'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp, ExternalLink, UserIcon, Video, Calendar, Clock } from "lucide-react";
import NavBar from "../components/navBar";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { checkUserMentorMenteeStatus } from "../lib/userStatus";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function SessionManagement() {
  const [sessions, setSessions] = useState([]);
  const [sessionType, setSessionType] = useState("virtual");
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mentees, setMentees] = useState([]);
  const [selectedMentees, setSelectedMentees] = useState([]);
  const [userStatus, setUserStatus] = useState({
    isMentorOrMentee: false,
    status: '',
    checking: true
  });
  const router = useRouter();

  // Check if the user is logged in and get their status
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      // If user is not logged in, redirect to the login page
      router.push("/login");
      return;
    }
    
    // Check user's role
    const checkStatus = async () => {
      try {
        const result = await checkUserMentorMenteeStatus();
        console.log('User status check result:', result);
        
        // Store the status
        setUserStatus({
          isMentorOrMentee: result.isMentorOrMentee,
          status: result.status,
          checking: false
        });
        
        // Load sessions based on user status
        loadSessions(result.status);
        
        // If user is a mentor, fetch their mentees
        if (result.status === 'Mentor') {
          setIsLoading(true); // Show loading state while fetching mentees
          
          // Try to use the direct API fetch instead of relying on userStatus
          // This ensures we get the latest data
          await fetchMentees();
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking mentor/mentee status:", error);
        setUserStatus({
          isMentorOrMentee: false,
          status: 'Student',
          checking: false
        });
        setIsLoading(false);
      }
    };
    
    checkStatus();
  }, [router]);
  
  // Function to fetch mentees from the API
  const fetchMentees = async () => {
    try {
      console.log("Starting to fetch mentees...");
      
      // First fetch the user's registration number from the profile API
      const profileResponse = await fetch("http://127.0.0.1:8000/api/user/profile/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      });
      
      console.log("Profile API response status:", profileResponse.status);
      
      if (!profileResponse.ok) {
        throw new Error(`Profile API request failed with status ${profileResponse.status}`);
      }
      
      const profileData = await profileResponse.json();
      console.log("Profile data received:", profileData);
      
      const registrationNo = profileData.reg_no;
      
      if (!registrationNo) {
        console.error("Registration number not found in user profile");
        alert("Could not fetch your profile information. Please try refreshing the page.");
        return;
      }
      
      console.log("Fetched registration number:", registrationNo);
      
      // Now fetch mentee data using the registration number
      console.log(`Fetching mentees from: http://127.0.0.1:8000/api/mentor_mentee/profile/${registrationNo}/`);
      
      const response = await fetch(`http://127.0.0.1:8000/api/mentor_mentee/profile/${registrationNo}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      });
      
      console.log("Mentees API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Mentees data received:", data);
      
      // Store the full mentee data for debugging
      window.__debug_mentees_data = data;
      
      // Process mentees data to match our application's format
      if (data.mentees && Array.isArray(data.mentees)) {
        const formattedMentees = data.mentees.map((mentee, index) => ({
          id: index + 1, // Generate unique IDs
          name: mentee.name,
          registrationNo: mentee.registration_no,
          semester: mentee.semester,
          branch: mentee.branch,
          techStack: mentee.tech_stack
        }));
        
        setMentees(formattedMentees);
        console.log("Mentees fetched successfully:", formattedMentees);
      } else {
        console.log("No mentees found or invalid data format:", data);
        setMentees([]);
      }
    } catch (error) {
      console.error("Error fetching mentees:", error);
      setMentees([]);
      alert("Failed to load your mentees. Please try again later.");
    }
  };
  
  // Mock function to load sessions from a server
  const loadSessions = (status) => {
    // In a real implementation, this would fetch from your API
    // For now, we'll create mock data
    const mockSessions = [
      {
        type: "virtual",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString(), // 2 days ago
        summary: "Discussed project progress and upcoming milestones.",
        meetLink: "https://meet.google.com/abc-defg-hij",
        mentor: "Dr. Sharma",
        duration: "45 minutes",
        participants: ["Rahul Singh", "Priya Sharma"]
      },
      {
        type: "physical",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleString(), // 7 days ago
        summary: "Met in the lab to review code implementation and debug issues.",
        location: "Engineering Block, Room 204",
        mentor: "Prof. Joshi",
        duration: "60 minutes",
        participants: ["Ajay Patel"]
      },
      {
        type: "virtual",
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleString(), // 14 days ago
        summary: "Initial project scope discussion and planning session.",
        meetLink: "https://meet.google.com/xyz-abcd-efg",
        mentor: "Dr. Sharma",
        duration: "30 minutes",
        participants: ["Neha Gupta", "Rahul Singh"]
      }
    ];
    
    setSessions(mockSessions);
  };

  const handleMenteeSelection = (menteeId) => {
    console.log(`Toggling selection for mentee ID: ${menteeId}`);
    
    setSelectedMentees(prevSelected => {
      const newSelected = prevSelected.includes(menteeId)
        ? prevSelected.filter(id => id !== menteeId)
        : [...prevSelected, menteeId];
        
      console.log(`New selection: ${JSON.stringify(newSelected)}`);
      return newSelected;
    });
  };

  const createSession = async (e) => {
    e.preventDefault();
    
    // Only mentors can create sessions
    if (userStatus.status !== 'Mentor') {
      alert("Only mentors can create new sessions.");
      return;
    }
    
    // Check if any mentees are selected
    if (selectedMentees.length === 0) {
      alert("Please select at least one mentee for the session.");
      return;
    }
    
    console.log(`Creating ${sessionType} session with mentees:`, selectedMentees);
    
    // Log the mentees that will be included
    const selectedMenteeNames = selectedMentees.map(id => {
      const mentee = mentees.find(m => m.id === id);
      return mentee ? `${mentee.name} (${mentee.registrationNo})` : null;
    }).filter(Boolean);
    
    console.log("Selected mentees:", selectedMenteeNames);
    
    setIsLoading(true);

    if (sessionType === "virtual") {
      try {
        const isAuthorized = localStorage.getItem("isAuthorized");

        if (!isAuthorized) {
          window.open("http://127.0.0.1:8000/api/utility/authorize", "_blank");
          localStorage.setItem("isAuthorized", "true");
          setIsLoading(false);
          return;
        }

        const response = await fetch("http://127.0.0.1:8000/api/utility/create-meet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
          },
          credentials: "include",
          body: JSON.stringify({
            menteeRegistrationNos: selectedMentees.map(id => {
              const mentee = mentees.find(m => m.id === id);
              return mentee ? mentee.registrationNo : null;
            }).filter(Boolean)
          })
        });

        if (response.redirected) {
          window.open(response.url, "_blank");
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error creating meeting:", errorData.error);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        if (data.meet_link) {
          // Get the names of selected mentees
          const selectedMenteeNames = selectedMentees.map(id => {
            const mentee = mentees.find(m => m.id === id);
            return mentee ? mentee.name : null;
          }).filter(Boolean);
          
          const newSession = {
            type: sessionType,
            date: new Date().toLocaleString(),
            summary: "Virtual session scheduled.",
            meetLink: data.meet_link,
            mentor: "You",
            duration: "Scheduled",
            participants: selectedMenteeNames
          };

          setSessions((prevSessions) => [newSession, ...prevSessions]);
          
          // Reset selected mentees
          setSelectedMentees([]);
        }
      } catch (error) {
        console.error("Error creating meeting:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Get the names of selected mentees
      const selectedMenteeNames = selectedMentees.map(id => {
        const mentee = mentees.find(m => m.id === id);
        return mentee ? mentee.name : null;
      }).filter(Boolean);
      
      const newSession = {
        type: sessionType,
        date: new Date().toLocaleString(),
        summary: "Physical session scheduled.",
        location: "To be determined",
        mentor: "You",
        duration: "Scheduled",
        participants: selectedMenteeNames
      };

      setSessions((prevSessions) => [newSession, ...prevSessions]);
      
      // Reset selected mentees
      setSelectedMentees([]);
      setIsLoading(false);
    }
  };

  const toggleShowAllSessions = () => {
    setShowAllSessions(!showAllSessions);
  };

  const displayedSessions = showAllSessions ? sessions : sessions.slice(0, 3);
  
  // Show loading state while checking user status
  if (userStatus.checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <NavBar />
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-2">
      <NavBar />
      <div className="max-w-4xl mx-auto space-y-8 pt-8">
        {/* Only show the create session card to mentors */}
        {userStatus.status === 'Mentor' && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Session</CardTitle>
              <CardDescription>Schedule a new mentoring session with your mentees</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createSession} className="space-y-6">
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
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Select Mentees</h3>
                  <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
                    {mentees.length > 0 ? (
                      <div className="space-y-2">
                        {mentees.map((mentee) => (
                          <div className="flex items-center space-x-2" key={mentee.id}>
                            <Checkbox 
                              id={`mentee-${mentee.id}`} 
                              checked={selectedMentees.includes(mentee.id)}
                              onCheckedChange={() => handleMenteeSelection(mentee.id)}
                            />
                            <Label 
                              htmlFor={`mentee-${mentee.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {mentee.name} - {mentee.branch} (Sem {mentee.semester})
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">You don&apos;t have any mentees assigned yet.</p>
                        <p className="text-xs text-blue-600 mt-1">Please contact the administrator if you believe this is an error.</p>
                      </div>
                    )}
                  </div>
                  {selectedMentees.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      {selectedMentees.length} {selectedMentees.length === 1 ? 'mentee' : 'mentees'} selected
                    </p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading || selectedMentees.length === 0}>
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating session...
                    </span>
                  ) : (
                    "Create Session"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        
        {/* Show mentee-specific message if user is a mentee */}
        {userStatus.status === 'Mentee' && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-4">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-800 mb-1">Welcome to Your Sessions</h3>
                  <p className="text-blue-700">
                    As a mentee, you can view all your scheduled and past sessions below. 
                    Join virtual meetings by clicking on the meeting links when they become available.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{userStatus.status === 'Mentor' ? 'Your Scheduled Sessions' : 'Your Sessions with Mentors'}</CardTitle>
              <CardDescription>
                {userStatus.status === 'Mentor' 
                  ? 'Sessions you have scheduled with your mentees' 
                  : 'Sessions scheduled for you by your mentors'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={toggleShowAllSessions}>
              {showAllSessions ? (
                <>
                  Show Recent <ChevronUp className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Show All <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {displayedSessions.length > 0 ? (
                  displayedSessions.map((session, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold capitalize flex items-center">
                              {session.type === "virtual" ? (
                                <Video className="h-5 w-5 mr-2 text-blue-500" />
                              ) : (
                                <UserIcon className="h-5 w-5 mr-2 text-green-500" />
                              )}
                              {session.type} Session
                            </h3>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {session.date}
                              <span className="mx-2">•</span>
                              <Clock className="h-4 w-4 mr-1" />
                              {session.duration}
                              <span className="mx-2">•</span>
                              <UserIcon className="h-4 w-4 mr-1" />
                              {session.mentor}
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            session.type === "virtual" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                          }`}>
                            {session.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-3">{session.summary}</p>
                        
                        {/* Show participants */}
                        {session.participants && session.participants.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="text-xs text-gray-500">Participants:</span>
                            {session.participants.map((participant, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                                {participant}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          {session.meetLink && (
                            <a
                              href={session.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              Join Meet <ExternalLink className="ml-1 h-4 w-4" />
                            </a>
                          )}
                          {session.location && (
                            <div className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-green-50 text-green-700">
                              Location: {session.location}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No sessions found. {userStatus.status === 'Mentor' ? 'Create a session to get started!' : 'Your mentor will schedule sessions soon.'}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}