import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

/**
 * Node.js has no built-in WebSocket. Neon serverless driver requires `ws`.
 * Safe to call multiple times.
 */
export function configureNeonWebSocket(): void {
  neonConfig.webSocketConstructor = ws;
  // Explicit isolated CI fixture only. Never weaken TLS for a real database.
  if(process.env.CM_QA_LOCAL_DATABASE==="1"){
    const url=new URL(process.env.DATABASE_URL??"");
    if(process.env.CI!=="true"||url.hostname!=="127.0.0.1"||url.port!=="5432"||url.pathname!=="/cm_admin_qa")throw new Error("QA database must be isolated on loopback");
    neonConfig.wsProxy=()=>"127.0.0.1:8765/v2";
    neonConfig.useSecureWebSocket=false;
    neonConfig.forceDisablePgSSL=true;
    neonConfig.pipelineConnect=false;
  }
}
