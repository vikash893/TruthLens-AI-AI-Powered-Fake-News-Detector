export const logger = {
  info: (msg: string, ...meta: any[]) => {
    console.log(`[${new Date().toISOString()}] [INFO] [server]: ${msg}`, ...meta);
  },
  warn: (msg: string, ...meta: any[]) => {
    console.warn(`[${new Date().toISOString()}] [WARN] [server]: ${msg}`, ...meta);
  },
  error: (msg: string, ...meta: any[]) => {
    console.error(`[${new Date().toISOString()}] [ERROR] [server]: ${msg}`, ...meta);
  }
};
