# Gemini Bridge 🚀

**A remote MCP server that connects Claude to Google's Gemini ecosystem.**

Gemini Bridge provides Claude with a unified interface for interacting with Gemini capabilities through the **Model Context Protocol (MCP)**.

```text
Claude
   │
   │ MCP / Streamable HTTP
   ▼
Gemini Bridge
   │
   │ Google Gemini API
   ▼
Gemini ✨
```

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [MCP Tools](#mcp-tools)
- [Deployment](#deployment)
- [Security](#security)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Why MCP?](#why-mcp)
- [Vision](#vision)

---

## Features

✨ **Current MCP Tools**

| Tool | Purpose | Status |
|------|---------|--------|
| `ask_gemini` | Send prompts to Gemini | ✅ Working |
| `generate_image` | Generate images with Gemini | 🟡 Implemented |
| `generate_video` | Generate videos with Veo | 🚧 Planned |
| `edit_image` | Edit existing images | 🚧 Planned |
| `image_to_video` | Turn images into videos | 🚧 Planned |

---

## Quick Start

### Prerequisites

- Node.js
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abdullahimujeeb0505-stack/gemini-bridge.git
   cd gemini-bridge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

The server will run on `http://localhost:3000` locally.

---

## How It Works

### Architecture

```text
Claude
   ↓
MCP Connector
   ↓
Gemini Bridge
   ↓
Google Gemini API
   ↓
Gemini response
```

Requests flow through a remotely deployed MCP server instead of Claude communicating with Gemini directly. This abstraction layer provides:

- Unified interface to multiple Gemini capabilities
- Security through credential management
- Extensibility for new tools

### MCP Transport

- **Protocol:** Streamable HTTP
- **Endpoint:** `/mcp`
- **Clients:** MCP-compatible clients (Claude, etc.)

---

## MCP Tools

### ask_gemini

Send prompts to Gemini and receive responses.

**Example:**
```javascript
ask_gemini({
  prompt: "Explain quantum computing"
})
```

### generate_image

Generate images using Gemini's image generation capabilities.

**Parameters:**
- `prompt` — Description of the image
- `aspect_ratio` — Aspect ratio (e.g., "16:9")
- `image_size` — Image resolution (e.g., "1K")

**Example:**
```javascript
generate_image({
  prompt: "A cinematic 3D cartoon monkey at a futuristic trading desk",
  aspect_ratio: "16:9",
  image_size: "1K"
})
```

**Note:** Image generation availability depends on your Google AI API project's model access and quota.

---

## Deployment

Gemini Bridge is deployed as a remote MCP server using **Streamable HTTP** on **Railway**.

### MCP Endpoint

- **Path:** `/mcp`
- **Protocol:** Streamable HTTP

The bridge is designed to work with MCP-compatible clients such as Claude.

---

## Security

### API Credentials

⚠️ **Important:** API credentials must never be committed to the repository.

**Environment Variables:**
- Store all secrets in `.env` file
- `.env` is excluded from version control
- Example: `GEMINI_API_KEY=your_api_key_here`

**Best Practices:**
- Never include API keys in source code
- Never commit credentials to git
- Never share keys in screenshots or documentation
- Use environment variables for all sensitive data

---

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Protocol:** Model Context Protocol (MCP)
- **API:** Google Gemini API
- **Validation:** Zod
- **Transport:** Streamable HTTP
- **Hosting:** Railway

---

## Project Structure

```
gemini-bridge/
├── index.js              # Main server file
├── package.json          # Dependencies and scripts
├── package-lock.json     # Locked dependency versions
├── README.md             # This file
└── .env                  # Environment variables (not committed)
```

---

## Roadmap

### Phase 1 — Core Bridge ✅
- [x] Node.js server
- [x] Express setup
- [x] Gemini API integration
- [x] MCP integration
- [x] Streamable HTTP transport
- [x] Remote Railway deployment
- [x] Claude MCP connection
- [x] Gemini text generation

### Phase 2 — Multimodal Generation
- [x] Image generation tool
- [ ] Image editing
- [ ] Multi-image workflows
- [ ] Video generation with Veo
- [ ] Image-to-video workflows

### Phase 3 — Unified Gemini Workflow
- [ ] Multimodal analysis
- [ ] Audio workflows
- [ ] Document understanding
- [ ] Search-grounded workflows
- [ ] Automatic model selection
- [ ] Unified media production pipeline

---

## Why MCP?

The **Model Context Protocol** provides a standardized interface through which AI applications can discover and use external tools.

**Benefits:**

- 🔧 **Extensible:** New Gemini capabilities can be added as additional MCP tools
- 🔌 **Pluggable:** Works with any MCP-compatible client
- 📋 **Standardized:** Consistent interface for tool discovery and invocation
- 🚀 **No rebuilds:** Add new capabilities without rebuilding the entire integration

Instead of exposing every underlying API detail to the client, Gemini Bridge acts as an abstraction layer between MCP clients and Gemini services.

---

## Vision

The long-term goal of Gemini Bridge is to provide Claude with a **unified MCP interface to Gemini's multimodal ecosystem**.

**Planned workflows:**

- 🧠 Reasoning
- 🎨 Image generation & editing
- 🎬 Video generation
- 🎞️ Image-to-video conversion
- 👁️ Multimodal analysis
- 🔊 Audio processing
- 🔧 Tool calling
- 📄 Document understanding
- 🔎 Grounded search

---

## Status

- **Current Milestone:** Claude → MCP → Gemini Bridge → Gemini API ✅
- **Next Milestone:** Unified multimodal Gemini production workflow
- **Development Status:** Active

---

## API Usage Notes

⚠️ Some Gemini models and capabilities may require:
- Specific API access permissions
- Sufficient quotas
- Billing setup

The bridge itself does not bypass Google's model restrictions or quotas—it simply provides an MCP interface to the APIs available to your Google AI project.

---

**Built with Node.js + MCP + Gemini** 🚀
