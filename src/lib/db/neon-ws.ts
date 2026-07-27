import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

/**
 * Node.js has no built-in WebSocket. Neon serverless driver requires `ws`.
 * Safe to call multiple times.
 */
export function configureNeonWebSocket(): void {
  neonConfig.webSocketConstructor = ws;
}
