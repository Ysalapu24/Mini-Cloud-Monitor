# Mini Cloud Monitor

A lightweight backend uptime monitoring service built with Node.js and Express. Pings HTTP/HTTPS endpoints on a schedule, measures response latency, flags slow or down services, and serves a live status dashboard — similar to how AWS CloudWatch SLA monitoring works.

## Features

- Monitors multiple endpoints on a 30-second interval
- Measures round-trip latency per endpoint
- Configurable per-endpoint latency thresholds
- Live status dashboard with history sparklines
- REST API for programmatic status access
- Color-coded: green (up), yellow (slow), red (down)

## Tech Stack

- Node.js
- Express.js
- Vanilla HTML/CSS/JavaScript (frontend)
- No external database — in-memory state with history ring buffer

## Installation

```bash
git clone https://github.com/Ysalapu24/mini-cloud-monitor.git
cd mini-cloud-monitor
npm install
npm start
```

Open your browser to: `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/status` | All endpoint statuses |
| GET | `/api/status/:name` | Single endpoint status + history |
| GET | `/api/summary` | Aggregate summary (up/down/avg latency) |

## Configuration

Edit the `ENDPOINTS` array in `server.js` to add or change monitored URLs:

```javascript
const ENDPOINTS = [
  { name: "My App", url: "https://myapp.com", threshold: 500 },
];
```

- `threshold` — latency (ms) above which the endpoint is flagged as slow

## Architecture

Mirrors AWS CloudWatch SLA logic:
- Scheduled polling replaces CloudWatch alarms
- Latency thresholds replace CloudWatch metric filters
- In-memory ring buffer replaces CloudWatch metric streams
- REST API replaces CloudWatch GetMetricData

## Author

**Yeshwanth Salapu**
B.S. Computer Science — University of North Texas
[LinkedIn](https://www.linkedin.com/in/yeshwanth-salapu-a257b7291/) | [GitHub](https://github.com/Ysalapu24)
