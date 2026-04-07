import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('6001').transform(Number),
    METRICS_PORT: z.string().default('6002').transform(Number),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string(),
    LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']).default('info'),
    GRAFANA_URL: z.string().default('http://localhost:3000'),
});

const _env = envSchema.parse(process.env);

export const config = {
    port: _env.PORT,
    metricsPort: _env.METRICS_PORT,
    env: _env.NODE_ENV,
    dbUrl: _env.DATABASE_URL,
    logLevel: _env.LOG_LEVEL,
    grafanaUrl: _env.GRAFANA_URL,
    isProduction: _env.NODE_ENV === 'production',
    serviceName: 'content-aggregator',
};

export type Config = typeof config;
