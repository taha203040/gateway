import express, { Request, Response } from "express";
import { KongLogEntry, StructuredLog } from "./types";

const app = express();
const PORT = parseInt(process.env.PORT ?? "4000", 10);

app.use(express.json({ limit: "10mb" }));

function toStructuredLog(entry: KongLogEntry): StructuredLog {
  return {
    timestamp:       entry.started_at,
    correlation_id:  entry.request.headers["x-correlation-id"] ?? null,
    method:          entry.request.method,
    path:            entry.request.uri,
    status:          entry.response.status,
    duration_ms:     entry.latencies.request,
    upstream_ms:     entry.latencies.proxy,
    kong_ms:         entry.latencies.kong,
    consumer:        entry.consumer?.username ?? "anon",
    service:         entry.service?.name ?? null,
    route:           entry.route?.name ?? null,
    client_ip:       entry.client_ip,
    is_error:        entry.response.status >= 400,
    is_rate_limited: entry.response.status === 429,
  };
}

// Kong sends one entry or an array depending on batch size
app.post("/logs", (req: Request, res: Response): void => {
  const raw: KongLogEntry | KongLogEntry[] = req.body;
  const entries: KongLogEntry[] = Array.isArray(raw) ? raw : [raw];

  entries
    .map(toStructuredLog)
    .forEach((log) => {
      process.stdout.write(JSON.stringify(log) + "\n");
    });

  res.status(200).send("ok");
});

app.get("/health", (_req: Request, res: Response): void => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Log collector listening on :${PORT}`);
});