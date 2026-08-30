import crypto from "node:crypto";
import express, { Request, Response } from "express";
import { chromium, BrowserContext, Page } from "patchright";
import { CONFIG } from "./config.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.AUTH_PORT || 3001);
const AUTH_TOKEN = process.env.AUTH_TOKEN;

if (!AUTH_TOKEN) {
  console.error("❌ AUTH_TOKEN is required");
  process.exit(1);
}

let context: BrowserContext | null = null;
let page: Page | null = null;

function authorized(req: Request, res: Response): boolean {
  const token =
    req.headers.authorization?.replace(/^Bearer\s+/i, "") ||
    String(req.query.token || "");

  if (!token || !crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(AUTH_TOKEN!)
  )) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  return true;
}

app.get("/", (_req, res) => {
  res.type("html").send(`
<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gemini Remote Auth</title>
<style>
body{font-family:system-ui;background:#111;color:#eee;padding:20px;max-width:900px;margin:auto}
button,input{font-size:16px;padding:12px;margin:5px;border-radius:8px;border:1px solid #555}
button{cursor:pointer}
img{max-width:100%;border:1px solid #555;border-radius:10px;margin-top:15px}
.row{display:flex;flex-wrap:wrap}
#status{white-space:pre-wrap;margin:15px 0}
</style>
</head>
<body>
<h2>Gemini Remote Authentication</h2>
<p>Start the browser, then complete Google's login yourself.</p>

<button onclick="start()">Start Browser</button>
<button onclick="refresh()">Refresh</button>
<button onclick="finish()">Finish & Save</button>

<div class="row">
<input id="text" placeholder="Text to type">
<button onclick="typeText()">Type</button>
</div>

<div class="row">
<input id="x" type="number" placeholder="X">
<input id="y" type="number" placeholder="Y">
<button onclick="clickAt()">Click</button>
</div>

<div id="status">Ready.</div>
<img id="screen">

<script>
const token = new URLSearchParams(location.search).get("token");
const headers = {"Authorization":"Bearer "+token,"Content-Type":"application/json"};

async function api(path, body) {
  const r = await fetch("/auth" + path, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const j = await r.json();
  document.getElementById("status").textContent =
    JSON.stringify(j,null,2);
  if(j.screenshot) {
    document.getElementById("screen").src =
      "data:image/png;base64," + j.screenshot;
  }
  return j;
}

async function start(){await api("/start",{ });}
async function refresh(){await api("/screenshot",{ });}
async function finish(){await api("/finish",{ });}
async function typeText(){
  await api("/type",{text:document.getElementById("text").value});
}
async function clickAt(){
  await api("/click",{
    x:Number(document.getElementById("x").value),
    y:Number(document.getElementById("y").value)
  });
}
</script>
</body>
</html>
`);
});

app.post("/start", async (req, res) => {
  if (!authorized(req, res)) return;

  try {
    if (context) {
      return res.json({ ok: true, message: "Browser already running" });
    }

    context = await chromium.launchPersistentContext(
      CONFIG.chromeProfileDir,
      {
        headless: true,
        channel: undefined,
        viewport: CONFIG.viewport,
        locale: "en-US",
        timezoneId: "Europe/Berlin",
        args: [
          "--disable-blink-features=AutomationControlled",
          "--disable-dev-shm-usage",
          "--no-first-run",
          "--no-default-browser-check"
        ]
      }
    );

    page = context.pages()[0] || await context.newPage();

    await page.goto(
      "https://accounts.google.com/",
      {
        waitUntil: "domcontentloaded",
        timeout: 60000
      }
    );

    res.json({
      ok: true,
      message: "Browser started. Use the screenshot and controls to complete Google login."
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get("/status", async (req, res) => {
  if (!authorized(req, res)) return;

  res.json({
    running: !!page,
    url: page?.url() || null
  });
});

app.post("/screenshot", async (req, res) => {
  if (!authorized(req, res)) return;

  if (!page) {
    return res.status(400).json({ error: "Browser not started" });
  }

  try {
    const screenshot = await page.screenshot({
      type: "png"
    });

    res.json({
      ok: true,
      url: page.url(),
      screenshot: screenshot.toString("base64")
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

app.post("/click", async (req, res) => {
  if (!authorized(req, res)) return;

  if (!page) {
    return res.status(400).json({ error: "Browser not started" });
  }

  const x = Number(req.body.x);
  const y = Number(req.body.y);

  await page.mouse.click(x, y);

  await page.waitForTimeout(700);

  const screenshot = await page.screenshot({ type: "png" });

  res.json({
    ok: true,
    url: page.url(),
    screenshot: screenshot.toString("base64")
  });
});

app.post("/type", async (req, res) => {
  if (!authorized(req, res)) return;

  if (!page) {
    return res.status(400).json({ error: "Browser not started" });
  }

  const text = String(req.body.text || "");

  await page.keyboard.type(text, { delay: 30 });

  const screenshot = await page.screenshot({ type: "png" });

  res.json({
    ok: true,
    screenshot: screenshot.toString("base64")
  });
});

app.post("/finish", async (req, res) => {
  if (!authorized(req, res)) return;

  if (!context || !page) {
    return res.status(400).json({ error: "Browser not running" });
  }

  try {
    const url = page.url();

    if (!url.startsWith("https://gemini.google.com/app")) {
      return res.status(400).json({
        ok: false,
        message: "Gemini App has not been reached yet.",
        url
      });
    }

    await context.storageState({
      path: `${CONFIG.browserStateDir}/state.json`
    });

    await context.close();

    context = null;
    page = null;

    res.json({
      ok: true,
      authenticated: true,
      message: "Authentication state saved successfully."
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔐 Remote auth server listening on ${PORT}`);
});
