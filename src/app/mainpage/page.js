// app/mainpage/page.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Menu, X } from 'lucide-react';
import ChatHistoryPage from "../chathistory/page";
import ChatInputPage from "../chatinput/page";
import ChatDisplayPage from "../chatdisplay/page";
import ApiKeyInstructions from "../components/ApiKeyInstructions";

export default function MainPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKeyStatus, setApiKeyStatus] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Function to test API key configuration
  const testApiKey = async () => {
    try {
      const response = await fetch('/api/gemini');
      const data = await response.json();
      setApiKeyStatus(data);
      console.log('API key status:', data);
      
      if (data.status === 'success') {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            text: `API key is properly configured (${data.details.maskedKey}, length: ${data.details.keyLength})`,
            type: 'ai'
          }
        ]);
      } else {
        setError('API key is not configured properly');
      }
    } catch (err) {
      console.error('Error testing API key:', err);
      setError('Error testing API key configuration');
    }
  };

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define the callback before any conditional returns
  const handleNewMessage = useCallback(async (newMessage, file = null, analysisResult = null) => {
    if (newMessage.trim() !== "" || file || analysisResult) {
      // Reset any previous errors
      setError(null);
      
      // Create message object with optional file attachment
      const userMessage = {
        text: newMessage,
        type: 'user',
        file: file ? {
          name: file.name,
          type: file.type,
          size: file.size,
          url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        } : null
      };
      
      // Add user message
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Set loading state (unless we already have analysis results)
      if (!analysisResult) {
        setIsLoading(true);
      }
      
      // Close sidebar on mobile after sending a message
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
      
      try {
        // If we already have analysis results, use them directly
        if (analysisResult) {
          setMessages(prevMessages => [
            ...prevMessages, 
            {
              text: analysisResult.reply,
              type: 'ai',
              analysisResult: {
                prediction: analysisResult.prediction,
                category: analysisResult.category
              }
            }
          ]);
          return;
        }
        
        // Prepare the message for Gemini
        let prompt = newMessage;
        
        // If there's a file, add context about it
        if (file) {
          prompt += `\n\nNote: The user has also attached a file named "${file.name}" of type "${file.type}".`;
          // In a real implementation, you might want to upload the file to a server
          // and include a reference or extract text from documents
        }
        
        console.log('Sending message to Gemini API');
        
        // Call the Gemini API with the correct route path
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: prompt }),
        });
        
        // Check response content type to debug issues
        const contentType = response.headers.get('content-type');
        console.log('Response content type:', contentType);
        
        // Handle non-JSON responses
        if (contentType && !contentType.includes('application/json')) {
          const textResponse = await response.text();
          console.error('Non-JSON response:', textResponse.substring(0, 500)); // Log first 500 chars
          throw new Error('Received non-JSON response from server');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('API error:', response.status, data);
          throw new Error(data.error || `API returned status ${response.status}`);
        }
        
        // Add AI response to messages
        setMessages(prevMessages => [
          ...prevMessages, 
          {
            text: data.reply,
            type: 'ai'
          }
        ]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        setError(error.message || 'Unknown error occurred');
        
        // Add error message
        setMessages(prevMessages => [
          ...prevMessages, 
          {
            text: "I'm sorry, I encountered an error processing your request. Please check the console for details and ensure your API key is correctly configured.",
            type: 'ai'
          }
        ]);
      } finally {
        // Clear loading state
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/loginpage");
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2e84cc]"></div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-white">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Sidebar */}
      <div 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transform transition-transform duration-300 ease-in-out md:translate-x-0 fixed md:static top-0 left-0 h-full md:h-screen z-40 bg-white shadow-lg md:shadow-md md:w-64 w-3/4 overflow-hidden`}
      >
        <ChatHistoryPage />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full md:w-auto h-screen overflow-hidden">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 m-2 rounded relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="block text-sm sm:text-base">Error connecting to AI service. Please check your API key configuration.</span>
              <div className="flex space-x-2">
                <button 
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                  onClick={testApiKey}
                >
                  Test API Key
                </button>
                <button 
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm"
                  onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
                >
                  Get API Key
                </button>
              </div>
            </div>
            <ApiKeyInstructions />
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          <ChatDisplayPage messages={messages} />
        </div>
        <div className="p-2 sm:p-4">
          <ChatInputPage onSend={handleNewMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
