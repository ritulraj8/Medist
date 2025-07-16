import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';

// Create authOptions that can be imported elsewhere
// This should match the configuration in your [...nextauth]/route.js
export const authOptions = {
  providers: [
    // Add your providers here - copy from your [...nextauth]/route.js
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
  // Add your callbacks here - copy from your [...nextauth]/route.js
};

// Server-side functions

// Function to check authentication and redirect if not authenticated
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/loginpage');
  }
  
  return session;
}

// Function to redirect if already authenticated (for login pages)
export async function redirectIfAuthenticated(redirectTo = '/mainpage') {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect(redirectTo);
  }
  
  return session;
}

// Client-side functions
// These must be used in client components (marked with "use client")

// Function to handle Google sign-in
export async function handleGoogleSignIn() {
  return await signIn('google', { callbackUrl: '/mainpage' });
}

// Function to handle credential-based sign-in
export async function handleCredentialsSignIn(email, password) {
  return await signIn('credentials', {
    redirect: false,
    email,
    password
  });
}

// Function to sign out
export async function handleSignOut() {
  return await signOut({ callbackUrl: '/loginpage' });
}