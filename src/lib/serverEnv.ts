/**
 * Read a server-only environment variable through a dynamic key.
 *
 * Next.js can replace direct `process.env.NAME` expressions while compiling.
 * Using a runtime key preserves Vercel-injected values for Node.js route
 * handlers without ever serializing them into client bundles.
 */
export function readServerEnv(name: string): string {
  return (process.env[name] || "").trim();
}
