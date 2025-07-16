'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <Toaster position="bottom-center" />
      {children}
    </SessionProvider>
  );
}
