'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Moon, Sun } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "system", content: "Welcome to VidyaSangam! How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add the user's message to the state
    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Send the messages array to the API
      const response = await fetch('/api/openaiChatbot', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }), // Send all messages to maintain context
      });

      const data = await response.json();
      console.log("Bot response data:", data);

      if (response.ok) {
        // Replace single newlines with double newlines or add two spaces before newlines
        const formattedText = data.response.replace(/\n/g, "  \n");
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "bot", content: formattedText }, // Update to match new structure
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "bot", content: "Sorry, I couldn't process that." },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "bot", content: "Sorry, there was an error." },
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
    <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-r from-orange-50 from-10% via-violet-100 via-30% to-white'}`}>
      <header className={`p-4 shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-orange-50 from-10% via-violet-100 via-30%'}`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex-grow text-center">
            <h1 className="text-3xl font-bold text-[#946f43] tracking-wide">VidyaSangam Chatbot</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-violet-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-300"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <Sun className="w-6 h-6 text-yellow-400" />
            ) : (
              <Moon className="w-6 h-6 text-violet-700" />
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "bot" ? "justify-start" : "justify-end"} animate-fadeIn`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg shadow-md transition-all duration-300 ${
                msg.role === "bot"
                  ? isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-800"
                  : isDarkMode
                  ? "bg-violet-700 text-white"
                  : "bg-violet-500 text-white"
              } ${msg.role === "bot" ? "rounded-tl-none" : "rounded-tr-none"}`}
            >
              {renderMessageText(msg)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className={`max-w-[80%] px-4 py-2 rounded-lg bg-gray-200 text-gray-800`}>
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
                : "bg-white text-gray-800 border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all duration-300`}
          />
          <button
            onClick={handleSendMessage}
            className={`${
              isDarkMode
                ? "bg-violet-700 hover:bg-violet-800"
                : "bg-violet-500 hover:bg-violet-600"
            } text-white p-3 rounded-r-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-300`}
            aria-label="Send message"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
