"use client";
import React from 'react';
import Image from 'next/image';

export default function ChatHistoryPage() {
    return (
        <div className="flex h-screen w-70 p-5 shadow-md items-start justify-start">
            <div>
                <div className="flex flex-row items-start justify-start -ml-2">
                    <Image src="/images/logo.png" width={40} height={40} alt="Logo" className="w-10 h-10 ml-0" />
                    <h1 className="font-bold text-[#0B3259] text-3xl ml-1">Medist</h1>
                </div>
                <div className="mt-3">
                    <button className="bg-[#2e84cc] w-35 h-13 border-2 rounded-lg border-transparent text-white hover:bg-blue-500 cursor-pointer p-2">
                        New chat
                    </button>
                </div>
            </div>
        </div>
    );
}