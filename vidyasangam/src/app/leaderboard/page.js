"use client"

import { useState, useEffect } from 'react'
import { Trophy, Users, CheckSquare, MessageSquare, Search, X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import NavBar from '../components/navBar'
import { useRouter } from 'next/navigation';

export default function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const router = useRouter();
  
  const leaderboardData = [
    { id: 1, name: "Alice Johnson", score: 1250, sessionsAttended: 15, tasksCompleted: 42, feedbackGiven: "Excellent" },
    { id: 2, name: "Bob Smith", score: 1100, sessionsAttended: 12, tasksCompleted: 38, feedbackGiven: "Good" },
    { id: 3, name: "Charlie Brown", score: 1000, sessionsAttended: 10, tasksCompleted: 35, feedbackGiven: "Very Good" },
    { id: 4, name: "Diana Prince", score: 950, sessionsAttended: 8, tasksCompleted: 30, feedbackGiven: "Good" },
    { id: 5, name: "Ethan Hunt", score: 900, sessionsAttended: 7, tasksCompleted: 28, feedbackGiven: "Satisfactory" },
    { id: 6, name: "Fiona Gallagher", score: 850, sessionsAttended: 6, tasksCompleted: 25, feedbackGiven: "Good" },
    { id: 7, name: "George Weasley", score: 800, sessionsAttended: 5, tasksCompleted: 22, feedbackGiven: "Satisfactory" },
    { id: 8, name: "Hermione Granger", score: 750, sessionsAttended: 4, tasksCompleted: 20, feedbackGiven: "Excellent" },
    { id: 9, name: "Ian Gallagher", score: 700, sessionsAttended: 3, tasksCompleted: 18, feedbackGiven: "Good" },
    { id: 10, name: "Jessica Jones", score: 650, sessionsAttended: 2, tasksCompleted: 15, feedbackGiven: "Satisfactory" },
  ]

   // Check if the user is logged in
   useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      // If user is not logged in, redirect to the login page
      router.push("/login");
    } 
  }, [router]);

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
      default: return 'text-gray-600'
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

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="font-bold text-lg text-center p-4">Rank</th>
                    <th className="font-bold text-lg text-center p-4">Participant</th>
                    <th className="font-bold text-lg text-center p-4">Points</th>
                    <th className="font-bold text-lg text-center p-4">
                      <Users className="w-5 h-5 inline mr-2" />Sessions
                    </th>
                    <th className="font-bold text-lg text-center p-4">
                      <CheckSquare className="w-5 h-5 inline mr-2" />Tasks
                    </th>
                    <th className="font-bold text-lg text-center p-4">
                      <MessageSquare className="w-5 h-5 inline mr-2" />Feedback
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
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No results found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}