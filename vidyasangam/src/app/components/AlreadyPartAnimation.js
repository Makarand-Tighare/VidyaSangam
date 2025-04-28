'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function AlreadyPartAnimation({ status }) {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Start confetti effect
    setShowConfetti(true)
    
    // Clean up confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [])

  const navigateToProfile = () => {
    router.push('/profile')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] relative overflow-hidden">
      {/* Background gradient - updated to match the app theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 opacity-70" />
      
      {/* Confetti effect */}
      {showConfetti && (
        <>
          {Array.from({ length: 50 }).map((_, index) => (
            <motion.div
              key={index}
              className="absolute w-3 h-3 rounded-full bg-blue-500"
              initial={{ 
                top: -20, 
                left: `${Math.random() * 100}%`,
                backgroundColor: index % 5 === 0 ? '#3b82f6' : index % 4 === 0 ? '#6366f1' : 
                  index % 3 === 0 ? '#8b5cf6' : index % 2 === 0 ? '#10b981' : '#60a5fa'
              }}
              animate={{ 
                top: '100%',
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1)
              }}
              transition={{ 
                duration: 4 + Math.random() * 6,
                ease: "easeOut",
                delay: Math.random() * 2
              }}
            />
          ))}
        </>
      )}
      
      {/* Main content */}
      <motion.div
        className="relative z-10 bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center border border-blue-100"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100, duration: 0.8, delay: 0.5 }}
          className="flex justify-center mb-6"
        >
          <CheckCircle2 className="w-24 h-24 text-green-500" />
        </motion.div>
        
        <motion.h1
          className="text-3xl font-bold text-gray-800 mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          You&apos;re Already Part of VidyaSangam!
        </motion.h1>
        
        <motion.p
          className="text-gray-600 mb-6 text-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          You are currently registered as a <span className="font-semibold text-blue-600">{status}</span> in our mentorship program.
        </motion.p>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="space-y-4"
        >
          <p className="text-gray-500">You can view your mentorship details in your profile.</p>
          
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-2 rounded-full"
            onClick={navigateToProfile}
          >
            Go to Profile
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
} 