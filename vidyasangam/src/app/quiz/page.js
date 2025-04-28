'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import NavBar from '../components/navBar'

export default function QuizPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const taskId = searchParams.get('taskId')
  const menteeId = searchParams.get('menteeId')
  
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  
  useEffect(() => {
    if (!taskId || !menteeId) {
      setError('Missing task ID or mentee ID')
      setLoading(false)
      return
    }
    
    // In a real application, fetch the quiz from the API
    const fetchQuiz = async () => {
      try {
        // Mock API call - in production, replace with actual API call
        // const response = await fetch(`/api/tasks?taskId=${taskId}&menteeId=${menteeId}`)
        // if (!response.ok) throw new Error('Failed to fetch quiz')
        // const data = await response.json()
        
        // Mock quiz data for development
        const mockQuiz = {
          id: taskId,
          title: "Mock Quiz: JavaScript Fundamentals",
          description: "Test your knowledge of JavaScript basics",
          questions: [
            {
              id: 1,
              question: "What is JavaScript?",
              options: [
                "A markup language",
                "A programming language",
                "A database language",
                "A styling language"
              ],
              answer: 1 // Index of correct answer
            },
            {
              id: 2,
              question: "Which of the following is not a JavaScript data type?",
              options: [
                "String",
                "Boolean",
                "Float",
                "Object"
              ],
              answer: 2
            },
            {
              id: 3,
              question: "How do you declare a constant variable in JavaScript?",
              options: [
                "var x = 5",
                "let x = 5",
                "const x = 5",
                "static x = 5"
              ],
              answer: 2
            },
            {
              id: 4,
              question: "Which method adds an element to the end of an array?",
              options: [
                "push()",
                "pop()",
                "unshift()",
                "shift()"
              ],
              answer: 0
            },
            {
              id: 5,
              question: "What does DOM stand for?",
              options: [
                "Document Object Model",
                "Data Object Model",
                "Document Oriented Mode",
                "Dynamic Object Management"
              ],
              answer: 0
            }
          ],
          total_marks: 10,
          created_at: new Date().toISOString()
        }
        
        setQuiz(mockQuiz)
      } catch (error) {
        console.error('Error fetching quiz:', error)
        setError('Failed to load quiz. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchQuiz()
  }, [taskId, menteeId])
  
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }))
  }
  
  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }
  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }
  
  const handleSubmit = () => {
    // Calculate score
    let correctAnswers = 0
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.answer) {
        correctAnswers++
      }
    })
    
    // Calculate final score based on total marks
    const finalScore = (correctAnswers / quiz.questions.length) * quiz.total_marks
    
    setScore(finalScore)
    setQuizCompleted(true)
    
    // In a real application, submit the result to the API
    // submitQuizResult(finalScore)
  }
  
  const submitQuizResult = async (finalScore) => {
    try {
      // Mock API call - in production, replace with actual API call
      // await fetch('/api/quiz-results', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     taskId,
      //     menteeId,
      //     score: finalScore,
      //     answers: selectedAnswers
      //   })
      // })
      
      console.log('Quiz result submitted', {
        taskId,
        menteeId,
        score: finalScore,
        answers: selectedAnswers
      })
    } catch (error) {
      console.error('Error submitting quiz result:', error)
    }
  }
  
  const navigateToProfile = () => {
    router.push('/profile')
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
        <NavBar />
        <div className="flex justify-center items-center h-[80vh]">
          <p className="text-lg">Loading quiz...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
        <NavBar />
        <div className="flex flex-col justify-center items-center h-[80vh]">
          <p className="text-lg text-red-500 mb-4">{error}</p>
          <Button onClick={navigateToProfile}>Return to Profile</Button>
        </div>
      </div>
    )
  }
  
  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
        <NavBar />
        <div className="flex justify-center items-center h-[80vh]">
          <p className="text-lg">Quiz not found</p>
        </div>
      </div>
    )
  }
  
  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
        <NavBar />
        <div className="max-w-3xl mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Completed</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">{quiz.title}</h2>
                <p className="text-gray-500">{quiz.description}</p>
              </div>
              
              <div className="my-8">
                <div className="text-4xl font-bold text-blue-600">{score.toFixed(1)}/{quiz.total_marks}</div>
                <p className="text-gray-600 mt-2">
                  {score >= quiz.total_marks * 0.7 ? 'Great job!' : 'Keep practicing!'}
                </p>
              </div>
              
              <div className="flex justify-center mt-8">
                <Button onClick={navigateToProfile} className="px-8">
                  Return to Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  const currentQuestionData = quiz.questions[currentQuestion]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <NavBar />
      <div className="max-w-3xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
            <p className="text-gray-500">{quiz.description}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </span>
              <span className="text-sm text-gray-500">
                Total Marks: {quiz.total_marks}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">
                {currentQuestionData.question}
              </h3>
              
              <RadioGroup
                value={selectedAnswers[currentQuestion]?.toString()}
                onValueChange={(value) => handleAnswerSelect(currentQuestion, parseInt(value))}
                className="space-y-4"
              >
                {currentQuestionData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            <div>
              {currentQuestion === quiz.questions.length - 1 ? (
                <Button 
                  variant="default" 
                  onClick={handleSubmit}
                  disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button variant="default" onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 