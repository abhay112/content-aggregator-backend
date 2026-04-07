import client from 'prom-client';

// Clear existing register
client.register.clear();

// Default metrics
client.collectDefaultMetrics();

// HTTP Request count
export const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
});

// HTTP Request duration
export const httpRequestDurationSeconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

// Articles fetched count
export const articlesFetchedTotal = new client.Counter({
    name: 'articles_fetched_total',
    help: 'Total number of articles fetched',
    labelNames: ['source'],
});

export const fetchRetriesTotal = new client.Counter({
    name: 'fetch_retries_total',
    help: 'Total number of API request retries during fetch',
    labelNames: ['source'],
});

export const fetchFailuresTotal = new client.Counter({
    name: 'fetch_failures_total',
    help: 'Total number of API fetch completely failing after all retries',
    labelNames: ['source', 'error_type'],
});

// Cron job last run timestamp
export const cronJobLastRunTimestamp = new client.Gauge({
    name: 'cron_job_last_run_timestamp',
    help: 'Timestamp of the last cron job run',
    labelNames: ['job_name'],
});

export const metricsRegister = client.register;
