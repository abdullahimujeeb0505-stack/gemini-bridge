#!/usr/bin/env node

import crypto from "node:crypto";
import express, { Request, Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { GeminiMCPServer } from "./index.js";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);

const gemini = new GeminiMCPServer();

const sessions = new Map<
  string,
  StreamableHTTPServerTransport
>();

app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "Gemini Media MCP",
    status: "running",
    transport: "Streamable HTTP",
    endpoint: "/mcp"
  });
});

app.all("/mcp", async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    let transport = sessionId ? sessions.get(sessionId) : undefined;

    if (!transport) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID()
      });

      transport.onclose = () => {
        if (transport?.sessionId) {
          sessions.delete(transport.sessionId);
        }
      };

      sessions.set(
        transport.sessionId as string,
        transport
      );

      await gemini.getServer().connect(transport);
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP HTTP error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
});

app.listen(PORT, () => {
  console.error(`🚀 Gemini Media MCP HTTP server running on port ${PORT}`);
  console.error(`🔌 MCP endpoint: http://localhost:${PORT}/mcp`);
});
