'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, BookOpen, FileText, Plus, PlusCircle, Check, Clock, Trash2, AlertTriangle, 
  Briefcase, GraduationCap, Award, Code, Bookmark, User, Download, Eye, Edit, X, Save } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { toast } from 'sonner'
import NavBar from '../components/navBar'
import { authenticatedFetch, isLoggedIn } from '../lib/auth'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import './resume-styles.css'

export default function CareerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)
  
  // Career Path Planning
  const [careerPath, setCareerPath] = useState({
    currentRole: '',
    targetRole: '',
    timeline: '1-2 years',
    description: '',
    skills: [],
    milestones: [],
    intermediateRoles: [],
    recommendedProjects: []
  })
  
  const [newSkill, setNewSkill] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [education, setEducation] = useState('')
  
  // Milestone dialog state
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState(null)
  const [milestoneNote, setMilestoneNote] = useState('')
  const [savingMilestoneNote, setSavingMilestoneNote] = useState(false)
  
  // Status update confirmation dialog
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false)
  const [statusUpdateInfo, setStatusUpdateInfo] = useState({
    milestoneId: null,
    status: null,
    title: '',
    statusText: ''
  })
  const [updatingStatus, setUpdatingStatus] = useState(false)
  
  // Progress tracking
  const [progressStats, setProgressStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    percentage: 0
  })
  
  // Resume Builder
  const [resume, setResume] = useState({
    basics: {
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: ''
    },
    education: [],
    experience: [],
    skills: {
      technical: [],
      soft: []
    },
    projects: [],
    certifications: [],
    achievements: []
  })
  
  // Initialize resume if it's somehow undefined
  useEffect(() => {
    if (!resume || !resume.basics || !resume.skills) {
      setResume({
        basics: {
          name: '',
          email: '',
          phone: '',
          location: '',
          summary: ''
        },
        education: [],
        experience: [],
        skills: {
          technical: [],
          soft: []
        },
        projects: [],
        certifications: [],
        achievements: []
      });
    }
  }, [resume]);
  
  // Load resume from localStorage when component mounts
  useEffect(() => {
    // Only try to load from localStorage if we're in a client environment
    if (typeof window !== 'undefined') {
      const savedResume = localStorage.getItem('vidyasangam_resume');
      if (savedResume) {
        try {
          const parsedResume = JSON.parse(savedResume);
          console.log('Loaded resume from local storage:', parsedResume);
          setResume(parsedResume);
        } catch (error) {
          console.error('Error parsing resume from localStorage:', error);
        }
      }
    }
  }, []);
  
  // Save resume to localStorage whenever it changes
  useEffect(() => {
    // Only save to localStorage if we're in a client environment and resume has been initialized
    if (typeof window !== 'undefined' && resume) {
      localStorage.setItem('vidyasangam_resume', JSON.stringify(resume));
      console.log('Saved resume to local storage');
    }
  }, [resume]);
  
  const [activeResumeSection, setActiveResumeSection] = useState('basics')
  const [newEducation, setNewEducation] = useState({ 
    institution: '', 
    degree: '', 
    fieldOfStudy: '',
    startDate: '', 
    endDate: '', 
    gpa: '',
    location: '',
    description: ''
  })
  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    bullets: ['']
  })
  const [newProject, setNewProject] = useState({
    title: '',
    technologies: '',
    link: '',
    startDate: '',
    endDate: '',
    bullets: ['']
  })
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    date: '',
    link: ''
  })
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    date: '',
    description: ''
  })
  
  const [isGeneratingResume, setIsGeneratingResume] = useState(false)
  const [isEnhancingText, setIsEnhancingText] = useState(false)
  const [enhancementTarget, setEnhancementTarget] = useState({ section: '', index: -1, field: '' })
  const [resumePreviewMode, setResumePreviewMode] = useState(false)
  const [isSavingResume, setIsSavingResume] = useState(false)

  // For storing notes in localStorage
  const MILESTONE_NOTES_KEY = 'vidyasangam_milestone_notes'

  // Load milestone notes from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedNotes = localStorage.getItem(MILESTONE_NOTES_KEY);
      if (savedNotes) {
        try {
          console.log('Loaded milestone notes from local storage');
        } catch (error) {
          console.error('Error parsing milestone notes from localStorage:', error);
        }
      }
    }
  }, []);
  
  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoggedIn()) {
        router.push('/login')
        return
      }
      
      try {
        // Fetch user data
        const response = await authenticatedFetch('https://vidyasangam.duckdns.org/api/user/profile/')
        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }
        
        const data = await response.json()
        setUserData(data)
        
        // Fetch career path data
        await fetchCareerPath()
        
        // Fetch resume data
        await fetchResume()
      } catch (error) {
        console.error('Error:', error)
        toast.error('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router])
  
  const fetchCareerPath = async () => {
    try {
      const response = await authenticatedFetch('https://vidyasangam.duckdns.org/api/career/path/')
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched career path data:', data);
        
        if (data && !data.error) {
          setCareerPath({
            currentRole: data.current_role || '',
            targetRole: data.target_role || '',
            timeline: data.timeline || '1-2 years',
            description: data.description || '',
            skills: data.skills || [],
            milestones: data.milestones || [],
            intermediateRoles: data.intermediate_roles || [],
            recommendedProjects: data.recommended_projects || []
          })
          
          // If education field is available, set it
          if (data.education) {
            setEducation(data.education);
          }
          
          // If we have existing data, consider it as editing mode
          if (data.current_role) {
            setIsEditing(true)
          }
          
          // Calculate progress stats if milestones exist
          if (data.milestones && data.milestones.length > 0) {
            calculateProgressStats(data.milestones);
          }
        } else {
          // No existing career path data
          console.log('No existing career path data found')
        }
      } else if (response.status === 404) {
        // It's fine if the user doesn't have a career path yet
        console.log('User does not have a career path yet')
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(`Failed to fetch career path: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching career path:', error)
      toast.error(error.message || 'Failed to load career path data')
    }
  }
  
  // Calculate progress statistics
  const calculateProgressStats = (milestones) => {
    const total = milestones.length;
    const completed = milestones.filter(m => m.status === 'completed').length;
    const inProgress = milestones.filter(m => m.status === 'in_progress').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    setProgressStats({
      total,
      completed,
      inProgress,
      percentage
    });
  }
  
  const generateCareerPath = async () => {
    if (!careerPath.currentRole || !careerPath.targetRole) {
      toast.error('Please fill in both Current Status and Career Goal');
      return;
    }
    
    // Validate that current role has sufficient details
    if (careerPath.currentRole.length < 5) {
      toast.error('Please provide more details about your Current Status');
      return;
    }
    
    // Validate that target role has sufficient details
    if (careerPath.targetRole.length < 5) {
      toast.error('Please provide more details about your Career Goal');
      return;
    }
    
    // Validate education information
    if (!education) {
      toast.error('Please provide your education details');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Extract skills as strings from the skills array
      const skillsString = careerPath.skills
        .map(skill => typeof skill === 'string' ? skill : (skill.name || ''))
        .filter(name => name.trim() !== '')
        .join(', ');
      
      // Prepare the payload
      const payload = {
        current_role: careerPath.currentRole,
        target_role: careerPath.targetRole,
        timeline: careerPath.timeline,
        current_skills: skillsString,
        education: education || 'Bachelor of Technology in Computer Science'
      };
      
      console.log('Sending payload for generation:', payload);
      
      const response = await authenticatedFetch('https://vidyasangam.duckdns.org/api/career/path/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(`Failed to generate career path: ${errorData.error || errorData.details || response.statusText}`);
      }
      
      const data = await response.json()
      console.log('Received generated career path:', data);
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      // Update state with generated data
      setCareerPath({
        ...careerPath,
        description: data.description || '',
        skills: data.skills || [],
        milestones: data.milestones || [],
        intermediateRoles: data.intermediate_roles || [],
        recommendedProjects: data.recommended_projects || []
      })
      
      toast.success('Career roadmap generated successfully')
      
      // We don't need to call saveCareerPath as the data is already saved on the server
      // during generation according to the API docs
      setIsEditing(true);
      
    } catch (error) {
      console.error('Error generating career path:', error)
      toast.error(error.message || 'Failed to generate career path')
    } finally {
      setIsGenerating(false)
    }
  }
  
  const saveCareerPath = async (pathData = careerPath) => {
    if (!pathData.currentRole || !pathData.targetRole) {
      toast.error('Please fill in both Current Status and Career Goal');
      return;
    }
    
    // Validate that current role has sufficient details
    if (pathData.currentRole.length < 5) {
      toast.error('Please provide more details about your Current Status');
      return;
    }
    
    // Validate that target role has sufficient details
    if (pathData.targetRole.length < 5) {
      toast.error('Please provide more details about your Career Goal');
      return;
    }
    
    // Validate education information
    if (!education) {
      toast.error('Please provide your education details');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Convert skills array to string format for API
      const skillsString = pathData.skills
        .map(skill => typeof skill === 'string' ? skill : (skill.name || ''))
        .filter(name => name.trim() !== '')
        .join(', ');
      
      // Prepare the payload
      const payload = {
        current_role: pathData.currentRole,
        target_role: pathData.targetRole,
        timeline: pathData.timeline,
        current_skills: skillsString,
        education: education || 'Bachelor of Technology in Computer Science'
      };
      
      console.log('Saving career path with payload:', payload);
      
      const response = await authenticatedFetch('https://vidyasangam.duckdns.org/api/career/path/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        
        // Format validation errors nicely
        if (response.status === 400 && typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          throw new Error(`Validation error: ${errorMessages}`);
        }
        
        throw new Error(`Failed to save career path: ${errorData.message || response.statusText}`);
      }
      
      toast.success('Career roadmap saved successfully')
      setIsEditing(true)
      
    } catch (error) {
      console.error('Error saving career path:', error)
      toast.error(error.message || 'Failed to save career path')
    } finally {
      setIsSaving(false)
    }
  }
  
  const addSkill = () => {
    if (!newSkill.trim()) return
    
    const updatedSkills = [...careerPath.skills, { name: newSkill, importance: 'medium' }]
    setCareerPath({ ...careerPath, skills: updatedSkills })
    setNewSkill('')
  }
  
  const removeSkill = (index) => {
    const updatedSkills = [...careerPath.skills]
    updatedSkills.splice(index, 1)
    setCareerPath({ ...careerPath, skills: updatedSkills })
  }
  
  const updateMilestoneStatus = async (milestoneId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const response = await authenticatedFetch(`https://vidyasangam.duckdns.org/api/career/milestones/${milestoneId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        
        if (errorData.error) {
          throw new Error(errorData.error);
        } else if (errorData.detail) {
          throw new Error(errorData.detail);
        } else {
          throw new Error(`Failed to update milestone status: ${response.statusText}`);
        }
      }
      
      const updatedMilestone = await response.json();
      console.log('Milestone updated:', updatedMilestone);
      
      // Update local state
      const updatedMilestones = careerPath.milestones.map(milestone => 
        milestone.id === milestoneId ? updatedMilestone : milestone
      )
      
      setCareerPath({ ...careerPath, milestones: updatedMilestones });
      
      // Recalculate progress stats
      calculateProgressStats(updatedMilestones);
      
      // Show success message with the appropriate text
      const statusText = newStatus === 'completed' ? 'completed' : 
                        newStatus === 'in_progress' ? 'in progress' : 'not started';
      toast.success(`Milestone marked as ${statusText}`);
      
      // Log the update for tracking purposes
      console.log(`Milestone ${milestoneId} status updated to ${newStatus} at ${new Date().toISOString()}`);
      
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error(error.message || 'Failed to update milestone');
    } finally {
      setStatusUpdateDialogOpen(false);
      setUpdatingStatus(false);
    }
  }
  
  // Show confirmation dialog before updating status
  const confirmStatusUpdate = (milestone, newStatus) => {
    const statusText = newStatus === 'completed' ? 'completed' : 
                      newStatus === 'in_progress' ? 'in progress' : 'not started';
    
    setStatusUpdateInfo({
      milestoneId: milestone.id,
      status: newStatus,
      title: milestone.title,
      statusText
    });
    
    setStatusUpdateDialogOpen(true);
  }
  
  const openMilestoneDialog = (milestone) => {
    setSelectedMilestone(milestone);
    
    // Load notes from localStorage if available
    if (typeof window !== 'undefined') {
      const savedNotes = localStorage.getItem(MILESTONE_NOTES_KEY);
      if (savedNotes) {
        try {
          const notesObj = JSON.parse(savedNotes);
          if (notesObj[milestone.id]) {
            setMilestoneNote(notesObj[milestone.id]);
          } else {
            setMilestoneNote(milestone.notes || '');
          }
        } catch (error) {
          console.error('Error parsing milestone notes from localStorage:', error);
          setMilestoneNote(milestone.notes || '');
        }
      } else {
        setMilestoneNote(milestone.notes || '');
      }
    } else {
      setMilestoneNote(milestone.notes || '');
    }
    
    setMilestoneDialogOpen(true);
  }
  
  const closeMilestoneDialog = () => {
    setMilestoneDialogOpen(false);
    setSelectedMilestone(null);
    setMilestoneNote('');
  }
  
  const saveMilestoneNote = async () => {
    if (!selectedMilestone || !selectedMilestone.id) {
      toast.error('Cannot save note: no milestone selected');
      return;
    }
    
    setSavingMilestoneNote(true);
    
    try {
      // Save note to localStorage
      if (typeof window !== 'undefined') {
        const savedNotes = localStorage.getItem(MILESTONE_NOTES_KEY);
        let notesObj = {};
        
        if (savedNotes) {
          try {
            notesObj = JSON.parse(savedNotes);
          } catch (error) {
            console.error('Error parsing existing notes, creating new object', error);
          }
        }
        
        // Add the new note
        notesObj[selectedMilestone.id] = milestoneNote;
        
        // Save to localStorage
        localStorage.setItem(MILESTONE_NOTES_KEY, JSON.stringify(notesObj));
        
        // Create a history entry
        const historyEntry = {
          timestamp: new Date().toISOString(),
          action: 'Updated notes',
          user: userData?.full_name || 'Student'
        };
        
        // Get existing history or initialize empty array
        const currentHistory = selectedMilestone.history || [];
        
        // Add new entry to history
        const updatedHistory = [...currentHistory, historyEntry];
        
        // Update the selectedMilestone with the note (just for UI display)
        const updatedMilestone = {
          ...selectedMilestone,
          notes: milestoneNote,
          history: updatedHistory
        };
        
        // Update the UI to show the updated milestone
        const updatedMilestones = careerPath.milestones.map(milestone => 
          milestone.id === selectedMilestone.id ? updatedMilestone : milestone
        );
        
        setCareerPath({ ...careerPath, milestones: updatedMilestones });
        setSelectedMilestone(updatedMilestone);
        
        toast.success('Notes saved successfully');
      } else {
        throw new Error('Browser storage is not available');
      }
    } catch (error) {
      console.error('Error saving milestone note:', error);
      toast.error(error.message || 'Failed to save note');
    } finally {
      setSavingMilestoneNote(false);
    }
  }
  
  // Resume functions
  const fetchResume = async () => {
    try {
      const response = await authenticatedFetch('https://vidyasangam.duckdns.org/api/career/resume/')
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched resume data from server:', data);
        
        if (data && !data.error) {
          // Server data takes priority over local storage
          setResume(data);
          // Update local storage with server data
          localStorage.setItem('vidyasangam_resume', JSON.stringify(data));
        } else {
          // No existing resume data on server
          console.log('No existing resume data found on server')
          
          // Check if we have data in local storage before pre-populating with user data
          const savedResume = localStorage.getItem('vidyasangam_resume');
          if (!savedResume) {
            // Pre-populate with user data if available
            if (userData) {
              setResume(prev => ({
                ...prev,
                basics: {
                  ...prev.basics,
                  name: userData.full_name || '',
                  email: userData.email || ''
                }
              }));
            }
          }
        }
      } else if (response.status === 404) {
        // It's fine if the user doesn't have a resume yet on server
        console.log('User does not have a resume yet on server')
        
        // Check if we have data in local storage before pre-populating with user data
        const savedResume = localStorage.getItem('vidyasangam_resume');
        if (!savedResume) {
          // Pre-populate with user data if available
          if (userData) {
            setResume(prev => ({
              ...prev,
              basics: {
                ...prev.basics,
                name: userData.full_name || '',
                email: userData.email || ''
              }
            }));
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(`Failed to fetch resume: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching resume:', error)
      toast.error(error.message || 'Failed to load resume data')
    }
  }
  
  const clearResume = () => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to clear your resume? This will delete all your resume data.')) {
      // Reset resume to initial state
      const emptyResume = {
        basics: {
          name: userData?.full_name || '',
          email: userData?.email || '',
          phone: '',
          location: '',
          summary: ''
        },
        education: [],
        experience: [],
        skills: {
          technical: [],
          soft: []
        },
        projects: [],
        certifications: [],
        achievements: []
      };
      
      setResume(emptyResume);
      
      // Clear from local storage
      localStorage.removeItem('vidyasangam_resume');
      
      // Reset to basics section
      setActiveResumeSection('basics');
      
      // Close preview mode if open
      if (resumePreviewMode) {
        setResumePreviewMode(false);
      }
      
      toast.success('Resume cleared successfully');
    }
  }
  
  const saveResume = async () => {
    // Basic validation before saving
    if (!resume.basics.name) {
      toast.error('Please add your name before saving');
      setActiveResumeSection('basics');
      return;
    }
    
    setIsSavingResume(true);
    
    try {
      const response = await authenticatedFetch('https://vidyasangam.duckdns.org/api/career/resume/save/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resume),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(`Failed to save resume: ${errorData.message || response.statusText}`);
      }
      
      const savedData = await response.json();
      console.log('Resume saved to server successfully:', savedData);
      
      // Update local state with the server response (it might include IDs or other server-generated data)
      if (savedData && !savedData.error) {
        setResume(savedData);
        // Also update localStorage with the latest server data
        localStorage.setItem('vidyasangam_resume', JSON.stringify(savedData));
      }
      
      toast.success('Resume saved to server successfully');
      
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error(error.message || 'Failed to save resume to server');
      
      // Still save to localStorage as backup in case of server issues
      localStorage.setItem('vidyasangam_resume', JSON.stringify(resume));
      toast.info('Resume saved to local device as backup');
    } finally {
      setIsSavingResume(false);
    }
  }
  
  const addEducation = () => {
    if (!newEducation.institution || !newEducation.degree) {
      toast.error('Institution and degree are required');
      return;
    }
    
    // Validate date format
    if ((newEducation.startDate && !/^\d{2}\/\d{4}$/.test(newEducation.startDate)) || 
        (newEducation.endDate && !/^\d{2}\/\d{4}$/.test(newEducation.endDate) && newEducation.endDate.toLowerCase() !== 'present')) {
      toast.error('Dates should be in MM/YYYY format');
      return;
    }
    
    setResume(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
    
    // Reset form
    setNewEducation({ 
      institution: '', 
      degree: '', 
      fieldOfStudy: '',
      startDate: '', 
      endDate: '', 
      gpa: '',
      location: '',
      description: ''
    });
    
    toast.success('Education added successfully');
  }
  
  const removeEducation = (index) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  }
  
  const addExperience = () => {
    if (!newExperience.company || !newExperience.position) {
      toast.error('Company and position are required');
      return;
    }
    
    // Validate date format
    if ((newExperience.startDate && !/^\d{2}\/\d{4}$/.test(newExperience.startDate)) || 
        (newExperience.endDate && !/^\d{2}\/\d{4}$/.test(newExperience.endDate) && newExperience.endDate.toLowerCase() !== 'present')) {
      toast.error('Dates should be in MM/YYYY format');
      return;
    }
    
    // Validate that at least one bullet point is not empty
    const validBullets = newExperience.bullets.filter(b => b.trim() !== '');
    if (validBullets.length === 0) {
      toast.error('Please add at least one bullet point');
      return;
    }
    
    setResume(prev => ({
      ...prev,
      experience: [...prev.experience, {...newExperience, bullets: validBullets}]
    }));
    
    // Reset form
    setNewExperience({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: ['']
    });
    
    toast.success('Experience added successfully');
  }
  
  const removeExperience = (index) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  }
  
  const addBulletPoint = () => {
    setNewExperience(prev => ({
      ...prev,
      bullets: [...prev.bullets, '']
    }));
  }
  
  const updateBulletPoint = (index, value) => {
    setNewExperience(prev => {
      const newBullets = [...prev.bullets];
      newBullets[index] = value;
      return {
        ...prev,
        bullets: newBullets
      };
    });
  }
  
  const removeBulletPoint = (index) => {
    if (newExperience.bullets.length === 1) {
      return; // Keep at least one bullet point
    }
    
    setNewExperience(prev => ({
      ...prev,
      bullets: prev.bullets.filter((_, i) => i !== index)
    }));
  }
  
  const addResumeSkill = () => {
    if (!newSkill.text.trim()) {
      return;
    }
    
    setResume(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [newSkill.category]: [...prev.skills[newSkill.category], newSkill.text]
      }
    }));
    
    setNewSkill({ text: '', category: newSkill.category });
  }
  
  const removeResumeSkill = (category, index) => {
    setResume(prev => {
      const updatedSkills = {...prev.skills};
      updatedSkills[category] = updatedSkills[category].filter((_, i) => i !== index);
      return {
        ...prev,
        skills: updatedSkills
      };
    });
  }
  
  const addProject = () => {
    if (!newProject.title) {
      toast.error('Project title is required');
      return;
    }
    
    // Validate date format
    if ((newProject.startDate && !/^\d{2}\/\d{4}$/.test(newProject.startDate)) || 
        (newProject.endDate && !/^\d{2}\/\d{4}$/.test(newProject.endDate) && newProject.endDate.toLowerCase() !== 'present')) {
      toast.error('Dates should be in MM/YYYY format');
      return;
    }
    
    // Validate URL format for link
    if (newProject.link && !isValidURL(newProject.link)) {
      toast.error('Please enter a valid URL for the project link');
      return;
    }

    // Validate that at least one bullet point is not empty
    const validBullets = newProject.bullets ? newProject.bullets.filter(b => b.trim() !== '') : [];
    if (validBullets.length === 0) {
      toast.error('Please add at least one bullet point');
      return;
    }
    
    setResume(prev => ({
      ...prev,
      projects: [...prev.projects, {...newProject, bullets: validBullets}]
    }));
    
    // Reset form
    setNewProject({
      title: '',
      technologies: '',
      link: '',
      startDate: '',
      endDate: '',
      bullets: ['']
    });
    
    toast.success('Project added successfully');
  }
  
  const removeProject = (index) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  }
  
  const addCertification = () => {
    if (!newCertification.name) {
      toast.error('Certification name is required');
      return;
    }
    
    // Validate date format
    if (newCertification.date && !/^\d{2}\/\d{4}$/.test(newCertification.date)) {
      toast.error('Date should be in MM/YYYY format');
      return;
    }
    
    // Validate URL format for link
    if (newCertification.link && !isValidURL(newCertification.link)) {
      toast.error('Please enter a valid URL for the verification link');
      return;
    }
    
    setResume(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }));
    
    // Reset form
    setNewCertification({
      name: '',
      issuer: '',
      date: '',
      link: ''
    });
    
    toast.success('Certification added successfully');
  }
  
  const removeCertification = (index) => {
    setResume(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  }
  
  const addAchievement = () => {
    if (!newAchievement.title) {
      toast.error('Achievement title is required');
      return;
    }
    
    // Validate date format
    if (newAchievement.date && !/^\d{2}\/\d{4}$/.test(newAchievement.date) && 
        !/^\d{4}-\d{4}$/.test(newAchievement.date)) {
      toast.error('Date should be in MM/YYYY format or academic year format (YYYY-YYYY)');
      return;
    }
    
    setResume(prev => ({
      ...prev,
      achievements: [...prev.achievements, newAchievement]
    }));
    
    // Reset form
    setNewAchievement({
      title: '',
      date: '',
      description: ''
    });
    
    toast.success('Achievement added successfully');
  }
  
  const removeAchievement = (index) => {
    setResume(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  }
  
  const enhanceTextWithAI = async (section, index, field, currentText) => {
    if (!currentText.trim()) {
      toast.error('Please enter some text to enhance');
      return;
    }
    
    setIsEnhancingText(true);
    setEnhancementTarget({ section, index, field });
    
    try {
      const response = await authenticatedFetch('https://vidyasangam.duckdns.org/api/career/resume/enhance-text/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: currentText,
          context: section, // Provides context about what kind of text we're enhancing
          target: field
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to enhance text: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.enhanced_text) {
        // Update the appropriate field based on section and index
        if (section === 'basics') {
          setResume(prev => ({
            ...prev,
            basics: {
              ...prev.basics,
              [field]: data.enhanced_text
            }
          }));
        } else if (section === 'experience' && index >= 0) {
          if (field === 'bullets' && typeof data.enhanced_text === 'object') {
            // If enhancing all bullets at once
            setResume(prev => {
              const updatedExperience = [...prev.experience];
              updatedExperience[index] = {
                ...updatedExperience[index],
                bullets: data.enhanced_text
              };
              return {
                ...prev,
                experience: updatedExperience
              };
            });
          } else if (field.startsWith('bullet-') && typeof data.enhanced_text === 'string') {
            // If enhancing a single bullet
            const bulletIndex = parseInt(field.split('-')[1]);
            setResume(prev => {
              const updatedExperience = [...prev.experience];
              const updatedBullets = [...updatedExperience[index].bullets];
              updatedBullets[bulletIndex] = data.enhanced_text;
              updatedExperience[index] = {
                ...updatedExperience[index],
                bullets: updatedBullets
              };
              return {
                ...prev,
                experience: updatedExperience
              };
            });
          } else {
            // For other experience fields
            setResume(prev => {
              const updatedExperience = [...prev.experience];
              updatedExperience[index] = {
                ...updatedExperience[index],
                [field]: data.enhanced_text
              };
              return {
                ...prev,
                experience: updatedExperience
              };
            });
          }
        } else if (section === 'projects' && index >= 0) {
          if (field === 'bullets' && typeof data.enhanced_text === 'object') {
            // If enhancing all bullets at once for projects
            setResume(prev => {
              const updatedProjects = [...prev.projects];
              updatedProjects[index] = {
                ...updatedProjects[index],
                bullets: data.enhanced_text
              };
              return {
                ...prev,
                projects: updatedProjects
              };
            });
          } else if (field.startsWith('bullet-') && typeof data.enhanced_text === 'string') {
            // If enhancing a single project bullet
            const bulletIndex = parseInt(field.split('-')[1]);
            setResume(prev => {
              const updatedProjects = [...prev.projects];
              const updatedBullets = [...(updatedProjects[index].bullets || [])];
              updatedBullets[bulletIndex] = data.enhanced_text;
              updatedProjects[index] = {
                ...updatedProjects[index],
                bullets: updatedBullets
              };
              return {
                ...prev,
                projects: updatedProjects
              };
            });
          } else {
            // For other project fields
            setResume(prev => {
              const updatedProjects = [...prev.projects];
              updatedProjects[index] = {
                ...updatedProjects[index],
                [field]: data.enhanced_text
              };
              return {
                ...prev,
                projects: updatedProjects
              };
            });
          }
        } else if (['education', 'certifications', 'achievements'].includes(section) && index >= 0) {
          setResume(prev => {
            const updatedItems = [...prev[section]];
            updatedItems[index] = {
              ...updatedItems[index],
              [field]: data.enhanced_text
            };
            return {
              ...prev,
              [section]: updatedItems
            };
          });
        } else {
          // Handle case where section is education, projects, etc. but index is -1 (new item)
          if (section === 'education') {
            setNewEducation(prev => ({
              ...prev,
              [field]: data.enhanced_text
            }));
          } else if (section === 'experience') {
            if (field === 'bullets') {
              // If enhancing bullets array for new experience
              if (typeof data.enhanced_text === 'object' && Array.isArray(data.enhanced_text)) {
                setNewExperience(prev => ({
                  ...prev,
                  bullets: data.enhanced_text
                }));
              } else if (typeof data.enhanced_text === 'string') {
                // If the API returned a string instead of array, split by newlines
                setNewExperience(prev => ({
                  ...prev,
                  bullets: data.enhanced_text.split('\n').filter(b => b.trim() !== '')
                }));
              }
            } else if (field.startsWith('bullet-')) {
              // If enhancing a specific bullet
              const bulletIndex = parseInt(field.split('-')[1]);
              setNewExperience(prev => {
                const updatedBullets = [...prev.bullets];
                updatedBullets[bulletIndex] = data.enhanced_text;
                return {
                  ...prev,
                  bullets: updatedBullets
                };
              });
            } else {
              // Other fields
              setNewExperience(prev => ({
                ...prev,
                [field]: data.enhanced_text
              }));
            }
          } else if (section === 'projects') {
            if (field === 'bullets') {
              // If enhancing bullets array for new project
              if (typeof data.enhanced_text === 'object' && Array.isArray(data.enhanced_text)) {
                setNewProject(prev => ({
                  ...prev,
                  bullets: data.enhanced_text
                }));
              } else if (typeof data.enhanced_text === 'string') {
                // If the API returned a string instead of array, split by newlines
                setNewProject(prev => ({
                  ...prev,
                  bullets: data.enhanced_text.split('\n').filter(b => b.trim() !== '')
                }));
              }
            } else if (field.startsWith('bullet-')) {
              // If enhancing a specific project bullet
              const bulletIndex = parseInt(field.split('-')[1]);
              setNewProject(prev => {
                const updatedBullets = [...(prev.bullets || [])];
                updatedBullets[bulletIndex] = data.enhanced_text;
                return {
                  ...prev,
                  bullets: updatedBullets
                };
              });
            } else {
              // Other project fields
              setNewProject(prev => ({
                ...prev,
                [field]: data.enhanced_text
              }));
            }
          } else if (section === 'achievements') {
            setNewAchievement(prev => ({
              ...prev,
              [field]: data.enhanced_text
            }));
          }
        }
        
        toast.success('Text enhanced successfully');
      } else {
        throw new Error('No enhanced text returned from the API');
      }
      
    } catch (error) {
      console.error('Error enhancing text:', error);
      toast.error(error.message || 'Failed to enhance text');
    } finally {
      setIsEnhancingText(false);
      setEnhancementTarget({ section: '', index: -1, field: '' });
    }
  }
  
  const generateResume = async () => {
    // Make sure resume exists before validation
    if (!resume || !resume.basics) {
      toast.error('Resume data is not initialized properly');
      return;
    }
    
    // Perform comprehensive validation before generating PDF
    if (!resume.basics.name) {
      toast.error('Please add your full name in the Basics section');
      setResumePreviewMode(false);
      setActiveResumeSection('basics');
      return;
    }
    
    if (!resume.basics.email) {
      toast.error('Please add your email address in the Basics section');
      setResumePreviewMode(false);
      setActiveResumeSection('basics');
      return;
    }
    
    if (!resume.basics.summary || resume.basics.summary.length < 50) {
      toast.error('Please add a detailed professional summary (at least 50 characters)');
      setResumePreviewMode(false);
      setActiveResumeSection('basics');
      return;
    }
    
    // Check if education section has entries
    if (!resume.education || resume.education.length === 0) {
      toast.error('Please add at least one education entry');
      setResumePreviewMode(false);
      setActiveResumeSection('education');
      return;
    }
    
    // Check if skills are added
    if (!resume.skills || (!resume.skills.technical || resume.skills.technical.length === 0) && 
        (!resume.skills.soft || resume.skills.soft.length === 0)) {
      toast.error('Please add at least some skills to your resume');
      setResumePreviewMode(false);
      setActiveResumeSection('skills');
      return;
    }
    
    // Check if resume has enough content overall
    const totalSections = [
      resume.education && resume.education.length > 0,
      resume.experience && resume.experience.length > 0,
      resume.skills && ((resume.skills.technical && resume.skills.technical.length > 0) || 
                        (resume.skills.soft && resume.skills.soft.length > 0)),
      resume.projects && resume.projects.length > 0,
      resume.certifications && resume.certifications.length > 0,
      resume.achievements && resume.achievements.length > 0
    ].filter(Boolean).length;
    
    if (totalSections < 3) {
      toast.error('Please complete at least 3 different sections for a comprehensive resume');
      setResumePreviewMode(false);
      return;
    }
    
    // Make sure we're in preview mode to capture the content
    if (!resumePreviewMode) {
      setResumePreviewMode(true);
      // Let the preview render first before proceeding
      toast.info('Preparing resume for download...');
      // Wait for the preview to render
      setTimeout(() => generatePDF(), 1000);
      return;
    }
    
    generatePDF();
  }
  
  const generatePDF = async () => {
    setIsGeneratingResume(true);
    
    try {
      // Dynamically import html2canvas and jspdf (they're only needed for PDF generation)
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      
      const html2canvas = html2canvasModule.default;
      const { jsPDF } = jsPDFModule.default;
      
      // Get the resume preview container
      const element = document.querySelector('.resume-preview-container');
      
      if (!element) {
        throw new Error('Resume preview container not found');
      }
      
      // Create a clone of the element with proper styling for PDF
      const clone = element.cloneNode(true);
      clone.style.width = '816px'; // Letter size width (8.5 inches at 96 dpi)
      clone.style.backgroundColor = 'white';
      clone.style.position = 'absolute';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);
      
      // Render the element to canvas
      const canvas = await html2canvas(clone, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Remove the clone from DOM
      document.body.removeChild(clone);
      
      // Calculate PDF dimensions (Letter size: 8.5 x 11 inches)
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      
      // Add image to PDF
      pdf.addImage(
        canvas.toDataURL('image/png'), 
        'PNG', 
        0, 
        position, 
        imgWidth, 
        imgHeight
      );
      
      // If the content is longer than one page, add additional pages
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png'), 
          'PNG', 
          0, 
          position, 
          imgWidth, 
          imgHeight
        );
        heightLeft -= pageHeight;
      }
      
      // Save the PDF
      const fileName = `${resume?.basics?.name?.replace(/\s+/g, '_') || 'Resume'}_Resume.pdf`;
      pdf.save(fileName);
      
      toast.success('Resume PDF generated and downloaded successfully');
      
      // Also save to server if available
      try {
        await saveResumeToServer();
      } catch (error) {
        console.error('Failed to save resume to server, but PDF was generated locally', error);
        // Don't show error since local PDF generation succeeded
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF: ' + error.message);
      
      // Fallback to server-side generation if client-side fails
      generateResumeFromServer();
    } finally {
      setIsGeneratingResume(false);
    }
  }
  
  const generateResumeFromServer = async () => {
    try {
      toast.info('Attempting server-side PDF generation...');
      
      const response = await authenticatedFetch('https://vidyasangam.duckdns.org/api/career/resume/generate-pdf/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resume),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to generate resume: ${errorData.message || response.statusText}`);
      }
      
      // Handle PDF download - typically, we'd receive a URL to the generated PDF
      const data = await response.json();
      
      if (data.pdf_url) {
        // Create a link to download the PDF
        const link = document.createElement('a');
        link.href = data.pdf_url;
        link.download = `${resume?.basics?.name?.replace(/\s+/g, '_') || 'Resume'}_Resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Resume generated successfully via server');
      } else {
        throw new Error('No PDF URL returned from the API');
      }
    } catch (error) {
      console.error('Error generating resume from server:', error);
      toast.error('Failed to generate resume: ' + error.message);
    }
  }
  
  const saveResumeToServer = async () => {
    // Skip server save if isSavingResume is already true
    if (isSavingResume) return;
    
    setIsSavingResume(true);
    try {
      const response = await authenticatedFetch('https://vidyasangam.duckdns.org/api/career/resume/save/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resume),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save resume to server');
      }
      
      console.log('Resume saved to server during PDF generation');
    } catch (error) {
      console.error('Error saving resume to server:', error);
      throw error;
    } finally {
      setIsSavingResume(false);
    }
  }
  
  // Calculate completion percentage for the resume
  const calculateResumeCompletion = () => {
    // If resume isn't defined yet, return 0
    if (!resume || !resume.basics || !resume.skills) {
      return 0;
    }
    
    let total = 0;
    let completed = 0;
    
    // Check basics section
    const basicFields = ['name', 'email', 'phone', 'location', 'summary'];
    basicFields.forEach(field => {
      total++;
      if (resume.basics[field]) completed++;
    });
    
    // Check other sections
    ['education', 'experience', 'projects', 'certifications', 'achievements'].forEach(section => {
      total++;
      if (resume[section] && resume[section].length > 0) completed++;
    });
    
    // Check skills
    total += 2; // technical and soft skills
    if (resume.skills.technical && resume.skills.technical.length > 0) completed++;
    if (resume.skills.soft && resume.skills.soft.length > 0) completed++;
    
    return Math.round((completed / total) * 100);
  }
  
  // Helper function to validate URLs
  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="flex-1 py-8 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-900">Career Development</h1>
            <p className="text-gray-600 mt-2">Tools to help you plan and advance your career journey</p>
          </div>
          
          <Tabs defaultValue="career-path" className="space-y-4">
            <TabsList className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <TabsTrigger value="career-path" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden md:inline">Career Path</span>
              </TabsTrigger>
              <TabsTrigger value="resume-builder" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden md:inline">Resume</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Career Path Planning */}
            <TabsContent value="career-path">
              <Card>
                <CardHeader>
                  <CardTitle>Career Path Planning</CardTitle>
                  <CardDescription>Define your career goals and track your progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                    <h3 className="font-medium text-blue-800 mb-2">How This Works</h3>
                    <p className="text-gray-700 text-sm">
                      Our AI-powered Career Path Planner helps you map your journey from your current academic status to your career goals.
                      Simply provide your current status (e.g., &quot;3rd Year Computer Science Student&quot;), your career goal (e.g., &quot;Machine Learning Engineer&quot;), 
                      and your current skills. The system will generate a personalized roadmap with milestones, recommended skills to develop, 
                      and projects to build that will help you achieve your goals.
                    </p>
                  </div>
                  
                  {/* Only show the input form if no career path exists yet */}
                  {!careerPath.description ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="current-role">Current Status</Label>
                            <Input 
                              id="current-role" 
                              value={careerPath.currentRole}
                              onChange={(e) => setCareerPath({...careerPath, currentRole: e.target.value})}
                              placeholder="E.g. Computer Science Student, 3rd Year"
                            />
                          </div>
                          <div>
                            <Label htmlFor="target-role">Career Goal</Label>
                            <Input 
                              id="target-role" 
                              value={careerPath.targetRole}
                              onChange={(e) => setCareerPath({...careerPath, targetRole: e.target.value})}
                              placeholder="E.g. Full Stack Developer, Data Scientist"
                            />
                          </div>
                          <div>
                            <Label htmlFor="timeline">Timeline after Graduation</Label>
                            <select 
                              id="timeline" 
                              className="w-full p-2 border rounded-md"
                              value={careerPath.timeline}
                              onChange={(e) => setCareerPath({...careerPath, timeline: e.target.value})}
                            >
                              <option value="0-6 months">0-6 months</option>
                              <option value="6-12 months">6-12 months</option>
                              <option value="1-2 years">1-2 years</option>
                              <option value="2-5 years">2-5 years</option>
                              <option value="5+ years">5+ years</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="education">Education Details</Label>
                            <Input 
                              id="education" 
                              value={education}
                              onChange={(e) => setEducation(e.target.value)}
                              placeholder="E.g. B.Tech in Computer Science, YCCE"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label>Current Skills</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {careerPath.skills.map((skill, index) => (
                                <Badge 
                                  key={index} 
                                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1"
                                >
                                  {skill.name || skill}
                                  <button 
                                    onClick={() => removeSkill(index)}
                                    className="ml-1 text-blue-800 hover:text-blue-900"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <div className="flex mt-2">
                              <Input 
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="Add a skill"
                                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                              />
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={addSkill}
                                className="ml-2"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-4 justify-end mt-6">
                        <Button 
                          onClick={generateCareerPath} 
                          disabled={isGenerating}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>Generate AI Career Roadmap</>
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    // Show this when a career path exists
                    <div className="space-y-6">
                      <div className="p-4 border rounded-md bg-white">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-lg">Your Career Path</h3>
                            <div className="flex gap-4 mt-2 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Current Status:</span> {careerPath.currentRole}
                              </div>
                              <div>
                                <span className="font-medium">Career Goal:</span> {careerPath.targetRole}
                              </div>
                              <div>
                                <span className="font-medium">Timeline:</span> {careerPath.timeline}
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Reset career path to generate a new one
                              setCareerPath({
                                currentRole: '',
                                targetRole: '',
                                timeline: '1-2 years',
                                description: '',
                                skills: [],
                                milestones: [],
                                intermediateRoles: [],
                                recommendedProjects: []
                              });
                              setEducation('');
                              setIsEditing(false);
                            }}
                          >
                            Create New Roadmap
                          </Button>
                        </div>
                      </div>
                  
                      {careerPath.description && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <h3 className="font-medium text-lg text-blue-800 mb-2">Career Path Overview</h3>
                          <p className="text-gray-700">{careerPath.description}</p>
                          
                          {/* Overall Career Progress */}
                          {progressStats.total > 0 && (
                            <div className="mt-4 pt-4 border-t border-blue-200">
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="text-sm font-medium text-blue-800">Your Career Progress</h4>
                                <span className="text-sm font-medium text-blue-800">{progressStats.percentage}%</span>
                              </div>
                              <div className="w-full bg-white rounded-full h-4 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-700 ease-in-out" 
                                  style={{ width: `${progressStats.percentage}%` }}
                                ></div>
                              </div>
                              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 bg-white rounded border border-gray-100">
                                  <div className="text-xs text-gray-500">Completed</div>
                                  <div className="text-lg font-semibold text-green-600">{progressStats.completed}</div>
                                </div>
                                <div className="p-2 bg-white rounded border border-gray-100">
                                  <div className="text-xs text-gray-500">In Progress</div>
                                  <div className="text-lg font-semibold text-blue-600">{progressStats.inProgress}</div>
                                </div>
                                <div className="p-2 bg-white rounded border border-gray-100">
                                  <div className="text-xs text-gray-500">Remaining</div>
                                  <div className="text-lg font-semibold text-gray-600">
                                    {progressStats.total - (progressStats.completed + progressStats.inProgress)}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3 text-xs text-gray-600 text-center">
                                Progress is automatically saved and synced with your profile
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {careerPath.skills && careerPath.skills.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-4">Recommended Skills to Develop</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {careerPath.skills.map((skill, index) => (
                              <div key={index} className="p-3 border rounded-md bg-white hover:shadow-sm transition-shadow">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium text-blue-900">{skill.name}</h4>
                                  <Badge className={
                                    skill.importance === 'high' ? 'bg-orange-100 text-orange-800' :
                                    skill.importance === 'medium' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }>
                                    {skill.importance || 'medium'}
                                  </Badge>
                                </div>
                                {skill.reason && (
                                  <p className="text-sm text-gray-600 mt-2">{skill.reason}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {careerPath.milestones && careerPath.milestones.length > 0 && (
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Career Milestones</h3>
                        <div>
                          {/* Show progress from progressStats */}
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 h-3 w-40 rounded-full overflow-hidden">
                              <div 
                                className="bg-green-500 h-full transition-all duration-500 ease-in-out" 
                                style={{ width: `${progressStats.percentage}%` }}
                              ></div>
                            </div>
                            <div className="flex gap-2 text-sm">
                              <span className="text-green-600 font-medium">{progressStats.completed} completed</span>
                              <span className="text-blue-600">{progressStats.inProgress} in progress</span>
                              <span className="text-gray-500">{progressStats.total} total</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-4">
                        {careerPath.milestones.map((milestone, index) => (
                          <div key={milestone.id || index} className="p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-blue-900">{milestone.title}</h3>
                                  <Badge 
                                    className={
                                      milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }
                                  >
                                    {milestone.status === 'completed' ? 'Completed' :
                                     milestone.status === 'in_progress' ? 'In Progress' :
                                     'Not Started'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                  {milestone.estimated_timeline && (
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      <span>{milestone.estimated_timeline}</span>
                                    </div>
                                  )}
                                  {milestone.deadline && (
                                    <div>
                                      <span className="font-medium">Deadline:</span> {milestone.deadline}
                                    </div>
                                  )}
                                </div>
                                {milestone.skills_involved && (
                                  <div className="mt-3 flex flex-wrap gap-1">
                                    {(typeof milestone.skills_involved === 'string' 
                                      ? milestone.skills_involved.split(',') 
                                      : Array.isArray(milestone.skills_involved) 
                                        ? milestone.skills_involved 
                                        : []
                                    ).map((skill, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">{skill.trim()}</Badge>
                                    ))}
                                  </div>
                                )}
                                {milestone.notes && (
                                  <div className="mt-2 text-sm text-gray-600 italic border-l-2 border-gray-200 pl-2">
                                    {milestone.notes}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-1 ml-4">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className={`h-8 w-8 p-0 ${milestone.status === 'in_progress' ? 'bg-blue-50' : ''}`}
                                  onClick={() => confirmStatusUpdate(milestone, 'in_progress')}
                                  title="Mark as In Progress"
                                  disabled={milestone.status === 'in_progress'}
                                >
                                  <Clock className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className={`h-8 w-8 p-0 ${milestone.status === 'completed' ? 'bg-green-50' : ''}`}
                                  onClick={() => confirmStatusUpdate(milestone, 'completed')}
                                  title="Mark as Completed"
                                  disabled={milestone.status === 'completed'}
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => openMilestoneDialog(milestone)}
                                  title="View Details"
                                >
                                  <PlusCircle className="h-4 w-4 text-gray-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Status Update Confirmation Dialog */}
                  <AlertDialog open={statusUpdateDialogOpen} onOpenChange={setStatusUpdateDialogOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to mark the milestone <span className="font-medium">&quot;{statusUpdateInfo.title}&quot;</span> as <span className="font-medium">{statusUpdateInfo.statusText}</span>?
                          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                              This action will update your progress tracking and be saved to your profile. The change will be visible to your mentors and academic advisors.
                            </div>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={updatingStatus}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => updateMilestoneStatus(statusUpdateInfo.milestoneId, statusUpdateInfo.status)}
                          disabled={updatingStatus}
                          className={statusUpdateInfo.status === 'completed' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                        >
                          {updatingStatus ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              {statusUpdateInfo.status === 'completed' ? 'Mark as Completed' : 'Mark as In Progress'}
                            </>
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  {/* Milestone Detail Dialog */}
                  <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>{selectedMilestone?.title}</DialogTitle>
                        <DialogDescription>
                          {selectedMilestone?.description}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="py-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold">Current Status</h4>
                            <Badge 
                              className={
                                selectedMilestone?.status === 'completed' ? 'bg-green-100 text-green-800' :
                                selectedMilestone?.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {selectedMilestone?.status === 'completed' ? 'Completed' :
                              selectedMilestone?.status === 'in_progress' ? 'In Progress' :
                              'Not Started'}
                            </Badge>
                          </div>
                          
                          {selectedMilestone?.estimated_timeline && (
                            <div>
                              <h4 className="text-sm font-semibold mb-1">Estimated Timeline</h4>
                              <p className="text-sm">{selectedMilestone.estimated_timeline}</p>
                            </div>
                          )}
                          
                          {selectedMilestone?.deadline && (
                            <div>
                              <h4 className="text-sm font-semibold mb-1">Deadline</h4>
                              <p className="text-sm">{selectedMilestone.deadline}</p>
                            </div>
                          )}
                          
                          {selectedMilestone?.skills_involved && (
                            <div>
                              <h4 className="text-sm font-semibold mb-1">Skills Involved</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(typeof selectedMilestone.skills_involved === 'string' 
                                  ? selectedMilestone.skills_involved.split(',') 
                                  : Array.isArray(selectedMilestone.skills_involved) 
                                    ? selectedMilestone.skills_involved 
                                    : []
                                ).map((skill, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">{skill.trim()}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Progress Notes</h4>
                            <Textarea
                              value={milestoneNote}
                              onChange={(e) => setMilestoneNote(e.target.value)}
                              placeholder="Add notes about your progress on this milestone..."
                              className="mt-1 ml-1"
                              rows={4}
                            />
                          </div>
                          
                          {/* Progress History */}
                          <div className="border-t pt-3 mt-4">
                            <h4 className="text-sm font-semibold mb-2">Progress History</h4>
                            <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2">
                              {selectedMilestone?.history ? (
                                selectedMilestone.history.map((entry, idx) => (
                                  <div key={idx} className="text-xs border-l-2 border-gray-200 pl-2 py-1">
                                    <span className="text-gray-600">{new Date(entry.timestamp).toLocaleString()}</span>
                                    <div className="font-medium">{entry.action}</div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-gray-500">No progress history available</p>
                              )}
                              
                              {/* Current status shown in history */}
                              <div className="text-xs border-l-2 border-blue-300 pl-2 py-1 bg-blue-50 rounded-r">
                                <span className="text-gray-600">{new Date().toLocaleString()}</span>
                                <div className="font-medium">
                                  Status: {selectedMilestone?.status === 'completed' ? 'Completed' :
                                          selectedMilestone?.status === 'in_progress' ? 'In Progress' :
                                          'Not Started'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={closeMilestoneDialog}>Cancel</Button>
                        <Button 
                          onClick={saveMilestoneNote} 
                          disabled={savingMilestoneNote}
                        >
                          {savingMilestoneNote ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : 'Save Notes'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  {careerPath.intermediateRoles && careerPath.intermediateRoles.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-4">Potential Career Steps</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {careerPath.intermediateRoles.map((role, index) => (
                          <div key={index} className="p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                            <h4 className="font-medium text-blue-900">
                              {index + 1}. {role.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-2">{role.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {careerPath.recommendedProjects && careerPath.recommendedProjects.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-4">Recommended Projects</h3>
                      <div className="space-y-4">
                        {careerPath.recommendedProjects.map((project, index) => (
                          <div key={index} className="p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                            <h4 className="font-medium text-blue-900">{project.title}</h4>
                            <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                            {project.skills_demonstrated && (
                              <div className="mt-3">
                                <p className="text-xs text-gray-500 mb-1">Skills demonstrated:</p>
                                <div className="flex flex-wrap gap-1">
                                  {(typeof project.skills_demonstrated === 'string' 
                                    ? project.skills_demonstrated.split(',') 
                                    : Array.isArray(project.skills_demonstrated) 
                                      ? project.skills_demonstrated 
                                      : []
                                  ).map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">{skill.trim()}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Resume Builder */}
            <TabsContent value="resume-builder">
              <Card>
                <CardHeader>
                  <CardTitle>Resume Builder</CardTitle>
                  <CardDescription>Create and manage your professional ATS-friendly resume</CardDescription>
                </CardHeader>
                <CardContent>
                  {resumePreviewMode ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Resume Preview</h2>
                        <Button 
                          variant="outline" 
                          onClick={() => setResumePreviewMode(false)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Back to Edit Mode
                        </Button>
                      </div>
                      
                      {/* ATS-friendly resume preview */}
                      <div className="border rounded-md p-8 bg-white resume-preview-container">
                        {/* Contact Info */}
                        <div className="header">
                          <div className="name">{resume?.basics?.name || 'Your Name'}</div>
                          <div className="contact">
                            {resume?.basics?.email && <span>{resume.basics.email}</span>}
                            {resume?.basics?.email && resume?.basics?.phone && <span> | </span>}
                            {resume?.basics?.phone && <span>{resume.basics.phone}</span>}
                            {(resume?.basics?.email || resume?.basics?.phone) && resume?.basics?.location && <span> | </span>}
                            {resume?.basics?.location && <span>{resume.basics.location}</span>}
                          </div>
                        </div>
                        
                        {/* Summary */}
                        {resume?.basics?.summary && (
                          <div className="section">
                            <div className="section-title">Professional Summary</div>
                            <div className="item-description">{resume.basics.summary}</div>
                          </div>
                        )}
                        
                        {/* Skills */}
                        {(resume.skills.technical.length > 0 || resume.skills.soft.length > 0) && (
                          <div className="section">
                            <div className="section-title">Skills</div>
                            <div className="skills-container">
                              {resume.skills.technical.length > 0 && (
                                <div className="skills-group">
                                  <div className="skills-title">Technical Skills</div>
                                  <div className="skills-list">
                                    {resume.skills.technical.map((skill, index) => (
                                      <div key={index} className="skill">{skill}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {resume.skills.soft.length > 0 && (
                                <div className="skills-group">
                                  <div className="skills-title">Soft Skills</div>
                                  <div className="skills-list">
                                    {resume.skills.soft.map((skill, index) => (
                                      <div key={index} className="skill">{skill}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Experience */}
                        {resume?.experience?.length > 0 && (
                          <div className="section">
                            <div className="section-title">Professional Experience</div>
                            
                            {resume.experience.map((exp, index) => (
                              <div key={index} className="item">
                                <div className="item-header">
                                  <div className="item-title">{exp?.position}</div>
                                  <div className="item-date">{exp?.startDate} - {exp?.current ? 'Present' : exp?.endDate}</div>
                                </div>
                                <div className="item-header">
                                  <div className="item-subtitle">{exp?.company}</div>
                                  <div className="item-location">{exp?.location}</div>
                                </div>
                                
                                {exp?.bullets?.length > 0 && (
                                  <ul className="bullets">
                                    {exp?.bullets?.map((bullet, i) => (
                                      <li key={i} className="bullet">{bullet}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Education */}
                        {resume?.education?.length > 0 && (
                          <div className="section">
                            <div className="section-title">Education</div>
                            
                            {resume?.education?.map((edu, index) => (
                              <div key={index} className="item">
                                <div className="item-header">
                                  <div className="item-title">{edu?.degree}{edu?.fieldOfStudy ? ` in ${edu?.fieldOfStudy}` : ''}</div>
                                  <div className="item-date">{edu?.startDate} - {edu?.endDate}</div>
                                </div>
                                <div className="item-header">
                                  <div className="item-subtitle">{edu?.institution}</div>
                                  <div className="item-location">{edu?.location}</div>
                                </div>
                                {edu?.gpa && <div>GPA: {edu?.gpa}</div>}
                                {edu?.description && <div className="item-description">{edu?.description}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Projects */}
                        {resume?.projects?.length > 0 && (
                          <div className="section">
                            <div className="section-title">Projects</div>
                            
                            {resume?.projects?.map((project, index) => (
                              <div key={index} className="item">
                                <div className="item-header">
                                  <div className="item-title">{project?.title}</div>
                                  {(project?.startDate || project?.endDate) && (
                                    <div className="item-date">
                                      {project?.startDate}{project?.endDate ? ` - ${project?.endDate}` : ''}
                                    </div>
                                  )}
                                </div>
                                {project?.technologies && (
                                  <div className="item-subtitle">Technologies: {project?.technologies}</div>
                                )}
                                {project?.description && <div className="item-description">{project?.description}</div>}
                                {project?.link && (
                                  <div>Link: <a href={project?.link} target="_blank" rel="noopener noreferrer">{project?.link}</a></div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Certifications */}
                        {resume?.certifications?.length > 0 && (
                          <div className="section">
                            <div className="section-title">Certifications</div>
                            
                            {resume?.certifications?.map((cert, index) => (
                              <div key={index} className="item">
                                <div className="item-header">
                                  <div className="item-title">{cert?.name}</div>
                                  <div className="item-date">{cert?.date}</div>
                                </div>
                                <div className="item-subtitle">{cert?.issuer}</div>
                                {cert?.link && (
                                  <div>Credential: <a href={cert?.link} target="_blank" rel="noopener noreferrer">{cert?.link}</a></div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Achievements */}
                        {resume?.achievements?.length > 0 && (
                          <div className="section">
                            <div className="section-title">Achievements</div>
                            
                            {resume?.achievements?.map((achievement, index) => (
                              <div key={index} className="item">
                                <div className="item-header">
                                  <div className="item-title">{achievement?.title}</div>
                                  {achievement?.date && <div className="item-date">{achievement?.date}</div>}
                                </div>
                                {achievement?.description && <div className="item-description">{achievement?.description}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end gap-4">
                        <Button variant="outline" onClick={() => setResumePreviewMode(false)}>
                          Edit Resume
                        </Button>
                        <Button 
                          onClick={generateResume}
                          disabled={isGeneratingResume}
                          className="gap-2"
                        >
                          {isGeneratingResume ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Generating PDF...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              Download PDF
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Resume completion progress */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1 mr-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Resume Completion</span>
                            <span className="text-sm font-medium">{calculateResumeCompletion()}%</span>
                          </div>
                          <Progress value={calculateResumeCompletion()} className="h-2" />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            onClick={clearResume}
                            className="gap-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Clear resume data"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden md:inline">Clear</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setResumePreviewMode(true)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </Button>
                          <Button 
                            onClick={saveResume} 
                            disabled={isSavingResume}
                            className="gap-2"
                          >
                            {isSavingResume ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Save Resume
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Resume Builder Tabs */}
                      <div className="flex border-b">
                        <button 
                          className={`px-4 py-2 font-medium ${activeResumeSection === 'basics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                          onClick={() => setActiveResumeSection('basics')}
                        >
                          <User className="h-4 w-4 inline mr-2" />
                          Basics
                        </button>
                        <button 
                          className={`px-4 py-2 font-medium ${activeResumeSection === 'education' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                          onClick={() => setActiveResumeSection('education')}
                        >
                          <GraduationCap className="h-4 w-4 inline mr-2" />
                          Education
                        </button>
                        <button 
                          className={`px-4 py-2 font-medium ${activeResumeSection === 'experience' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                          onClick={() => setActiveResumeSection('experience')}
                        >
                          <Briefcase className="h-4 w-4 inline mr-2" />
                          Experience
                        </button>
                        <button 
                          className={`px-4 py-2 font-medium ${activeResumeSection === 'skills' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                          onClick={() => setActiveResumeSection('skills')}
                        >
                          <Code className="h-4 w-4 inline mr-2" />
                          Skills
                        </button>
                        <button 
                          className={`px-4 py-2 font-medium ${activeResumeSection === 'projects' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                          onClick={() => setActiveResumeSection('projects')}
                        >
                          <Bookmark className="h-4 w-4 inline mr-2" />
                          Projects
                        </button>
                        <button 
                          className={`px-4 py-2 font-medium ${activeResumeSection === 'extras' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                          onClick={() => setActiveResumeSection('extras')}
                        >
                          <Award className="h-4 w-4 inline mr-2" />
                          Extras
                        </button>
                      </div>
                      
                      {/* Basics Section */}
                      {activeResumeSection === 'basics' && (
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                            <h3 className="font-medium text-blue-800 mb-2">ATS-Friendly Resume Tips</h3>
                            <p className="text-gray-700 text-sm">
                              Use a clean, professional summary that highlights your most relevant qualifications for the job. 
                              Avoid graphics, tables, and complex formatting that ATS systems may not be able to parse.
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <Label htmlFor="resume-name">Full Name</Label>
                              <Input 
                                id="resume-name"
                                value={resume?.basics?.name || ''}
                                onChange={(e) => setResume({
                                  ...resume,
                                  basics: {...(resume?.basics || {}), name: e.target.value}
                                })}
                                placeholder="Your full name"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="resume-email">Email</Label>
                              <Input 
                                id="resume-email"
                                type="email"
                                value={resume?.basics?.email || ''}
                                onChange={(e) => setResume({
                                  ...resume,
                                  basics: {...(resume?.basics || {}), email: e.target.value}
                                })}
                                placeholder="your.email@example.com"
                                className="mt-1"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <Label htmlFor="resume-phone">Phone</Label>
                              <Input 
                                id="resume-phone"
                                value={resume?.basics?.phone || ''}
                                onChange={(e) => setResume({
                                  ...resume,
                                  basics: {...(resume?.basics || {}), phone: e.target.value}
                                })}
                                placeholder="Your phone number"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="resume-location">Location</Label>
                              <Input 
                                id="resume-location"
                                value={resume?.basics?.location || ''}
                                onChange={(e) => setResume({
                                  ...resume,
                                  basics: {...(resume?.basics || {}), location: e.target.value}
                                })}
                                placeholder="City, State, Country"
                                className="mt-1"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center">
                              <Label htmlFor="resume-summary">Professional Summary</Label>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => enhanceTextWithAI('basics', -1, 'summary', resume?.basics?.summary || '')}
                                disabled={isEnhancingText && enhancementTarget.section === 'basics' && enhancementTarget.field === 'summary'}
                              >
                                {isEnhancingText && enhancementTarget.section === 'basics' && enhancementTarget.field === 'summary' ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : 'Enhance with AI'}
                              </Button>
                            </div>
                            <Textarea 
                              id="resume-summary"
                              value={resume?.basics?.summary || ''}
                              onChange={(e) => setResume({
                                ...resume,
                                basics: {...(resume?.basics || {}), summary: e.target.value}
                              })}
                              placeholder="A brief summary of your professional background and career goals"
                              rows={4}
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              This is one of the most important sections for ATS. Use relevant keywords from job descriptions.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Education Section */}
                      {activeResumeSection === 'education' && (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            {resume.education.map((edu, index) => (
                              <div key={index} className="p-4 border rounded-lg bg-white relative">
                                <button 
                                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                  onClick={() => removeEducation(index)}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-medium">{edu.institution}</h3>
                                    <p>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-gray-600">
                                      {edu.startDate} - {edu.endDate}
                                    </p>
                                    {edu.location && (
                                      <p className="text-gray-600">{edu.location}</p>
                                    )}
                                  </div>
                                </div>
                                
                                {edu.gpa && (
                                  <p className="mt-2 text-gray-700">GPA: {edu.gpa}</p>
                                )}
                                
                                {edu.description && (
                                  <p className="mt-2 text-gray-700">{edu.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <div className="p-4 border rounded-lg bg-gray-50">
                            <h3 className="text-lg font-medium mb-4">Add Education</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="edu-institution">Institution</Label>
                                <Input 
                                  id="edu-institution"
                                  value={newEducation.institution}
                                  onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                                  placeholder="University/College Name"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edu-location">Location</Label>
                                <Input 
                                  id="edu-location"
                                  value={newEducation.location}
                                  onChange={(e) => setNewEducation({...newEducation, location: e.target.value})}
                                  placeholder="City, State, Country"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <Label htmlFor="edu-degree">Degree</Label>
                                <Input 
                                  id="edu-degree"
                                  value={newEducation.degree}
                                  onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                                  placeholder="Bachelor of Science, Master's, etc."
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edu-field">Field of Study</Label>
                                <Input 
                                  id="edu-field"
                                  value={newEducation.fieldOfStudy}
                                  onChange={(e) => setNewEducation({...newEducation, fieldOfStudy: e.target.value})}
                                  placeholder="Computer Science, Business, etc."
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <Label htmlFor="edu-start">Start Date</Label>
                                <Input 
                                  id="edu-start"
                                  value={newEducation.startDate}
                                  onChange={(e) => setNewEducation({...newEducation, startDate: e.target.value})}
                                  placeholder="MM/YYYY"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edu-end">End Date</Label>
                                <Input 
                                  id="edu-end"
                                  value={newEducation.endDate}
                                  onChange={(e) => setNewEducation({...newEducation, endDate: e.target.value})}
                                  placeholder="MM/YYYY or Present"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <Label htmlFor="edu-gpa">GPA (Optional)</Label>
                              <Input 
                                id="edu-gpa"
                                value={newEducation.gpa}
                                onChange={(e) => setNewEducation({...newEducation, gpa: e.target.value})}
                                placeholder="3.8/4.0"
                                className="mt-1"
                              />
                            </div>
                            
                            <div className="mt-4">
                              <div className="flex justify-between items-center">
                                <Label htmlFor="edu-description">Description (Optional)</Label>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => enhanceTextWithAI('education', -1, 'description', newEducation.description)}
                                  disabled={isEnhancingText && enhancementTarget.section === 'education' && enhancementTarget.field === 'description'}
                                >
                                  {isEnhancingText && enhancementTarget.section === 'education' && enhancementTarget.field === 'description' ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : 'Enhance with AI'}
                                </Button>
                              </div>
                              <Textarea 
                                id="edu-description"
                                value={newEducation.description}
                                onChange={(e) => setNewEducation({...newEducation, description: e.target.value})}
                                placeholder="Relevant coursework, achievements, etc."
                                rows={3}
                                className="mt-1"
                              />
                            </div>
                            
                            <Button 
                              onClick={addEducation}
                              className="mt-4"
                            >
                              Add Education
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Experience Section */}
                      {activeResumeSection === 'experience' && (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            {resume.experience.map((exp, index) => (
                              <div key={index} className="p-4 border rounded-lg bg-white relative">
                                <button 
                                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                  onClick={() => removeExperience(index)}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-medium">{exp.position}</h3>
                                    <p>{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-gray-600">
                                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                    </p>
                                  </div>
                                </div>
                                
                                {exp.description && (
                                  <p className="mt-2 text-gray-700">{exp.description}</p>
                                )}
                                
                                {exp.bullets && exp.bullets.length > 0 && (
                                  <div className="mt-2">
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                      {exp.bullets.map((bullet, i) => (
                                        <li key={i} className="text-gray-700">{bullet}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <div className="p-4 border rounded-lg bg-gray-50">
                            <h3 className="text-lg font-medium mb-4">Add Work Experience</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="exp-company">Company</Label>
                                <Input 
                                  id="exp-company"
                                  value={newExperience.company}
                                  onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                                  placeholder="Company Name"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="exp-position">Position</Label>
                                <Input 
                                  id="exp-position"
                                  value={newExperience.position}
                                  onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}
                                  placeholder="Job Title"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <Label htmlFor="exp-location">Location</Label>
                                <Input 
                                  id="exp-location"
                                  value={newExperience.location}
                                  onChange={(e) => setNewExperience({...newExperience, location: e.target.value})}
                                  placeholder="City, State, Country"
                                  className="mt-1"
                                />
                              </div>
                              <div className="flex items-center mt-6">
                                <input 
                                  id="exp-current"
                                  type="checkbox"
                                  checked={newExperience.current}
                                  onChange={(e) => setNewExperience({...newExperience, current: e.target.checked})}
                                  className="mr-2"
                                />
                                <Label htmlFor="exp-current">I currently work here</Label>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <Label htmlFor="exp-start">Start Date</Label>
                                <Input 
                                  id="exp-start"
                                  value={newExperience.startDate}
                                  onChange={(e) => setNewExperience({...newExperience, startDate: e.target.value})}
                                  placeholder="MM/YYYY"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="exp-end">End Date</Label>
                                <Input 
                                  id="exp-end"
                                  value={newExperience.endDate}
                                  onChange={(e) => setNewExperience({...newExperience, endDate: e.target.value})}
                                  placeholder="MM/YYYY"
                                  className="mt-1"
                                  disabled={newExperience.current}
                                />
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div className="flex justify-between items-center">
                                <Label>Bullet Points (ATS-friendly achievements)</Label>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    if (newExperience.bullets.some(b => b.trim() !== '')) {
                                      enhanceTextWithAI('experience', -1, 'bullets', newExperience.bullets.join('\n'))
                                    } else {
                                      toast.error('Please add at least one bullet point to enhance');
                                    }
                                  }}
                                  disabled={isEnhancingText && enhancementTarget.section === 'experience' && enhancementTarget.field === 'bullets'}
                                >
                                  {isEnhancingText && enhancementTarget.section === 'experience' && enhancementTarget.field === 'bullets' ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : 'Enhance All with AI'}
                                </Button>
                              </div>
                              <p className="text-xs text-gray-500 mb-2">
                                Start each bullet with an action verb and focus on achievements and results, not just duties.
                              </p>
                              
                              {newExperience.bullets.map((bullet, index) => (
                                <div key={index} className="flex items-start mt-2">
                                  <div className="flex-1 mr-2">
                                    <div className="flex">
                                      <Input 
                                        value={bullet}
                                        onChange={(e) => updateBulletPoint(index, e.target.value)}
                                        placeholder={`Achievement or responsibility ${index + 1}`}
                                      />
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                          if (bullet.trim()) {
                                            enhanceTextWithAI('experience', -1, `bullet-${index}`, bullet)
                                          } else {
                                            toast.error('Please add text to enhance');
                                          }
                                        }}
                                        disabled={isEnhancingText && enhancementTarget.section === 'experience' && enhancementTarget.field === `bullet-${index}`}
                                        className="ml-1"
                                      >
                                        {isEnhancingText && enhancementTarget.section === 'experience' && enhancementTarget.field === `bullet-${index}` ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : 'AI'}
                                      </Button>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeBulletPoint(index)}
                                    className="h-9 w-9 p-0"
                                    title="Remove bullet point"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={addBulletPoint}
                                className="mt-2"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Bullet Point
                              </Button>
                            </div>
                            
                            <Button 
                              onClick={addExperience}
                              className="mt-4"
                            >
                              Add Experience
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Skills Section */}
                      {activeResumeSection === 'skills' && (
                        <div className="space-y-6">
                          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                            <h3 className="font-medium text-blue-800 mb-2">ATS-Friendly Skills Section Tips</h3>
                            <p className="text-gray-700 text-sm">
                              Include both technical skills (hard skills) and soft skills. Use the exact keywords from job descriptions
                              to maximize your chances of passing ATS scans. Separate skills by type to make them more organized.
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-lg font-medium mb-3">Technical Skills</h3>
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                {resume.skills.technical.map((skill, index) => (
                                  <Badge 
                                    key={index} 
                                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1 py-1.5 px-3"
                                  >
                                    {skill}
                                    <button 
                                      onClick={() => removeResumeSkill('technical', index)}
                                      className="ml-1 text-blue-800 hover:text-blue-900"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex gap-2">
                                <Input 
                                  value={newSkill.text}
                                  onChange={(e) => setNewSkill({...newSkill, text: e.target.value, category: 'technical'})}
                                  placeholder="Add a technical skill"
                                  onKeyPress={(e) => e.key === 'Enter' && addResumeSkill()}
                                />
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    if (newSkill.text.trim()) {
                                      addResumeSkill();
                                    }
                                  }}
                                >
                                  Add
                                </Button>
                              </div>
                              
                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">Technical Skill Suggestions</h4>
                                <div className="flex flex-wrap gap-1">
                                  {['JavaScript', 'React', 'Python', 'SQL', 'Java', 'Git', 'AWS', 'HTML/CSS', 'Node.js', 'Docker'].map((skill) => (
                                    <Badge 
                                      key={skill} 
                                      className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-blue-100 hover:text-blue-800"
                                      onClick={() => {
                                        if (!resume.skills.technical.includes(skill)) {
                                          setResume(prev => ({
                                            ...prev,
                                            skills: {
                                              ...prev.skills,
                                              technical: [...prev.skills.technical, skill]
                                            }
                                          }));
                                        }
                                      }}
                                    >
                                      + {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-medium mb-3">Soft Skills</h3>
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                {resume.skills.soft.map((skill, index) => (
                                  <Badge 
                                    key={index} 
                                    className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1 py-1.5 px-3"
                                  >
                                    {skill}
                                    <button 
                                      onClick={() => removeResumeSkill('soft', index)}
                                      className="ml-1 text-green-800 hover:text-green-900"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex gap-2">
                                <Input 
                                  value={newSkill.category === 'soft' ? newSkill.text : ''}
                                  onChange={(e) => setNewSkill({...newSkill, text: e.target.value, category: 'soft'})}
                                  placeholder="Add a soft skill"
                                  onKeyPress={(e) => e.key === 'Enter' && newSkill.category === 'soft' && addResumeSkill()}
                                />
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    if (newSkill.text.trim() && newSkill.category === 'soft') {
                                      addResumeSkill();
                                    } else {
                                      setNewSkill({...newSkill, category: 'soft'});
                                    }
                                  }}
                                >
                                  Add
                                </Button>
                              </div>
                              
                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">Soft Skill Suggestions</h4>
                                <div className="flex flex-wrap gap-1">
                                  {['Communication', 'Teamwork', 'Problem Solving', 'Time Management', 'Leadership', 'Adaptability', 'Critical Thinking', 'Creativity', 'Attention to Detail', 'Project Management'].map((skill) => (
                                    <Badge 
                                      key={skill} 
                                      className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-green-100 hover:text-green-800"
                                      onClick={() => {
                                        if (!resume.skills.soft.includes(skill)) {
                                          setResume(prev => ({
                                            ...prev,
                                            skills: {
                                              ...prev.skills,
                                              soft: [...prev.skills.soft, skill]
                                            }
                                          }));
                                        }
                                      }}
                                    >
                                      + {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 border rounded-lg bg-yellow-50 mt-6">
                            <h3 className="font-medium text-yellow-800 mb-2">ATS Tip: Keyword Matching</h3>
                            <p className="text-sm text-yellow-800">
                              For the best results, analyze each job posting you apply to and make sure to include matching skills 
                              in your resume. ATS systems often rank candidates based on keyword matches.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Projects Section */}
                      {activeResumeSection === 'projects' && (
                        <div className="space-y-6">
                          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                            <h3 className="font-medium text-blue-800 mb-2">ATS-Friendly Projects Tips</h3>
                            <p className="text-gray-700 text-sm">
                              Projects are a great way to demonstrate skills when you lack formal work experience. 
                              Add bullet points highlighting your contributions and use action verbs to describe what you did.
                            </p>
                          </div>
                          
                          <div className="space-y-4">
                            {resume.projects.map((project, index) => (
                              <div key={index} className="p-4 border rounded-lg bg-white relative">
                                <button 
                                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                  onClick={() => removeProject(index)}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-medium">{project.title}</h3>
                                    {project.technologies && (
                                      <p className="text-sm text-gray-600">Technologies: {project.technologies}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    {(project.startDate || project.endDate) && (
                                      <p className="text-gray-600">
                                        {project.startDate}{project.endDate ? ` - ${project.endDate}` : ''}
                                      </p>
                                    )}
                                    {project.link && (
                                      <a 
                                        href={project.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-blue-600 text-sm hover:underline"
                                      >
                                        View Project
                                      </a>
                                    )}
                                  </div>
                                </div>
                                
                                {project.bullets && project.bullets.length > 0 && (
                                  <div className="mt-2">
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                      {project.bullets.map((bullet, i) => (
                                        <li key={i} className="text-gray-700">{bullet}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <div className="p-4 border rounded-lg bg-gray-50">
                            <h3 className="text-lg font-medium mb-4">Add Project</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="project-title">Project Title</Label>
                                <Input 
                                  id="project-title"
                                  value={newProject.title}
                                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                                  placeholder="Project Name"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="project-tech">Technologies Used</Label>
                                <Input 
                                  id="project-tech"
                                  value={newProject.technologies}
                                  onChange={(e) => setNewProject({...newProject, technologies: e.target.value})}
                                  placeholder="React, Node.js, MongoDB, etc."
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <Label htmlFor="project-start">Start Date (Optional)</Label>
                                <Input 
                                  id="project-start"
                                  value={newProject.startDate}
                                  onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                                  placeholder="MM/YYYY"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="project-end">End Date (Optional)</Label>
                                <Input 
                                  id="project-end"
                                  value={newProject.endDate}
                                  onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                                  placeholder="MM/YYYY or Present"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <Label htmlFor="project-link">Project Link (Optional)</Label>
                              <Input 
                                id="project-link"
                                value={newProject.link}
                                onChange={(e) => setNewProject({...newProject, link: e.target.value})}
                                placeholder="https://github.com/yourusername/project"
                                className="mt-1"
                              />
                            </div>
                            
                            <div className="mt-4">
                              <div className="flex justify-between items-center">
                                <Label>Project Bullet Points</Label>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    if (newProject.bullets && newProject.bullets.some(b => b.trim() !== '')) {
                                      enhanceTextWithAI('projects', -1, 'bullets', newProject.bullets.join('\n'))
                                    } else {
                                      toast.error('Please add at least one bullet point to enhance');
                                    }
                                  }}
                                  disabled={isEnhancingText && enhancementTarget.section === 'projects' && enhancementTarget.field === 'bullets'}
                                >
                                  {isEnhancingText && enhancementTarget.section === 'projects' && enhancementTarget.field === 'bullets' ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : 'Enhance All with AI'}
                                </Button>
                              </div>
                              
                              {(newProject.bullets || []).map((bullet, index) => (
                                <div key={index} className="flex items-start mt-2">
                                  <div className="flex-1 mr-2">
                                    <div className="flex">
                                      <Input 
                                        value={bullet}
                                        onChange={(e) => {
                                          const updatedBullets = [...(newProject.bullets || [])];
                                          updatedBullets[index] = e.target.value;
                                          setNewProject({...newProject, bullets: updatedBullets});
                                        }}
                                        placeholder={`Project detail or achievement ${index + 1}`}
                                      />
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                          if (bullet.trim()) {
                                            enhanceTextWithAI('projects', -1, `bullet-${index}`, bullet)
                                          } else {
                                            toast.error('Please add text to enhance');
                                          }
                                        }}
                                        disabled={isEnhancingText && enhancementTarget.section === 'projects' && enhancementTarget.field === `bullet-${index}`}
                                        className="ml-1"
                                      >
                                        {isEnhancingText && enhancementTarget.section === 'projects' && enhancementTarget.field === `bullet-${index}` ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : 'AI'}
                                      </Button>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      const updatedBullets = [...(newProject.bullets || [])];
                                      updatedBullets.splice(index, 1);
                                      setNewProject({...newProject, bullets: updatedBullets});
                                    }}
                                    className="h-9 w-9 p-0"
                                    title="Remove bullet point"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const bullets = newProject.bullets || [];
                                  setNewProject({...newProject, bullets: [...bullets, '']});
                                }}
                                className="mt-2"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Bullet Point
                              </Button>
                            </div>
                            
                            <Button 
                              onClick={addProject}
                              className="mt-4"
                            >
                              Add Project
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Extras Section - Certifications & Achievements */}
                      {activeResumeSection === 'extras' && (
                        <div className="space-y-6">
                          <div className="p-4 bg-green-50 border border-green-100 rounded-lg mb-4">
                            <h3 className="font-medium text-green-800 mb-2">ATS-Friendly Extras Tips</h3>
                            <p className="text-gray-700 text-sm">
                              Include certifications and achievements that are relevant to your target role.
                              These extras can differentiate you from other candidates with similar qualifications.
                            </p>
                          </div>
                          
                          {/* Certifications Section */}
                          <div>
                            <h3 className="text-lg font-medium mb-3">Certifications</h3>
                            
                            <div className="space-y-4 mb-6">
                              {resume.certifications.map((cert, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-white relative">
                                  <button 
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                    onClick={() => removeCertification(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h3 className="font-medium">{cert.name}</h3>
                                      {cert.issuer && <p className="text-gray-600">Issuer: {cert.issuer}</p>}
                                    </div>
                                    <div className="text-right">
                                      {cert.date && <p className="text-gray-600">{cert.date}</p>}
                                      {cert.link && (
                                        <a 
                                          href={cert.link} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="text-blue-600 text-sm hover:underline"
                                        >
                                          Verify Certificate
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              <div className="p-4 border rounded-lg bg-gray-50">
                                <h4 className="font-medium mb-3">Add Certification</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="cert-name">Certification Name</Label>
                                    <Input 
                                      id="cert-name"
                                      value={newCertification.name}
                                      onChange={(e) => setNewCertification({...newCertification, name: e.target.value})}
                                      placeholder="AWS Certified Solutions Architect"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="cert-issuer">Issuing Organization</Label>
                                    <Input 
                                      id="cert-issuer"
                                      value={newCertification.issuer}
                                      onChange={(e) => setNewCertification({...newCertification, issuer: e.target.value})}
                                      placeholder="Amazon Web Services"
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  <div>
                                    <Label htmlFor="cert-date">Date Acquired</Label>
                                    <Input 
                                      id="cert-date"
                                      value={newCertification.date}
                                      onChange={(e) => setNewCertification({...newCertification, date: e.target.value})}
                                      placeholder="MM/YYYY"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="cert-link">Verification Link (Optional)</Label>
                                    <Input 
                                      id="cert-link"
                                      value={newCertification.link}
                                      onChange={(e) => setNewCertification({...newCertification, link: e.target.value})}
                                      placeholder="https://verify.example.com/cert"
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                                
                                <Button 
                                  onClick={addCertification}
                                  className="mt-4"
                                >
                                  Add Certification
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Achievements Section */}
                          <div>
                            <h3 className="text-lg font-medium mb-3">Achievements & Awards</h3>
                            
                            <div className="space-y-4">
                              {resume.achievements.map((achievement, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-white relative">
                                  <button 
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                    onClick={() => removeAchievement(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h3 className="font-medium">{achievement.title}</h3>
                                    </div>
                                    <div className="text-right">
                                      {achievement.date && <p className="text-gray-600">{achievement.date}</p>}
                                    </div>
                                  </div>
                                  
                                  {achievement.description && (
                                    <p className="mt-2 text-gray-700">{achievement.description}</p>
                                  )}
                                </div>
                              ))}
                              
                              <div className="p-4 border rounded-lg bg-gray-50">
                                <h4 className="font-medium mb-3">Add Achievement or Award</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="achievement-title">Achievement Title</Label>
                                    <Input 
                                      id="achievement-title"
                                      value={newAchievement.title}
                                      onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
                                      placeholder="Dean's List, Academic Excellence Award"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="achievement-date">Date (Optional)</Label>
                                    <Input 
                                      id="achievement-date"
                                      value={newAchievement.date}
                                      onChange={(e) => setNewAchievement({...newAchievement, date: e.target.value})}
                                      placeholder="MM/YYYY or Academic Year"
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                                
                                <div className="mt-4">
                                  <div className="flex justify-between items-center">
                                    <Label htmlFor="achievement-description">Description (Optional)</Label>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => enhanceTextWithAI('achievements', -1, 'description', newAchievement.description)}
                                      disabled={isEnhancingText && enhancementTarget.section === 'achievements' && enhancementTarget.field === 'description'}
                                    >
                                      {isEnhancingText && enhancementTarget.section === 'achievements' && enhancementTarget.field === 'description' ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : 'Enhance with AI'}
                                    </Button>
                                  </div>
                                  <Textarea 
                                    id="achievement-description"
                                    value={newAchievement.description}
                                    onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                                    placeholder="Brief description of the achievement and its significance"
                                    rows={3}
                                    className="mt-1"
                                  />
                                </div>
                                
                                <Button 
                                  onClick={addAchievement}
                                  className="mt-4"
                                >
                                  Add Achievement
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
} 