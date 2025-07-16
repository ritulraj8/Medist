import { NextResponse } from 'next/server';

// Helper function to ensure we return JSON responses
const createJsonResponse = (data, status = 200) => {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export async function POST(req) {
  try {
    const { message } = await req.json();

    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API Key is not defined in environment variables');
      return createJsonResponse({ 
        error: 'API key missing',
        reply: "I'm sorry, there's a configuration issue with the AI service. Please contact the administrator." 
      }, 500);
    }

    // Add medical context to the prompt
    const enhancedPrompt = `You are Medist, a helpful medical assistant AI. Please provide accurate, helpful information about health topics.Don't scare the user by giving too much information.Keep asking follow-up questions dont keep asking many follow up question just follow up question until the problem is found and give the solution.

${message}`;

    console.log('Sending request to Gemini API...');
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: enhancedPrompt }] }],
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 800,
            }
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API Error Response:', response.status, errorData);
        return createJsonResponse({ 
          error: `Gemini API error: ${response.status}`,
          reply: `I'm sorry, the AI service returned an error (${response.status}). Please verify your API key is valid and has sufficient quota.` 
        }, 500);
      }

      const data = await response.json();
      console.log('Received response from Gemini API');
      
      // Handle potential errors in the API response
      if (data.error) {
        console.error('Gemini API Error:', data.error);
        return createJsonResponse({ 
          error: data.error,
          reply: "I'm sorry, I encountered an error processing your request. Please try again later." 
        }, 500);
      }
      
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I was unable to generate a response. Please try rephrasing your question.';

      return createJsonResponse({ reply });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return createJsonResponse({ 
        error: `Fetch error: ${fetchError.message}`,
        reply: "I'm sorry, there was a network error when contacting the AI service. Please try again later."
      }, 500);
    }
  } catch (err) {
    console.error('Request processing error:', err);
    return createJsonResponse({ 
      error: `Request error: ${err.message}`,
      reply: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment."
    }, 500);
  }
}