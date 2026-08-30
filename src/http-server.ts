#!/usr/bin/env node

import crypto from "node:crypto";
import express, { Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { GeminiMCPServer } from "./index.js";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);

type Session = {
  transport: StreamableHTTPServerTransport;
  gemini: GeminiMCPServer;
};

const sessions = new Map<string, Session>();

// Expose remote authentication through the public Railway port.
app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://127.0.0.1:3001",
    changeOrigin: true,
    pathRewrite: { "^/auth": "" },
  })
);

app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "Gemini Media MCP",
    status: "running",
    transport: "Streamable HTTP",
    endpoint: "/mcp",
  });
});

app.all("/mcp", async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    // Existing session
    if (sessionId) {
      const session = sessions.get(sessionId);

      if (!session) {
        res.status(404).json({
          jsonrpc: "2.0",
          error: {
            code: -32001,
            message: "MCP session not found",
          },
          id: null,
        });
        return;
      }

      await session.transport.handleRequest(req, res, req.body);
      return;
    }

    // New session
    let createdSession: Session | undefined;

    const gemini = new GeminiMCPServer();

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),

      onsessioninitialized: (newSessionId) => {
        if (createdSession) {
          sessions.set(newSessionId, createdSession);
          console.error(`🔗 MCP session created: ${newSessionId}`);
        }
      },
    });

    createdSession = {
      transport,
      gemini,
    };

    transport.onclose = () => {
      if (transport.sessionId) {
        sessions.delete(transport.sessionId);
        console.error(`🔌 MCP session closed: ${transport.sessionId}`);
      }
    };

    await gemini.getServer().connect(transport);

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP HTTP error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : String(error),
        },
        id: null,
      });
    }
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.error(`🚀 Gemini Media MCP HTTP server running on port ${PORT}`);
  console.error(`🔌 MCP endpoint: http://localhost:${PORT}/mcp`);
});
