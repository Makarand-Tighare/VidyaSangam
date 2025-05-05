/* eslint-disable */
"use client"

import Image from "next/image";
import NavBar from "./components/navBar";
import FancyTestimonialsSlider from "./components/fancy-testimonials-slider";
import testimonialData from "./data/testimonial.data";
import Linkedin from "./images/linkedin.png";
import Twitter from "./images/x.png";
import Instagram from "./images/insta.png";
import { useEffect, useRef } from "react";

import MentorMentee from "./images/mentorMentee.png";
import Leaderboard from "./images/leaderboard.jpg";
import Workshops from "./images/workshops.jpg";
import Roadmap from "./images/roadmap.jpg";
import MeetingSummarization from "./images/meetingSummarization.jpg";
import AutoLinkedin from "./images/autoLinkedin.jpg";
import LinkedInButton from "./components/linkedinButton";

// Custom styles for animations
const animationStyles = `
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  @keyframes slideUp {
    0% { transform: translateY(30px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes scrollDown {
    0% { transform: translateY(0); opacity: 0.6; }
    50% { transform: translateY(6px); opacity: 1; }
    100% { transform: translateY(0); opacity: 0.6; }
  }
  
  @keyframes ripple {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2); opacity: 0; }
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  
  @keyframes backgroundGradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes spin-slow {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 1s ease-out forwards;
  }
  
  .animate-slideUp {
    animation: slideUp 1s ease-out forwards;
  }
  
  .animate-scrollDown {
    animation: scrollDown 1.5s infinite;
  }
  
  .animate-ripple {
    animation: ripple 1.5s linear infinite;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-pulse {
    animation: pulse 2s ease-in-out infinite;
  }
  
  .animate-spin-slow {
    animation: spin-slow 10s linear infinite;
  }
  
  .background-animate {
    background-size: 400%;
    animation: backgroundGradient 15s ease infinite;
  }
  
  .animate-gradient {
    background-size: 200% auto;
    animation: backgroundGradient 5s ease infinite;
  }
  
  .animation-delay-300 {
    animation-delay: 300ms;
  }
  
  .animation-delay-500 {
    animation-delay: 500ms;
  }
  
  .animation-delay-700 {
    animation-delay: 700ms;
  }
`;

// Animation component for particles
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    // Set canvas size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 0.8; // 80% of viewport height
      initParticles();
    };

    // Create particles
    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(Math.floor(window.innerWidth / 10), 100);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          color: `rgba(${Math.floor(Math.random() * 100) + 100}, ${Math.floor(Math.random() * 100) + 100}, 255, ${Math.random() * 0.2 + 0.1})`,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25
        });
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      
      // Connect nearby particles with lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(100, 100, 255, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    // Initialize
    window.addEventListener('resize', handleResize);
    handleResize();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 pointer-events-none" 
    />
  );
};

// Counter animation component
const AnimatedCounter = ({ end, duration = 2000, label, icon }) => {
  const counterRef = useRef(null);
  
  useEffect(() => {
    let startTimestamp = null;
    const startValue = 0;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentCount = Math.floor(progress * (end - startValue) + startValue);
      
      if (counterRef.current) {
        counterRef.current.textContent = currentCount;
      }
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        if (counterRef.current) {
          counterRef.current.textContent = end.toString();
        }
      }
    };
    
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            window.requestAnimationFrame(step);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (counterRef.current) {
      observer.observe(counterRef.current);
    }
    
    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, [end, duration]);
  
  return (
    <div className="text-center animate-fadeIn" style={{ animationDelay: `${Math.random() * 500}ms` }}>
      <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4 transform transition-transform hover:scale-110 duration-300 animate-float" style={{ animationDelay: `${Math.random() * 1000}ms` }}>
        {icon}
      </div>
      <h3 className="text-4xl font-bold text-indigo-900 mb-1">
        <span ref={counterRef}>0</span>
        {end === 4.8 && <span>+</span>}
      </h3>
      <p className="text-gray-600">{label}</p>
    </div>
  );
};

