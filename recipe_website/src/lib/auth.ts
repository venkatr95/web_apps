import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDemoUser, isDemoMode } from "./demo";
import { isDatabaseAvailable, prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  // Only use PrismaAdapter if database is available
  adapter: isDemoMode() ? undefined : PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Demo mode: accept demo@example.com with any password
        if (isDemoMode() || !(await isDatabaseAvailable())) {
          if (
            credentials.email === "demo@example.com" ||
            credentials.email.includes("demo")
          ) {
            const demoUser = getDemoUser();
            return {
              id: demoUser.id,
              email: demoUser.email,
              name: demoUser.name,
              image: demoUser.image,
            };
          }
          throw new Error("Demo mode: use demo@example.com");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email before signing in");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    CredentialsProvider({
      id: "pin",
      name: "PIN Login",
      credentials: {
        email: { label: "Email", type: "email" },
        pin: { label: "PIN", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.pin) {
          throw new Error("Invalid credentials");
        }

        // Demo mode
        if (isDemoMode() || !(await isDatabaseAvailable())) {
          if (
            credentials.email === "demo@example.com" ||
            credentials.email.includes("demo")
          ) {
            const demoUser = getDemoUser();
            return {
              id: demoUser.id,
              email: demoUser.email,
              name: demoUser.name,
              image: demoUser.image,
            };
          }
          throw new Error("Demo mode: use demo@example.com");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.pin) {
          throw new Error("Invalid credentials");
        }

        const isPinValid = await compare(credentials.pin, user.pin);

        if (!isPinValid) {
          throw new Error("Invalid PIN");
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email before signing in");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;

        // Fetch role from database if not in demo mode
        if (!isDemoMode() && (await isDatabaseAvailable())) {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
          });
          token.role = dbUser?.role || "USER";
        } else {
          // Demo user is admin
          token.role = "ADMIN";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
