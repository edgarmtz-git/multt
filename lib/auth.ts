import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { getNextAuthConfig } from "@/lib/config"
import type { JWT } from 'next-auth/jwt'
import type { Session } from 'next-auth'
import type { User } from 'next-auth'

const nextAuthConfig = getNextAuthConfig()

export const authOptions = {
  ...nextAuthConfig,
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos")
        }

        try {
          // Buscar usuario en la base de datos
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            console.log("Login failed: Usuario no encontrado")
            throw new Error("Usuario no encontrado")
          }

          // Verificar si la cuenta está bloqueada (si el campo existe)
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            console.log("Login failed: Cuenta bloqueada")
            throw new Error("Cuenta temporalmente bloqueada. Intenta más tarde.")
          }

          if (!user.isActive) {
            console.log("Login failed: Usuario inactivo")
            throw new Error("Usuario inactivo")
          }

          if (user.isSuspended) {
            console.log("Login failed: Usuario suspendido")
            throw new Error("Usuario suspendido")
          }

          // Verificar contraseña
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log("Login failed: Contraseña incorrecta")
            throw new Error("Contraseña incorrecta")
          }

          // Login exitoso - actualizar último login (si los campos existen)
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                lastLoginAt: new Date()
              }
            })
          } catch (error) {
            // Ignorar error si los campos no existen aún
            console.log("Could not update lastLoginAt (field may not exist)")
          }

          console.log("Login successful:", { userId: user.id, email: user.email })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            company: user.company,
            avatar: user.avatar,
          }
        } catch (error) {
          console.error("Error en autenticación:", error)
          throw error
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 horas (más estable para desarrollo)
    updateAge: 60 * 60, // Actualizar cada hora
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key-for-development",
  // Configuración adicional para manejar errores
  events: {
    async signIn({ user, account, profile, isNewUser }: { user: any; account: any; profile?: any; isNewUser?: boolean }) {
      console.log("Sign in successful:", { userId: user.id, email: user.email })
    },
    async signOut({ session, token }: { session: any; token: any }) {
      console.log("Sign out:", { userId: token?.sub })
    },
    async error({ error }: { error: any }) {
      console.error("NextAuth error:", error)
    }
  }
}
