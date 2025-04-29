"use client"

import { useState, useEffect } from 'react'
import { Trophy, Users, CheckSquare, MessageSquare, Search, X, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import NavBar from '../components/navBar'
import { useRouter } from 'next/navigation';

export default function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [leaderboardData, setLeaderboardData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter();
  
  // Check if the user is logged in
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      // If user is not logged in, redirect to the login page
      router.push("/login");
    } else {
      // If user is logged in, fetch leaderboard data
      fetchLeaderboardData();
    }
  }, [router]);

  // Fetch leaderboard data from existing APIs
  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      const authToken = localStorage.getItem("authToken");
      
      // Fetch list of all participants
      const participantsResponse = await fetch('http://127.0.0.1:8000/api/mentor_mentee/list_participants/', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!participantsResponse.ok) {
        throw new Error('Failed to fetch participants data');
      }
      
      const participantsData = await participantsResponse.json();
      
      // Extract only mentees from the participants list
      const mentees = participantsData.filter(participant => 
        participant.mentoring_preferences?.toLowerCase() !== 'mentor'
      ).map(mentee => ({
        id: mentee.registration_no,
        name: mentee.name,
        mentor: mentee.mentor ? mentee.mentor.name : 'Not assigned'
      }));
      
      // Create an array to hold mentee data with scores
      const menteesWithScores = [];
      
      // For each mentee, fetch their quiz results and sessions
      for (const mentee of mentees) {
        try {
          // Get completed quizzes
          const quizResponse = await fetch(`http://127.0.0.1:8000/api/mentor_mentee/quiz-results/${mentee.id}/`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          
          let quizData = [];
          if (quizResponse.ok) {
            quizData = await quizResponse.json();
          }
          
          // Get sessions
          const sessionsResponse = await fetch(`http://127.0.0.1:8000/api/mentor_mentee/sessions/user/${mentee.id}/`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          
          let sessionsData = [];
          if (sessionsResponse.ok) {
            sessionsData = await sessionsResponse.json();
          }
          
          // Calculate scores and stats
          const completedQuizzes = quizData.length;
          
          // Calculate average score from completed quizzes
          let totalScore = 0;
          let averageScore = 0;
          
          if (completedQuizzes > 0) {
            totalScore = quizData.reduce((sum, quiz) => sum + (quiz.percentage || 0), 0);
            averageScore = totalScore / completedQuizzes;
          }
          
          // Count the number of sessions - each session in the API response counts as one
          const sessionsAttended = sessionsData.length;
          
          // Calculate overall score based on quizzes and sessions
          // Quizzes are worth 50 points each, sessions are worth 100 points each
          const overallScore = (completedQuizzes * 50) + (sessionsAttended * 100) + Math.round(averageScore * 5);
          
          // Add mentee to the array with mentor info
          menteesWithScores.push({
            id: mentee.id,
            name: mentee.name,
            mentorName: mentee.mentor,
            score: overallScore,
            sessionsAttended: sessionsAttended,
            tasksCompleted: completedQuizzes,
            averageScore: averageScore,
            feedbackGiven: calculateFeedbackLevel(averageScore)
          });
        } catch (error) {
          console.error(`Error fetching data for mentee ${mentee.name}:`, error);
          // Continue with the next mentee
        }
      }
      
      // Sort mentees by score (highest first)
      menteesWithScores.sort((a, b) => b.score - a.score);
      
      // Update state with the results
      setLeaderboardData(menteesWithScores);
      setError(null);
    } catch (error) {
      console.error('Error building leaderboard data:', error);
      setError('Failed to load leaderboard data. Please try again later.');
      
      // Fallback data in case all APIs fail
      const fallbackData = [
        { id: 1, name: "Makarand Tighare", mentorName: "Raj Singh", score: 1250, sessionsAttended: 15, tasksCompleted: 12, feedbackGiven: "Excellent" },
        { id: 2, name: "Ramna Varma", mentorName: "Asha Patel", score: 1100, sessionsAttended: 12, tasksCompleted: 10, feedbackGiven: "Good" },
        { id: 3, name: "Paras Pethe", mentorName: "Raj Singh", score: 1000, sessionsAttended: 10, tasksCompleted: 9, feedbackGiven: "Very Good" },
      ];
      setLeaderboardData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate feedback level based on average score
  const calculateFeedbackLevel = (averageScore) => {
    if (averageScore >= 90) return "Excellent";
    if (averageScore >= 80) return "Very Good";
    if (averageScore >= 70) return "Good";
    if (averageScore >= 60) return "Satisfactory";
    return "Needs Improvement";
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const filteredData = leaderboardData.filter((player) =>
    player.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  )

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-500 hover:bg-yellow-600'
      case 2: return 'bg-gray-400 hover:bg-gray-500'
      case 3: return 'bg-amber-600 hover:bg-amber-700'
      default: return 'bg-blue-500 hover:bg-blue-600'
    }
  }

  const getFeedbackColor = (feedback) => {
    switch (feedback.toLowerCase()) {
      case 'excellent': return 'text-green-600'
      case 'very good': return 'text-blue-600'
      case 'good': return 'text-cyan-600'
      case 'satisfactory': return 'text-orange-600'
      default: return 'text-red-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-2">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-xl rounded-xl overflow-hidden border-none">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 w-full flex justify-center">
            <CardTitle className="text-3xl font-bold flex items-center gap-3 justify-center">
              <Trophy className="w-8 h-8" />
              <span>Leaderboard Rankings</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="mb-4 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <span className="ml-3 text-blue-600 font-medium">Loading leaderboard data...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>{error}</p>
                <Button 
                  className="mt-4"
                  onClick={fetchLeaderboardData}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="font-bold text-lg text-center p-4">Rank</th>
                      <th className="font-bold text-lg text-center p-4">Participant</th>
                      <th className="font-bold text-lg text-center p-4">Mentor</th>
                      <th className="font-bold text-lg text-center p-4">Points</th>
                      <th className="font-bold text-lg text-center p-4">
                        <Users className="w-5 h-5 inline mr-2" />Sessions
                      </th>
                      <th className="font-bold text-lg text-center p-4">
                        <CheckSquare className="w-5 h-5 inline mr-2" />Quizzes
                      </th>
                      <th className="font-bold text-lg text-center p-4">
                        <MessageSquare className="w-5 h-5 inline mr-2" />Performance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((player, index) => (
                        <tr 
                          key={player.id} 
                          className="transition-colors hover:bg-blue-50/50"
                        >
                          <td className="text-center py-4">
                            <Badge 
                              className={`${getRankColor(index + 1)} text-white font-bold px-4 py-1 text-sm transition-colors`}
                            >
                              #{index + 1}
                            </Badge>
                          </td>
                          <td className="text-center font-semibold text-gray-800">
                            {player.name}
                          </td>
                          <td className="text-center font-semibold text-gray-800">
                            {player.mentorName}
                          </td>
                          <td className="text-center font-bold text-blue-600">
                            {player.score.toLocaleString()}
                          </td>
                          <td className="text-center text-gray-700">
                            {player.sessionsAttended}
                          </td>
                          <td className="text-center text-gray-700">
                            {player.tasksCompleted}
                          </td>
                          <td className={`text-center font-medium ${getFeedbackColor(player.feedbackGiven)}`}>
                            {player.feedbackGiven}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500">
                          {searchQuery ? "No results found" : "No leaderboard data available"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}