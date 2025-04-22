/**
 * Logger utility that conditionally disables console.log in production
 * while keeping it enabled in development environment.
 */

// Store original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
};

// Only modify non-error console methods in production
if (process.env.NODE_ENV === 'production') {
  // Disable console.log, console.info, and console.debug in production
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  
  // Keep console.warn and console.error functional in production
  // as they are important for reporting issues
} 

// Export the original methods in case they need to be used explicitly
export const logger = {
  // Force logging even in production
  forceLog: originalConsole.log,
  forceInfo: originalConsole.info,
  forceWarn: originalConsole.warn,
  forceError: originalConsole.error,
  forceDebug: originalConsole.debug,
};

export default logger; 