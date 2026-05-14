const express = require("express");
const http = require("http");
const https = require("https");
const path = require("path");

const app = express();
const PORT = 3000;

// ── CONFIGURATION ──
const ENDPOINTS = [
  { name: "Google",        url: "https://www.google.com",       threshold: 500  },
  { name: "GitHub",        url: "https://github.com",           threshold: 800  },
  { name: "Cloudflare",    url: "https://www.cloudflare.com",   threshold: 600  },
  { name: "OpenAI",        url: "https://www.openai.com",       threshold: 1000 },
  { name: "AWS",           url: "https://aws.amazon.com",       threshold: 900  },
  { name: "Azure",         url: "https://azure.microsoft.com",  threshold: 900  },
];

const CHECK_INTERVAL_MS = 30000; // check every 30 seconds
const HISTORY_LIMIT = 20;        // keep last 20 results per endpoint

// ── STATE ──
const status = {};
ENDPOINTS.forEach(ep => {
  status[ep.name] = {
    name: ep.name,
    url: ep.url,
    threshold: ep.threshold,
    up: null,
    latency: null,
    lastChecked: null,
    history: [],
  };
});

// ── PING FUNCTION ──
function pingEndpoint(ep) {
  return new Promise((resolve) => {
    const start = Date.now();
    const mod = ep.url.startsWith("https") ? https : http;

    const req = mod.get(ep.url, { timeout: 5000 }, (res) => {
      const latency = Date.now() - start;
      resolve({ up: true, latency, statusCode: res.statusCode });
    });

    req.on("error", () => resolve({ up: false, latency: null, statusCode: null }));
    req.on("timeout", () => { req.destroy(); resolve({ up: false, latency: null, statusCode: null }); });
  });
}

// ── CHECK ALL ──
async function checkAll() {
  const now = new Date().toISOString();
  for (const ep of ENDPOINTS) {
    const result = await pingEndpoint(ep);
    const entry = {
      up: result.up,
      latency: result.latency,
      statusCode: result.statusCode,
      timestamp: now,
    };

    const s = status[ep.name];
    s.up = result.up;
    s.latency = result.latency;
    s.lastChecked = now;
    s.history.unshift(entry);
    if (s.history.length > HISTORY_LIMIT) s.history.pop();

    const flag = result.up
      ? (result.latency > ep.threshold ? "⚠ SLOW" : "✓ UP")
      : "✗ DOWN";
    console.log(`[${now}] ${ep.name.padEnd(12)} ${flag}  ${result.latency ?? "—"}ms`);
  }
}

// ── ROUTES ──
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (req, res) => {
  res.json(Object.values(status));
});

app.get("/api/status/:name", (req, res) => {
  const s = status[req.params.name];
  if (!s) return res.status(404).json({ error: "Not found" });
  res.json(s);
});

app.get("/api/summary", (req, res) => {
  const all = Object.values(status);
  res.json({
    total: all.length,
    up: all.filter(s => s.up === true).length,
    down: all.filter(s => s.up === false).length,
    avgLatency: Math.round(
      all.filter(s => s.latency).reduce((a, b) => a + b.latency, 0) /
      (all.filter(s => s.latency).length || 1)
    ),
  });
});

// ── START ──
app.listen(PORT, async () => {
  console.log(`\n🖥  Mini Cloud Monitor running at http://localhost:${PORT}`);
  console.log(`Checking ${ENDPOINTS.length} endpoints every ${CHECK_INTERVAL_MS / 1000}s\n`);
  await checkAll();
  setInterval(checkAll, CHECK_INTERVAL_MS);
});
