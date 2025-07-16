"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function SignUpPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    const handleChange = (e) => {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const { name, email, password, confirmPassword } = formData;
  
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
  
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        toast.success('Signup successful! Please check your email for verification.');
        router.push('/loginpage');
      } else {
        toast.error(data.error || 'Signup failed');
      }
    };
   
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2e84cc]">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full h-120 max-w-md">
          <h1 className="text-3xl font-bold text-center text-[#0B3259] mb-6">Sign Up</h1>
  
          <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            <input
              name="name"
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2e84cc]"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2e84cc]"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2e84cc]"
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2e84cc]"
            />
  
            <button
              type="submit"
              className="bg-[#2e84cc] text-white py-3 rounded-md font-semibold hover:bg-blue-600 transition duration-200"
            >
              Sign Up
            </button>
          </form>
  
          <div className="mt-3 text-center">
            <p className="text-gray-600">Already have an account?</p>
            <a
              href="/loginpage"
              className="text-[#2e84cc] font-semibold hover:underline"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    );
    
  }
  