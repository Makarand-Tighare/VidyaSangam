"use client"

import { useState, useEffect } from 'react'
import { Trophy, Users, CheckSquare, MessageSquare, Search, X, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NavBar from '../components/navBar'
import { useRouter } from 'next/navigation';

export default function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [leaderboardData, setLeaderboardData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("mentors") // Default to mentors tab
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
      const participantsResponse = await fetch('https://project-api-qgho.onrender.com/api/mentor_mentee/list_participants/', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!participantsResponse.ok) {
        throw new Error('Failed to fetch participants data');
      }
      
      const participantsData = await participantsResponse.json();
      
      // Include all participants with proper role determination
      const participants = participantsData.map(participant => {
        // Determine actual role based on relationships:
        // - If participant has mentees array and it's not empty -> actual role is Mentor
        // - If participant has mentor object -> actual role is Mentee
        // - Otherwise use their preference
        let actualRole = participant.mentoring_preferences?.toLowerCase() || 'unknown';
        
        // If they have a mentor, they're definitely a mentee (regardless of preference)
        if (participant.mentor) {
          actualRole = 'mentee';
        }
        
        // If they have mentees, they're definitely a mentor (regardless of preference)
        if (participant.mentees && participant.mentees.length > 0) {
          actualRole = 'mentor';
        }
        
        return {
          id: participant.registration_no,
          name: participant.name,
          preference: participant.mentoring_preferences?.toLowerCase(),
          role: actualRole,
          mentor: participant.mentor ? participant.mentor.name : 'Not assigned',
          mentorId: participant.mentor ? participant.mentor.registration_no : null,
          mentees: participant.mentees || [],
          branch: participant.branch,
          semester: participant.semester,
          techStack: participant.tech_stack
        };
      });
      
      // Create an array to hold participant data with scores
      const participantsWithScores = [];
      
      // Store mentee quiz data to calculate mentor scores
      const menteeQuizData = {};
      
      // First pass: process mentees and store their quiz data
      for (const participant of participants) {
        if (participant.role === 'mentee') {
          try {
            // Get completed quizzes
            const quizResponse = await fetch(`https://project-api-qgho.onrender.com/api/mentor_mentee/quiz-results/${participant.id}/`, {
              headers: {
                'Authorization': `Bearer ${authToken}`
              }
            });
            
            let quizData = [];
            if (quizResponse.ok) {
              quizData = await quizResponse.json();
            }
            
            // Store quiz data for this mentee
            menteeQuizData[participant.id] = {
              completedQuizzes: quizData.length,
              averageScore: quizData.length > 0 ? 
                quizData.reduce((sum, quiz) => sum + (quiz.percentage || 0), 0) / quizData.length : 0
            };
          } catch (error) {
            console.error(`Error fetching quiz data for mentee ${participant.name}:`, error);
            menteeQuizData[participant.id] = { completedQuizzes: 0, averageScore: 0 };
          }
        }
      }
      
      // For each participant, fetch their quiz results and sessions
      for (const participant of participants) {
        try {
          // Initialize variables for participant data
          let completedQuizzes = 0;
          let averageScore = 0;
          let totalScore = 0;
          
          // For mentees, get their own quiz data
          if (participant.role === 'mentee') {
            const quizData = menteeQuizData[participant.id] || { completedQuizzes: 0, averageScore: 0 };
            completedQuizzes = quizData.completedQuizzes;
            averageScore = quizData.averageScore;
          } 
          // For mentors, calculate based on their mentees' quiz performance
          else if (participant.role === 'mentor') {
            let menteeQuizCount = 0;
            let menteeScoreSum = 0;
            
            // Calculate based on all mentees' quiz performance
            participant.mentees.forEach(mentee => {
              const menteeData = menteeQuizData[mentee.registration_no];
              if (menteeData) {
                menteeQuizCount += menteeData.completedQuizzes;
                menteeScoreSum += menteeData.averageScore * menteeData.completedQuizzes;
              }
            });
            
            completedQuizzes = menteeQuizCount;
            averageScore = menteeQuizCount > 0 ? menteeScoreSum / menteeQuizCount : 0;
          }
          
          // Get sessions
          const sessionsResponse = await fetch(`https://project-api-qgho.onrender.com/api/mentor_mentee/sessions/user/${participant.id}/`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          
          let sessionsData = [];
          if (sessionsResponse.ok) {
            sessionsData = await sessionsResponse.json();
          }
          
          // Count the number of sessions - each session in the API response counts as one
          const sessionsAttended = sessionsData.length;
          
          // Calculate overall score 
          // For mentors: sessions are worth 100 points each, mentee quizzes worth 20 points each
          // For mentees: sessions are worth 100 points each, quizzes are worth 50 points each
          const quizValue = participant.role === 'mentor' ? 20 : 50;
          const overallScore = (sessionsAttended * 100) + (completedQuizzes * quizValue) + Math.round(averageScore * 5);
          
          // Add participant to the array with mentor/mentee info
          participantsWithScores.push({
            id: participant.id,
            name: participant.name,
            preference: participant.preference,
            role: participant.role,
            mentorName: participant.mentor,
            mentorId: participant.mentorId,
            menteesCount: participant.mentees.length,
            branch: participant.branch,
            semester: participant.semester,
            techStack: participant.techStack,
            score: overallScore,
            sessionsAttended: sessionsAttended,
            tasksCompleted: completedQuizzes,
            averageScore: averageScore,
            feedbackGiven: calculateFeedbackLevel(averageScore)
          });
        } catch (error) {
          console.error(`Error fetching data for participant ${participant.name}:`, error);
          // Continue with the next participant with basic information
          participantsWithScores.push({
            id: participant.id,
            name: participant.name,
            preference: participant.preference,
            role: participant.role,
            mentorName: participant.mentor,
            mentorId: participant.mentorId,
            menteesCount: participant.mentees.length,
            branch: participant.branch,
            semester: participant.semester,
            techStack: participant.techStack,
            score: 0,
            sessionsAttended: 0,
            tasksCompleted: 0,
            averageScore: 0,
            feedbackGiven: 'No Data'
          });
        }
      }
      
      // Sort participants by score (highest first)
      participantsWithScores.sort((a, b) => b.score - a.score);
      
      // Update state with the results
      setLeaderboardData(participantsWithScores);
      setError(null);
    } catch (error) {
      console.error('Error building leaderboard data:', error);
      setError('Failed to load leaderboard data. Please try again later.');
      
      // Fallback data in case all APIs fail
      const fallbackData = [
        { id: 1, name: "Makarand Tighare", mentorName: "Raj Singh", score: 1250, sessionsAttended: 15, tasksCompleted: 12, feedbackGiven: "Excellent", role: "mentee" },
        { id: 2, name: "Ramna Varma", mentorName: "Asha Patel", score: 1100, sessionsAttended: 12, tasksCompleted: 10, feedbackGiven: "Good", role: "mentee" },
        { id: 3, name: "Paras Pethe", mentorName: "Raj Singh", score: 1000, sessionsAttended: 10, tasksCompleted: 9, feedbackGiven: "Very Good", role: "mentor" },
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

  const filteredData = leaderboardData.filter((player) => {
    // First filter by search query (name or role)
    const matchesSearch = player.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (player.role && player.role.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
    
    // Then filter by active tab
    if (activeTab === "mentors") {
      return matchesSearch && player.role === "mentor";
    } else if (activeTab === "mentees") {
      return matchesSearch && player.role === "mentee";
    }
    
    return matchesSearch;
  });

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
            <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
              <div className="relative w-full md:w-1/3">
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
              <Tabs 
                defaultValue="mentors" 
                className="w-full md:w-auto"
                onValueChange={setActiveTab}
                value={activeTab}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mentors">Mentors</TabsTrigger>
                  <TabsTrigger value="mentees">Mentees</TabsTrigger>
                </TabsList>
              </Tabs>
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
                      <th className="font-bold text-lg text-center p-4">
                        {activeTab === "mentors" ? "Mentees" : "Mentor"}
                      </th>
                      <th className="font-bold text-lg text-center p-4">Points</th>
                      <th className="font-bold text-lg text-center p-4">
                        <Users className="w-5 h-5 inline mr-2" />Sessions
                      </th>
                      <th className="font-bold text-lg text-center p-4">
                        <CheckSquare className="w-5 h-5 inline mr-2" />
                        {activeTab === "mentors" ? "Mentee Quizzes" : "Quizzes"}
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
                            {player.role === 'mentor' ? 
                              `${player.menteesCount} mentees` : 
                              player.mentorName
                            }
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
                          {searchQuery ? "No results found" : `No ${activeTab === "mentors" ? "mentor" : "mentee"} leaderboard data available`}
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