export default function Home() {
  // Ref for scroll indicator
  const scrollIndicatorRef = useRef(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (scrollIndicatorRef.current) {
        if (window.scrollY > 100) {
          scrollIndicatorRef.current.classList.add('opacity-0');
        } else {
          scrollIndicatorRef.current.classList.remove('opacity-0');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="overflow-x-hidden p-2">
      {/* Navigation Bar */}
      <NavBar />
      {/* <LinkedInButton /> */}
      
      {/* Header Section - Enhanced with modern styling and animations */}
      <div className="relative py-20 mt-8 overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 background-animate"></div>
        <ParticleBackground />
        
        {/* Background decorative elements */}
        <div className="absolute -top-40 right-0 w-96 h-96 bg-indigo-100 rounded-full opacity-70 blur-3xl -z-10"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-3xl -z-10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl max-h-full">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-blue-50 opacity-20 rounded-full blur-3xl"></div>
      </div>

        {/* Animated dots grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-2 h-2 bg-indigo-500 rounded-full"></div>
          <div className="absolute top-10 left-20 w-2 h-2 bg-indigo-500 rounded-full"></div>
          <div className="absolute top-20 left-10 w-2 h-2 bg-indigo-500 rounded-full"></div>
          <div className="absolute top-20 left-20 w-2 h-2 bg-indigo-500 rounded-full"></div>
          {/* Right side dots */}
          <div className="absolute top-10 right-10 w-2 h-2 bg-indigo-500 rounded-full"></div>
          <div className="absolute top-10 right-20 w-2 h-2 bg-indigo-500 rounded-full"></div>
          <div className="absolute top-20 right-10 w-2 h-2 bg-indigo-500 rounded-full"></div>
          <div className="absolute top-20 right-20 w-2 h-2 bg-indigo-500 rounded-full"></div>
      </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-5 animate-fadeIn">
              <span className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full mb-3">
                <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
                Welcome to the Future of Mentorship
              </span>
            </div>
            
            <h1 className="text-[#1e3a8a] text-4xl md:text-5xl lg:text-6xl font-bold font-comfortaa leading-tight mb-6 animate-slideUp">
              <span className="relative inline-block">
                <span className="relative z-10">VidyaSangam</span>
                <span className="absolute bottom-0 left-0 right-0 h-3 bg-indigo-200/60 rounded-full -z-0 transform origin-left transition-all duration-300 ease-out"></span>
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-600 mt-2 animate-gradient">
                Mentor-Mentee Platform
              </span>
            </h1>
            
            <p className="text-gray-600 text-lg md:text-xl mt-6 max-w-3xl mx-auto font-roboto leading-relaxed animate-fadeIn animation-delay-300">
              Empowering mentors to guide, and mentees to grow. Learn and develop
              together in a collaborative ecosystem designed for academic excellence.
            </p>
            
            <div className="mt-10 flex flex-wrap justify-center gap-5 animate-fadeIn animation-delay-500">
              <a
                href="/mentoring-form"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-indigo-500/30 transform hover:-translate-y-1 transition-all duration-300"
              >
                <span>Get Started</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="/chatbot"
                className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg shadow-sm hover:shadow-md hover:bg-indigo-50 border border-indigo-100 transition-all"
              >
                <span>Try VidyaSangam AI</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.5 2a1 1 0 00-.5.1v1.05A5.5 5.5 0 0013 9a5.5 5.5 0 00-5 5.85v1.05a1 1 0 00.5.1h7a1 1 0 001-1V3a1 1 0 00-1-1h-7z" />
                  <path fillRule="evenodd" d="M12 11.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          </div>

        {/* Scroll indicator */}
        <div 
          ref={scrollIndicatorRef}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center transition-opacity duration-500"
        >
          <span className="text-indigo-600 text-sm mb-2">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-indigo-600 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-indigo-600 rounded-full animate-scrollDown"></div>
          </div>
        </div>
      </div>
      
      {/* Stats Section - New addition - ENHANCED with animations */}
      <div className="bg-white py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/30 to-white/70"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl opacity-70 -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl opacity-50 -z-10"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="bg-white backdrop-blur-lg rounded-2xl shadow-xl border border-indigo-100/70 p-8 md:p-10 max-w-5xl mx-auto transform -translate-y-16 relative overflow-hidden">
            {/* Animated background dots */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-1 h-1 bg-indigo-500/10 rounded-full"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `pulse ${2 + Math.random() * 2}s infinite ease-in-out`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                ></div>
              ))}
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 relative z-10">
              <AnimatedCounter 
                end={50} 
                label="Active Mentors"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                }
              />
              
              <AnimatedCounter 
                end={200} 
                label="Active Students"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                }
              />
              
              <AnimatedCounter 
                end={120} 
                label="Sessions Completed"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                }
              />

              <AnimatedCounter 
                end={4.8} 
                label="Average Rating"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* CTA Button - Enhanced with animation */}
          <div className="text-center mt-8">
            <a
              href="/mentoring-form"
              className="inline-flex items-center px-7 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10 text-lg">Join the Community</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 relative z-10 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
            </a>
          </div>
        </div>
      </div>

      {/* Vision Section - ENHANCED with image */}
      <div className="py-20 relative overflow-hidden bg-gradient-to-b from-white to-indigo-50/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <h2 className="text-[#1e3a8a] text-3xl md:text-4xl font-semibold font-comfortaa relative inline-block mb-6">
                <span className="relative z-10">Our Vision</span>
                <span className="absolute -bottom-1 left-0 right-0 h-2 bg-indigo-200/60 rounded-full -z-0"></span>
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                To create a supportive environment where experienced mentors help
                students grow by sharing industry insights and guiding them through
                their learning journeys.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                We believe in fostering meaningful connections that accelerate professional growth
                and create opportunities for collaborative learning.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">Personalized Guidance</span>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">Industry Insights</span>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">Career Development</span>
                </div>
              </div>
            </div>
            
            <div className="lg:order-1 relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 opacity-10 blur-lg transform -rotate-6"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-indigo-100">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                  alt="Students collaborating" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Credits Section - Simple & Elegant */}
      <div className="py-24 relative overflow-hidden bg-gradient-to-b from-white to-indigo-50/30">
        {/* Subtle animated background elements */}
        <div 
          className="absolute inset-0 bg-grid-pattern opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Section heading */}
          <div className="text-center mb-16">
            <h2 className="text-indigo-900 text-3xl md:text-4xl font-bold mb-3">The Team</h2>
            <div className="w-16 h-1 bg-indigo-600 mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-700 max-w-xl mx-auto">
              Meet the talented individuals who brought VidyaSangam to life, combining 
              technology and expertise to create meaningful connections.
            </p>
          </div>

          {/* Team container with subtle reveal animation */}
          <div className="max-w-6xl mx-auto">
            {/* Team circles with staggered animation */}
            <div className="flex flex-wrap justify-center items-center -m-4">
              {/* Team Lead - Center position with highlight */}
              <div className="w-full p-4 md:w-1/2 lg:w-1/3 opacity-0 animate-fadeInUp" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                <div className="relative py-8 px-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-100 overflow-hidden group">
                  {/* Animated highlight line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                  
                  {/* Photo/avatar with pulse effect */}
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto mb-5">
                    <div className="absolute inset-0 bg-indigo-100 flex items-center justify-center">
                      <svg className="w-20 h-20 text-indigo-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500 scale-0 group-hover:scale-105 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </div>
                  
                  {/* Label */}
                  <div className="absolute top-4 right-4 bg-indigo-100 px-2 py-1 rounded text-xs font-medium text-indigo-700">Lead</div>
                  
                  {/* Info */}
                  <h3 className="text-xl font-bold text-center text-gray-900 mb-1 group-hover:text-indigo-700 transition-colors">Makarand Tighare</h3>
                  <p className="text-indigo-600 text-sm text-center mb-4">Lead & Full Stack Developer</p>
                  
                  {/* Description with clean transition */}
                  <div className="mb-5 overflow-hidden">
                    <p className="text-gray-600 text-sm text-center transform transition-transform duration-300 group-hover:-translate-y-0">
                      Guiding the team with expertise in both technical implementation and mentorship vision.
            </p>
          </div>

                  {/* Social link with animation */}
                  <div className="flex justify-center">
                    <a 
                      href="https://www.linkedin.com/in/makarand-tighare" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-50 hover:bg-indigo-500 group-hover:scale-110 transition-all duration-300 transform"
                    >
                      <Image 
                        src={Linkedin} 
                        width={16} 
                        height={16} 
                        alt="LinkedIn" 
                        className="group-hover:brightness-200 transition-all" 
                      />
                      <span className="absolute animate-ping h-full w-full rounded-full bg-indigo-400 opacity-0 group-hover:opacity-20"></span>
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Other team members */}
              {[
                {
                  name: "Ramna Varma",
                  role: "DevOps Engineer",
                  description: "Managing deployment pipelines and infrastructure for seamless platform delivery.",
                  linkedin: "https://www.linkedin.com/in/ramna-varma",
                  delay: "0.2s"
                },
                {
                  name: "Paras Pethe",
                  role: "Frontend Developer & Documentation",
                  description: "Creating intuitive interfaces and comprehensive documentation for the platform.",
                  linkedin: "https://www.linkedin.com/in/paras-pethe",
                  delay: "0.3s"
                },
                {
                  name: "Vivek Devkar",
                  role: "Backend Engineer",
                  description: "Building robust systems and APIs that power the mentorship platform.",
                  linkedin: "https://www.linkedin.com/in/vivek-devkar",
                  delay: "0.4s"
                },
                {
                  name: "Pravin Yadav",
                  role: "Support Engineer",
                  description: "Providing technical assistance and ensuring smooth platform operations.",
                  linkedin: "https://www.linkedin.com/in/pravin-yadav",
                  delay: "0.5s"
                }
              ].map((member, index) => (
                <div 
                  key={index} 
                  className="w-full p-4 md:w-1/2 lg:w-1/4 opacity-0 animate-fadeInUp" 
                  style={{ animationDelay: member.delay, animationFillMode: 'forwards' }}
                >
                  <div className="py-6 px-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-indigo-50 h-full group">
                    {/* Photo/avatar */}
                    <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
                      <div className="absolute inset-0 bg-indigo-100 flex items-center justify-center">
                        <svg className="w-12 h-12 text-indigo-200" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                        </svg>
                      </div>
            </div>
                    
                    {/* Info */}
                    <h3 className="text-lg font-semibold text-center text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{member.name}</h3>
                    <p className="text-indigo-500 text-xs text-center mb-3">{member.role}</p>
                    
                    {/* Description with overflow hidden */}
                    <div className="mb-4 overflow-hidden h-12">
                      <p className="text-gray-500 text-xs text-center transform transition-transform duration-300 group-hover:-translate-y-0">
                        {member.description}
            </p>
          </div>

                    {/* Social link */}
                    <div className="flex justify-center mt-auto">
                      <a 
                        href={member.linkedin} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-50 hover:bg-indigo-500 transition-all duration-300 transform group-hover:scale-105"
                      >
                        <Image 
                          src={Linkedin} 
                          width={14} 
                          height={14} 
                          alt="LinkedIn" 
                          className="group-hover:brightness-200 transition-all" 
                        />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Simple animated dots decoration */}
          <div className="absolute -bottom-4 left-0 right-0 h-8 flex justify-center items-center gap-2 overflow-hidden">
            {[...Array(9)].map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-30 animate-jumpingDot" 
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Custom animations */}
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fadeInUp {
            animation: fadeInUp 0.6s ease-out;
          }
          
          @keyframes jumpingDot {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          .animate-jumpingDot {
            animation: jumpingDot 1.5s ease-in-out infinite;
          }
        `}</style>
      </div>

      {/* Modern Footer with Navigation */}
      <footer className="bg-gradient-to-b from-indigo-900 to-[#0f1f4d] text-white pt-16 pb-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-0 left-20 w-px h-full bg-indigo-300"></div>
          <div className="absolute top-0 left-1/2 w-px h-full bg-indigo-300"></div>
          <div className="absolute top-0 right-20 w-px h-full bg-indigo-300"></div>
          <div className="absolute top-1/3 left-0 w-full h-px bg-indigo-300"></div>
          <div className="absolute bottom-32 left-0 w-full h-px bg-indigo-300"></div>
      </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-1 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-comfortaa font-bold text-white">VidyaSangam</h2>
              </div>
              <p className="text-indigo-200 mb-6 max-w-xs">
                Empowering mentorship platform for students and professionals at Yeshwantrao Chavan College of Engineering.
              </p>
              <div className="flex items-center gap-4 text-xs text-indigo-300">
                <a href="mailto:vidyasangam.edu@gmail.com" className="hover:text-white transition-colors">
                  vidyasangam.edu@gmail.com
                </a>
                <span>|</span>
                <span>YCCE, Nagpur</span>
        </div>
      </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-indigo-100">Platform</h3>
              <ul className="space-y-3">
                <li><a href="/mentoring-form" className="text-indigo-300 hover:text-white transition-colors">Apply as Mentor</a></li>
                <li><a href="/mentoring-form" className="text-indigo-300 hover:text-white transition-colors">Become a Mentee</a></li>
                <li><a href="/sessions" className="text-indigo-300 hover:text-white transition-colors">View Sessions</a></li>
                <li><a href="/chatbot" className="text-indigo-300 hover:text-white transition-colors">AI Assistant</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-indigo-100">Resources</h3>
              <ul className="space-y-3">
                <li><a href="/leaderboard" className="text-indigo-300 hover:text-white transition-colors">Leaderboard</a></li>
                <li><a href="#" className="text-indigo-300 hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#" className="text-indigo-300 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-indigo-300 hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-indigo-100">Connect</h3>
              <div className="flex space-x-4 mb-6">
          <a
            href="https://www.linkedin.com/school/officialycce"
                  className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image src={Linkedin} width={20} height={20} alt="LinkedIn" />
                </a>
                <a 
                  href="https://x.com/ycceofficial" 
                  className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image src={Twitter} width={20} height={20} alt="Twitter" />
                </a>
                <a 
                  href="https://www.instagram.com/ctsc_ycce" 
                  className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image src={Instagram} width={20} height={20} alt="Instagram" />
          </a>
        </div>
              <p className="text-indigo-300 text-sm">
                Department of Computer Technology<br />
          Yeshwantrao Chavan College of Engineering
        </p>
            </div>
          </div>
          
          <div className="border-t border-indigo-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
              <div className="text-sm text-indigo-300">
                &copy; {new Date().getFullYear()} VidyaSangam. All rights reserved.
              </div>
              
              <div className="text-xs text-indigo-400">
                Made with passion by the Department of Computer Technology, YCCE
              </div>
            </div>
          </div>
      </div>
      </footer>
    </div>
  );
}
