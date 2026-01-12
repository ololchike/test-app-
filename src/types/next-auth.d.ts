import type { DefaultSession, DefaultUser } from "next-auth"
import type { JWT as DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      agentId?: string
      phone?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role?: string
    agentId?: string
    phone?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string
    role?: string
    agentId?: string
    phone?: string
  }
}
