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
import { authenticatedFetch, isLoggedIn } from '../lib/auth';
import { withAuth } from '../lib/useAuth';
import { useRouter } from 'next/navigation';

function Profile() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
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
    numQuestions: 5, // Default value for number of questions
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

  const [quizDetailsDialogOpen, setQuizDetailsDialogOpen] = useState(false);
  const [selectedMenteeDetails, setSelectedMenteeDetails] = useState(null);

  // Check auth first before making any API calls
  useEffect(() => {
    const checkAuth = async () => {
      setIsInitializing(true);
      if (!isLoggedIn()) {
        router.push('/login');
        return;
      }
      setIsInitializing(false);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    // Only fetch user data if not initializing (authentication check passed)
    if (!isInitializing) {
      fetchUserData();
    }
  }, [isInitializing]);

  // Fetch user data from API with better error handling
  const fetchUserData = async () => {
    setLoadingProfile(true);
    try {
      const response = await authenticatedFetch('https://project-api-qgho.onrender.com/api/user/profile/');

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - redirect to login
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
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
      });

      // Try to load profile picture from localStorage
      if (data.reg_no) {
        const savedProfilePic = localStorage.getItem(`profile_picture_${data.reg_no}`);
        if (savedProfilePic) {
          setProfilePicture(savedProfilePic);
        }
        
        // Fetch mentor/mentee status
        await fetchMentorMenteeStatus(data.reg_no);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

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
      const response = await authenticatedFetch(`https://project-api-qgho.onrender.com/api/mentor_mentee/profile/${registrationNo}/`);
      
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
  
  const generateQuiz = async () => {
    setTaskData(prev => ({ ...prev, isLoading: true }));
  
    try {
      const response = await authenticatedFetch('https://project-api-qgho.onrender.com/api/mentor_mentee/generate-quiz/', {
        method: 'POST',
        body: JSON.stringify({
          prompt: taskData.taskPrompt,
          description: taskData.taskDescription,
          num_questions: parseInt(taskData.numQuestions),
          mentee_id: taskData.selectedMentee.registration_no,
          mentor_id: formData.registrationNumber
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }
      
      const data = await response.json();
      
      // Extract the quiz data from the API response
      const quizData = data.quiz;
      const quizId = data.quiz_id;
      
      // Update the mentee tasks with the new quiz
      const newQuiz = {
        id: quizId,
        title: taskData.taskPrompt,
        description: taskData.taskDescription,
        questions: quizData,
        total_marks: quizData.length,
        created_at: new Date().toISOString(),
        status: data.status
      };
      
      setMenteeTasks(prev => ({
        ...prev,
        [taskData.selectedMentee.registration_no]: [
          ...(prev[taskData.selectedMentee.registration_no] || []),
          newQuiz
        ]
      }));
      
      // Show success message
      alert(data.message || 'Task assigned successfully!');
      
      // Reset task form
      resetTaskData();
      
      setIsTaskDialogOpen(false);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Error generating quiz. Please try again.');
      setTaskData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Extract only the updatable fields from formData
      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        mobile_number: formData.phone,
        section: formData.section,
        year: formData.year,
        semester: formData.semester
      }
      
      const response = await authenticatedFetch('https://project-api-qgho.onrender.com/api/user/update-profile/', {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      
      const data = await response.json()
      alert('Profile updated successfully!')
      
      // Set editing to false only after successful update
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert(`Failed to update profile: ${error.message}. Please try again.`)
      // Keep the form in edit mode if update fails
      setIsEditing(true)
    }
  }

  const handleSecuritySubmit = async (e) => {
    e.preventDefault()
    
    // // Validate inputs
    // if (!securityData.currentPassword) {
    //   setSecurityData(prev => ({
    //     ...prev,
    //     message: 'Current password is required',
    //     success: false
    //   }))
    //   return
    // }
    
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
      const response = await authenticatedFetch('https://project-api-qgho.onrender.com/api/user/changepassword/', {
        method: 'POST',
        body: JSON.stringify({
          // current_password: securityData.currentPassword,
          password: securityData.newPassword,
          password2: securityData.confirmPassword
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password')
      }
      
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
      // If the user is a mentee, fetch their quizzes
      if (status === 'Mentee' || mentorMenteeData.mentor !== null) {
        await fetchPendingQuizzes(regNo);
      }
      
      // If the user is a mentor, fetch quizzes for each mentee
      if (status === 'Mentor' || mentorMenteeData.mentees?.length > 0) {
        // For each mentee, fetch their quiz history
        for (const mentee of mentorMenteeData.mentees) {
          try {
            await fetchMenteeQuizHistory(mentee.registration_no);
          } catch (error) {
            console.error(`Error fetching quizzes for mentee ${mentee.name}:`, error);
            // Show error notification or handle gracefully
            // Don't use mock data in production
          }
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Show error notification
    }
  }

  // Submit completed quiz to the server
  const submitQuiz = async (registrationNo, quizId, userAnswers) => {
    try {
      const response = await fetch('https://project-api-qgho.onrender.com/api/mentor_mentee/submit-quiz/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          participant_id: registrationNo,
          quiz_id: quizId,
          quiz_answers: userAnswers
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  };

  // Fetch a mentee's quiz history (for mentors to view)
  const fetchMenteeQuizHistory = async (menteeId) => {
    try {
      // Fetch both pending and completed quizzes
      const pendingResponse = await fetch(`https://project-api-qgho.onrender.com/api/mentor_mentee/pending-quizzes/${menteeId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!pendingResponse.ok) {
        throw new Error('Failed to fetch pending quizzes');
      }
      
      const pendingQuizzes = await pendingResponse.json();
      
      const completedResponse = await fetch(`https://project-api-qgho.onrender.com/api/mentor_mentee/quiz-results/${menteeId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!completedResponse.ok) {
        throw new Error('Failed to fetch quiz history');
      }
      
      const completedQuizzes = await completedResponse.json();
      
      // Process to match UI format
      const formattedPendingQuizzes = pendingQuizzes.map(quiz => ({
        id: quiz.id,
        title: quiz.quiz_topic,
        description: `Quiz with ${quiz.total_questions} questions`,
        questions: quiz.quiz_data,
        total_marks: quiz.total_questions,
        created_at: quiz.quiz_date,
        status: 'pending',
        participant_name: quiz.participant_name
      }));
      
      const formattedCompletedQuizzes = completedQuizzes.map(quiz => ({
        id: quiz.id,
        title: quiz.quiz_topic,
        description: `Quiz with ${quiz.total_questions} questions`,
        questions: quiz.quiz_data,
        total_marks: quiz.total_questions,
        created_at: quiz.quiz_date,
        status: 'completed',
        participant_name: quiz.participant_name,
        score: quiz.score,
        percentage: quiz.percentage,
        quiz_answers: quiz.quiz_answers,
        result_details: quiz.result_details
      }));
      
      // Combine all quizzes
      const allQuizzes = [...formattedPendingQuizzes, ...formattedCompletedQuizzes];
      
      // Update the mentee tasks state
      setMenteeTasks(prev => ({
        ...prev,
        [menteeId]: allQuizzes
      }));
      
      return allQuizzes;
    } catch (error) {
      console.error('Error fetching mentee quiz history:', error);
      throw error;
    }
  };

  // Get quiz history for a user
  const getQuizHistory = async (registrationNo) => {
    try {
      const response = await fetch(`https://project-api-qgho.onrender.com/api/mentor_mentee/quiz-results/${registrationNo}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch quiz history');
      }
      
      const quizHistory = await response.json();
      return quizHistory;
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      throw error;
    }
  };

  // Fetch pending quizzes for a mentee
  const fetchPendingQuizzes = async (menteeId) => {
    try {
      const response = await fetch(`https://project-api-qgho.onrender.com/api/mentor_mentee/pending-quizzes/${menteeId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending quizzes');
      }
      
      const pendingQuizzes = await response.json();
      
      // Fetch completed quizzes
      const completedResponse = await fetch(`https://project-api-qgho.onrender.com/api/mentor_mentee/quiz-results/${menteeId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!completedResponse.ok) {
        throw new Error('Failed to fetch completed quizzes');
      }
      
      const completedQuizzes = await completedResponse.json();
      
      // Process the API responses to match our UI format
      const formattedPendingQuizzes = pendingQuizzes.map(quiz => ({
        id: quiz.id,
        title: quiz.quiz_topic,
        description: `Quiz with ${quiz.total_questions} questions`,
        questions: quiz.quiz_data,
        total_marks: quiz.total_questions,
        created_at: quiz.quiz_date,
        status: 'pending',
        participant_name: quiz.participant_name
      }));
      
      const formattedCompletedQuizzes = completedQuizzes.map(quiz => ({
        id: quiz.id,
        title: quiz.quiz_topic,
        description: `Quiz with ${quiz.total_questions} questions`,
        questions: quiz.quiz_data,
        total_marks: quiz.total_questions,
        created_at: quiz.quiz_date,
        status: 'completed',
        participant_name: quiz.participant_name,
        score: quiz.score,
        percentage: quiz.percentage,
        quiz_answers: quiz.quiz_answers,
        result_details: quiz.result_details
      }));
      
      // Combine pending and completed quizzes
      const allQuizzes = [...formattedPendingQuizzes, ...formattedCompletedQuizzes];
      
      // Update the mentee tasks state with all quizzes
      setMenteeTasks(prev => ({
        ...prev,
        [menteeId]: allQuizzes
      }));
      
      return allQuizzes;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  };

  const resetTaskData = () => {
    setTaskData(prev => ({
      selectedMentee: prev.selectedMentee, // Preserve the selected mentee
      taskPrompt: "",
      taskDescription: "",
      numQuestions: 5,
      isLoading: false,
    }));
  };

  // Function to open quiz details dialog
  const openQuizDetailsDialog = (mentee) => {
    // Get the mentee's quizzes
    const menteeQuizzes = menteeTasks[mentee.registration_no] || [];
    
    // Count pending and completed quizzes
    const pendingQuizzes = menteeQuizzes.filter(q => q.status === 'pending');
    const completedQuizzes = menteeQuizzes.filter(q => q.status === 'completed');
    
    // Calculate average score if there are completed quizzes
    const averageScore = completedQuizzes.length > 0
      ? (completedQuizzes.reduce((sum, quiz) => sum + quiz.percentage, 0) / completedQuizzes.length).toFixed(1)
      : 'N/A';
    
    // Store details for the dialog
    setSelectedMenteeDetails({
      mentee: mentee,
      quizzes: menteeQuizzes,
      pending: pendingQuizzes,
      completed: completedQuizzes,
      averageScore: averageScore
    });
    
    // Open the dialog
    setQuizDetailsDialogOpen(true);
  };

  // Function to delete a quiz
  const deleteQuiz = async (quizId) => {
    try {
      // Confirm before deletion
      if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
        return;
      }
      
      // Determine user role based on formData.status
      const userRole = formData.status === 'Mentor' ? 'mentor' : 'mentee';
      
      const response = await fetch(`https://project-api-qgho.onrender.com/api/mentor_mentee/delete-quiz/${quizId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: formData.registrationNumber,
          user_role: userRole
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }
      
      // First, handle the case where we're in the details dialog
      if (selectedMenteeDetails) {
        // Remove the deleted quiz from the list
        const updatedQuizzes = selectedMenteeDetails.quizzes.filter(quiz => quiz.id !== quizId);
        
        // Recalculate pending and completed
        const updatedPending = updatedQuizzes.filter(q => q.status === 'pending');
        const updatedCompleted = updatedQuizzes.filter(q => q.status === 'completed');
        
        // Calculate new average score
        const newAverageScore = updatedCompleted.length > 0
          ? (updatedCompleted.reduce((sum, quiz) => sum + quiz.percentage, 0) / updatedCompleted.length).toFixed(1)
          : 'N/A';
        
        // Update state with new data
        setSelectedMenteeDetails({
          ...selectedMenteeDetails,
          quizzes: updatedQuizzes,
          pending: updatedPending,
          completed: updatedCompleted,
          averageScore: newAverageScore
        });
        
        // Update the main menteeTasks state for this mentee
        const menteeId = selectedMenteeDetails.mentee.registration_no;
        setMenteeTasks(prev => ({
          ...prev,
          [menteeId]: updatedQuizzes
        }));
      } else {
        // Handle the case where we're deleting directly from the profile page
        
        // Update all mentee task lists by removing the deleted quiz
        setMenteeTasks(prev => {
          const updatedTasks = {};
          
          // For each mentee
          Object.keys(prev).forEach(menteeId => {
            // Filter out the deleted quiz
            updatedTasks[menteeId] = prev[menteeId].filter(quiz => quiz.id !== quizId);
          });
          
          return updatedTasks;
        });
      }
      
      // Show success message
      alert('Quiz deleted successfully');
      
      // Refresh the tasks if needed
      if (formData.status === 'Mentor') {
        // For mentors, refresh all mentee data
        for (const mentee of mentorMenteeData.mentees) {
          try {
            await fetchMenteeQuizHistory(mentee.registration_no);
          } catch (error) {
            console.error(`Error refreshing quizzes for mentee ${mentee.name}:`, error);
          }
        }
      } else if (formData.status === 'Mentee') {
        // For mentees, just refresh their own data
        await fetchPendingQuizzes(formData.registrationNumber);
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Error deleting quiz. Please try again.');
    }
  };

  // Render profile page with loading state
  if (isInitializing || loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#f0f8ff] via-[#e6f3ff] to-[#f0f8ff]">
        <NavBar />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
            <p className="mt-4 text-lg text-blue-800">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
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
                    readOnly={true}
                    disabled={true}
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
                    readOnly={true}
                    disabled={true}
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
                <div>
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              {isEditing && (
                <Button type="submit">
                  Save Changes
                </Button>
              )}
            </form>
            {!isEditing && (
              <Button 
                type="button" 
                onClick={() => setIsEditing(true)}
                style={{marginTop: '1rem'}}
              >
                Edit Details
              </Button>
            )}
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
              <CardTitle>Your Quizzes</CardTitle>
              <p className="text-sm text-gray-500">Quizzes assigned by your mentor</p>
            </CardHeader>
            <CardContent>
              {/* This would typically fetch from an API */}
              {menteeTasks[formData.registrationNumber] && menteeTasks[formData.registrationNumber].length > 0 ? (
                <div>
                  {/* Pending Quizzes */}
                  <h3 className="text-lg font-semibold mb-3">Pending Quizzes</h3>
                  <div className="space-y-4 mb-8">
                    {menteeTasks[formData.registrationNumber]
                      .filter(task => task.status === 'pending')
                      .map((task, index) => (
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
                          <div className="mt-4 flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                window.location.href = `/quiz?taskId=${task.id}&menteeId=${formData.registrationNumber}`;
                              }}
                            >
                              Take Quiz
                            </Button>
                            {formData.status === 'Mentor' && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => deleteQuiz(task.id)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    
                    {menteeTasks[formData.registrationNumber].filter(task => task.status === 'pending').length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <p>No pending quizzes.</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Completed Quizzes */}
                  <h3 className="text-lg font-semibold mb-3">Completed Quizzes</h3>
                  <div className="space-y-4">
                    {menteeTasks[formData.registrationNumber]
                      .filter(task => task.status === 'completed')
                      .map((task, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 bg-green-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{task.title}</h3>
                              <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                              <p className="text-xs text-gray-500 mt-2">Completed on: {new Date(task.created_at).toLocaleDateString()}</p>
                              <div className="mt-2">
                                <span className="text-sm font-medium text-green-700">
                                  Score: {task.score} / {task.total_marks} ({task.percentage}%)
                                </span>
                              </div>
                            </div>
                            <div>
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                Completed
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                window.location.href = `/quiz?taskId=${task.id}&menteeId=${formData.registrationNumber}&view=results`;
                              }}
                            >
                              View Results
                            </Button>
                            {formData.status === 'Mentor' && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => deleteQuiz(task.id)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    
                    {menteeTasks[formData.registrationNumber].filter(task => task.status === 'completed').length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <p>No completed quizzes.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No quizzes assigned yet.</p>
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz Status</th>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {menteeTasks[mentee.registration_no] && menteeTasks[mentee.registration_no].length > 0 ? (
                            <div className="space-y-1">
                              <div>
                                <span className="text-xs font-medium">
                                  {menteeTasks[mentee.registration_no].filter(quiz => quiz.status === 'pending').length} pending
                                </span>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-green-700">
                                  {menteeTasks[mentee.registration_no].filter(quiz => quiz.status === 'completed').length} completed
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">No quizzes assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Button 
                            variant="outline" 
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleMenteeSelection(mentee)}
                          >
                            Assign Quiz
                          </Button>
                          
                          {menteeTasks[mentee.registration_no] && menteeTasks[mentee.registration_no].length > 0 && (
                            <div className="mt-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-xs text-gray-500"
                                onClick={() => openQuizDetailsDialog(mentee)}
                              >
                                View Quiz Details
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quiz Assignment Dialog */}
              <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Assign Quiz to {taskData.selectedMentee?.name}</DialogTitle>
                    <DialogDescription>
                      Create a quiz for your mentee. Enter a topic and the system will generate questions.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleTaskSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="taskPrompt" className="col-span-4">
                          Quiz Topic
                        </Label>
                        <Input
                          id="taskPrompt"
                          name="taskPrompt"
                          placeholder="e.g., Operating Systems, Data Structures, AI Fundamentals"
                          className="col-span-4"
                          value={taskData.taskPrompt}
                          onChange={handleTaskChange}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="taskDescription" className="col-span-4">
                          Description (Optional)
                        </Label>
                        <Textarea
                          id="taskDescription"
                          name="taskDescription"
                          placeholder="Provide additional details about the quiz..."
                          className="col-span-4"
                          value={taskData.taskDescription}
                          onChange={handleTaskChange}
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="numQuestions" className="col-span-4">
                          Number of Questions
                        </Label>
                        <Input
                          id="numQuestions"
                          name="numQuestions"
                          type="number"
                          min="1"
                          max="10"
                          className="col-span-4"
                          value={taskData.numQuestions}
                          onChange={handleTaskChange}
                        />
                        <p className="text-xs text-gray-500 col-span-4">Choose between 1-10 questions</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={taskData.isLoading || !taskData.taskPrompt}
                      >
                        {taskData.isLoading ? "Generating Quiz..." : "Assign Quiz"}
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
                  {/* <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={securityData.currentPassword}
                      onChange={handleSecurityChange}
                    />
                  </div> */}
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

      {/* Quiz Details Dialog */}
      <Dialog open={quizDetailsDialogOpen} onOpenChange={setQuizDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz Details for {selectedMenteeDetails?.mentee?.name}</DialogTitle>
            <DialogDescription>
              View all assigned quizzes and their status
            </DialogDescription>
          </DialogHeader>
          
          {selectedMenteeDetails && (
            <div className="space-y-4">
              {/* Summary stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <h3 className="text-sm font-medium text-blue-800">Total Quizzes</h3>
                  <p className="text-xl font-bold">{selectedMenteeDetails.quizzes.length}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <h3 className="text-sm font-medium text-yellow-800">Pending</h3>
                  <p className="text-xl font-bold">{selectedMenteeDetails.pending.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <h3 className="text-sm font-medium text-green-800">Completed</h3>
                  <p className="text-xl font-bold">{selectedMenteeDetails.completed.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <h3 className="text-sm font-medium text-purple-800">Average Score</h3>
                  <p className="text-xl font-bold">{selectedMenteeDetails.averageScore}%</p>
                </div>
              </div>
              
              {/* Quiz list */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Quiz Details</h3>
                
                {selectedMenteeDetails.quizzes.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No quizzes assigned yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedMenteeDetails.quizzes.map((quiz, idx) => (
                      <div 
                        key={idx} 
                        className={`border p-3 rounded-md ${
                          quiz.status === 'completed' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-yellow-50 border-yellow-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{quiz.title}</h4>
                            <p className="text-sm text-gray-600">{quiz.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {quiz.status === 'completed' ? 'Completed' : 'Assigned'} on: {new Date(quiz.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            {quiz.status === 'completed' ? (
                              <div className="text-right">
                                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  Completed
                                </span>
                                <p className="text-sm font-medium text-green-700 mt-1">
                                  Score: {quiz.score}/{quiz.total_marks}
                                </p>
                                <p className="text-xs font-medium text-green-700">
                                  ({quiz.percentage}%)
                                </p>
                              </div>
                            ) : (
                              <div className="text-right">
                                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                  Pending
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                  {quiz.total_marks} marks
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {quiz.status === 'completed' ? (
                          <div className="mt-2 pl-3 border-l-2 border-green-300">
                            <p className="text-xs text-gray-600 font-medium">Question Summary:</p>
                            <p className="text-xs text-gray-600">
                              {quiz.result_details ? (
                                `${quiz.result_details.filter(q => q.is_correct).length} correct out of ${quiz.result_details.length} questions`
                              ) : (
                                `${quiz.score} correct out of ${quiz.total_marks} questions`
                              )}
                            </p>
                            <div className="mt-2 flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  window.location.href = `/quiz?taskId=${quiz.id}&menteeId=${selectedMenteeDetails.mentee.registration_no}&view=results`;
                                }}
                              >
                                View Quiz Results
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => deleteQuiz(quiz.id)}
                              >
                                Delete Quiz
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 pl-3 border-l-2 border-yellow-300">
                            <p className="text-xs text-gray-600">
                              This quiz has {quiz.questions ? quiz.questions.length : quiz.total_marks} questions.
                            </p>
                            <div className="mt-2 flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Copy a direct link to this quiz
                                  const quizUrl = `${window.location.origin}/quiz?taskId=${quiz.id}&menteeId=${selectedMenteeDetails.mentee.registration_no}`;
                                  navigator.clipboard.writeText(quizUrl);
                                  alert('Quiz link copied to clipboard. You can share this with your mentee.');
                                }}
                              >
                                Copy Quiz Link
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Send a reminder (this would typically call an API)
                                  alert(`A reminder has been sent to ${selectedMenteeDetails.mentee.name} to complete this quiz.`);
                                }}
                              >
                                Send Reminder
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => deleteQuiz(quiz.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setQuizDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Export the wrapped component as default
export default withAuth(Profile);
