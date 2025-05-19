'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Moon, Sun, ArrowLeft, Loader2, Info, X, Sparkles, History, Trash2, Plus, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { InlineLoader } from '@/components/ui/content-loader';

// System prompt with comprehensive knowledge about VidyaSangam
const VIDYASANGAM_SYSTEM_PROMPT = {
  role: "system",
  content: `You are a helpful assistant for VidyaSangam, a platform connecting mentors and mentees at Yeshwantrao Chavan College of Engineering. 

Key features of VidyaSangam:
- Mentor-mentee matching based on tech stack, interests, and academic background
- Student users can apply to become mentors or mentees through an 8-section application form
- Session management (virtual via Google Meet or in-person) for mentorship meetings
- Task and quiz assignment for mentors to help mentees develop skills
- Progress tracking with badges and points system
- Profile management with LinkedIn integration
- Secure JWT token-based authentication with localStorage persistence

User roles:
- Student: Basic registered user
- Mentee: Student assigned to a mentor
- Mentor: Approved user who guides mentees
- Admin: Platform administrator

Key workflows:
- Registration and login
- Mentoring application submission and approval
- Session creation and management
- Task/quiz creation and completion
- Progress tracking and badge earning

Only answer questions related to VidyaSangam platform features, career guidance, and academic mentorship. Provide concise, well-formatted responses with numbered or bulleted points when appropriate.`
};

// Fallback initial questions in case API fails
const FALLBACK_QUESTIONS = [
  "What is VidyaSangam?",
  "How do I apply to become a mentor?",
  "How do mentorship sessions work?"
];

