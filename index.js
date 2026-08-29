require("dotenv").config();

const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { z } = require("zod");

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Normal health check
app.get("/", (req, res) => {
  res.send("Blockfirm bridge is running 🚀");
});

// Existing REST endpoint
app.post("/ask", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash"
    });

    const result = await model.generateContent(
      req.body.prompt || "Hello from Blockfirm bridge"
    );

    res.json({
      response: result.response.text()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
  }
});

// MCP server
const mcp = new McpServer({
  name: "Blockfirm Bridge",
  version: "1.0.0"
});

mcp.tool(
  "ask_gemini",
  "Send a prompt to Gemini through the Blockfirm bridge.",
  {
    prompt: z.string().describe("The prompt to send to Gemini")
  },
  async ({ prompt }) => {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-3.6-flash"
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return {
        content: [
          {
            type: "text",
            text
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Gemini error: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
);

// MCP HTTP endpoint
app.all("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  res.on("close", () => {
    transport.close().catch(() => {});
  });

  await mcp.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Blockfirm bridge running on port ${PORT}`);
});
