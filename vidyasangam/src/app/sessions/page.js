'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import NavBar from "../components/navBar";
import { useRouter } from "next/navigation";

export default function SessionManagement() {
  const [sessions, setSessions] = useState([]);
  const [sessionType, setSessionType] = useState("virtual");
  const [showAllSessions, setShowAllSessions] = useState(false);
  const router = useRouter(); // Initialize router

  // Check if the user is logged in
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      // If user is not logged in, redirect to the login page
      router.push("/login");
    } 
  }, [router]);

  const createSession = async (e) => {
    e.preventDefault();

    if (sessionType === "virtual") {
      try {
        const isAuthorized = localStorage.getItem("isAuthorized");

        if (!isAuthorized) {
          window.open("http://localhost:5000/authorize", "_blank");
          localStorage.setItem("isAuthorized", "true");
          return;
        }

        const response = await fetch("http://localhost:5000/create-meet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.redirected) {
          window.open(response.url, "_blank");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error creating meeting:", errorData.error);
          return;
        }

        const data = await response.json();
        if (data.meet_link) {
          const newSession = {
            type: sessionType,
            date: new Date().toLocaleString(),
            summary: "Virtual session scheduled.",
            meetLink: data.meet_link,
          };

          setSessions((prevSessions) => [newSession, ...prevSessions]);
        }
      } catch (error) {
        console.error("Error creating meeting:", error);
      }
    } else {
      const newSession = {
        type: sessionType,
        date: new Date().toLocaleString(),
        summary: "Generating summary...",
      };

      setSessions((prevSessions) => [newSession, ...prevSessions]);

      setTimeout(() => {
        setSessions((prevSessions) => {
          const updatedSessions = [...prevSessions];
          updatedSessions[0] = {
            ...updatedSessions[0],
            summary: `This was a ${sessionType} session. Topics discussed were project updates, resource allocation, and deadlines.`,
          };
          return updatedSessions;
        });
      }, 3000);
    }
  };

  const toggleShowAllSessions = () => {
    setShowAllSessions(!showAllSessions);
  };

  const displayedSessions = showAllSessions ? sessions : sessions.slice(0, 1);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#e6f3ff] via-[#f0f8ff] to-[#f5faff] p-2">
      <NavBar />
      <div className="max-w-4xl mx-auto space-y-8 pt-8">
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Sessions</CardTitle>
            <Button variant="outline" size="sm" onClick={toggleShowAllSessions}>
              {showAllSessions ? (
                <>
                  Show All <ChevronUp className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Show Latest <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {displayedSessions.map((session, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold capitalize">{session.type} Session</h3>
                          <p className="text-sm text-gray-500">{session.date}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          session.type === "virtual" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }`}>
                          {session.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{session.summary}</p>
                      {session.meetLink && (
                        <a
                          href={session.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center text-sm text-blue-600 hover:underline"
                        >
                          Join Meet <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
