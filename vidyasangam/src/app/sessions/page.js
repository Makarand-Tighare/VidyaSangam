'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import NavBar from '../components/navBar'

export default function SessionManagement() {
  const [sessions, setSessions] = useState([])
  const [sessionType, setSessionType] = useState('virtual')

  const createSession = async (e) => {
    e.preventDefault()
    const newSession = {
      type: sessionType,
      date: new Date().toLocaleString(),
      summary: 'Generating summary...'
    }
    setSessions([newSession, ...sessions])

    // Simulate AI summary generation
    setTimeout(() => {
      setSessions(prevSessions => {
        const updatedSessions = [...prevSessions]
        updatedSessions[0] = {
          ...updatedSessions[0],
          summary: `This was a ${sessionType} session. The main topics discussed were project updates, resource allocation, and upcoming deadlines. Action items were assigned to team members with specific timelines.`
        }
        return updatedSessions
      })
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#e6f3ff] via-[#f0f8ff] to-[#f5faff] p-2">
      <NavBar />
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Session</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createSession} className="space-y-4">
              <div>
                <label htmlFor="sessionType" className="block text-sm font-medium text-gray-700 mb-1">
                  Session Type
                </label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger id="sessionType">
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Create Session
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.map((session, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold capitalize">{session.type} Session</h3>
                        <p className="text-sm text-gray-500">{session.date}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        session.type === 'virtual' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {session.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{session.summary}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
