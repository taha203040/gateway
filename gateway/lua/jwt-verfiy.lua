local jwt   = require "resty.jwt"
local cjson = require "cjson"

-- ── Helper: send a 401 and stop the request ───────────
local function reject(reason)
  ngx.status = 401
  ngx.header["Content-Type"] = "application/json"
  ngx.say(cjson.encode({ error = "unauthorized", reason = reason }))
  return ngx.exit(401)
end

-- ── 1. Read Authorization header ─────────────────────
local auth_header = ngx.req.get_headers()["Authorization"]

if not auth_header then
  return reject("missing authorization header")
end

-- ── 2. Extract token from "Bearer <token>" ────────────
local token = auth_header:match("^Bearer%s+(.+)$")

if not token then
  return reject("authorization header must be: Bearer <token>")
end

-- ── 3. Verify signature + expiry ─────────────────────
-- jwt_public_key is a global loaded ONCE at nginx startup
-- via init_by_lua_block — no file read or network call here
local verified = jwt:verify(jwt_public_key, token)

if not verified.verified then
  return reject(verified.reason)   -- "expired", "invalid signature", etc.
end

-- ── 4. Extract claims from payload ───────────────────
local payload = verified.payload

if not payload.userId then
  return reject("token payload missing userId")
end

-- ── 5. Forward user info to upstream as headers ───────
-- product-service reads these — it never sees the raw JWT
ngx.req.set_header("X-User-Id",    payload.userId)
ngx.req.set_header("X-User-Email", payload.email  or "")
ngx.req.set_header("X-User-Role",  payload.role   or "user")

-- ── 6. Strip raw JWT — upstream should not receive it ─
ngx.req.clear_header("Authorization")

-- Request is clean — proxy_pass takes over
