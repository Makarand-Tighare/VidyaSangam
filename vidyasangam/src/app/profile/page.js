'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"
import { Loader2 } from "lucide-react"

import NavBar from '../components/navBar'
import LinkedInButton from '../components/linkedinButton';

export default function Profile() {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    status: '',
    email: '',
    phone: '',
    section: '',
    year: '',
    semester: '',
    linkedin_access_token: '',
  })

  const [mentorMenteeData, setMentorMenteeData] = useState({
    mentor: null,
    mentees: [],
    branch: '',
    tech_stack: '',
    areas_of_interest: '',
  })

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    isSubmitting: false,
    message: '',
    success: false
  })
  
  // New state for task management
  const [taskData, setTaskData] = useState({
    selectedMentee: null,
    taskPrompt: '',
    taskDescription: '',
    isLoading: false,
  })
  
  // State to store tasks for mentees
  const [menteeTasks, setMenteeTasks] = useState({})
  
  // Dialog state
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)

  const [isEditing, setIsEditing] = useState(false)

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Fetch user data from API
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) throw new Error('No auth token found')

        const response = await fetch('http://127.0.0.1:8000/api/user/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        })

        if (!response.ok) throw new Error('Failed to fetch user data')

        const data = await response.json()
        setFormData({
          registrationNumber: data.reg_no || '',
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          organizationName: 'Yeshwantrao Chavan College of Engineering (YCCE), Nagpur',
          status: 'Loading...', // Initially set as loading
          email: data.email || '',
          phone: data.mobile_number || '',
          section: data.section || '',
          year: data.year || '',
          semester: data.semester || '',
          linkedin_access_token: data.linkedin_access_token || '',
        })

        // Try to load profile picture from localStorage
        if (data.reg_no) {
          const savedProfilePic = localStorage.getItem(`profile_picture_${data.reg_no}`);
          if (savedProfilePic) {
            setProfilePicture(savedProfilePic);
          }
          
          // Fetch mentor/mentee status
          fetchMentorMenteeStatus(data.reg_no)
          // We'll fetch tasks after the status is set
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [])

  // Add a new useEffect to update status when mentorMenteeData changes
  useEffect(() => {
    const regNo = formData.registrationNumber;
    
    if (regNo) {
      let newStatus = 'Student';
      
      // First check if they have a mentor assigned
      if (mentorMenteeData.mentor !== null) {
        newStatus = 'Mentee';
      } 
      // Then check if they have mentees assigned
      else if (mentorMenteeData.mentees && mentorMenteeData.mentees.length > 0) {
        newStatus = 'Mentor';
      }
      
      console.log('Updating status to:', newStatus);
      
      setFormData(prev => ({ 
        ...prev, 
        status: newStatus 
      }));
      
      // Now that we have the correct status, fetch tasks
      fetchTasks(regNo, newStatus);
    }
  }, [mentorMenteeData]);

  // Add debugging for status changes
  useEffect(() => {
    console.log('Current status:', formData.status);
    console.log('Has mentor:', mentorMenteeData.mentor !== null);
    console.log('Has mentees:', mentorMenteeData.mentees.length > 0);
  }, [formData.status, mentorMenteeData.mentor, mentorMenteeData.mentees]);
  
  // Load profile picture from localStorage on component mount
  useEffect(() => {
    if (formData.registrationNumber) {
      const savedProfilePic = localStorage.getItem(`profile_picture_${formData.registrationNumber}`);
      if (savedProfilePic) {
        setProfilePicture(savedProfilePic);
      }
    }
  }, [formData.registrationNumber]);
  
  // Handle profile picture upload
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit');
      return;
    }
    
    // Check file type
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      alert('Only JPG and PNG files are allowed');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Read file as data URL
      const base64String = await readFileAsDataURL(file);
      
      // Store in localStorage with user ID as key
      if (formData.registrationNumber) {
        localStorage.setItem(`profile_picture_${formData.registrationNumber}`, base64String);
        setProfilePicture(base64String);
        alert('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Helper function to read file as data URL
  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const fetchMentorMenteeStatus = async (registrationNo) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/mentor_mentee/profile/${registrationNo}/`)
      
      if (!response.ok) throw new Error('Failed to fetch mentor/mentee data')
      
      const data = await response.json()
      console.log('Mentor/Mentee API response:', data)
      
      setMentorMenteeData({
        mentor: data.mentor,
        mentees: data.mentees || [],
        branch: data.branch || '',
        tech_stack: data.tech_stack || '',
        areas_of_interest: data.areas_of_interest || '',
      })
      
      // Determine status based on the mentor/mentee data
      let status = 'Student'
      
      // First check if they have a mentor assigned
      if (data.mentor !== null) {
        status = 'Mentee'
      }
      // Then check if the person has mentoring_preferences set to mentor
      // or if they have mentees assigned
      else if ((data.mentoring_preferences && data.mentoring_preferences.toLowerCase() === 'mentor') ||
          (data.mentees && data.mentees.length > 0)) {
        status = 'Mentor'
      }
      
      console.log('Determined status:', status)
      
      setFormData(prev => ({
        ...prev,
        status
      }))
      
    } catch (error) {
      console.error('Error fetching mentor/mentee status:', error)
      setFormData(prev => ({
        ...prev,
        status: 'Student'
      }))
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSecurityChange = (e) => {
    const { name, value } = e.target
    setSecurityData(prev => ({ ...prev, [name]: value }))
  }
  
  // Handle task input changes
  const handleTaskChange = (e) => {
    const { name, value } = e.target
    setTaskData(prev => ({ ...prev, [name]: value }))
  }
  
  // Handle mentee selection for task assignment
  const handleMenteeSelection = (mentee) => {
    setTaskData(prev => ({ ...prev, selectedMentee: mentee }))
    setIsTaskDialogOpen(true)
  }
  
  // Function to generate a quiz based on the prompt
  const generateQuiz = async () => {
    // In a real implementation, this would call an API to generate a quiz
    setTaskData(prev => ({ ...prev, isLoading: true }))
    
    try {
      // Mock API call - in production, replace with actual API call
      // const response = await fetch('http://127.0.0.1:8000/api/generate-quiz/', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify({
      //     prompt: taskData.taskPrompt,
      //     description: taskData.taskDescription,
      //     mentee_id: taskData.selectedMentee.registration_no
      //   })
      // })
      
      // if (!response.ok) throw new Error('Failed to generate quiz')
      // const data = await response.json()
      
      // Mock response for development purposes
      const mockQuiz = {
        id: Date.now(),
        title: taskData.taskPrompt,
        description: taskData.taskDescription,
        questions: [
          { id: 1, question: "Sample question 1 based on prompt", options: ["Option A", "Option B", "Option C", "Option D"], answer: 0 },
          { id: 2, question: "Sample question 2 based on prompt", options: ["Option A", "Option B", "Option C", "Option D"], answer: 1 },
        ],
        total_marks: 10,
        created_at: new Date().toISOString()
      }
      
      // Update the mentee tasks
      setMenteeTasks(prev => ({
        ...prev,
        [taskData.selectedMentee.registration_no]: [
          ...(prev[taskData.selectedMentee.registration_no] || []),
          mockQuiz
        ]
      }))
      
      // Show success message
      alert('Task assigned successfully!')
      
      // Reset task form
      setTaskData({
        selectedMentee: null,
        taskPrompt: '',
        taskDescription: '',
        isLoading: false
      })
      
      setIsTaskDialogOpen(false)
    } catch (error) {
      console.error('Error generating quiz:', error)
      alert('Error generating quiz. Please try again.')
    } finally {
      setTaskData(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsEditing(false)
    console.log('Form Data Saved:', formData)
    // Implement API call to save data
  }

  const handleSecuritySubmit = async (e) => {
    e.preventDefault()
    
    // Validate inputs
    if (!securityData.currentPassword) {
      setSecurityData(prev => ({
        ...prev,
        message: 'Current password is required',
        success: false
      }))
      return
    }
    
    if (!securityData.newPassword) {
      setSecurityData(prev => ({
        ...prev,
        message: 'New password is required',
        success: false
      }))
      return
    }
    
    if (securityData.newPassword !== securityData.confirmPassword) {
      setSecurityData(prev => ({
        ...prev,
        message: 'New passwords do not match',
        success: false
      }))
      return
    }
    
    setSecurityData(prev => ({ ...prev, isSubmitting: true, message: '' }))
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/user/changepassword/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          current_password: securityData.currentPassword,
          new_password: securityData.newPassword,
          confirm_password: securityData.confirmPassword
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password')
      }
      
      console.log('Password change API response:', data)
      
      // Reset form after successful submission
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        isSubmitting: false,
        message: 'Password changed successfully!',
        success: true
      })
    } catch (error) {
      console.error('Error changing password:', error)
      setSecurityData(prev => ({
        ...prev,
        isSubmitting: false,
        message: error.message || 'Error changing password. Please try again.',
        success: false
      }))
    }
  }
  
  // Function to handle task submission
  const handleTaskSubmit = (e) => {
    e.preventDefault()
    if (!taskData.taskPrompt) {
      alert('Please enter a task prompt')
      return
    }
    generateQuiz()
  }

  // Function to fetch all tasks for the user (as either mentor or mentee)
  const fetchTasks = async (regNo, status) => {
    try {
      // In a real implementation, this would call your API
      // const response = await fetch(`http://127.0.0.1:8000/api/tasks/${regNo}/`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      //     'Content-Type': 'application/json'
      //   }
      // })
      
      // if (!response.ok) throw new Error('Failed to fetch tasks')
      // const data = await response.json()
      
      // Determine if the user is a mentor or mentee first by checking the current status
      // const userStatus = formData.status;
      
      // Mock data for development purposes
      // This would be replaced with actual API data in production
      let mockTasks = {};
      
      // If user is a mentee, add tasks assigned to them
      if (status === 'Mentee' || mentorMenteeData.mentor !== null) {
        mockTasks[regNo] = [
          {
            id: 1,
            title: "Introduction to Data Structures",
            description: "Learn about basic data structures like arrays, linked lists, and stacks",
            total_marks: 10,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
          }
        ];
      }
      
      // If user is a mentor, add tasks they've assigned to mentees
      if (status === 'Mentor' || mentorMenteeData.mentees?.length > 0) {
        // Create mock tasks for each mentee
        mentorMenteeData.mentees.forEach(mentee => {
          if (!mockTasks[mentee.registration_no]) {
            mockTasks[mentee.registration_no] = [];
          }
          
          mockTasks[mentee.registration_no].push({
            id: Date.now(),
            title: "Git Fundamentals",
            description: "Learn basic Git commands and workflows",
            total_marks: 10,
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
          });
        });
      }
      
      console.log('Fetched tasks:', mockTasks);
      setMenteeTasks(mockTasks);
      
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-2">
      <NavBar />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="w-32 h-32 mb-4">
              <AvatarImage 
                src={profilePicture || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?t=st=1730071119~exp=1730074719~hmac=37544826c51ddd25b4d265c9336deff7b884deb1771c551bcf5b23bbfa75a336&w=1380"} 
                alt="Profile" 
              />
              <AvatarFallback>
                {formData.firstName && formData.lastName 
                  ? `${formData.firstName[0]}${formData.lastName[0]}`
                  : 'PP'}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground mb-4">JPG or PNG no larger than 5 MB</p>
            
            {/* Hidden file input */}
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg, image/png"
              onChange={handleFileChange}
            />
            
            <Button 
              onClick={handleUploadClick}
              disabled={isUploading}
              className="mb-4"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload new image'
              )}
            </Button>
            
            {profilePicture && (
              <Button 
                variant="outline" 
                onClick={() => {
                  if (formData.registrationNumber) {
                    localStorage.removeItem(`profile_picture_${formData.registrationNumber}`);
                  }
                  setProfilePicture(null);
                }}
                className="mb-4"
              >
                Remove image
              </Button>
            )}
            
            <br />
            {formData.linkedin_access_token && formData.linkedin_access_token.length > 1 ? (
              <Button style={{ backgroundColor: 'skyblue' }}>LinkedIn connected</Button>
            ) : (
              <LinkedInButton />
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={true}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <Button type="submit" disabled={!isEditing} onClick={() => !isEditing && setIsEditing(true)}>
                {isEditing ? "Save Changes" : "Edit Details"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {mentorMenteeData.mentor !== null && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Your Mentor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-blue-700 mb-2">
                  {mentorMenteeData.mentor?.name || "Not assigned yet"}
                </h3>
                {mentorMenteeData.mentor && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-semibold">Registration No:</p>
                      <p>{mentorMenteeData.mentor.registration_no}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Semester:</p>
                      <p>{mentorMenteeData.mentor.semester}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Tech Stack:</p>
                      <p>{mentorMenteeData.mentor.tech_stack || "Not specified"}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* New section for assigned tasks (for mentees) */}
        {formData.status === 'Mentee' && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Assigned Tasks</CardTitle>
              <p className="text-sm text-gray-500">Tasks assigned by your mentor</p>
            </CardHeader>
            <CardContent>
              {/* This would typically fetch from an API */}
              {menteeTasks[formData.registrationNumber] && menteeTasks[formData.registrationNumber].length > 0 ? (
                <div className="space-y-4">
                  {menteeTasks[formData.registrationNumber].map((task, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                          <p className="text-xs text-gray-500 mt-2">Assigned on: {new Date(task.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {task.total_marks} marks
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            window.location.href = `/quiz?taskId=${task.id}&menteeId=${formData.registrationNumber}`;
                          }}
                        >
                          Take Quiz
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No tasks assigned yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {mentorMenteeData.mentees.length > 0 && formData.status === 'Mentor' && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Your Mentees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tech Stack</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mentorMenteeData.mentees.map((mentee, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mentee.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mentee.registration_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mentee.semester}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mentee.branch}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mentee.tech_stack}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Button 
                            variant="outline" 
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleMenteeSelection(mentee)}
                          >
                            Assign Task
                          </Button>
                          
                          {menteeTasks[mentee.registration_no] && menteeTasks[mentee.registration_no].length > 0 && (
                            <div className="mt-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-xs text-gray-500"
                              >
                                {menteeTasks[mentee.registration_no].length} task(s) assigned
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Task Assignment Dialog */}
              <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Assign Task to {taskData.selectedMentee?.name}</DialogTitle>
                    <DialogDescription>
                      Create a task or quiz for your mentee. Enter a prompt and the system will generate a 10-mark quiz.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleTaskSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="taskPrompt" className="col-span-4">
                          Task Topic/Prompt
                        </Label>
                        <Input
                          id="taskPrompt"
                          name="taskPrompt"
                          placeholder="e.g., Data Structures and Algorithms"
                          className="col-span-4"
                          value={taskData.taskPrompt}
                          onChange={handleTaskChange}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="taskDescription" className="col-span-4">
                          Task Description (Optional)
                        </Label>
                        <Textarea
                          id="taskDescription"
                          name="taskDescription"
                          placeholder="Provide additional details about the task..."
                          className="col-span-4"
                          value={taskData.taskDescription}
                          onChange={handleTaskChange}
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={taskData.isLoading || !taskData.taskPrompt}
                      >
                        {taskData.isLoading ? "Generating Quiz..." : "Assign Task"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSecuritySubmit} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={securityData.currentPassword}
                  onChange={handleSecurityChange}
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={securityData.newPassword}
                  onChange={handleSecurityChange}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={securityData.confirmPassword}
                  onChange={handleSecurityChange}
                />
              </div>
              <Button type="submit" disabled={securityData.isSubmitting}>
                {securityData.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
              {securityData.message && (
                <p className={`text-sm ${securityData.success ? 'text-green-600' : 'text-red-600'}`}>
                  {securityData.message}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
