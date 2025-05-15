'use client';

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  UserIcon, 
  Video, 
  Calendar, 
  Clock, 
  Plus,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import NavBar from "../components/navBar";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { checkUserMentorMenteeStatus } from "../lib/userStatus";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  
  // New state variables for session creation
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("14:00");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Use useMemo to memoize categorized sessions
  const categorizedSessions = useMemo(() => {
    return categorizeSessions(sessions);
  }, [sessions]);
  
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
      const profileResponse = await fetch("https://vidyasangam.duckdns.org/api/user/profile/", {
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
      console.log(`Fetching mentees from: https://vidyasangam.duckdns.org/api/mentor_mentee/profile/${registrationNo}/`);
      
      const response = await fetch(`https://vidyasangam.duckdns.org/api/mentor_mentee/profile/${registrationNo}/`, {
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
  
  // Function to load sessions from a server
  const loadSessions = async (status) => {
    try {
      setIsLoading(true);
      
      // Get registration number from profile
      const profileResponse = await fetch("https://vidyasangam.duckdns.org/api/user/profile/", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!profileResponse.ok) {
        throw new Error("Failed to fetch user profile");
      }
      
      const profileData = await profileResponse.json();
      const registrationNo = profileData.reg_no;
      
      if (!registrationNo) {
        throw new Error("Registration number not found");
      }
      
      // Fetch sessions for this user (works for both mentors and mentees)
      const response = await fetch(`https://vidyasangam.duckdns.org/api/mentor_mentee/sessions/user/${registrationNo}/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }
      
      const sessionsData = await response.json();
      
      // Transform API response to match our UI format
      const formattedSessions = sessionsData.map(session => {
        const sessionCreationTime = new Date(session.created_at);
        const currentTime = new Date();
        
        // Calculate if the session is still joinable (within 30 minutes of creation)
        const timeDifferenceInMinutes = Math.floor((currentTime - sessionCreationTime) / (1000 * 60));
        const isJoinable = timeDifferenceInMinutes <= 30;
        
        return {
          id: session.session_id,
          type: session.session_type,
          date: new Date(session.date_time).toLocaleString(),
          summary: session.summary,
          meetLink: session.meeting_link,
          location: session.location,
          mentor: status === 'Mentor' ? 'You' : session.mentor_details?.name || 'Unknown',
          duration: "Scheduled", // You might want to calculate this based on session data
          participants: session.participant_details?.map(p => p.name) || [],
          createdAt: session.created_at,
          isJoinable: isJoinable
        };
      });
      
      setSessions(formattedSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenteeSelection = (menteeId) => {
    console.log(`Toggling selection for mentee ID: ${menteeId}`);
    
    // Use functional update to avoid depending on the previous state
    setSelectedMentees(prevSelected => {
      // Check if already selected to avoid unnecessary updates
      const isAlreadySelected = prevSelected.includes(menteeId);
      if (isAlreadySelected) {
        return prevSelected.filter(id => id !== menteeId);
      } else {
        return [...prevSelected, menteeId];
      }
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
    
    setIsLoading(true);
    
    try {
      // Get current user's registration number
      const profileResponse = await fetch("https://vidyasangam.duckdns.org/api/user/profile/", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!profileResponse.ok) {
        throw new Error("Failed to fetch profile");
      }
      
      const profileData = await profileResponse.json();
      const mentorRegNo = profileData.reg_no;
      
      // Get selected mentee registration numbers
      const participantRegNos = selectedMentees.map(id => {
        const mentee = mentees.find(m => m.id === id);
        return mentee ? mentee.registrationNo : null;
      }).filter(Boolean);
      
      // Combine date and time into a single date object
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledDateTime = new Date(date);
      scheduledDateTime.setHours(hours, minutes, 0, 0);
      
      // For virtual sessions, first create a meeting link if needed
      let meetingLink = null;
      let sessionLocation = location;
      
      if (sessionType === "virtual") {
        const isAuthorized = localStorage.getItem("isAuthorized");
        
        if (!isAuthorized) {
          window.open("https://vidyasangam.duckdns.org/api/utility/authorize", "_blank");
          localStorage.setItem("isAuthorized", "true");
          setIsLoading(false);
          return;
        }
        
        const meetResponse = await fetch("https://vidyasangam.duckdns.org/api/utility/create-meet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
          },
          credentials: "include"
        });
        
        if (meetResponse.redirected) {
          window.open(meetResponse.url, "_blank");
          setIsLoading(false);
          return;
        }
        
        if (!meetResponse.ok) {
          throw new Error("Failed to create meeting");
        }
        
        const meetData = await meetResponse.json();
        meetingLink = meetData.meet_link;
      } else {
        // For physical session
        if (!sessionLocation) {
          sessionLocation = "To be determined";
        }
      }
      
      // Create the session in the backend
      const sessionData = {
        mentor: mentorRegNo,
        session_type: sessionType,
        date_time: scheduledDateTime.toISOString(),
        meeting_link: meetingLink,
        location: sessionLocation,
        summary: summary || (sessionType === "virtual" ? "Virtual session scheduled." : "Physical session scheduled."),
        participants: participantRegNos
      };
      
      const response = await fetch("https://vidyasangam.duckdns.org/api/mentor_mentee/sessions/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(sessionData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to create session");
      }
      
      // Session created successfully, now reload the sessions
      await loadSessions(userStatus.status);
      
      // Reset form fields
      setSelectedMentees([]);
      setDate(new Date());
      setTime("14:00");
      setLocation("");
      setSummary("");
      
      // Switch to the upcoming tab to show the new session
      setActiveTab("upcoming");
      
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowAllSessions = () => {
    setShowAllSessions(!showAllSessions);
  };

  const deleteSession = async () => {
    if (!sessionToDelete) return;
    
    setIsDeletingSession(true);
    setDeleteError(null);
    
    try {
      // Get current user's registration number
      const profileResponse = await fetch("https://vidyasangam.duckdns.org/api/user/profile/", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!profileResponse.ok) {
        throw new Error("Failed to fetch profile");
      }
      
      const profileData = await profileResponse.json();
      const mentorRegNo = profileData.reg_no;
      
      const sessionId = sessionToDelete.id;
      
      // Delete the session - remove debugging log and use only the primary endpoint
      const response = await fetch(`https://vidyasangam.duckdns.org/api/mentor_mentee/sessions/delete/${sessionId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({
          mentor_reg_no: mentorRegNo
        })
      });
      
      if (!response.ok) {
        // Update error handling to be simpler without detailed logging
        let errorMessage = "Failed to delete session";
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If parsing fails, use generic error message
        }
        throw new Error(errorMessage);
      }
      
      // Session deleted successfully, now reload the sessions
      await loadSessions(userStatus.status);
      
      // Close delete dialog
      setIsDeleteDialogOpen(false);
      setSessionToDelete(null);
      
    } catch (error) {
      console.error("Error deleting session:", error);
      setDeleteError(error.message || "Failed to delete session. Please try again.");
    } finally {
      setIsDeletingSession(false);
    }
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

  // Use the memoized value here
  const { upcoming, past } = categorizedSessions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <NavBar />
      
      {/* Hero section with improved visual design */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 mb-8 shadow-lg">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Session Management</h1>
              <p className="mt-2 text-blue-100">
                {userStatus.status === 'Mentor' 
                  ? 'Create and manage your mentoring sessions with students' 
                  : 'View and join your scheduled mentoring sessions'}
              </p>
            </div>
            
            {userStatus.status === 'Mentor' && (
              <Button 
                className="bg-white text-blue-600 hover:bg-blue-50 gap-1.5 shadow-md"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("create");
                }}
              >
                <Plus className="h-4 w-4" />
                New Session
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            if (value !== activeTab) {
              setActiveTab(value);
            }
          }} 
          className="w-full"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-3 p-1 bg-blue-50 rounded-lg">
              <TabsTrigger 
                value="upcoming" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md"
              >
                <Calendar className="h-4 w-4" />
                <span>Upcoming</span>
                {upcoming.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">{upcoming.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="past" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md"
              >
                <Clock className="h-4 w-4" />
                <span>Past</span>
                {past.length > 0 && (
                  <Badge variant="outline" className="ml-1">{past.length}</Badge>
                )}
              </TabsTrigger>
              {userStatus.status === 'Mentor' && (
                <TabsTrigger 
                  value="create" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create</span>
                </TabsTrigger>
              )}
            </TabsList>
            
            {activeTab !== "create" && userStatus.status === 'Mentor' && (
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("create");
                }}
                className="hidden sm:flex gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4" />
                New Session
              </Button>
            )}
          </div>
          
          {/* Upcoming Sessions Tab */}
          <TabsContent value="upcoming" className="space-y-6">
            {upcoming.length > 0 ? (
              <div className="grid gap-6">
                {upcoming.map((session, index) => (
                  <SessionCard 
                    key={index} 
                    session={session} 
                    userStatus={userStatus} 
                    onDelete={() => {
                      setSessionToDelete(session);
                      setIsDeleteDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={<Calendar className="h-16 w-16 text-blue-100" />}
                title="No upcoming sessions"
                description={userStatus.status === 'Mentor' 
                  ? "You don't have any sessions scheduled. Create a new session to get started."
                  : "You don't have any upcoming sessions scheduled with your mentors yet."}
                action={userStatus.status === 'Mentor' ? (
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("create");
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Session
                  </Button>
                ) : null}
              />
            )}
          </TabsContent>
          
          {/* Past Sessions Tab */}
          <TabsContent value="past" className="space-y-6">
            {past.length > 0 ? (
              <div className="grid gap-6">
                {past.map((session, index) => (
                  <SessionCard 
                    key={index} 
                    session={session} 
                    userStatus={userStatus}
                    isPast
                    onDelete={() => {
                      setSessionToDelete(session);
                      setIsDeleteDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={<Clock className="h-16 w-16 text-blue-100" />}
                title="No past sessions"
                description="You haven't had any sessions yet."
              />
            )}
          </TabsContent>
          
          {/* Create Session Tab (Only for Mentors) */}
          {userStatus.status === 'Mentor' && (
            <TabsContent value="create" className="space-y-6">
              <Card className="border-blue-200 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                  <CardTitle className="text-white flex items-center text-xl">
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Session
                  </CardTitle>
                  <CardDescription className="text-blue-100 mt-1">
                    Schedule a new mentoring session with your mentees
                  </CardDescription>
                </div>
                
                <CardContent className="p-6 pt-8">
                  <form onSubmit={createSession} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <Label htmlFor="sessionType" className="text-gray-700 font-medium">Session Type</Label>
                        <Select value={sessionType} onValueChange={setSessionType}>
                          <SelectTrigger id="sessionType" className="w-full mt-1.5 border-gray-300">
                            <SelectValue placeholder="Select session type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="virtual">
                              <div className="flex items-center">
                                <div className="bg-blue-50 p-1 rounded-full mr-2">
                                  <Video className="h-4 w-4 text-blue-500" />
                                </div>
                                <span>Virtual Session</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="physical">
                              <div className="flex items-center">
                                <div className="bg-green-50 p-1 rounded-full mr-2">
                                  <MapPin className="h-4 w-4 text-green-500" />
                                </div>
                                <span>Physical Session</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1.5">
                          {sessionType === "virtual" 
                            ? "A Google Meet link will be generated automatically" 
                            : "You'll need to specify a location for the session"}
                        </p>
                      </div>
                      
                      {sessionType === "physical" && (
                        <div>
                          <Label htmlFor="location" className="text-gray-700 font-medium">Location</Label>
                          <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., Room 101, Main Building"
                            className="mt-1.5 border-gray-300"
                          />
                        </div>
                      )}
                      
                      <div>
                        <Label htmlFor="date" className="text-gray-700 font-medium">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={date ? format(date, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const newDate = e.target.value ? new Date(e.target.value) : null;
                            setDate(newDate);
                          }}
                          className="mt-1.5 border-gray-300"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="time" className="text-gray-700 font-medium">Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="mt-1.5 border-gray-300"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="summary" className="text-gray-700 font-medium">Session Summary</Label>
                      <Textarea
                        id="summary"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Brief description of what will be covered in this session..."
                        className="mt-1.5 resize-none border-gray-300 min-h-[100px]"
                        rows={3}
                      />
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <Label className="text-base font-medium text-gray-700">Select Mentees</Label>
                        {selectedMentees.length > 0 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedMentees([])}
                            className="h-8 text-xs text-gray-500"
                          >
                            Clear selection
                          </Button>
                        )}
                      </div>
                      <div className="border rounded-md bg-white p-2 max-h-[240px] overflow-y-auto">
                        {mentees.length > 0 ? (
                          <div className="space-y-1">
                            {mentees.map((mentee) => (
                              <div 
                                key={mentee.id}
                                className={cn(
                                  "flex items-center space-x-3 p-2.5 rounded-md transition-colors",
                                  selectedMentees.includes(mentee.id) 
                                    ? "bg-blue-50 border border-blue-100" 
                                    : "hover:bg-gray-50 border border-transparent"
                                )}
                              >
                                <Checkbox 
                                  id={`mentee-${mentee.id}`} 
                                  checked={selectedMentees.includes(mentee.id)}
                                  onCheckedChange={() => handleMenteeSelection(mentee.id)}
                                  className={selectedMentees.includes(mentee.id) ? "text-blue-500 border-blue-300" : ""}
                                />
                                <div className="flex flex-col">
                                  <Label 
                                    htmlFor={`mentee-${mentee.id}`}
                                    className="text-sm font-medium text-gray-800 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {mentee.name}
                                  </Label>
                                  <span className="text-xs text-gray-500 mt-1">
                                    {mentee.branch} • Semester {mentee.semester}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-10">
                            <div className="bg-gray-100 p-3 rounded-full inline-flex mb-3">
                              <UserIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">You don&apos;t have any mentees assigned yet.</p>
                            <p className="text-xs text-blue-600 mt-1">Please contact the administrator if you believe this is an error.</p>
                          </div>
                        )}
                      </div>
                      {selectedMentees.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="secondary" className="text-xs">
                            {selectedMentees.length} {selectedMentees.length === 1 ? 'mentee' : 'mentees'} selected
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isLoading || selectedMentees.length === 0}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating session...
                        </span>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Session
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
      
      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && sessionToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Delete Session
              </h2>
              <p className="text-gray-600 mt-2">
                Are you sure you want to delete this {sessionToDelete.type} session scheduled for {sessionToDelete.date}?
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <h3 className="font-medium text-amber-800 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Warning
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  Deleting this session may affect your leaderboard points and the points of your mentees. 
                  This action cannot be undone.
                </p>
              </div>
              
              {deleteError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  <div className="font-semibold flex items-center">
                    <XCircle className="h-4 w-4 mr-2" />
                    Error
                  </div>
                  <div className="mt-1 text-sm">{deleteError}</div>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-100 p-4 flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
              <button
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSessionToDelete(null);
                  setDeleteError(null);
                }}
                disabled={isDeletingSession}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
                onClick={deleteSession}
                disabled={isDeletingSession}
              >
                {isDeletingSession ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  "Delete Session"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add new function to categorize sessions
const categorizeSessions = (sessions) => {
  const now = new Date();
  
  const upcoming = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate > now;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const past = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate <= now;
  }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first
  
  return { upcoming, past };
};

// Component for session cards
const SessionCard = ({ session, userStatus, isPast = false, onDelete }) => {
  const isVirtual = session.type === "virtual";
  const statusColor = isPast 
    ? "bg-gray-100 text-gray-700" 
    : isVirtual 
      ? "bg-blue-100 text-blue-800" 
      : "bg-green-100 text-green-800";
  
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg group relative",
      isPast ? "opacity-90" : "",
      isVirtual 
        ? "border-blue-200 hover:border-blue-300" 
        : "border-green-200 hover:border-green-300"
    )}>
      {/* Colored accent strip */}
      <div className={cn(
        "absolute left-0 top-0 h-full w-1.5",
        isVirtual ? "bg-blue-500" : "bg-green-500"
      )} />
      
      <CardContent className="p-0">
        <div className="p-6 pl-8">
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-start mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold capitalize flex items-center">
                  {isVirtual ? (
                    <Video className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" />
                  ) : (
                    <MapPin className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                  )}
                  <span className="truncate">{session.type} Session</span>
                </h3>
                <Badge className={cn(statusColor, "ml-1 font-medium")}>
                  {isPast ? "Completed" : "Upcoming"}
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0 text-gray-400" />
                  {session.date}
                </div>
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1.5 flex-shrink-0 text-gray-400" />
                  {session.mentor}
                </div>
              </div>
            </div>
            
            {userStatus.status === 'Mentor' && !isPast && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onDelete}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="sm:hidden">Delete</span>
              </Button>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">{session.summary}</p>
          
          {/* Show participants */}
          {session.participants && session.participants.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">Participants:</h4>
              <div className="flex flex-wrap gap-1.5">
                {session.participants.map((participant, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-gray-50 hover:bg-gray-100 transition-colors">
                    {participant}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <Separator className="my-4" />
          
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {isVirtual && session.meetLink ? (
                session.isJoinable ? (
                  <a
                    href={session.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Join Meet <ExternalLink className="ml-1.5 h-4 w-4" />
                  </a>
                ) : (
                  <div className="inline-flex items-center px-3 py-1.5 text-sm rounded-md bg-gray-100 text-gray-500">
                    <XCircle className="h-4 w-4 mr-1.5 text-gray-400" />
                    Meeting link expired
                  </div>
                )
              ) : null}
              
              {session.location && (
                <div className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-green-50 text-green-700 border border-green-200">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  {session.location}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Empty state component
const EmptyState = ({ icon, title, description, action }) => (
  <Card className="border-dashed border-2 border-gray-200 bg-white">
    <CardContent className="p-10 flex flex-col items-center justify-center text-center">
      <div className="rounded-full bg-blue-50 p-4 mb-5 ring-8 ring-blue-50/50">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </CardContent>
  </Card>
);