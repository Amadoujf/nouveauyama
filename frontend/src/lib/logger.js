const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  log: (...args) => (isDev ? console.log(...args) : undefined),
  warn: (...args) => (isDev ? console.warn(...args) : undefined),
  error: (...args) => console.error(...args),
};

export default logger;
