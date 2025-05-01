'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import NavBar from '../components/navBar'

// Loading component for Suspense fallback
function QuizLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <NavBar />
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-lg">Loading quiz...</p>
      </div>
    </div>
  );
}

// Client component that uses search params
function QuizContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const taskId = searchParams.get('taskId')
  const menteeId = searchParams.get('menteeId')
  const viewResults = searchParams.get('view') === 'results'
  
  const [quiz, setQuiz] = useState(null)
  const [quizId, setQuizId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [resultDetails, setResultDetails] = useState([])
  
  useEffect(() => {
    if (!taskId || !menteeId) {
      setError('Missing task ID or mentee ID')
      setLoading(false)
      return
    }
    
    // Fetch the quiz from the API
    const fetchQuiz = async () => {
      try {
        // If we're viewing results, use the quiz-results endpoint
        const endpoint = viewResults 
          ? `http://127.0.0.1:8000/api/mentor_mentee/quiz-results/${menteeId}/` 
          : `http://127.0.0.1:8000/api/mentor_mentee/pending-quizzes/${menteeId}/`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) throw new Error('Failed to fetch quiz');
        
        const quizzes = await response.json();
        
        // Find the specific quiz by ID
        const selectedQuiz = quizzes.find(quiz => quiz.id.toString() === taskId);
        
        if (!selectedQuiz) {
          throw new Error('Quiz not found');
        }
        
        // Format the quiz for our UI
        const formattedQuiz = {
          id: selectedQuiz.id,
          title: selectedQuiz.quiz_topic,
          description: `Quiz with ${selectedQuiz.total_questions} questions`,
          questions: selectedQuiz.quiz_data,
          total_marks: selectedQuiz.total_questions,
          created_at: selectedQuiz.quiz_date,
          percentage: selectedQuiz.percentage,
          quiz_answers: selectedQuiz.quiz_answers || {},
          result_details: selectedQuiz.result_details || []
        };
        
        setQuizId(selectedQuiz.id);
        setQuiz(formattedQuiz);
        
        // If we're viewing results, set up the completed state
        if (viewResults) {
          setScore(selectedQuiz.score);
          
          // Use result_details from the API if available
          if (selectedQuiz.result_details && selectedQuiz.result_details.length > 0) {
            setResultDetails(selectedQuiz.result_details);
          } else {
            // Otherwise generate results from the quiz data
            const details = formattedQuiz.questions.map((question, index) => {
              const userAnswer = selectedQuiz.quiz_answers[index];
              const isCorrect = userAnswer === question.answer;
              
              return {
                question: question.question,
                user_answer: userAnswer,
                correct_answer: question.answer,
                is_correct: isCorrect,
                explanation: question.explanation
              };
            });
            setResultDetails(details);
          }
          
          setQuizCompleted(true);
          setSelectedAnswers(selectedQuiz.quiz_answers);
        }
      } catch (error) {
        console.error('Error fetching quiz:', error)
        setError('Failed to load quiz. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchQuiz()
  }, [taskId, menteeId, viewResults])
  
  const handleAnswerSelect = (questionIndex, option) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: option
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
  
  const handleSubmit = async () => {
    try {
      // Disable further edits during submission
      setLoading(true);
      
      // Submit answers to API
      const result = await submitQuizResult(0, selectedAnswers);
      
      // Set results from API response
      setScore(result.score || 0);
      
      // Use result_details from the API if available
      if (result.result_details && result.result_details.length > 0) {
        setResultDetails(result.result_details);
      } else {
        // Fallback if API doesn't return result details
        const details = quiz.questions.map((question, index) => {
          const userAnswer = selectedAnswers[index];
          const isCorrect = userAnswer === question.answer;
          
          return {
            question: question.question,
            user_answer: userAnswer,
            correct_answer: question.answer,
            is_correct: isCorrect,
            explanation: question.explanation
          };
        });
        setResultDetails(details);
      }
      
      setQuizCompleted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  const submitQuizResult = async (finalScore, answers) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/mentor_mentee/submit-quiz/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          participant_id: menteeId,
          quiz_id: quizId,
          quiz_answers: answers
        })
      });
      
      if (!response.ok) throw new Error('Failed to submit quiz');
      
      const result = await response.json();
      
      // Log the result and return it
      console.log('Quiz result submitted:', result);
      return result;
    } catch (error) {
      console.error('Error submitting quiz result:', error);
      throw error;
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
                <div className="text-4xl font-bold text-blue-600">{score} / {quiz.total_marks}</div>
                <p className="text-lg text-gray-600 mt-2">
                  {(score / quiz.total_marks) * 100 >= 70 ? 'Great job!' : 'Keep learning!'}
                </p>
              </div>
              
              <div className="mt-8 text-left">
                <h3 className="text-xl font-bold mb-4">Results Breakdown</h3>
                
                <div className="space-y-6">
                  {resultDetails.map((result, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${result.is_correct ? 'bg-green-50' : 'bg-red-50'}`}>
                      <h4 className="font-medium mb-2">Question {index + 1}: {result.question}</h4>
                      
                      <div className="ml-4">
                        <p className="mb-1">
                          Your answer: <span className={result.is_correct ? "font-medium text-green-600" : "font-medium text-red-600"}>
                            {result.user_answer || 'Not answered'} - {result.user_answer ? quiz.questions[index].options[result.user_answer] : ''}
                          </span>
                        </p>
                        
                        {!result.is_correct && (
                          <p className="mb-1 font-medium text-green-600">
                            Correct answer: {result.correct_answer} - {quiz.questions[index].options[result.correct_answer]}
                          </p>
                        )}
                        
                        <p className="mt-2 text-sm text-gray-600">
                          {result.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={navigateToProfile}>Return to Profile</Button>
            </CardFooter>
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
                key={`question-${currentQuestion}`}
                value={selectedAnswers[currentQuestion] ? selectedAnswers[currentQuestion].toString() : undefined}
                onValueChange={(value) => handleAnswerSelect(currentQuestion, value)}
                className="space-y-4"
              >
                {Object.entries(currentQuestionData.options).map(([option, label]) => (
                  <div key={`${currentQuestion}-${option}`} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                    <RadioGroupItem value={option} id={`question-${currentQuestion}-option-${option}`} />
                    <Label htmlFor={`question-${currentQuestion}-option-${option}`} className="flex-1 cursor-pointer">
                      {label}
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

// Main page component with Suspense boundary
export default function QuizPage() {
  return (
    <Suspense fallback={<QuizLoading />}>
      <QuizContent />
    </Suspense>
  )
} 