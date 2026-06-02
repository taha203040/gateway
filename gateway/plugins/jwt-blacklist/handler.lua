local redis = require "resty.redis"
local cjson = require "cjson.safe"

local JwtBlacklistHandler = {
  VERSION  = "1.0.0",
  PRIORITY = 900,
}

local function extract_token()
  local auth = kong.request.get_header("Authorization")
  if auth then
    return auth:match("^[Bb]earer%s+(.+)$")
  end
end

local function get_jti(token)
  local payload_b64 = token:match("^[^.]+%.([^.]+)%.[^.]+$")
  if not payload_b64 then return nil end

  local remainder = #payload_b64 % 4
  if remainder == 2 then payload_b64 = payload_b64 .. "=="
  elseif remainder == 3 then payload_b64 = payload_b64 .. "=" end

  payload_b64 = payload_b64:gsub("-", "+"):gsub("_", "/")
  local json = ngx.decode_base64(payload_b64)
  if not json then return nil end

  local claims = cjson.decode(json)
  return claims and claims.jti
end

function JwtBlacklistHandler:access(conf)
  local token = extract_token()
  if not token then return end

  local jti = get_jti(token)
  if not jti then return end

  local red = redis:new()
  red:set_timeout(1000)

  local ok, err = red:connect(conf.redis_host, conf.redis_port)
  if not ok then
    kong.log.err("redis connect failed: ", err)
    return kong.response.exit(503, { message = "Service unavailable" })
  end

  local res = red:get("blacklist:jwt:" .. jti)
  red:set_keepalive(10000, 100)

  if res ~= ngx.null and res ~= nil then
    return kong.response.exit(401, { message = "Token has been revoked" })
  end
end

return JwtBlacklistHandler