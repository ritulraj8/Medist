"use client";
import React, { useRef, useState } from "react";
import { Paperclip, X, Loader2 } from 'lucide-react';
import { FaArrowUp } from "react-icons/fa6";

export default function ChatInputPage({ onSend, isLoading = false }) {
    const [input, setInput] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
    const fileInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isLoading || isAnalyzingImage) return;

        // If there's an image file and it's a medical image, analyze it first
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setIsAnalyzingImage(true);
            try {
                const formData = new FormData();
                formData.append('image', selectedFile);

                const response = await fetch('/api/image-analysis', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Image analysis failed: ${response.status}`);
                }

                const result = await response.json();
                
                // Send the analysis result as a message
                onSend(input || "Please analyze this medical image", null, result);
                setInput("");
                clearFileSelection();
            } catch (error) {
                console.error("Error analyzing image:", error);
                // Still send the message with the image if analysis fails
                onSend(input || "Please analyze this medical image", selectedFile);
                setInput("");
                clearFileSelection();
            } finally {
                setIsAnalyzingImage(false);
            }
        } else if (input.trim() !== "" || selectedFile) {
            // Regular message or non-medical image file
            onSend(input, selectedFile);
            setInput("");
            clearFileSelection();
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isLoading && !isAnalyzingImage) {
            e.preventDefault();
            handleSubmit(e);
        }
    }

    const handleFileClick = () => {
        if (!isLoading && !isAnalyzingImage) {
            fileInputRef.current.click();
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            
            // Create preview URL for images
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            } else {
                setPreviewUrl(null);
            }
        }
    }

    const clearFileSelection = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
            {/* File preview area */}
            {selectedFile && (
                <div className="mx-2 mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
                    <div className="flex items-center overflow-hidden">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="h-8 w-8 sm:h-10 sm:w-10 object-cover rounded flex-shrink-0" />
                        ) : (
                            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-100 flex items-center justify-center rounded flex-shrink-0">
                                <span className="text-xs text-blue-500">{selectedFile.name.split('.').pop()}</span>
                            </div>
                        )}
                        <span className="ml-2 text-xs sm:text-sm text-gray-600 truncate max-w-[150px] sm:max-w-[200px]">
                            {selectedFile.name}
                        </span>
                    </div>
                    <button 
                        type="button" 
                        onClick={clearFileSelection}
                        disabled={isLoading || isAnalyzingImage}
                        className={`text-gray-500 hover:text-red-500 flex-shrink-0 ml-2 ${(isLoading || isAnalyzingImage) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            
            <div className="relative">
                {/* Hidden file input */}
                <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    disabled={isLoading || isAnalyzingImage}
                />
                
                {/* Textarea */}
                <textarea
                    rows={2}
                    placeholder={
                        isLoading ? "Waiting for response..." : 
                        isAnalyzingImage ? "Analyzing medical image..." : 
                        "Ask a health question..."
                    }
                    className={`w-full resize-none p-3 sm:p-4 pr-12 sm:pr-16 pl-10 sm:pl-12 text-sm sm:text-base rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 shadow-sm bg-gray-50 placeholder-gray-400 ${(isLoading || isAnalyzingImage) ? 'opacity-70' : ''}`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    style={{ minHeight: '50px', maxHeight: '150px', overflowY: 'auto' }}
                    disabled={isLoading || isAnalyzingImage}
                />

                {/* Paperclip Icon */}
                <button 
                    type="button"
                    onClick={handleFileClick}
                    disabled={isLoading || isAnalyzingImage}
                    className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 transition-all duration-150 ${(isLoading || isAnalyzingImage) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Send Button or Loading Spinner */}
                <button 
                    type="submit"
                    disabled={isLoading || isAnalyzingImage || (input.trim() === "" && !selectedFile)}
                    className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-1.5 sm:p-2 rounded-md shadow-md transition-all duration-150 ${(isLoading || isAnalyzingImage || (input.trim() === "" && !selectedFile)) ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    {isLoading || isAnalyzingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <FaArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                </button>
            </div>
        </form>
    );
}
