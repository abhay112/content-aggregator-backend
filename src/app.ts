import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { requestLogger } from "@middleware/requestLogger";
import { globalErrorHandler } from "@middleware/errorHandler";
import { metricsMiddleware } from "@middleware/metrics.middleware";
import apiV1Routes from "@routes/api.v1";
import { config } from "@config/env";

const app = express();

/**
 * ✅ CORS CONFIG
 */
const corsOptions: cors.CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        const allowedOrigins = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
        ];
        // Allow requests with no origin (like mobile apps)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

/**
 * ✅ BODY PARSER
 */
app.use(express.json());

/**
 * ✅ LOGGING + METRICS
 */
app.use(requestLogger);
app.use(metricsMiddleware);

/**
 * ✅ SWAGGER SETUP
 */
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Content Aggregator API",
            version: "1.0.0",
            description: "Production-grade content aggregator service",
        },
        servers: [
            {
                url: `http://localhost:${config.port}`,
            },
        ],
    },
    apis: ["./src/controllers/*.ts", "./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * ✅ ROUTES
 */
app.use("/api/v1", apiV1Routes);

/**
 * ✅ HEALTH CHECK
 */
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            status: "OK",
            uptime: process.uptime(),
            environment: config.env,
            timestamp: new Date().toISOString(),
        },
    });
});

/**
 * ❌ 404 HANDLER
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: `Route ${req.method} ${req.url} not found`,
            code: "NOT_FOUND",
        },
    });
});

/**
 * ❌ GLOBAL ERROR HANDLER (VERY IMPORTANT)
 */
app.use(globalErrorHandler);

export { app };