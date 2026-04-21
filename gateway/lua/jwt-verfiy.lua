local jwt = require "resty.jwt"
local cjson = require "cjson"

-- ── 1. Load public key (cached in memory via init_by_lua_block at startup) ──
--    jwt_public_key is a global set once in nginx.conf, not read from disk here
local public_key = jwt_public_key
 -- 2 Extract the token from header  and check
local auth_header = ngx.req.get_headers()["Authorization"]
if not auth_header then
    ngx.status = 401
    ngx.say(cjson.encode({err = 'invalid auth format'}))
    return ngx.exit(401)
end