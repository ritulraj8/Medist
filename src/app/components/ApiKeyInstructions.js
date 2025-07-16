"use client";
import React, { useState } from 'react';

export default function ApiKeyInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4 mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-blue-500 hover:text-blue-700 font-medium flex items-center"
      >
        {isOpen ? '▼ ' : '▶ '} How to set up your Gemini API key
      </button>
      
      {isOpen && (
        <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="font-bold text-lg mb-2">Setting up your Gemini API key</h3>
          
          <ol className="list-decimal pl-5 space-y-2">
            <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Google AI Studio</a></li>
            <li>Sign in with your Google account</li>
            <li>Click on "Get API key" or "Create API key"</li>
            <li>Copy the generated API key</li>
            <li>Create a <code className="bg-gray-200 px-1 rounded">.env.local</code> file in the root of this project</li>
            <li>Add the following line to the file:
              <pre className="bg-gray-800 text-green-400 p-2 rounded mt-1 overflow-x-auto">
                GEMINI_API_KEY=your_api_key_here
              </pre>
            </li>
            <li>Restart your Next.js development server</li>
          </ol>
          
          <div className="mt-4 p-2 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
            <p><strong>Note:</strong> Make sure not to commit your API key to version control.</p>
          </div>
        </div>
      )}
    </div>
  );
} 