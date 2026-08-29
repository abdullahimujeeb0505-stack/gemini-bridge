# Gemini Bridge 🚀

**A remote MCP server that connects Claude to Google's Gemini ecosystem.**

Gemini Bridge provides Claude with a unified interface for interacting with Gemini capabilities through the **Model Context Protocol (MCP)**.

## Architecture

```text
Claude
   │
   │ MCP / Streamable HTTP
   ▼
Gemini Bridge
   │
   │ Google Gemini API
   ▼
Gemini

git add README.md && git commit -m "Add Gemini Bridge README" && git push -u origin main
