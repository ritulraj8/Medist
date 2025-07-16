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
    const formData = await req.formData();
    const image = formData.get('image');
    
    if (!image) {
      return createJsonResponse({ error: 'No image provided' }, 400);
    }

    // Create a new FormData object for the Flask server
    const flaskFormData = new FormData();
    flaskFormData.append('image', image);

    // Send the image to the Flask server for analysis
    const flaskResponse = await fetch('http://localhost:5000/analyze', {
      method: 'POST',
      body: flaskFormData,
    });

    if (!flaskResponse.ok) {
      const errorText = await flaskResponse.text();
      console.error('Flask server error:', flaskResponse.status, errorText);
      return createJsonResponse({ 
        error: `Image analysis error: ${flaskResponse.status}`,
        reply: "I'm sorry, there was an error analyzing the image. Please try again later."
      }, 500);
    }

    // Get the analysis results
    const analysisResult = await flaskResponse.json();
    
    // Call Gemini API to get detailed information about the condition
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API Key is not defined in environment variables');
      return createJsonResponse({ 
        error: 'API key missing',
        reply: "I was able to analyze the image, but I couldn't provide detailed information due to a configuration issue."
      }, 500);
    }

    // Prepare the prompt for Gemini based on the analysis result
    let prompt = '';
    if (analysisResult.category === "Alzheimer's Disease") {
      prompt = `You are Medist, a helpful medical assistant AI. The user has uploaded an MRI scan that has been analyzed and classified as "${analysisResult.prediction}" in the category of "${analysisResult.category}". 
      
      Please provide a detailed but compassionate explanation about:
      1. What this condition means
      2. Common symptoms associated with this stage
      3. General treatment approaches
      4. What the patient should do next
      
      Keep your response concise, accurate, and supportive. Do not make definitive diagnoses or replace professional medical advice.`;
    } 
    else if (analysisResult.category === "Brain Tumor") {
      prompt = `You are Medist, a helpful medical assistant AI. The user has uploaded an MRI scan that has been analyzed and the model has ${analysisResult.prediction === 'yes' ? 'detected' : 'not detected'} a potential brain tumor.
      
      Please provide a detailed but compassionate explanation about:
      1. What this result means
      2. Common symptoms associated with brain tumors
      3. General diagnostic and treatment approaches
      4. What the patient should do next
      
      Keep your response concise, accurate, and supportive. Do not make definitive diagnoses or replace professional medical advice.`;
    }
    else if (analysisResult.category === "Diabetic Retinopathy") {
      prompt = `You are Medist, a helpful medical assistant AI. The user has uploaded an eye scan that has been analyzed and classified as "${analysisResult.prediction}" in the category of "${analysisResult.category}".
      
      Please provide a detailed but compassionate explanation about:
      1. What this condition means
      2. Common symptoms associated with this stage
      3. General treatment approaches
      4. What the patient should do next
      
      Keep your response concise, accurate, and supportive. Do not make definitive diagnoses or replace professional medical advice.`;
    }

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
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

    if (!geminiResponse.ok) {
      console.error('Gemini API Error:', geminiResponse.status);
      // Return just the analysis result without the detailed explanation
      return createJsonResponse({ 
        ...analysisResult,
        reply: `Image Analysis Result: ${analysisResult.prediction} (${analysisResult.category}). I couldn't retrieve detailed information at this time.`
      });
    }

    const geminiData = await geminiResponse.json();
    const detailedExplanation = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I apologize, but I was unable to generate detailed information about this condition.";

    // Return combined result
    return createJsonResponse({
      ...analysisResult,
      reply: `**Image Analysis Result:** ${analysisResult.prediction} (${analysisResult.category})\n\n${detailedExplanation}`
    });

  } catch (err) {
    console.error('Request processing error:', err);
    return createJsonResponse({ 
      error: `Request error: ${err.message}`,
      reply: "I'm sorry, I'm having trouble processing your image right now. Please try again in a moment."
    }, 500);
  }
} 