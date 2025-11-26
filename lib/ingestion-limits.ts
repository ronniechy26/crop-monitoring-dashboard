const DEFAULT_MAX_FEATURES = 20000;
const parsedLimit = Number.parseInt(process.env.INGESTION_MAX_FEATURES ?? "", 10);

export const MAX_FEATURES = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : DEFAULT_MAX_FEATURES;
