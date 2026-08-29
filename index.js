require("dotenv").config();

const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleGenAI } = require("@google/genai");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { z } = require("zod");

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Normal health check
app.get("/", (req, res) => {
  res.send("Gemini bridge is running 🚀");
});

// Existing REST endpoint
app.post("/ask", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash"
    });

    const result = await model.generateContent(
      req.body.prompt || "Hello from Gemini bridge"
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
  name: "Gemini Bridge",
  version: "1.0.0"
});

mcp.tool(
  "ask_gemini",
  "Send a prompt to Gemini through the Gemini bridge.",
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

mcp.tool(
  "generate_image",
  "Generate a real image using Gemini Nano Banana 2. Returns the generated image as base64 data.",
  {
    prompt: z.string().describe("Detailed description of the image to generate"),
    aspect_ratio: z.string().optional().describe("Image aspect ratio, for example 16:9, 1:1, or 9:16"),
    image_size: z.string().optional().describe("Image size: 1K, 2K, or 4K")
  },
  async ({ prompt, aspect_ratio, image_size }) => {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
      });

      const interaction = await ai.interactions.create({
        model: "gemini-3.1-flash-image",
        input: prompt,
        response_format: {
          type: "image",
          aspect_ratio: aspect_ratio || "1:1",
          image_size: image_size || "1K"
        }
      });

      if (!interaction.output_image) {
        return {
          content: [
            {
              type: "text",
              text: interaction.output_text || "Gemini did not return an image."
            }
          ],
          isError: true
        };
      }

      return {
        content: [
          {
            type: "image",
            data: interaction.output_image.data,
            mimeType: interaction.output_image.mime_type || "image/png"
          },
          {
            type: "text",
            text: interaction.output_text || "Image generated successfully."
          }
        ]
      };

    } catch (error) {
      console.error("Image generation error:", error);

      return {
        content: [
          {
            type: "text",
            text: "Image generation error: " + error.message
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
  console.log(`Gemini bridge running on port ${PORT}`);
});
