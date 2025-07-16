import { NextResponse } from 'next/server';

export async function GET() {
  // Check if API key is available
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ 
      status: 'error',
      message: 'Gemini API Key is not defined in environment variables'
    }, { status: 500 });
  }
  
  // Return first few characters of API key (safely)
  const firstChars = apiKey.substring(0, 4);
  const lastChars = apiKey.substring(apiKey.length - 4);
  const maskedKey = `${firstChars}...${lastChars}`;
  const keyLength = apiKey.length;
  
  return NextResponse.json({
    status: 'success',
    message: 'API key is configured',
    details: {
      keyLength,
      maskedKey,
      environment: process.env.NODE_ENV
    }
  });
} 