"use client";
import React, { useEffect, useRef, useState } from "react";
import { FileIcon, ImageIcon, Activity } from 'lucide-react';

// TypewriterText component for animating text
const TypewriterText = ({ text, textColor = "text-gray-800" }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  
  // Reset animation when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setShowCursor(true);
  }, [text]);
  
  // Typing effect
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, 30); // Speed of typing - adjust as needed
      
      return () => clearTimeout(timeout);
    } else {
      // Animation is complete, stop showing cursor after a delay
      const timeout = setTimeout(() => {
        setShowCursor(false);
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);
  
  // Blinking cursor effect
  useEffect(() => {
    if (currentIndex < text.length || showCursor) {
      const cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500); // Blink rate
      
      return () => clearInterval(cursorInterval);
    }
  }, [currentIndex, text.length, showCursor]);
  
  // Convert markdown-style formatting to HTML
  const formatText = (text) => {
    // Replace **text** with <strong>text</strong>
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace newlines with <br />
    formattedText = formattedText.replace(/\n/g, '<br />');
    
    return formattedText;
  };
  
  return (
    <p className={textColor} dangerouslySetInnerHTML={{ __html: formatText(displayedText) }}>
      {showCursor && <span className="animate-pulse">|</span>}
    </p>
  );
};

// FileAttachment component to display file attachments
const FileAttachment = ({ file }) => {
  if (!file) return null;
  
  return (
    <div className="mt-2 mb-1">
      {file.url ? (
        <div className="relative">
          <img 
            src={file.url} 
            alt={file.name}
            className="max-w-full h-auto rounded-md max-h-40 sm:max-h-60 object-contain" 
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded">
            {file.name}
          </div>
        </div>
      ) : (
        <div className="flex items-center p-2 bg-gray-100 rounded-md">
          <div className="bg-blue-100 p-1.5 sm:p-2 rounded-md mr-2 flex-shrink-0">
            {file.type.includes('pdf') ? (
              <FileIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            ) : file.type.includes('doc') ? (
              <FileIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-800" />
            ) : (
              <FileIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            )}
          </div>
          <span className="text-xs sm:text-sm text-gray-700 truncate max-w-[120px] sm:max-w-[200px]">
            {file.name}
          </span>
          <span className="text-xs text-gray-500 ml-2 hidden sm:inline">
            {(file.size / 1024).toFixed(1)} KB
          </span>
        </div>
      )}
    </div>
  );
};

// Medical Analysis Result component
const MedicalAnalysisResult = ({ analysisResult }) => {
  if (!analysisResult) return null;
  
  // Determine the severity color based on the prediction
  const getSeverityColor = (category, prediction) => {
    if (category === "Alzheimer's Disease") {
      if (prediction === "NonDemented") return "bg-green-100 text-green-800";
      if (prediction === "VeryMildDemented") return "bg-yellow-100 text-yellow-800";
      if (prediction === "MildDemented") return "bg-orange-100 text-orange-800";
      if (prediction === "ModerateDemented") return "bg-red-100 text-red-800";
    } else if (category === "Brain Tumor") {
      return prediction === "yes" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800";
    } else if (category === "Diabetic Retinopathy") {
      if (prediction === "Healthy") return "bg-green-100 text-green-800";
      if (prediction === "Mild DR") return "bg-yellow-100 text-yellow-800";
      if (prediction === "Moderate DR") return "bg-orange-100 text-orange-800";
      if (prediction === "Severe DR" || prediction === "Proliferate DR") return "bg-red-100 text-red-800";
    }
    return "bg-blue-100 text-blue-800";
  };
  
  const severityColor = getSeverityColor(analysisResult.category, analysisResult.prediction);
  
  return (
    <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
      <div className="flex items-center mb-2">
        <Activity className="h-4 w-4 mr-2 text-blue-600" />
        <span className="font-medium text-gray-700">{analysisResult.category} Analysis</span>
      </div>
      <div className="flex items-center">
        <span className="text-sm text-gray-600 mr-2">Result:</span>
        <span className={`text-sm font-medium px-2 py-0.5 rounded ${severityColor}`}>
          {analysisResult.prediction}
        </span>
      </div>
    </div>
  );
};

export default function ChatDisplayPage({ messages }) {
    const messagesEndRef = useRef(null);

    // Auto-scroll to the bottom when new messages are added
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // If there are no messages, show a welcome message
    if (!messages || messages.length === 0) {
        return (
            <div className="flex flex-col w-full mx-auto bg-transparent">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-4 sm:p-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">Welcome to Medist</h2>
                        <p className="text-sm sm:text-base text-gray-500">Ask any health-related question to get started</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full mx-auto bg-transparent">
          {/* Chat messages area */}
          <div className="flex-1 p-3 sm:p-6 space-y-3 sm:space-y-4 flex flex-col">
            {messages.map((message, index) => {
              const isUserMessage = message.type === 'user';
              
              return (
                <div
                  key={index}
                  className={`${isUserMessage ? 'self-end bg-[#2e84cc]' : 'self-start bg-transparent'} p-3 sm:p-4 rounded-lg max-w-[85%] sm:max-w-[80%] w-fit break-words`}
                >
                  {message.file && isUserMessage && (
                    <FileAttachment file={message.file} />
                  )}
                  
                  {!isUserMessage && message.analysisResult && (
                    <MedicalAnalysisResult analysisResult={message.analysisResult} />
                  )}
                  
                  {isUserMessage ? (
                    <p className="text-white text-sm sm:text-base">{message.text}</p>
                  ) : (
                    <TypewriterText text={message.text} textColor="text-gray-800 text-sm sm:text-base" />
                  )}
                </div>
              );
            })}
            {/* Scroll to bottom ref */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      );
}
