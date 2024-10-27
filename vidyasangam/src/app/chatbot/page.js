'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Moon, Sun, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';

export default function Chatassistant() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome to VidyaSangam! How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  const scrollToassistanttom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToassistanttom, [messages]);

   // Check if the user is logged in
   useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      // If user is not logged in, redirect to the login page
      router.push("/login");
    } 
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch('/api/openaiChatbot', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      console.log("assistant response data:", data);

      if (response.ok) {
        const formattedText = data.response.replace(/\n/g, "  \n");
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: formattedText },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: "Sorry, I couldn't process that." },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Sorry, there was an error." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const renderMessageText = (message) => {
    return <ReactMarkdown>{message.content}</ReactMarkdown>;
  };

  return (
    <div className={`flex flex-col h-screen ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-gradient-to-r from-[#e6f3ff] via-[#f0f8ff] to-[#f5faff] text-gray-800'
    }`}>
      <header className={`p-4 shadow-md ${
        isDarkMode 
          ? 'bg-gray-800' 
          : 'bg-gradient-to-r from-[#d1e8ff] via-[#e0f1ff] to-[#eaf6ff]'
      }`}>
        <div className="container mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push('/')} // Back button to the '/' route
            className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 ${
              isDarkMode 
                ? 'hover:bg-gray-700 focus:ring-gray-600' 
                : 'hover:bg-[#c4e0ff] focus:ring-[#a0d6f1]'
            }`}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex-grow text-center">
            <h1 className={`text-3xl font-bold tracking-wide ${
              isDarkMode ? 'text-white' : 'text-[#2c5282]'
            }`}>Vidya Sangam Chatbot</h1>
          </div>

          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 ${
              isDarkMode 
                ? 'hover:bg-gray-700 focus:ring-gray-600' 
                : 'hover:bg-[#c4e0ff] focus:ring-[#a0d6f1]'
            }`}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <Sun className="w-6 h-6 text-yellow-400" />
            ) : (
              <Moon className="w-6 h-6 text-[#2c5282]" />
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"} animate-fadeIn`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg shadow-md transition-all duration-300 ${
                msg.role === "assistant"
                  ? isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-800"
                  : isDarkMode
                  ? "bg-[#4a72a5] text-white"
                  : "bg-[#6cb2eb] text-white"
              } ${msg.role === "assistant" ? "rounded-tl-none" : "rounded-tr-none"}`}
            >
              {renderMessageText(msg)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
              isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
            }`}>
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message here..."
            className={`flex-1 p-3 rounded-l-lg border ${
              isDarkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-gray-800 border-[#a0d6f1]"
            } focus:outline-none focus:ring-2 focus:ring-[#6cb2eb] transition-all duration-300`}
          />
          <button
            onClick={handleSendMessage}
            className={`${
              isDarkMode
                ? "bg-[#4a72a5] hover:bg-[#3a5a84]"
                : "bg-[#6cb2eb] hover:bg-[#5a9fd9]"
            } text-white p-3 rounded-r-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#6cb2eb]`}
            aria-label="Send message"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}