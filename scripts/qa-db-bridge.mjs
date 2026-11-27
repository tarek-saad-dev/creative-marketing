// CI-only: local PostgreSQL TCP over WebSocket, using the same Neon adapter as the app.
import {WebSocketServer,WebSocket} from "ws";
import net from "node:net";
if(process.env.CI!=="true"||process.env.CM_QA_LOCAL_DATABASE!=="1")throw new Error("CI only");
const url=new URL(process.env.DATABASE_URL??"");
if(url.hostname!=="127.0.0.1"||url.port!=="5432"||url.pathname!=="/cm_admin_qa")throw new Error("Refusing non-QA database");
const server=new WebSocketServer({host:"127.0.0.1",port:8765});
server.on("connection",socket=>{
 const tcp=net.createConnection({host:"127.0.0.1",port:5432});
 socket.on("message",data=>tcp.write(data));
 tcp.on("data",data=>{if(socket.readyState===WebSocket.OPEN)socket.send(data);});
 socket.on("close",()=>tcp.destroy());socket.on("error",()=>tcp.destroy());
 tcp.on("end",()=>socket.close());tcp.on("error",()=>socket.close());
});
console.log("Local QA database bridge ready");
