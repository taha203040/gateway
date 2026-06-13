// ─────────────────────────────────────────
// Kong HTTP Log payload shape
// Based on: https://developer.konghq.com/plugins/http-log/
// ─────────────────────────────────────────

export interface KongLogEntry {
  started_at: number;
  client_ip:  string;
  consumer?:  { username: string; id: string };
  request: {
    method:  string;
    uri:     string;
    size:    number;
    headers: Record<string, string>;
  };
  response: {
    status:  number;
    size:    number;
    headers: Record<string, string>;
  };
  latencies: {
    request: number;  // total ms client waited
    proxy:   number;  // ms spent in upstream service
    kong:    number;  // ms Kong itself spent (plugins, routing)
  };
  service?: { name: string; host: string; port: number };
  route?:   { name: string; paths: string[]; methods: string[] };
}

export interface StructuredLog {
  timestamp:       number;
  correlation_id:  string | null;
  method:          string;
  path:            string;
  status:          number;
  duration_ms:     number;
  upstream_ms:     number;
  kong_ms:         number;
  consumer:        string;
  service:         string | null;
  route:           string | null;
  client_ip:       string;
  is_error:        boolean;
  is_rate_limited: boolean;
}