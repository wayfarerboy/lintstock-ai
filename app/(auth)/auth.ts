import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { authConfig } from './auth.config';
import { DUMMY_PASSWORD } from '@/lib/constants';
import type { DefaultJWT } from 'next-auth/jwt';
import PostgresAdapter from '@auth/pg-adapter';
import { Pool } from '@neondatabase/serverless';

export type UserType = 'regular';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

const emailProviderConfig = {
  server: {
    host: process.env.MAILGUN_HOST,
    port: process.env.MAILGUN_PORT,
    auth: {
      user: process.env.MAILGUN_USER,
      pass: process.env.MAILGUN_PASSWORD,
    },
  },
  from: process.env.MAILGUN_FROM,
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return {
    ...authConfig,
    providers: [EmailProvider(emailProviderConfig)],
    adapter: PostgresAdapter(pool) as any,
    session: {
      maxAge: 24 * 60 * 60,
    },
    callbacks: {
      async redirect({ url, baseUrl }) {
        // Allows relative callback URLs
        if (url.startsWith('/')) {
          if (url === '/login') return baseUrl;
          return `${baseUrl}${url}`;
          // Allows callback URLs on the same origin
        } else if (new URL(url).origin === baseUrl) {
          if (url.endsWith('/login')) return baseUrl;
          return url;
        }
        return baseUrl;
      },
    },
  };
});
