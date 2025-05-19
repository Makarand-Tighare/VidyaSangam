import React, { useState, useEffect } from "react";
import { Loader2, LightbulbIcon, Clock } from "lucide-react";

// Array of short loading phrases
const LOADING_PHRASES = [
  "Almost there...",
  "Processing...",
  "Fetching data...",
  "Just a moment...",
  "Loading content...",
  "Gathering information...",
  "Preparing your view...",
  "Calculating results...",
  "Connecting to server...",
  "Organizing content...",
  "Loading resources...",
  "Rendering view...",
  "Analyzing data...",
  "Building interface...",
  "Retrieving your content..."
];

export function ContentLoader({ message = "Loading...", className = "" }) {
  const [phraseIndex, setPhraseIndex] = useState(Math.floor(Math.random() * LOADING_PHRASES.length));
  const [dots, setDots] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Simulate a delay of 4-5 seconds
    const minDelay = 4000; // 4 seconds
    const maxDelay = 5000; // 5 seconds
    const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    
    const loadingTimeout = setTimeout(() => {
      setProgress(100);
      setIsReady(true);
    }, randomDelay);
    
    // Change phrase every 2.5 seconds
    const phraseInterval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % LOADING_PHRASES.length);
    }, 2500);
    
    // Animate dots every 400ms
    const dotsInterval = setInterval(() => {
      setDots(prev => prev < 3 ? prev + 1 : 1);
    }, 400);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 8 + 2; // 2-10
        return prev < 85 ? Math.min(prev + increment, 85) : prev;
      });
    }, 800);
    
    return () => {
      clearInterval(phraseInterval);
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
      clearTimeout(loadingTimeout);
    };
  }, []);
  
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="relative">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-75 blur-sm animate-pulse"></div>
        <div className="relative bg-white rounded-full p-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-blue-700 font-medium text-lg mb-1">{message}</p>
        <p className="text-blue-500 text-sm animate-pulse">
          {LOADING_PHRASES[phraseIndex]}{'.'.repeat(dots)}
        </p>
      </div>
      
      <div className="w-64 bg-gray-200 rounded-full h-1.5 mt-6 mb-4">
        <div 
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-center mt-2 space-x-2">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" 
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
}

export function InlineLoader({ message = "Loading...", size = "sm", className = "" }) {
  const [dots, setDots] = useState(1);
  const [phrase, setPhrase] = useState(() => 
    LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]
  );
  
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => prev < 3 ? prev + 1 : 1);
    }, 400);
    
    // Change phrase every 3 seconds
    const phraseInterval = setInterval(() => {
      setPhrase(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);
    }, 3000);
    
    return () => {
      clearInterval(dotsInterval);
      clearInterval(phraseInterval);
    };
  }, []);
  
  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };
  
  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };
  
  const actualMessage = message === "Loading..." ? phrase : message;
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-blue-200 rounded-full opacity-30 animate-ping"></div>
        <Loader2 className={`animate-spin text-blue-600 relative z-10 ${sizes[size]}`} />
      </div>
      {actualMessage && (
        <span className={`text-blue-600 font-medium ${textSizes[size]}`}>
          {actualMessage}{'.'.repeat(dots)}
        </span>
      )}
    </div>
  );
}

// A skeleton loader for content that's loading
export function SkeletonLoader({ rows = 3, className = "" }) {
  return (
    <div className={`w-full space-y-4 ${className}`}>
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// A card skeleton loader
export function CardSkeletonLoader({ className = "" }) {
  return (
    <div className={`border rounded-lg shadow-sm p-4 w-full animate-pulse ${className}`}>
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="flex justify-between mt-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
} 