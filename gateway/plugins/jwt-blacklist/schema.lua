return {
  name = "jwt-blacklist",
  fields = {
    { config = {
        type   = "record",
        fields = {
          { redis_host = { type = "string", required = true, default = "redis" } },
          { redis_port = { type = "integer", required = true, default = 6379 } },
        },
    }},
  },
}