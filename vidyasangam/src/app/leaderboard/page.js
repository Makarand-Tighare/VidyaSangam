"use client"

import { useState, useEffect } from 'react'
import { Trophy, Users, CheckSquare, MessageSquare, Search, X, Loader2, RefreshCw, Shield } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NavBar from '../components/navBar'
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from 'sonner';

export default function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [leaderboardData, setLeaderboardData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("mentors") // Default to mentors tab
  const [lastRecalculatedAt, setLastRecalculatedAt] = useState(null)
  const router = useRouter();
  
  // Check if the user is logged in
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      // If user is not logged in, redirect to the login page
      router.push("/login");
    } else {
      // First recalculate points, then fetch leaderboard data
      (async () => {
        try {
          setIsRecalculating(true);
          const recalculateResponse = await fetch('http://54.166.190.24:8000/api/mentor_mentee/leaderboard/calculate/', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          
          if (recalculateResponse.ok) {
            const result = await recalculateResponse.json();
            console.log("Points recalculated automatically:", result.message);
            
            // Show a toast notification that points have been recalculated
            toast.success("Leaderboard points automatically recalculated", {
              description: "Rankings are now up-to-date with the latest activities",
              duration: 3000
            });
            
            // Set the last recalculation timestamp
            setLastRecalculatedAt(new Date());
          }
          
          // Fetch the leaderboard data after recalculation
          fetchLeaderboardData();
          
        } catch (error) {
          console.error("Error auto-recalculating points:", error);
          // Don't show error toast to avoid confusion
          // Fall back to regular fetch
          fetchLeaderboardData();
        } finally {
          setIsRecalculating(false);
        }
      })();
    }
  }, [router, activeTab]);

  // Fetch leaderboard data from the API
  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const authToken = localStorage.getItem("authToken");
      
      // Use the new GET leaderboard API endpoint with role filter
      const response = await fetch(`http://54.166.190.24:8000/api/mentor_mentee/leaderboard/?role=${activeTab.slice(0, -1)}&search=${debouncedSearchQuery}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
        
      const data = await response.json();
      
      // Log raw data for debugging
      console.clear();
      console.log("===== LEADERBOARD API RESPONSE =====");
      console.log(JSON.stringify(data, null, 2));
      
      // Get sample object to inspect structure
      if (data.length > 0) {
        console.log("Sample participant object keys:", Object.keys(data[0]));
      }
      
      // Create a new array to hold processed data
      let processedData = [...data];
      
      // No need to fetch mentor names as they're already in the API response
      
      setLeaderboardData(processedData);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setError('Failed to load leaderboard data. Please try again later.');
      
      // Fallback data in case the API fails
      const fallbackData = [
        { id: 1, name: "Makarand Tighare", mentorName: "Raj Singh", score: 1250, sessionsAttended: 15, tasksCompleted: 12, feedbackGiven: "Excellent", role: "mentee", badges_earned: 0 },
        { id: 2, name: "Ramna Varma", mentorName: "Asha Patel", score: 1100, sessionsAttended: 12, tasksCompleted: 10, feedbackGiven: "Good", role: "mentee", badges_earned: 1 },
        { id: 3, name: "Paras Pethe", mentorName: "Raj Singh", score: 1000, sessionsAttended: 10, tasksCompleted: 0, assignedQuizzes: 9, feedbackGiven: "Very Good", role: "mentor", badges_earned: 2, is_super_mentor: false, menteesCount: 3 },
      ];
      setLeaderboardData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Recalculate leaderboard points using server-side calculation
  const recalculateLeaderboardPoints = async () => {
    try {
      setIsRecalculating(true);
      const authToken = localStorage.getItem("authToken");
      
      const response = await fetch('http://54.166.190.24:8000/api/mentor_mentee/leaderboard/calculate/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to recalculate leaderboard points');
      }
      
      const result = await response.json();
      
      console.log("Leaderboard calculation response:", result);
      
      // Check if we need to fetch fresh leaderboard data
      const shouldFetchLeaderboard = !result.updated_participants || result.updated_participants.length === 0;
      
      if (shouldFetchLeaderboard) {
        // If no updated participants, fetch fresh leaderboard data
        await fetchLeaderboardData();
      } else {
        // Otherwise, use the data from the calculation response
        toast.success(`${result.message}`);
      }
      
      // Set the last recalculation timestamp
      setLastRecalculatedAt(new Date());
      
    } catch (error) {
      console.error('Error recalculating leaderboard points:', error);
      toast.error('Failed to recalculate leaderboard points');
      // Fallback to regular fetch
      fetchLeaderboardData();
    } finally {
      setIsRecalculating(false);
    }
  };
  
  // Sync leaderboard points from frontend to backend
  const syncLeaderboardPoints = async () => {
    try {
      setIsSyncing(true);
      const authToken = localStorage.getItem("authToken");
      
      const response = await fetch('http://54.166.190.24:8000/api/mentor_mentee/leaderboard/sync/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leaderboard_data: leaderboardData
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync leaderboard points');
      }
      
      const result = await response.json();
      toast.success(`${result.message}`);
      
      // Refresh the leaderboard data
      fetchLeaderboardData();
    } catch (error) {
      console.error('Error syncing leaderboard points:', error);
      toast.error('Failed to sync leaderboard points');
    } finally {
      setIsSyncing(false);
    }
  };

  // Debounced search query effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Effect to refetch data when tab or search query changes
  useEffect(() => {
    if (!isLoading) {
      fetchLeaderboardData();
    }
  }, [activeTab, debouncedSearchQuery]);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-500 hover:bg-yellow-600'
      case 2: return 'bg-gray-400 hover:bg-gray-500'
      case 3: return 'bg-amber-600 hover:bg-amber-700'
      default: return 'bg-blue-500 hover:bg-blue-600'
    }
  }

  const getFeedbackColor = (feedback) => {
    switch (feedback?.toLowerCase()) {
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
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 w-full flex justify-between items-center">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <span>Leaderboard Rankings</span>
            </CardTitle>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white text-blue-700 hover:bg-blue-50"
                      onClick={recalculateLeaderboardPoints}
                      disabled={isRecalculating || isLoading}
                    >
                      {isRecalculating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Recalculate
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Recalculate points based on all activities</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Points are automatically recalculated when the page loads
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white text-blue-700 hover:bg-blue-50"
                      onClick={syncLeaderboardPoints}
                      disabled={isSyncing || isLoading}
                    >
                      {isSyncing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Shield className="h-4 w-4 mr-2" />
                      )}
                      Sync Points
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sync current points to database</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Auto-recalculation status banner */}
            {isRecalculating && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center text-blue-700">
                <Loader2 className="h-5 w-5 mr-2 animate-spin text-blue-600" />
                <p>Automatically recalculating leaderboard points for the most up-to-date rankings...</p>
              </div>
            )}
            
            <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
              <div className="flex flex-col md:flex-row gap-2 items-center">
                <div className="relative w-full md:w-64">
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
                {lastRecalculatedAt && (
                  <div className="text-xs text-gray-500 flex items-center">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Last updated: {lastRecalculatedAt.toLocaleTimeString()}
                  </div>
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
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="flex items-center justify-center w-full">
                        <Users className="w-5 h-5 inline mr-2" />Sessions
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Number of mentoring sessions attended</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </th>
                      <th className="font-bold text-lg text-center p-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="flex items-center justify-center w-full">
                        <CheckSquare className="w-5 h-5 inline mr-2" />
                              {activeTab === "mentors" ? "Assigned Quizzes" : "Quizzes"}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {activeTab === "mentors" 
                                  ? "Number of quizzes assigned to mentees" 
                                  : "Number of quizzes completed"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </th>
                      <th className="font-bold text-lg text-center p-4">
                        <MessageSquare className="w-5 h-5 inline mr-2" />Performance
                      </th>
                      <th className="font-bold text-lg text-center p-4">Badges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.length > 0 ? (
                      leaderboardData.map((player, index) => (
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
                            {player.is_super_mentor && (
                              <Badge className="ml-2 bg-purple-600 text-white">Super Mentor</Badge>
                            )}
                          </td>
                          <td className="text-center font-semibold text-gray-800">
                            {activeTab === "mentors" ? 
                              `${player.menteesCount} mentees` : 
                              player.mentorName
                            }
                          </td>
                          <td className="text-center font-bold text-blue-600">
                            {player.score.toLocaleString()}
                          </td>
                          <td className="text-center text-gray-700">
                            {player.sessionsAttended || 0}
                          </td>
                          <td className="text-center text-gray-700">
                            {activeTab === "mentors" 
                              ? (player.assignedQuizzes !== undefined ? player.assignedQuizzes : 0)
                              : (player.tasksCompleted || 0)
                            }
                          </td>
                          <td className={`text-center font-medium ${getFeedbackColor(player.feedbackGiven)}`}>
                            {player.feedbackGiven}
                          </td>
                          <td className="text-center text-gray-700">
                            {player.badges_earned || 0}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-gray-500">
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