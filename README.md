# Gemini Bridge 🚀

**A remote MCP server that connects Claude to Google's Gemini ecosystem.**

Gemini Bridge provides Claude with a unified interface for interacting with Gemini capabilities through the **Model Context Protocol (MCP)**.

Instead of Claude communicating with Gemini directly, requests flow through a remotely deployed MCP server.

```text
Claude
   │
   │ MCP / Streamable HTTP
   ▼
Gemini Bridge
   │
   │ Google Gemini API
   ▼
Gemini✨ Current MCP Tools
Tool
Purpose
Status
ask_gemini
Send prompts to Gemini
✅ Working
generate_image
Generate images with Gemini
🟡 Implemented
generate_video
Generate videos with Veo
🚧 Planned
edit_image
Edit existing images
🚧 Planned
image_to_video
Turn images into videos
🚧 Planned
🏗️ Technology
Node.js
Express
Model Context Protocol (MCP)
Google Gemini API
Zod
Streamable HTTP
Railway
Claude MCP Connectors
🌐 Deployment
Gemini Bridge runs as a remote MCP server using Streamable HTTP.
MCP endpoint:
/mcp
The bridge is designed to be used by MCP-compatible clients such as Claude.
🔐 Security
API credentials are stored as environment variables and must never be committed to the repository.
Example:
GEMINI_API_KEY=your_api_key_here
The real API key should remain private and should never appear in source code, commits, screenshots, or public documentation.
🧪 Tested Architecture
The MCP server has been tested locally and remotely.
Claude
   ↓
MCP Connector
   ↓
Gemini Bridge
   ↓
Google Gemini API
   ↓
Gemini response
The MCP server successfully exposes its tools through the Streamable HTTP endpoint.
🎨 Image Generation
Gemini Bridge includes a generate_image MCP tool.
It accepts:
prompt
aspect_ratio
image_size
Example:
generate_image(
  prompt="A cinematic 3D cartoon monkey at a futuristic trading desk",
  aspect_ratio="16:9",
  image_size="1K"
)
Image generation availability depends on the Google AI API project's model access and quota.
🧠 Gemini Text
The ask_gemini MCP tool allows Claude to send prompts to Gemini.
Example workflow:
Claude
  ↓
ask_gemini
  ↓
Gemini
  ↓
Response
  ↓
Claude
🚀 Development
Clone the repository:
git clone https://github.com/abdullahimujeeb0505-stack/gemini-bridge.git
Enter the project:
cd gemini-bridge
Install dependencies:
npm install
Create an environment configuration:
GEMINI_API_KEY=your_api_key_here
Start the server:
npm start
The local server runs on:
http://localhost:3000
🔌 MCP Transport
Gemini Bridge uses:
Streamable HTTP
MCP endpoint:
/mcp
This allows remote MCP-compatible clients to connect to the bridge.
🎯 Vision
The long-term goal of Gemini Bridge is to provide Claude with a unified MCP interface to Gemini's multimodal ecosystem.
The project is being developed toward workflows involving:
🧠 Reasoning
🎨 Image generation
🖼️ Image editing
🎬 Video generation
🎞️ Image-to-video
👁️ Multimodal analysis
🔊 Audio workflows
🔧 Tool calling
📄 Document understanding
🔎 Grounded search workflows
Rather than exposing every underlying API detail to the client, Gemini Bridge acts as an abstraction layer between MCP clients and Gemini services.
🗺️ Roadmap
Phase 1 — Core Bridge
[x] Node.js server
[x] Express
[x] Gemini API integration
[x] MCP integration
[x] Streamable HTTP
[x] Remote Railway deployment
[x] Claude MCP connection
[x] Gemini text generation
Phase 2 — Multimodal Generation
[x] Image generation tool
[ ] Image editing
[ ] Multi-image workflows
[ ] Video generation with Veo
[ ] Image-to-video workflows
Phase 3 — Unified Gemini Workflow
[ ] Multimodal analysis
[ ] Audio workflows
[ ] Document workflows
[ ] Search-grounded workflows
[ ] Automatic model selection
[ ] Unified media production pipeline
📌 Project Status
Active development
Current milestone:
Claude → MCP → Gemini Bridge → Gemini API
Next milestone:
Unified multimodal Gemini production workflow
💡 Why MCP?
The Model Context Protocol provides a standardized interface through which AI applications can discover and use external tools.
Gemini Bridge uses MCP to expose Gemini capabilities as tools that can be discovered and invoked by compatible AI clients.
This makes the bridge extensible: new Gemini capabilities can be added as additional MCP tools without rebuilding the entire integration.
📁 Project Structure
gemini-bridge/
├── index.js
├── package.json
├── package-lock.json
├── README.md
└── .env
.env contains private credentials and should never be committed.
⚠️ API Usage
Some Gemini models and capabilities may require specific API access, quotas, or billing.
The bridge itself does not bypass Google's model restrictions or quotas. It simply provides an MCP interface to the APIs available to the configured Google AI project.
Built with Node.js + MCP + Gemini.
