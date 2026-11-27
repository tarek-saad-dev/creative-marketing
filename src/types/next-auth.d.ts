import type { DefaultSession } from "next-auth";
import type { AdminRole } from "@/generated/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AdminRole;
      credentialVersion?:string;
    } & DefaultSession["user"];
  }

  interface User {
    role: AdminRole;
    credentialVersion?:string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AdminRole;
    credentialVersion?:string;
  }
}