export default function Chatassistant() {
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "Welcome to VidyaSangam! How can I assist you today?",
      timestamp: new Date().toISOString() 
    }
  ]);
  const [input, setInput] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typingEffect, setTypingEffect] = useState(false);
  const [lastResponse, setLastResponse] = useState("");
  const [showTips, setShowTips] = useState(false);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true); // Start with loading state
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();
  const [isInputFocused, setIsInputFocused] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, typingEffect]);

  // Generate initial questions when component first loads
  useEffect(() => {
    generateInitialQuestions();
  }, []);

  // Generate initial suggested questions
  const generateInitialQuestions = async () => {
    try {
      const response = await fetch('/api/openaiChatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [
            VIDYASANGAM_SYSTEM_PROMPT,
            { 
              role: "user", 
              content: "As a new user of VidyaSangam platform, what are the top 3 questions I might want to ask to get started? Respond with just the questions in a JSON array format like [\"Question 1?\", \"Question 2?\", \"Question 3?\"]."
            }
          ]
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        let questionsArray = [];
        try {
          // Try to parse the response as JSON
          const responseText = data.response.trim();
          if (responseText.startsWith('[') && responseText.endsWith(']')) {
            questionsArray = JSON.parse(responseText);
          } else {
            // If not properly formatted JSON, extract using regex
            const matches = responseText.match(/"([^"]+)"/g);
            if (matches) {
              questionsArray = matches.map(m => m.replace(/"/g, ''));
            } else {
              // Simple split by newline as fallback
              questionsArray = responseText.split(/\n/)
                .map(line => line.replace(/^\d+\.\s*/, '').trim())
                .filter(line => line.length > 0 && line.endsWith('?'))
                .slice(0, 3);
            }
          }
          
          // Ensure we have exactly 3 questions
          if (questionsArray.length > 3) {
            questionsArray = questionsArray.slice(0, 3);
          } else if (questionsArray.length < 3) {
            // If we have fewer than 3, add from fallback
            while (questionsArray.length < 3) {
              const fallbackQ = FALLBACK_QUESTIONS[questionsArray.length];
              if (!questionsArray.includes(fallbackQ)) {
                questionsArray.push(fallbackQ);
              }
            }
          }
          
          setSuggestedQuestions(questionsArray);
        } catch (error) {
          console.error("Error parsing initial questions:", error);
          setSuggestedQuestions(FALLBACK_QUESTIONS);
        }
      } else {
        setSuggestedQuestions(FALLBACK_QUESTIONS);
      }
    } catch (error) {
      console.error("Error generating initial questions:", error);
      setSuggestedQuestions(FALLBACK_QUESTIONS);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Load chat history from localStorage
   useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      // If user is not logged in, redirect to the login page
      router.push("/login");
      return;
    }
    
    // Load chat history from localStorage
    const savedMessages = localStorage.getItem("chatHistory");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Only set messages if there's actual history
        if (parsedMessages.length > 0) {
          setMessages(parsedMessages);
          
          // Generate suggested questions if there are messages
          if (parsedMessages.length > 1) {
            generateSuggestedQuestions(parsedMessages);
          }
        }
      } catch (error) {
        console.error("Error parsing chat history:", error);
      }
    }
    
    // Focus the input on load
    inputRef.current?.focus();
    
    // Check preferred color scheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }

    // Show tips after 2 seconds for first-time users
    const hasSeenTips = localStorage.getItem("hasSeenChatbotTips");
    if (!hasSeenTips) {
      const timer = setTimeout(() => {
        setShowTips(true);
      }, 2000);
      return () => clearTimeout(timer);
    } 
  }, [router]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    // Don't save if we're in the middle of typing animation
    if (!typingEffect && messages.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }
  }, [messages, typingEffect]);

  // Generate suggested questions based on conversation context
  const generateSuggestedQuestions = async (messagesContext = messages) => {
    // Check if there are any user messages in the context
    const hasUserMessage = messagesContext.some(msg => msg.role === "user");
    
    // Don't generate suggestions if there are no user messages or if we're already loading
    if (!hasUserMessage) {
      // If we're at the initial state and don't have questions yet, generate initial ones
      if (suggestedQuestions.length === 0 && !loadingSuggestions) {
        generateInitialQuestions();
      }
      return;
    }
    
    // Don't generate suggestions if we're already loading or if there's only system messages
    if (loadingSuggestions || messagesContext.every(msg => msg.role === "assistant")) {
      return;
    }
    
    setLoadingSuggestions(true);
    
    try {
      // Extract the last 5 messages for context or fewer if there aren't enough
      const contextMessages = messagesContext.slice(-Math.min(5, messagesContext.length));
      
      const response = await fetch('/api/openaiChatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [
            VIDYASANGAM_SYSTEM_PROMPT, // Include system prompt for context
            ...contextMessages,
            { 
              role: "user", 
              content: "Based on our conversation, generate exactly 3 follow-up questions from user perspective that should be relevant to context going on. Respond with just the questions in a JSON array format like [\"Question 1?\", \"Question 2?\", \"Question 3?\"]."
            }
          ]
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Parse the response to extract the questions
        let questionsArray = [];
        try {
          // Try to parse the response as JSON
          const responseText = data.response.trim();
          // Handle different formats the API might return
          if (responseText.startsWith('[') && responseText.endsWith(']')) {
            questionsArray = JSON.parse(responseText);
          } else {
            // If not properly formatted JSON, extract using regex
            const matches = responseText.match(/"([^"]+)"/g);
            if (matches) {
              questionsArray = matches.map(m => m.replace(/"/g, ''));
            } else {
              // Simple split by newline as fallback
              questionsArray = responseText.split(/\n/)
                .map(line => line.replace(/^\d+\.\s*/, '').trim())
                .filter(line => line.length > 0 && line.endsWith('?'))
                .slice(0, 3);
            }
          }
          
          // Ensure we have exactly 3 questions
          if (questionsArray.length > 3) {
            questionsArray = questionsArray.slice(0, 3);
          } else if (questionsArray.length < 3) {
            // If we have fewer than 3, add generic ones to get to 3
            const defaultQuestions = [
              "Can you explain more about this topic?",
              "What are the best resources to learn more?",
              "How can I apply this knowledge in practice?"
            ];
            
            while (questionsArray.length < 3) {
              const defaultQ = defaultQuestions[questionsArray.length];
              if (!questionsArray.includes(defaultQ)) {
                questionsArray.push(defaultQ);
              }
            }
          }
          
          setSuggestedQuestions(questionsArray);
        } catch (error) {
          console.error("Error parsing suggested questions:", error);
          setSuggestedQuestions([
            "Can you elaborate on that?",
            "What other information can you provide?",
            "How does this relate to my studies?"
          ]);
        }
      } else {
        setSuggestedQuestions([
          "Can you provide more details?",
          "What else would you like to know?",
          "How can I help with your academic needs?"
        ]);
      }
    } catch (error) {
      console.error("Error generating suggested questions:", error);
      setSuggestedQuestions([
        "Can you tell me more about your question?",
        "What specific aspect are you interested in?",
        "Do you need help with a particular assignment?"
      ]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Use a suggested question and send it immediately
  const handleQuestionClick = (question) => {
    // Set the input first
    setInput(question);
    
    // Then send the message with a small delay to ensure UI updates
    setTimeout(() => {
      // Create a user message with the question
      const userMessage = { 
        role: "user", 
        content: question,
        timestamp: new Date().toISOString() 
      };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
      setSuggestedQuestions([]);
    setLoading(true);

      // Send the question to the API
      sendMessageToAPI(newMessages);
    }, 10);
  };

  // Separate function to send messages to API (used by both manual send and suggested questions)
  const sendMessageToAPI = async (messagesList) => {
    try {
      // Convert saved messages to API format (exclude timestamps)
      const apiMessages = messagesList.map(msg => ({
        role: msg.role === "assistant" ? "system" : msg.role, // Map assistant to system for API compatibility
        content: msg.content
      }));

      const response = await fetch('/api/openaiChatbot', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [
            VIDYASANGAM_SYSTEM_PROMPT, // Include system prompt with every request
            ...apiMessages
          ] 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const formattedText = data.response.replace(/\n/g, "  \n");
        
        // Add a placeholder message that will be updated during typing effect
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "", 
          timestamp: new Date().toISOString() 
        }]);
        
        // Start the typing effect
        simulateTyping(formattedText);
      } else {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "Sorry, I couldn't process that. Please try again.", 
          timestamp: new Date().toISOString() 
        }]);
        
        // Generate new suggestions even if there was an error
        setTimeout(() => generateSuggestedQuestions(), 500);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, there was an error connecting to the service. Please try again later.", 
        timestamp: new Date().toISOString() 
      }]);
      
      // Generate new suggestions even if there was an error
      setTimeout(() => generateSuggestedQuestions(), 500);
    } finally {
      setLoading(false);
    }
  };

  const simulateTyping = (text) => {
    setTypingEffect(true);
    setLastResponse("");
    
    let i = 0;
    const speed = 10; // typing speed in milliseconds
    
    const typeWriter = () => {
      if (i < text.length) {
        setLastResponse(prev => prev + text.charAt(i));
        i++;
        setTimeout(typeWriter, speed);
      } else {
        setTypingEffect(false);
        // Add the complete message to the messages array
        setMessages(prev => {
          const updatedMessages = [...prev.slice(0, -1), 
            { ...prev[prev.length - 1], content: text }
          ];
          
          // Generate new suggested questions after response, whether or not there's just one message
          setTimeout(() => generateSuggestedQuestions(updatedMessages), 100);
          
          return updatedMessages;
        });
      }
    };
    
    typeWriter();
  };

  const dismissTips = () => {
    setShowTips(false);
    localStorage.setItem("hasSeenChatbotTips", "true");
  };

  const clearChatHistory = () => {
    const initialMessage = { 
      role: "assistant", 
      content: "Chat history has been cleared. How can I assist you today?",
      timestamp: new Date().toISOString() 
    };
    setMessages([initialMessage]);
    // Generate new initial questions
    generateInitialQuestions();
    setShowHistoryMenu(false);
  };

  const startNewChat = () => {
    // Save current chat to history if it has more than just the welcome message
    if (messages.length > 1) {
      const currentHistory = JSON.parse(localStorage.getItem("chatHistoryArchive") || "[]");
      // Create a chat object with timestamp and messages
      const chatSession = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        title: getConversationTitle(),
        messages: [...messages]
      };
      
      // Add current chat to history and save it
      const updatedHistory = [chatSession, ...currentHistory].slice(0, 10); // Keep only last 10 chats
      localStorage.setItem("chatHistoryArchive", JSON.stringify(updatedHistory));
    }
    
    // Start new chat
    const initialMessage = { 
      role: "assistant", 
      content: "Started a new chat session. How can I assist you today?",
      timestamp: new Date().toISOString() 
    };
    setMessages([initialMessage]);
    // Generate new initial questions
    generateInitialQuestions();
    setShowHistoryMenu(false);
  };

  const getConversationTitle = () => {
    // Find first user message to use as title
    const firstUserMessage = messages.find(msg => msg.role === "user");
    if (firstUserMessage) {
      // Truncate to a reasonable length
      const title = firstUserMessage.content.substring(0, 30);
      return title + (firstUserMessage.content.length > 30 ? "..." : "");
    }
    return "Conversation " + new Date().toLocaleDateString();
  };

  const loadPreviousChat = (chatSession) => {
    setMessages(chatSession.messages);
    generateSuggestedQuestions(chatSession.messages);
    setShowHistoryMenu(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      role: "user", 
      content: input,
      timestamp: new Date().toISOString() 
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setSuggestedQuestions([]);
    setLoading(true);

    // Use the extracted API call function
    await sendMessageToAPI(newMessages);
    
    // Always try to generate new suggested questions after a user message
    if (!loadingSuggestions) {
      generateSuggestedQuestions(newMessages);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderMessageText = (message) => {
    return <ReactMarkdown className="prose prose-sm max-w-none">{message.content}</ReactMarkdown>;
  };

  return (
    <div className={`flex flex-col h-screen ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800'
    } transition-colors duration-300`}>
      <header className={`p-4 shadow-md backdrop-blur-md ${
        isDarkMode 
          ? 'bg-gray-800/90 border-b border-gray-700' 
          : 'bg-white/80 border-b border-gray-200'
      } transition-colors duration-300 sticky top-0 z-10`}>
        <div className="container mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className={`p-2 rounded-full transition-all duration-200 focus:outline-none ${
              isDarkMode 
                ? 'hover:bg-gray-700 active:bg-gray-600' 
                : 'hover:bg-blue-100 active:bg-blue-200'
            }`}
            aria-label="Go back"
          >
            <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </button>

          <div className="flex items-center gap-3">
            {/* Logo with animation effect */}
            <div className={`w-9 h-9 rounded-full bg-gradient-to-r ${
              isDarkMode 
                ? 'from-blue-600 to-indigo-600 shadow-lg shadow-blue-900/20' 
                : 'from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30'
            } flex items-center justify-center text-white font-bold transition-all duration-500 hover:scale-105`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className={`text-xl md:text-2xl font-bold tracking-tight ${
              isDarkMode ? 'text-white' : 'text-blue-600'
            } transition-colors duration-300`}>
              VidyaSangam Assistant
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowHistoryMenu(!showHistoryMenu)}
                className={`p-2 rounded-full transition-all duration-200 focus:outline-none ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 active:bg-gray-600' 
                    : 'hover:bg-blue-100 active:bg-blue-200'
                }`}
                aria-label="Chat history"
              >
                <History className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </button>
              
              {/* History dropdown menu */}
              {showHistoryMenu && (
                <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg overflow-hidden z-50 ${
                  isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className={`p-3 font-medium border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>Chat History</div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    <button 
                      onClick={startNewChat}
                      className={`w-full text-left p-3 flex items-center gap-2 ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 border-b border-gray-700' 
                          : 'hover:bg-gray-100 border-b border-gray-200'
                      }`}
                    >
                      <span className={`p-1 rounded ${
                        isDarkMode ? 'bg-blue-600' : 'bg-blue-100'
                      }`}>
                        <Plus className={`w-4 h-4 ${
                          isDarkMode ? 'text-white' : 'text-blue-600'
                        }`} />
                      </span>
                      <span>New Chat</span>
                    </button>
                    
                    {/* Previous chat sessions */}
                    {JSON.parse(localStorage.getItem("chatHistoryArchive") || "[]").map((chat) => (
                      <button 
                        key={chat.id}
                        onClick={() => loadPreviousChat(chat)}
                        className={`w-full text-left p-3 flex items-center gap-2 ${
                          isDarkMode 
                            ? 'hover:bg-gray-700 border-b border-gray-700' 
                            : 'hover:bg-gray-100 border-b border-gray-200'
                        }`}
                      >
                        <div className="flex-1 truncate">
                          <div className="font-medium truncate">{chat.title}</div>
                          <div className="text-xs opacity-70">{formatDate(chat.timestamp)}</div>
                        </div>
                      </button>
                    ))}
                    
                    {/* Clear current chat */}
                    <button 
                      onClick={clearChatHistory}
                      className={`w-full text-left p-3 flex items-center gap-2 ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 text-red-400' 
                          : 'hover:bg-gray-100 text-red-600'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear Current Chat</span>
                    </button>
                  </div>
                </div>
              )}
          </div>

          <button
            onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all duration-200 focus:outline-none ${
              isDarkMode 
                  ? 'hover:bg-gray-700 active:bg-gray-600' 
                  : 'hover:bg-blue-100 active:bg-blue-200'
            }`}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-300" />
            ) : (
                <Moon className="w-5 h-5 text-blue-600" />
            )}
          </button>
          </div>
        </div>
      </header>

      {/* Tips modal */}
      {showTips && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn`}>
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={dismissTips}></div>
          <div className={`relative max-w-md w-full rounded-xl shadow-2xl p-6 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <button 
              onClick={dismissTips}
              className={`absolute top-3 right-3 p-1 rounded-full ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Info className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className="text-lg font-semibold">Tips for using the chatbot</h3>
            </div>
            <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} ml-5 list-disc`}>
              <li>Ask specific questions for better answers</li>
              <li>You can use markdown in your messages</li>
              <li>Press Enter to send your message</li>
              <li>Toggle dark/light mode with the button in the header</li>
              <li>Your chat history is saved automatically</li>
              <li>Click the history icon to view past conversations</li>
              <li>Use suggested questions for quick follow-ups</li>
            </ul>
            <button 
              onClick={dismissTips}
              className={`mt-5 w-full py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      <div className={`flex-1 overflow-auto px-4 py-6 md:px-8 ${
        isDarkMode ? 'scrollbar-dark' : 'scrollbar-light'
      } relative`}>
        <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"} animate-fadeIn`}
          >
            <div
                className={`group max-w-[85%] md:max-w-[75%] px-5 py-3 rounded-2xl shadow-sm transition-all duration-300 ${
                msg.role === "assistant"
                  ? isDarkMode
                      ? "bg-gray-800 text-white border border-gray-700 hover:border-blue-700"
                      : "bg-white text-gray-800 border border-gray-200 hover:border-blue-300"
                  : isDarkMode
                    ? "bg-blue-700 text-white"
                    : "bg-blue-600 text-white"
                } ${
                  msg.role === "assistant" 
                    ? "rounded-tl-sm" 
                    : "rounded-tr-sm"
                }`}
              >
                <div className={`prose ${isDarkMode ? 'prose-invert' : ''} prose-pre:bg-gray-800 prose-pre:text-gray-100`}>
                  {idx === messages.length - 1 && typingEffect && msg.role === "assistant" ? (
                    <p>{lastResponse}<span className="animate-pulse">|</span></p>
                  ) : (
                    renderMessageText(msg)
                  )}
                </div>
                <div className={`text-xs mt-1 opacity-60 text-right transition-opacity group-hover:opacity-100 flex justify-between items-center ${
                  msg.role === "assistant" ? isDarkMode ? "text-gray-400" : "text-gray-500" : "text-blue-100"
                }`}>
                  <span className="text-xs">{formatTime(msg.timestamp)}</span>
                  <span>{msg.role === "assistant" ? "AI Assistant" : "You"}</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Show suggested questions after the last assistant message */}
          {!loading && !typingEffect && suggestedQuestions.length > 0 && 
           (messages.length === 1 || 
            (messages.some(msg => msg.role === "user") && messages[messages.length - 1].role === "assistant")) && (
            <div className="ml-1 mb-4 animate-fadeIn max-w-[85%] md:max-w-[75%]">
              <div className={`flex items-center gap-2 mb-2 text-sm ${
                isDarkMode ? 'text-blue-300' : 'text-blue-600'
              }`}>
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="font-medium">{messages.length === 1 ? "Get started with:" : "Ask a follow-up:"}</span>
          </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(question)}
                    className={`text-sm px-3 py-1.5 rounded-full text-left transition-all ${
                      isDarkMode
                        ? 'bg-gray-800/80 hover:bg-gray-700 text-blue-300 border border-gray-700 hover:border-blue-600'
                        : 'bg-white/80 hover:bg-blue-50 text-blue-700 border border-gray-200 hover:border-blue-300'
                    } shadow-sm hover:shadow-md`}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Loading suggestions indicator (now positioned with the messages) */}
          {loadingSuggestions && (
            <div className="ml-1 mb-2">
              <InlineLoader message="Loading suggested questions..." size="sm" />
            </div>
          )}
          
        {loading && (
          <div className="flex justify-start">
              <div className={`flex items-center gap-3 max-w-[85%] md:max-w-[75%] px-5 py-3 rounded-2xl ${
                isDarkMode 
                  ? 'bg-gray-800 text-blue-400 border border-gray-700' 
                  : 'bg-white text-blue-600 border border-gray-200'
              }`}>
                <InlineLoader message="Processing your request..." />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={`p-4 ${
        isDarkMode 
          ? 'bg-gray-800/95 backdrop-blur-md border-t border-gray-700' 
          : 'bg-white/95 backdrop-blur-md border-t border-gray-200'
      } transition-colors duration-300 sticky bottom-0 z-10`}>
        <div className="max-w-3xl mx-auto">
          <div className={`flex items-center gap-2 p-2 rounded-full ${
            isDarkMode
              ? `bg-gray-700 ${isInputFocused ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-900/20' : 'shadow-md'}`
              : `bg-gray-100 ${isInputFocused ? 'ring-2 ring-blue-300 shadow-lg shadow-blue-500/10' : 'shadow-md'}`
          } transition-all duration-300`}>
          <input
              ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Ask me anything..."
              className={`flex-1 p-2 px-4 bg-transparent border-none focus:outline-none ${
                isDarkMode ? "text-white" : "text-gray-800"
              } transition-colors duration-300`}
              disabled={loading || typingEffect}
          />
          <button
            onClick={handleSendMessage}
              disabled={loading || typingEffect || !input.trim()}
            className={`${
                loading || typingEffect || !input.trim()
                  ? isDarkMode 
                    ? "bg-gray-600 cursor-not-allowed opacity-70" 
                    : "bg-gray-300 cursor-not-allowed opacity-70"
                  : isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              } text-white p-3 rounded-full transition-all duration-300 focus:outline-none shadow-md`}
            aria-label="Send message"
          >
              <Send className="w-4 h-4" />
          </button>
          </div>
          <div className="text-xs mt-2 text-center opacity-60">
            {isDarkMode ? (
              <span className="text-gray-400">VidyaSangam Assistant - Your academic companion</span>
            ) : (
              <span className="text-gray-500">VidyaSangam Assistant - Your academic companion</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}