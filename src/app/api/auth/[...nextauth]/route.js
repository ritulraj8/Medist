import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import clientPromise from '../../../../lib/mongodb';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const client = await clientPromise;
          const db = client.db('ritul');
          const usersCollection = db.collection('users');

          const user = await usersCollection.findOne({ email: credentials.email });

          if (!user) {
            throw new Error('No user found');
          }

          if (!user.isVerified) {
            throw new Error('Email not verified');
          }

          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/loginpage',
    signOut: '/logout',
    error: '/loginpage?error=CredentialsSignin',
    verifyRequest: '/verify',
    newUser: '/mainpage',
  },

  secret: process.env.NEXTAUTH_SECRET,

  // ✅ Correctly placed cookies configuration
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // true in production with HTTPS
      },
    },
  },

  callbacks: {
    async signIn({ user, account }) {
      try {
        const client = await clientPromise;
        const db = client.db('ritul');
        const usersCollection = db.collection('users');

        if (account.provider === 'google') {
          const existingUser = await usersCollection.findOne({ email: user.email });

          if (!existingUser) {
            await usersCollection.insertOne({
              name: user.name,
              email: user.email,
              isVerified: true,
              password: null,
            });
            console.log(`✅ Google user inserted: ${user.email}`);
          } else {
            console.log(`🔁 Google user exists: ${user.email}`);
          }
        }

        return true;
      } catch (error) {
        console.error('SignIn error:', error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
