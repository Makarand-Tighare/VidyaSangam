import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import NavBar from "@/app/components/navBar";

// Array of educational tips that will rotate during loading
const LOADING_TIPS = [
  "Did you know? Mentors with diverse tech stacks help mentees gain broader perspectives.",
  "Tip: Regularly sharing your progress with your mentor leads to better outcomes.",
  "Fun fact: The best mentorship relationships often continue beyond formal programs.",
  "Quick tip: Asking specific questions gets you more helpful responses.",
  "Remember: The best way to learn is by teaching others what you know.",
  "Fact: Setting clear goals at the beginning of mentorship increases success rates.",
  "Tip: Documenting your learning journey helps reinforce new concepts.",
  "Did you know? Taking short breaks during study sessions improves retention.",
  "Reminder: Celebrate small achievements along your learning path.",
  "Fact: The IT industry values continuous learning more than most other fields.",
  "Insight: The most successful tech professionals are often great communicators.",
  "Curious fact: Regular code reviews can improve a team's overall code quality by 30-40%.",
  "Learning tip: Understanding the 'why' is often more valuable than knowing the 'how'.",
  "Did you know? Writing pseudocode before actual code reduces debugging time.",
  "Career advice: Building a strong portfolio is as important as obtaining degrees.",
  "Productivity tip: The Pomodoro Technique can boost your focus and efficiency.",
  "Fact: Most successful innovations come from interdisciplinary knowledge.",
  "Reminder: Mentorship is a two-way learning experience.",
  "Interesting: The fastest-growing tech roles today didn't exist 10 years ago.",
  "Learning hack: Teaching a concept to someone else solidifies your own understanding."
];

export function PageLoader({ message = "Loading..." }) {
  const [tipIndex, setTipIndex] = useState(Math.floor(Math.random() * LOADING_TIPS.length));
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Simulate a delay of 4-5 seconds
    const minDelay = 4000; // 4 seconds
    const maxDelay = 5000; // 5 seconds
    const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    
    // Set a timeout to simulate loading completion
    const loadingTimeout = setTimeout(() => {
      setIsVisible(false);
    }, randomDelay);
    
    // Rotate through tips every 4 seconds
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % LOADING_TIPS.length);
    }, 3000);
    
    // Simulate progress with random increments
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 8 + 2; // Between 2-10
        return prev < 90 ? Math.min(prev + increment, 90) : prev;
      });
    }, 800);
    
    // When timeout completes, quickly finish the progress bar
    const completeProgress = () => {
      setProgress(100);
    };
    
    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
      clearTimeout(loadingTimeout);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="flex flex-col items-center justify-center h-[80vh] px-4">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
          <Loader2 className="absolute inset-0 m-auto h-10 w-10 animate-pulse text-blue-600" />
        </div>
        
        <h3 className="text-xl font-semibold text-blue-700 mb-2">{message}</h3>
        
        <div className="w-72 md:w-96 bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="max-w-md text-center transition-opacity duration-500 animate-pulse">
          <p className="text-gray-600 font-medium">{LOADING_TIPS[tipIndex]}</p>
        </div>
      </div>
    </div>
  );
}

export function PageLoaderWithNav({ message = "Loading..." }) {
  const [tipIndex, setTipIndex] = useState(Math.floor(Math.random() * LOADING_TIPS.length));
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Simulate a delay of 4-5 seconds
    const minDelay = 4000; // 4 seconds
    const maxDelay = 5000; // 5 seconds
    const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    
    // Set a timeout to simulate loading completion
    const loadingTimeout = setTimeout(() => {
      setProgress(100); // Complete the progress
      setIsReady(true);
    }, randomDelay);
    
    // Rotate through tips every 3 seconds
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % LOADING_TIPS.length);
    }, 3000);
    
    // Simulate progress with random increments
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 8 + 2; // Between 2-10
        return prev < 85 ? Math.min(prev + increment, 85) : prev;
      });
    }, 800);
    
    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
      clearTimeout(loadingTimeout);
    };
  }, []);
  
  // We're using isReady flag just for the delayed rendering effect
  // In reality we'll continue showing the loader until the page content is ready
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <NavBar />
      <div className="flex flex-col items-center justify-center h-[70vh] px-4">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
          <Loader2 className="absolute inset-0 m-auto h-10 w-10 animate-pulse text-blue-600" />
        </div>
        
        <h3 className="text-xl font-semibold text-blue-700 mb-2">{message}</h3>
        
        <div className="w-72 md:w-96 bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="max-w-md text-center transition-opacity duration-500 animate-pulse">
          <p className="text-gray-600 font-medium">{LOADING_TIPS[tipIndex]}</p>
        </div>
      </div>
    </div>
  );
} 