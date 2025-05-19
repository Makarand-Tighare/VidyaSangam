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
import { Loader2, Star, AlertCircle } from "lucide-react"
import axios from 'axios'
import { toast } from 'sonner'
import { ContentLoader } from '@/components/ui/content-loader'
import { InlineLoader } from '@/components/ui/content-loader'
import { PageLoaderWithNav } from "@/components/ui/page-loader"

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
    fileContent: null, // Add this line to track file content
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

  // Add state for badges
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [isLoadingBadges, setIsLoadingBadges] = useState(false);
  const [isClaimingBadge, setIsClaimingBadge] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [approvalStatus, setApprovalStatus] = useState('');
  const [participantStatus, setParticipantStatus] = useState('');

  // Add feedback-related state
  const [feedbackEligibility, setFeedbackEligibility] = useState({
    mentor_feedback_eligible: false,
    app_feedback_eligible: false,
    allow_anonymous_feedback: false,
    is_mentee: false,
    already_submitted_mentor_feedback: false,
    already_submitted_app_feedback: false,
    window: null
  });
  
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState(''); // 'mentor' or 'app'
  
  const [mentorFeedback, setMentorFeedback] = useState({
    communication_rating: 0,
    knowledge_rating: 0,
    availability_rating: 0,
    helpfulness_rating: 0,
    overall_rating: 0,
    strengths: '',
    areas_for_improvement: '',
    additional_comments: '',
    anonymous: false,
    isSubmitting: false
  });
  
  const [appFeedback, setAppFeedback] = useState({
    usability_rating: 0,
    features_rating: 0,
    performance_rating: 0,
    overall_rating: 0,
    nps_score: 7, // Default NPS score
    what_you_like: '',
    what_to_improve: '',
    feature_requests: '',
    additional_comments: '',
    anonymous: false,
    isSubmitting: false
  });
  
  // Add LinkedIn sharing state
  const [linkedInShareData, setLinkedInShareData] = useState({
    isOpen: false,
    isLoading: false,
    previewContent: '',
    badgeName: '',
    badgeDescription: '',
    achievementDetails: '',
    isGeneratingPreview: false,
    badgeId: null,
    userBadgeId: null
  });
  
  // Add this state near other state declarations
  const [forcedLoading, setForcedLoading] = useState(true);

  // Add this effect to create a loading delay
  useEffect(() => {
    // Always show loader for 4-5 seconds regardless of actual loading speed
    const randomDelay = Math.floor(Math.random() * 1000) + 4000; // 4-5 seconds
    const timer = setTimeout(() => {
      setForcedLoading(false);
    }, randomDelay);
    
    return () => clearTimeout(timer);
  }, []);

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
      console.log('Fetching user profile data...');
      const response = await authenticatedFetch('https://vidyasangam.duckdns.org/api/user/profile/');

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
      const response = await authenticatedFetch(`https://vidyasangam.duckdns.org/api/mentor_mentee/profile/${registrationNo}/`);
      
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
      const response = await authenticatedFetch('https://vidyasangam.duckdns.org/api/mentor_mentee/quiz/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: taskData.taskPrompt,
          description: taskData.taskDescription,
          num_questions: parseInt(taskData.numQuestions),
          mentee_id: taskData.selectedMentee.registration_no,
          mentor_id: formData.registrationNumber
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate quiz');
      }
      
      const data = await response.json();
      
      // Extract the quiz data from the API response
      const quizData = data.quiz;
      const quizId = data.quiz_id;
      
      if (!quizData || !quizId) {
        throw new Error('Invalid quiz data received from server');
      }
      
      // Update the mentee tasks with the new quiz
      const newQuiz = {
        id: quizId,
        title: taskData.taskPrompt,
        description: taskData.taskDescription,
        questions: quizData,
        total_marks: quizData.length,
        created_at: new Date().toISOString(),
        status: 'pending'
      };
      
      setMenteeTasks(prev => ({
        ...prev,
        [taskData.selectedMentee.registration_no]: [
          ...(prev[taskData.selectedMentee.registration_no] || []),
          newQuiz
        ]
      }));
      
      // Show success message using toast
      toast.success('Quiz generated successfully!', {
        description: 'The quiz has been assigned to your mentee.'
      });
      
      // Reset task form
      resetTaskData();
      
      // Close the dialog
      setIsTaskDialogOpen(false);
      
      // Refresh the mentee's quiz list
      await fetchMenteeQuizHistory(taskData.selectedMentee.registration_no);
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz', {
        description: error.message || 'Please try again with different parameters.'
      });
    } finally {
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
      
      const response = await authenticatedFetch('https://vidyasangam.duckdns.org/api/user/update-profile/', {
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
      const response = await authenticatedFetch('https://vidyasangam.duckdns.org/api/user/changepassword/', {
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
      const response = await fetch('https://vidyasangam.duckdns.org/api/mentor_mentee/quiz/submit/', {
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
      const pendingResponse = await fetch(`https://vidyasangam.duckdns.org/api/mentor_mentee/quiz/pending/${menteeId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!pendingResponse.ok) {
        throw new Error('Failed to fetch pending quizzes');
      }
      
      const pendingQuizzes = await pendingResponse.json();
      
      const completedResponse = await fetch(`https://vidyasangam.duckdns.org/api/mentor_mentee/quiz/results/${menteeId}/`, {
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
      
      // Only include completed quizzes that have actually been attempted (have answers or score > 0)
      const formattedCompletedQuizzes = completedQuizzes
        .filter(quiz => {
          // Check if quiz has been actually attempted
          const hasAnswers = quiz.quiz_answers && Object.keys(quiz.quiz_answers).length > 0;
          const hasScore = quiz.score > 0;
          return hasAnswers || hasScore;
        })
        .map(quiz => ({
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
      const response = await fetch(`https://vidyasangam.duckdns.org/api/mentor_mentee/quiz/results/${registrationNo}/`, {
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
      const response = await fetch(`https://vidyasangam.duckdns.org/api/mentor_mentee/quiz/pending/${menteeId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending quizzes');
      }
      
      const pendingQuizzes = await response.json();
      
      // Fetch completed quizzes
      const completedResponse = await fetch(`https://vidyasangam.duckdns.org/api/mentor_mentee/quiz/results/${menteeId}/`, {
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
      
      // Only include completed quizzes that have actually been attempted (have answers or score > 0)
      const formattedCompletedQuizzes = completedQuizzes
        .filter(quiz => {
          // Check if quiz has been actually attempted
          const hasAnswers = quiz.quiz_answers && Object.keys(quiz.quiz_answers).length > 0;
          const hasScore = quiz.score > 0;
          return hasAnswers || hasScore;
        })
        .map(quiz => ({
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
      fileContent: null, // Reset file content too
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
      
      const response = await fetch(`https://vidyasangam.duckdns.org/api/mentor_mentee/quiz/delete/${quizId}/`, {
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

  // Remove the fetchBadges function and modify the useEffect to only call fetchUserBadges
  useEffect(() => {
    if (formData.registrationNumber) {
      fetchUserBadges();
      fetchUserPoints();
      fetchApprovalAndStatus();
    }
  }, [formData.registrationNumber]);

  // Update the fetchUserBadges function to work with the actual API response format
  const fetchUserBadges = async () => {
    if (!formData.registrationNumber) return;
    setIsLoadingBadges(true);
    try {
      const url = `https://vidyasangam.duckdns.org/api/mentor_mentee/participants/badges/${formData.registrationNumber}/`;
      const response = await axios.get(url);
      
      // Store the response data
      if (response.data) {
        // Set the badges array from the badges details in the response
        const badgesData = response.data.badges || [];
        setUserBadges(badgesData);
        setBadges(badgesData.map(userBadge => userBadge.badge_details));
        
        // Store participant info if available
        if (response.data.participant) {
          const badgesEarned = response.data.participant.badges_earned;
          console.log(`User has earned ${badgesEarned} badges`);
        }
      } else {
        setUserBadges([]);
        setBadges([]);
      }
    } catch (error) {
      console.error("Error fetching user badges:", error);
      setUserBadges([]);
      setBadges([]);
    } finally {
      setIsLoadingBadges(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const url = 'https://vidyasangam.duckdns.org/api/mentor_mentee/leaderboard/';
      const response = await axios.get(url);
      // Find the user in the leaderboard
      const user = response.data.find(u => u.id === formData.registrationNumber);
      setUserPoints(user ? user.score : 0);
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const fetchApprovalAndStatus = async () => {
    try {
      const url = `https://vidyasangam.duckdns.org/api/mentor_mentee/profile/${formData.registrationNumber}/`;
      const response = await axios.get(url);
      setApprovalStatus(response.data.approval_status || '');
      setParticipantStatus(response.data.status || '');
    } catch (error) {
      console.error('Error fetching approval/status:', error);
    }
  };

  const handleClaimBadge = async (badgeId) => {
    setIsClaimingBadge(true);
    try {
      const url = 'https://vidyasangam.duckdns.org/api/mentor_mentee/badges/claim/';
      await axios.post(url, {
        badge_id: badgeId,
        participant_id: formData.registrationNumber
      });
      
      // Refresh user data
      await fetchUserBadges();
      await fetchUserPoints();
      
      // Use sonner toast for a better user experience
      toast.success("Badge Claimed Successfully!", {
        description: "You've successfully claimed this badge.",
      });
    } catch (error) {
      console.error('Error claiming badge:', error);
      
      // Show error toast
      toast.error("Failed to Claim Badge", {
        description: error.response?.data?.error || "An error occurred. Please try again.",
      });
    } finally {
      setIsClaimingBadge(false);
    }
  };

  // Add this function to handle file uploads
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit');
      return;
    }
    
    // Only allow text and doc files
    if (!file.type.match('text/plain') && !file.type.match('application/msword') && 
        !file.type.match('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      alert('Only TXT and DOC/DOCX files are allowed');
      return;
    }
    
    try {
      const fileContent = await readFileContent(file);
      setTaskData(prev => ({
        ...prev,
        taskDescription: "GENERATE QUESTIONS BASED ONLY ON THIS CONTENT AND USE OPTIONS PROVIDED IN THE DOCUMENT ONLY:\n\n" + fileContent,
        fileContent: fileContent
      }));
      
      alert('File content loaded successfully!');
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try again.');
    }
  };

  // Helper function to read file content as text
  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Check feedback eligibility when user is loaded
  useEffect(() => {
    if (formData.registrationNumber) {
      checkFeedbackEligibility();
    }
  }, [formData.registrationNumber]);
  
  // Check if user is eligible to submit feedback
  const checkFeedbackEligibility = async () => {
    try {
      const response = await authenticatedFetch(`https://vidyasangam.duckdns.org/api/mentor_mentee/feedback/eligibility/${formData.registrationNumber}/`);
      
      if (!response.ok) {
        throw new Error('Failed to check feedback eligibility');
      }
      
      const data = await response.json();
      setFeedbackEligibility(data);
      
    } catch (error) {
      console.error('Error checking feedback eligibility:', error);
      // Default to not eligible if there's an error
      setFeedbackEligibility({
        mentor_feedback_eligible: false,
        app_feedback_eligible: false,
        allow_anonymous_feedback: false,
        is_mentee: false,
        already_submitted_mentor_feedback: false,
        already_submitted_app_feedback: false,
        window: null
      });
    }
  };
  
  // Handle mentor feedback input changes
  const handleMentorFeedbackChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMentorFeedback(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle mentor feedback rating changes
  const handleMentorRatingChange = (name, value) => {
    setMentorFeedback(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };
  
  // Handle app feedback input changes
  const handleAppFeedbackChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppFeedback(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle app feedback rating changes
  const handleAppRatingChange = (name, value) => {
    setAppFeedback(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };
  
  // Open feedback dialog
  const openFeedbackDialog = (type) => {
    setFeedbackType(type);
    setFeedbackDialogOpen(true);
  };
  
  // Submit mentor feedback
  const submitMentorFeedback = async (e) => {
    e.preventDefault();
    
    // Validate ratings
    if (mentorFeedback.communication_rating === 0 ||
        mentorFeedback.knowledge_rating === 0 ||
        mentorFeedback.availability_rating === 0 ||
        mentorFeedback.helpfulness_rating === 0 ||
        mentorFeedback.overall_rating === 0) {
      toast.error("Please provide ratings for all categories");
      return;
    }
    
    setMentorFeedback(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const payload = {
        mentee_id: formData.registrationNumber,
        communication_rating: mentorFeedback.communication_rating,
        knowledge_rating: mentorFeedback.knowledge_rating,
        availability_rating: mentorFeedback.availability_rating,
        helpfulness_rating: mentorFeedback.helpfulness_rating,
        overall_rating: mentorFeedback.overall_rating,
        strengths: mentorFeedback.strengths,
        areas_for_improvement: mentorFeedback.areas_for_improvement,
        additional_comments: mentorFeedback.additional_comments,
        anonymous: mentorFeedback.anonymous
      };
      
      const response = await authenticatedFetch('https://vidyasangam.duckdns.org/api/mentor_mentee/feedback/mentor/submit/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit mentor feedback');
      }
      
      const data = await response.json();
      
      // Update feedback eligibility to reflect submission
      setFeedbackEligibility(prev => ({
        ...prev,
        already_submitted_mentor_feedback: true
      }));
      
      // Show success message
      toast.success("Mentor feedback submitted successfully!");
      
      // Reset form and close dialog
      resetMentorFeedback();
      setFeedbackDialogOpen(false);
      
    } catch (error) {
      console.error('Error submitting mentor feedback:', error);
      toast.error(error.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setMentorFeedback(prev => ({ ...prev, isSubmitting: false }));
    }
  };
  
  // Submit app feedback
  const submitAppFeedback = async (e) => {
    e.preventDefault();
    
    // Validate ratings
    if (appFeedback.usability_rating === 0 ||
        appFeedback.features_rating === 0 ||
        appFeedback.performance_rating === 0 ||
        appFeedback.overall_rating === 0) {
      toast.error("Please provide ratings for all categories");
      return;
    }
    
    setAppFeedback(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const payload = {
        participant_id: formData.registrationNumber,
        usability_rating: appFeedback.usability_rating,
        features_rating: appFeedback.features_rating,
        performance_rating: appFeedback.performance_rating,
        overall_rating: appFeedback.overall_rating,
        nps_score: appFeedback.nps_score,
        what_you_like: appFeedback.what_you_like,
        what_to_improve: appFeedback.what_to_improve,
        feature_requests: appFeedback.feature_requests,
        additional_comments: appFeedback.additional_comments,
        anonymous: appFeedback.anonymous
      };
      
      const response = await authenticatedFetch('https://vidyasangam.duckdns.org/api/mentor_mentee/feedback/app/submit/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit application feedback');
      }
      
      const data = await response.json();
      
      // Update feedback eligibility to reflect submission
      setFeedbackEligibility(prev => ({
        ...prev,
        already_submitted_app_feedback: true
      }));
      
      // Show success message
      toast.success("Application feedback submitted successfully!");
      
      // Reset form and close dialog
      resetAppFeedback();
      setFeedbackDialogOpen(false);
      
    } catch (error) {
      console.error('Error submitting application feedback:', error);
      toast.error(error.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setAppFeedback(prev => ({ ...prev, isSubmitting: false }));
    }
  };
  
  // Reset mentor feedback form
  const resetMentorFeedback = () => {
    setMentorFeedback({
      communication_rating: 0,
      knowledge_rating: 0,
      availability_rating: 0,
      helpfulness_rating: 0,
      overall_rating: 0,
      strengths: '',
      areas_for_improvement: '',
      additional_comments: '',
      anonymous: false,
      isSubmitting: false
    });
  };
  
  // Reset app feedback form
  const resetAppFeedback = () => {
    setAppFeedback({
      usability_rating: 0,
      features_rating: 0,
      performance_rating: 0,
      overall_rating: 0,
      nps_score: 7,
      what_you_like: '',
      what_to_improve: '',
      feature_requests: '',
      additional_comments: '',
      anonymous: false,
      isSubmitting: false
    });
  };
  
  // Render rating component for feedback forms
  const renderRatingSelector = (label, name, value, onChange) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${rating <= value ? 'text-yellow-500' : 'text-gray-300'}`}
            onClick={() => onChange(name, rating)}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {value > 0 ? `${value}/5` : 'Not rated'}
        </span>
      </div>
    </div>
  );

  const handleShareToLinkedIn = async (userBadge) => {
    // Check if badge has already been shared
    if (userBadge.linkedin_shared) {
      toast.info("Already Shared", {
        description: "This badge has already been shared on LinkedIn."
      });
      return;
    }
    
    // Check if user has LinkedIn access token
    if (!formData.linkedin_access_token) {
      toast.error("Please connect your LinkedIn account first", {
        description: "Connect your LinkedIn account in your profile to share badges."
      });
      return;
    }
    
    // Get badge details
    const badge = userBadge.badge_details;
    
    // Default achievement details (user can modify this)
    const achievementDetails = `Earned the ${badge.name} badge in the VidyaSangam mentoring program at YCCE.`;
    
    setLinkedInShareData({
      isOpen: true,
      isLoading: false,
      previewContent: '',
      badgeName: badge.name,
      badgeDescription: badge.description,
      achievementDetails: achievementDetails,
      isGeneratingPreview: false,
      badgeId: badge.id,
      userBadgeId: userBadge.id
    });
  };

  const generateLinkedInPreview = async () => {
    if (!linkedInShareData.achievementDetails) {
      toast.error("Please provide achievement details");
      return;
    }
    
    setLinkedInShareData(prev => ({ 
      ...prev, 
      isGeneratingPreview: true,
      isLoading: true 
    }));
    
    try {
      // Create the payload according to the specified format
      const payload = {
        badgeName: linkedInShareData.badgeName,
        achievementDetails: linkedInShareData.achievementDetails,
        participant_id: formData.registrationNumber,
        badge_id: linkedInShareData.badgeId
      };
      
      const response = await authenticatedFetch('https://vidyasangam.duckdns.org/api/mentor_mentee/linkedin/preview/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate LinkedIn preview');
      }
      
      const data = await response.json();
      console.log('LinkedIn preview response:', data);
      
      // Check if the API returned preview_content property
      if (!data.preview_content) {
        throw new Error('No preview content received from server');
      }
      
      // Also update these values if available in the response
      const badge_id = data.badge_id || linkedInShareData.badgeId;
      const participant_id = data.participant_id || formData.registrationNumber;
      
      setLinkedInShareData(prev => ({
        ...prev,
        isLoading: false,
        isGeneratingPreview: false,
        previewContent: data.preview_content,
        badgeId: badge_id,
        // Store additional data returned from the API if needed
        apiResponseData: data
      }));
      
    } catch (error) {
      console.error('Error generating LinkedIn preview:', error);
      
      toast.error("Error generating LinkedIn preview", {
        description: error.message || "An error occurred. Please try again."
      });
      
      setLinkedInShareData(prev => ({
        ...prev,
        isLoading: false,
        isGeneratingPreview: false
      }));
    }
  };

  const handlePostToLinkedIn = async () => {
    setLinkedInShareData(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Fetch latest profile data to get the current access token
      const profileResponse = await authenticatedFetch('https://vidyasangam.duckdns.org/api/user/profile/');
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const profileData = await profileResponse.json();
      
      // Create the payload in the exact format specified
      const payload = {
        accessToken: profileData.linkedin_access_token,
        content: linkedInShareData.previewContent,
        participant_id: formData.registrationNumber,
        badge_id: linkedInShareData.badgeId,
        user_badge_id: linkedInShareData.userBadgeId
      };
      
      console.log('LinkedIn post payload:', payload);
      
      const response = await authenticatedFetch('https://vidyasangam.duckdns.org/api/mentor_mentee/linkedin/post/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to post to LinkedIn');
      }
      
      const data = await response.json();
      console.log('LinkedIn post response:', data);
      
      // Update the user badges to mark this badge as shared
      setUserBadges(prev => prev.map(badge => {
        if (badge.id === linkedInShareData.userBadgeId) {
          return { ...badge, linkedin_shared: true };
        }
        return badge;
      }));
      
      toast.success("Successfully shared to LinkedIn!", {
        description: "Your achievement has been posted to your LinkedIn profile."
      });
      
      // Close the dialog
      setLinkedInShareData(prev => ({ 
        ...prev, 
        isOpen: false, 
        isLoading: false 
      }));
      
    } catch (error) {
      console.error('Error posting to LinkedIn:', error);
      
      toast.error("Error posting to LinkedIn", {
        description: error.message || "An error occurred. Please try again later."
      });
      
      setLinkedInShareData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const closeLinkedInShare = () => {
    setLinkedInShareData({
      isOpen: false,
      isLoading: false,
      previewContent: '',
      badgeName: '',
      badgeDescription: '',
      achievementDetails: '',
      isGeneratingPreview: false,
      badgeId: null,
      userBadgeId: null
    });
  };

  // Render profile page with loading state
  if (isInitializing || loadingProfile || forcedLoading) {
    return <PageLoaderWithNav message="Loading your profile..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pb-12">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8">

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-6">
              <Avatar className="w-32 h-32 mb-4 border-4 border-white shadow-lg">
                <AvatarImage 
                  src={profilePicture} 
                  alt="Profile" 
                />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">
                  {formData.firstName && formData.lastName 
                    ? `${formData.firstName[0]}${formData.lastName[0]}`
                    : 'PP'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">{formData.firstName} {formData.lastName}</h2>
              <p className="text-sm text-gray-500 mb-4">{formData.registrationNumber}</p>
              
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {approvalStatus && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}
                  </span>
                )}
                {participantStatus && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${participantStatus === 'active' ? 'bg-blue-100 text-blue-800' : participantStatus === 'graduated' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {participantStatus.charAt(0).toUpperCase() + participantStatus.slice(1)}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                  {formData.status}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">JPG or PNG no larger than 5 MB</p>
              
              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg, image/png"
                onChange={handleFileChange}
              />
              
              <div className="flex flex-wrap gap-3 justify-center w-full">
                <Button 
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  {isUploading ? (
                    <InlineLoader message="Uploading" size="sm" />
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
                    size="sm"
                  >
                    Remove image
                  </Button>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t w-full flex justify-center">
                {formData.linkedin_access_token && formData.linkedin_access_token.length > 1 ? (
                  <Button style={{ backgroundColor: '#0077B5' }} className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                    </svg>
                    LinkedIn Connected
                  </Button>
                ) : (
                  <LinkedInButton className="w-full" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Details Card */}
          <Card className="md:col-span-2 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="registrationNumber" className="text-sm font-medium text-gray-700 mb-1 block">Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      readOnly={true}
                      disabled={true}
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-1 block">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "cursor-not-allowed" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-1 block">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "cursor-not-allowed" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="organizationName" className="text-sm font-medium text-gray-700 mb-1 block">Organization Name</Label>
                    <Input
                      id="organizationName"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      readOnly={true}
                      disabled={true}
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "cursor-not-allowed" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "cursor-not-allowed" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="section" className="text-sm font-medium text-gray-700 mb-1 block">Section</Label>
                    <Input
                      id="section"
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "cursor-not-allowed" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="year" className="text-sm font-medium text-gray-700 mb-1 block">Year</Label>
                    <Input
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "cursor-not-allowed" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="semester" className="text-sm font-medium text-gray-700 mb-1 block">Semester</Label>
                    <Input
                      id="semester"
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "cursor-not-allowed" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-1 block">Status</Label>
                    <Input
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={true}
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end mt-6 pt-4 border-t">
                  {isEditing ? (
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Save Changes
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Edit Details
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="md:col-span-1 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSecuritySubmit} className="mx-auto">
                <div className="space-y-5">
                  {/* <div>
                    <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 mb-1 block">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={securityData.currentPassword}
                      onChange={handleSecurityChange}
                      disabled={securityData.isSubmitting}
                      className="w-full"
                    />
                  </div> */}
                  <div>
                    <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 mb-1 block">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={securityData.newPassword}
                      onChange={handleSecurityChange}
                      disabled={securityData.isSubmitting}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Min 8 characters with at least 1 number</p>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1 block">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={handleSecurityChange}
                      disabled={securityData.isSubmitting}
                      className="w-full"
                    />
                  </div>
                  
                  {securityData.message && (
                    <div className={`mt-4 p-3 rounded-lg ${securityData.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {securityData.message}
                    </div>
                  )}
                  
                  <div className="flex justify-end pt-2">
                    <Button 
                      type="submit" 
                      disabled={securityData.isSubmitting} 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {securityData.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Badges Card */}
          <Card className="md:col-span-2 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-wrap justify-between items-center">
                <CardTitle className="text-xl">Badges & Achievements</CardTitle>
                <div className="flex flex-wrap gap-3 mt-2 md:mt-0">
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Points: {userPoints || '--'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingBadges ? (
                <ContentLoader message="Loading badges..." />
              ) : userBadges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userBadges.map((userBadge) => {
                    const badge = userBadge.badge_details;
                    const isClaimed = userBadge.is_claimed;
                    const isShared = userBadge.linkedin_shared;
                    
                    return (
                      <div key={userBadge.id} className={`rounded-xl shadow-lg overflow-hidden transform transition-all ${
                        isClaimed ? 'border-2 border-green-400 bg-green-50 hover:scale-105' : 
                        'border-2 border-yellow-400 bg-yellow-50 hover:scale-105'
                      }`}>
                        <div className="flex items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 border-b">
                          {badge.image_url ? (
                            <img src={badge.image_url} alt={badge.name} className="w-16 h-16 object-contain" />
                          ) : (
                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold">
                              {badge.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-lg mb-2 text-center">{badge.name}</h3>
                          <p className="text-gray-600 text-sm mb-3 text-center">{badge.description}</p>
                          <div className="flex items-center justify-center gap-2 mb-4">
                            
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                              {badge.points_required} pts
                            </span>
                            
                          </div>
                          <div className="flex justify-center">
                            {isClaimed ? (
                              <div className="flex flex-col gap-2">
                                <span className="w-full text-center py-2 rounded-lg bg-green-100 text-green-800 font-semibold text-sm flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Claimed on {new Date(userBadge.claimed_date).toLocaleDateString()}
                                </span>
                                <Button
                                  className="w-full bg-blue-700 hover:bg-blue-800 flex items-center justify-center gap-2"
                                  onClick={() => handleShareToLinkedIn(userBadge)}
                                  disabled={!formData.linkedin_access_token || isShared}
                                >
                                  {isShared ? (
                                    <>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                                      </svg>
                                      Already Shared
                                    </>
                                  ) : (
                                    <>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                                      </svg>
                                      Share on LinkedIn
                                    </>
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <Button
                                className="w-full bg-yellow-600 hover:bg-yellow-700"
                                onClick={() => handleClaimBadge(badge.id)}
                                disabled={isClaimingBadge}
                              >
                                {isClaimingBadge ? (
                                  <InlineLoader message="Claiming..." size="sm" />
                                ) : (
                                  'Claim Badge'
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Badges Available</h3>
                  <p className="text-gray-500 max-w-md mx-auto">You haven&apos;t earned any badges yet. Keep participating in the program to earn badges!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mentor Card - Restored */}
          {mentorMenteeData.mentor !== null && (
            <Card className="md:col-span-3 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-xl">Your Mentor</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-gray-50 p-6 rounded-md">
                  <h3 className="text-lg font-medium text-blue-700 mb-4">
                    {mentorMenteeData.mentor?.name || "Not assigned yet"}
                  </h3>
                  {mentorMenteeData.mentor && (
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">Registration No:</p>
                        <p className="text-base">{mentorMenteeData.mentor.registration_no}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">Semester:</p>
                        <p className="text-base">{mentorMenteeData.mentor.semester}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">Tech Stack:</p>
                        <p className="text-base">{mentorMenteeData.mentor.tech_stack || "Not specified"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quizzes Card - Restored */}
          {formData.status === 'Mentee' && (
            <Card className="md:col-span-3 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-xl">Your Quizzes</CardTitle>
                <p className="text-sm text-gray-500">Quizzes assigned by your mentor</p>
              </CardHeader>
              <CardContent className="pt-6">
                {/* This would typically fetch from an API */}
                {menteeTasks[formData.registrationNumber] && menteeTasks[formData.registrationNumber].length > 0 ? (
                  <div>
                    {/* Pending Quizzes */}
                    <h3 className="text-lg font-semibold mb-4">Pending Quizzes</h3>
                    <div className="space-y-4 mb-8">
                      {menteeTasks[formData.registrationNumber]
                        .filter(task => task.status === 'pending')
                        .map((task, index) => (
                          <div key={index} className="border rounded-lg p-5 hover:bg-gray-50 transition-colors shadow-sm">
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
                                className="hover:bg-blue-50"
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
                        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                          <p>No pending quizzes.</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Completed Quizzes */}
                    <h3 className="text-lg font-semibold mb-4">Completed Quizzes</h3>
                    <div className="space-y-4">
                      {menteeTasks[formData.registrationNumber]
                        .filter(task => task.status === 'completed')
                        .map((task, index) => (
                          <div key={index} className="border rounded-lg p-5 hover:bg-green-50 bg-green-50 transition-colors shadow-sm">
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
                                className="hover:bg-green-100"
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
                        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                          <p>No completed quizzes.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                    <p>No quizzes assigned yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Mentees Card - Restored */}
          {mentorMenteeData.mentees.length > 0 && formData.status === 'Mentor' && (
            <Card className="md:col-span-3 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-xl">Your Mentees</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
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
                          <Label htmlFor="fileUpload" className="col-span-4">
                            Upload Content File (TXT or DOC)
                          </Label>
                          <div className="col-span-4">
                            <Input
                              id="fileUpload"
                              type="file"
                              accept=".txt,.doc,.docx"
                              onChange={handleFileUpload}
                              className="col-span-4"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Upload a file with quiz content. The content will be used to generate questions.
                            </p>
                          </div>
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
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {taskData.isLoading ? (
                            <InlineLoader message="Generating quiz" size="sm" />
                          ) : (
                            "Assign Quiz"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* Feedback Card - Show if eligible for any type of feedback */}
          {(feedbackEligibility.mentor_feedback_eligible || feedbackEligibility.app_feedback_eligible) && (
            <Card className="md:col-span-3 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-xl">Feedback</CardTitle>
                <p className="text-sm text-gray-500">
                  {feedbackEligibility.window && (
                    <>Feedback window is open until {new Date(feedbackEligibility.window.end_date).toLocaleDateString()}</>
                  )}
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mentor Feedback Card */}
                  {feedbackEligibility.mentor_feedback_eligible && mentorMenteeData.mentor && (
                    <div className={`p-6 rounded-lg border ${feedbackEligibility.already_submitted_mentor_feedback 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-blue-50 border-blue-200'}`}>
                      <h3 className="text-lg font-semibold mb-2">
                        Mentor Feedback
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {feedbackEligibility.already_submitted_mentor_feedback 
                          ? 'You have already submitted feedback for your mentor.' 
                          : `Share your experience working with ${mentorMenteeData.mentor.name}.`}
                      </p>
                      
                      {feedbackEligibility.already_submitted_mentor_feedback ? (
                        <div className="flex items-center text-green-600 gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Feedback submitted</span>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => openFeedbackDialog('mentor')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Provide Mentor Feedback
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* Application Feedback Card */}
                  {feedbackEligibility.app_feedback_eligible && (
                    <div className={`p-6 rounded-lg border ${feedbackEligibility.already_submitted_app_feedback 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-purple-50 border-purple-200'}`}>
                      <h3 className="text-lg font-semibold mb-2">
                        Application Feedback
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {feedbackEligibility.already_submitted_app_feedback 
                          ? 'You have already submitted feedback for the application.' 
                          : 'Help us improve by sharing your thoughts on the platform.'}
                      </p>
                      
                      {feedbackEligibility.already_submitted_app_feedback ? (
                        <div className="flex items-center text-green-600 gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Feedback submitted</span>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => openFeedbackDialog('app')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Provide Application Feedback
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quiz Details Dialog - Restored */}
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
            <Button onClick={() => setQuizDetailsDialogOpen(false)} className="bg-blue-600 hover:bg-blue-700">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {feedbackType === 'mentor' ? 'Mentor Feedback' : 'Application Feedback'}
            </DialogTitle>
            <DialogDescription>
              {feedbackType === 'mentor' 
                ? 'Share your experience working with your mentor. Your feedback helps improve the mentoring program.'
                : 'Share your thoughts on the platform. Your feedback helps us improve the user experience.'}
            </DialogDescription>
          </DialogHeader>
          
          {feedbackType === 'mentor' ? (
            <form onSubmit={submitMentorFeedback} className="space-y-6 py-4">
              <div className="space-y-4">
                {/* Mentor Ratings */}
                {renderRatingSelector('Communication', 'communication_rating', mentorFeedback.communication_rating, handleMentorRatingChange)}
                {renderRatingSelector('Technical Knowledge', 'knowledge_rating', mentorFeedback.knowledge_rating, handleMentorRatingChange)}
                {renderRatingSelector('Availability & Responsiveness', 'availability_rating', mentorFeedback.availability_rating, handleMentorRatingChange)}
                {renderRatingSelector('Helpfulness', 'helpfulness_rating', mentorFeedback.helpfulness_rating, handleMentorRatingChange)}
                {renderRatingSelector('Overall Experience', 'overall_rating', mentorFeedback.overall_rating, handleMentorRatingChange)}
                
                {/* Strengths */}
                <div className="space-y-2">
                  <Label htmlFor="strengths" className="text-sm font-medium text-gray-700">
                    What are your mentor&apos;s strengths?
                  </Label>
                  <Textarea
                    id="strengths"
                    name="strengths"
                    placeholder="E.g., technical expertise, communication style, teaching ability..."
                    value={mentorFeedback.strengths}
                    onChange={handleMentorFeedbackChange}
                    className="min-h-[80px]"
                  />
                </div>
                
                {/* Areas for Improvement */}
                <div className="space-y-2">
                  <Label htmlFor="areas_for_improvement" className="text-sm font-medium text-gray-700">
                    Areas for improvement (optional)
                  </Label>
                  <Textarea
                    id="areas_for_improvement"
                    name="areas_for_improvement"
                    placeholder="What could your mentor improve on?"
                    value={mentorFeedback.areas_for_improvement}
                    onChange={handleMentorFeedbackChange}
                    className="min-h-[80px]"
                  />
                </div>
                
                {/* Additional Comments */}
                <div className="space-y-2">
                  <Label htmlFor="additional_comments" className="text-sm font-medium text-gray-700">
                    Additional comments (optional)
                  </Label>
                  <Textarea
                    id="additional_comments"
                    name="additional_comments"
                    placeholder="Any other thoughts you'd like to share..."
                    value={mentorFeedback.additional_comments}
                    onChange={handleMentorFeedbackChange}
                    className="min-h-[80px]"
                  />
                </div>
                
                {/* Anonymous Option */}
                {feedbackEligibility.allow_anonymous_feedback && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      name="anonymous"
                      checked={mentorFeedback.anonymous}
                      onChange={handleMentorFeedbackChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="anonymous" className="text-sm font-medium text-gray-700">
                      Submit feedback anonymously
                    </Label>
                  </div>
                )}
                
                {/* Notice */}
                <div className="bg-blue-50 p-3 rounded-md flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Your honest feedback is valuable for improving the mentoring program. 
                    {mentorFeedback.anonymous 
                      ? ' Your identity will be kept anonymous when sharing this feedback with your mentor.'
                      : ' Your mentor will be able to see your name with this feedback.'}
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setFeedbackDialogOpen(false)}
                  disabled={mentorFeedback.isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={mentorFeedback.isSubmitting}
                >
                  {mentorFeedback.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={submitAppFeedback} className="space-y-6 py-4">
              <div className="space-y-4">
                {/* App Ratings */}
                {renderRatingSelector('Usability', 'usability_rating', appFeedback.usability_rating, handleAppRatingChange)}
                {renderRatingSelector('Features & Functionality', 'features_rating', appFeedback.features_rating, handleAppRatingChange)}
                {renderRatingSelector('Performance & Reliability', 'performance_rating', appFeedback.performance_rating, handleAppRatingChange)}
                {renderRatingSelector('Overall Experience', 'overall_rating', appFeedback.overall_rating, handleAppRatingChange)}
                
                {/* NPS Score */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    How likely are you to recommend this platform to others? (0-10)
                  </Label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      id="nps_score"
                      name="nps_score"
                      min="0"
                      max="10"
                      value={appFeedback.nps_score}
                      onChange={handleAppFeedbackChange}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0</span>
                      <span className="text-center">{appFeedback.nps_score}</span>
                      <span>10</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Not likely</span>
                      <span>Very likely</span>
                    </div>
                  </div>
                </div>
                
                {/* What You Like */}
                <div className="space-y-2">
                  <Label htmlFor="what_you_like" className="text-sm font-medium text-gray-700">
                    What do you like about the platform?
                  </Label>
                  <Textarea
                    id="what_you_like"
                    name="what_you_like"
                    placeholder="E.g., user interface, specific features, ease of use..."
                    value={appFeedback.what_you_like}
                    onChange={handleAppFeedbackChange}
                    className="min-h-[80px]"
                  />
                </div>
                
                {/* What to Improve */}
                <div className="space-y-2">
                  <Label htmlFor="what_to_improve" className="text-sm font-medium text-gray-700">
                    What could be improved?
                  </Label>
                  <Textarea
                    id="what_to_improve"
                    name="what_to_improve"
                    placeholder="Any aspects of the platform you find challenging or frustrating?"
                    value={appFeedback.what_to_improve}
                    onChange={handleAppFeedbackChange}
                    className="min-h-[80px]"
                  />
                </div>
                
                {/* Feature Requests */}
                <div className="space-y-2">
                  <Label htmlFor="feature_requests" className="text-sm font-medium text-gray-700">
                    Feature requests (optional)
                  </Label>
                  <Textarea
                    id="feature_requests"
                    name="feature_requests"
                    placeholder="Any features or functionality you'd like to see added?"
                    value={appFeedback.feature_requests}
                    onChange={handleAppFeedbackChange}
                    className="min-h-[80px]"
                  />
                </div>
                
                {/* Additional Comments */}
                <div className="space-y-2">
                  <Label htmlFor="additional_comments" className="text-sm font-medium text-gray-700">
                    Additional comments (optional)
                  </Label>
                  <Textarea
                    id="additional_comments"
                    name="additional_comments"
                    placeholder="Any other thoughts you'd like to share..."
                    value={appFeedback.additional_comments}
                    onChange={handleAppFeedbackChange}
                    className="min-h-[80px]"
                  />
                </div>
                
                {/* Anonymous Option */}
                {feedbackEligibility.allow_anonymous_feedback && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      name="anonymous"
                      checked={appFeedback.anonymous}
                      onChange={handleAppFeedbackChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="anonymous" className="text-sm font-medium text-gray-700">
                      Submit feedback anonymously
                    </Label>
                  </div>
                )}
                
                {/* Notice */}
                <div className="bg-purple-50 p-3 rounded-md flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                  <p className="text-xs text-purple-700">
                    Your feedback helps us improve the platform. All feedback is reviewed by our development team.
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setFeedbackDialogOpen(false)}
                  disabled={appFeedback.isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={appFeedback.isSubmitting}
                >
                  {appFeedback.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add LinkedIn Share Dialog */}
      <Dialog open={linkedInShareData.isOpen} onOpenChange={closeLinkedInShare}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share Badge Achievement on LinkedIn</DialogTitle>
            <DialogDescription>
              Share your achievement details and we&apos;ll create an engaging LinkedIn post for you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Badge Info */}
            <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-blue-800">{linkedInShareData.badgeName}</h4>
                <p className="text-sm text-blue-600">{linkedInShareData.badgeDescription}</p>
              </div>
            </div>
            
            {/* Step 1: Enter Achievement Details */}
            <div className={`space-y-3 ${linkedInShareData.previewContent ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium text-gray-700">1</div>
                <h3 className="font-medium">Describe Your Achievement</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="achievement-details" className="text-sm font-medium text-gray-700">
                  What did you do to earn this badge? (Be specific)
                </Label>
                <Textarea
                  id="achievement-details"
                  className="min-h-[100px] text-sm"
                  value={linkedInShareData.achievementDetails}
                  onChange={(e) => setLinkedInShareData(prev => ({
                    ...prev,
                    achievementDetails: e.target.value
                  }))}
                  placeholder="Example: Successfully completed 10 coding challenges, helped 5 peers with technical issues, participated in 3 group projects..."
                  disabled={linkedInShareData.previewContent || linkedInShareData.isLoading}
                />
                <p className="text-xs text-gray-500">
                  The more details you provide, the better we can craft your LinkedIn post.
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={generateLinkedInPreview}
                  disabled={!linkedInShareData.achievementDetails || linkedInShareData.isGeneratingPreview || linkedInShareData.previewContent}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {linkedInShareData.isGeneratingPreview ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Preview...
                    </>
                  ) : (
                    'Generate LinkedIn Post'
                  )}
                </Button>
              </div>
            </div>
            
            {/* Step 2: Preview & Edit Generated Content */}
            {(linkedInShareData.isLoading && !linkedInShareData.isGeneratingPreview) ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-blue-600 font-medium">Loading preview...</span>
              </div>
            ) : linkedInShareData.previewContent ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium text-gray-700">2</div>
                  <h3 className="font-medium">Review & Edit Your Post</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin-preview" className="text-sm font-medium text-gray-700">
                    Edit your post (if needed)
                  </Label>
                  <Textarea
                    id="linkedin-preview"
                    className="min-h-[150px] text-sm"
                    value={linkedInShareData.previewContent}
                    onChange={(e) => setLinkedInShareData(prev => ({
                      ...prev,
                      previewContent: e.target.value
                    }))}
                    placeholder="Loading preview content..."
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-800 flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Preview
                  </h4>
                  <div className="bg-white p-3 rounded border border-blue-100 text-sm text-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage 
                          src={profilePicture || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?t=st=1730071119~exp=1730074719~hmac=37544826c51ddd25b4d265c9336deff7b884deb1771c551bcf5b23bbfa75a336&w=1380"} 
                        />
                        <AvatarFallback>
                          {formData.firstName && formData.lastName 
                            ? `${formData.firstName[0]}${formData.lastName[0]}`
                            : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{formData.firstName} {formData.lastName}</p>
                        <p className="text-xs text-gray-500">Just now · 🌎</p>
                      </div>
                    </div>
                    <p className="whitespace-pre-line">{linkedInShareData.previewContent}</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setLinkedInShareData(prev => ({ 
                      ...prev, 
                      previewContent: '',
                      isGeneratingPreview: false
                    }))}
                    disabled={linkedInShareData.isLoading}
                  >
                    Start Over
                  </Button>
                  <Button 
                    className="bg-blue-700 hover:bg-blue-800 flex items-center gap-2"
                    onClick={handlePostToLinkedIn}
                    disabled={linkedInShareData.isLoading || !linkedInShareData.previewContent}
                  >
                    {linkedInShareData.isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                        </svg>
                        Post to LinkedIn
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={closeLinkedInShare}
              disabled={linkedInShareData.isLoading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Export the wrapped component as default
export default withAuth(Profile);
