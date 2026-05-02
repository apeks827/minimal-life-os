type LogContext = Record<string, unknown>;

export function logInfo(event: string, context: LogContext = {}) {
  console.info(JSON.stringify({ level: "info", event, ...context }));
}

export function logError(event: string, cause: unknown, context: LogContext = {}) {
  const message = cause instanceof Error ? cause.message : String(cause);
  console.error(JSON.stringify({ level: "error", event, message, ...context }));
}
