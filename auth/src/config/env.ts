import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  PORT: number;
  NODEENV: string;
  JWTSECRET: string;
  JWTEXPIRE: string;
  MONGO_URI: string;
  REDIS_URI: string;
  ALLOW_ORIGINS: string[];
  LOG_LEVEL: string;
  ISS:string;
}

function getEnvConfig(): EnvConfig {
  return {
      ISS : process.env.ISS|| "",
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODEENV: process.env.NODE_ENV || 'development',
    JWTSECRET: process.env.JWT_SECRET || 'default_jwt_secret',
    JWTEXPIRE: process.env.JWT_EXPIRES_IN || '7d',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/auth_db',
    REDIS_URI: process.env.REDIS_URL || 'redis://localhost:6379',
    ALLOW_ORIGINS: (process.env.ALLOWED_ORIGINS || '*').split(','),
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  };
}

export const env = getEnvConfig();
