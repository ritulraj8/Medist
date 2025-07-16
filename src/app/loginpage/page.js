"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/mainpage'); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2e84cc]">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-[#0B3259] mb-6">Login</h1>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2e84cc]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2e84cc]"
          />
          <button
            type="submit"
            className="bg-[#2e84cc] text-white py-3 rounded-md font-semibold hover:bg-blue-600 transition duration-200"
          >
            Login
          </button>

          <button
            type="button"
            onClick={async () => {
              await signIn('google', { callbackUrl: '/mainpage' });
            }}
            className="flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-md font-semibold hover:bg-gray-100 transition duration-200"
          >
            <Image
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span>Sign in with Google</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Don't have an account?</p>
          <Link href="/signup" className="text-[#2e84cc] font-semibold hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}


  
  