"use client";

import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Info } from 'lucide-react';
import AdminRoute from "@/components/AdminRoute";
import { useRouter } from "next/navigation";
import { isAdmin, isLoggedIn } from "@/app/lib/auth";
import { toast } from 'sonner';

// Add this helper function to get department theme color
const getDepartmentThemeColor = (departmentCode) => {
  if (!departmentCode) return { bg: 'blue', text: 'blue', light: 'blue-50', border: 'blue-500' };
  
  const deptCode = departmentCode.toLowerCase();
  
  switch (deptCode) {
    case 'cse':
      return { bg: 'blue', text: 'blue', light: 'blue-50', border: 'blue-500' };
    case 'it':
      return { bg: 'indigo', text: 'indigo', light: 'indigo-50', border: 'indigo-500' };
    case 'etc':
      return { bg: 'purple', text: 'purple', light: 'purple-50', border: 'purple-500' };
    case 'ce':
    case 'civil':
      return { bg: 'green', text: 'green', light: 'green-50', border: 'green-500' };
    case 'me':
    case 'mech':
      return { bg: 'red', text: 'red', light: 'red-50', border: 'red-500' };
    case 'ee':
    case 'electrical':
    case 'eee':
      return { bg: 'yellow', text: 'yellow', light: 'yellow-50', border: 'yellow-500' };
    case 'ece':
      return { bg: 'orange', text: 'orange', light: 'orange-50', border: 'orange-500' };
    case 'biotech':
      return { bg: 'lime', text: 'lime', light: 'lime-50', border: 'lime-500' };
    case 'chem':
      return { bg: 'emerald', text: 'emerald', light: 'emerald-50', border: 'emerald-500' };
    case 'ct':
      return { bg: 'teal', text: 'teal', light: 'teal-50', border: 'teal-500' };
    case 'aids':
      return { bg: 'cyan', text: 'cyan', light: 'cyan-50', border: 'cyan-500' };
    case 'aiml':
      return { bg: 'sky', text: 'sky', light: 'sky-50', border: 'sky-500' };
    case 'cse-iot':
      return { bg: 'violet', text: 'violet', light: 'violet-50', border: 'violet-500' };
    case 'csd':
      return { bg: 'fuchsia', text: 'fuchsia', light: 'fuchsia-50', border: 'fuchsia-500' };
    default:
      return { bg: 'gray', text: 'gray', light: 'gray-50', border: 'gray-500' };
  }
};

function AdminDashboard() {
  const [mentorMentees, setMentorMentees] = useState({});
  const [participants, setParticipants] = useState([]);
  const [unmatchedParticipants, setUnmatchedParticipants] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [csvData, setCsvData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUnmatched, setIsLoadingUnmatched] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statsRefreshInterval, setStatsRefreshInterval] = useState(30); // seconds
  const [matchesFetched, setMatchesFetched] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [activeTab, setActiveTab] = useState("participants");
  const [selectedUnmatchedParticipant, setSelectedUnmatchedParticipant] = useState(null);
  const [showUnmatchedParticipantModal, setShowUnmatchedParticipantModal] = useState(false);
  const [techStackFilter, setTechStackFilter] = useState('');
  const [mentoringPreferenceFilter, setMentoringPreferenceFilter] = useState('');
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false);
  const [selectedApprovalParticipant, setSelectedApprovalParticipant] = useState(null);
  const [showApprovalDetailModal, setShowApprovalDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalSearchTerm, setApprovalSearchTerm] = useState('');
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [participantForStatus, setParticipantForStatus] = useState(null);
  const [badges, setBadges] = useState([]);
  const [isLoadingBadges, setIsLoadingBadges] = useState(false);
  const [showBadgeCreateModal, setShowBadgeCreateModal] = useState(false);
  const [showBadgeAwardModal, setShowBadgeAwardModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [badgeFormData, setBadgeFormData] = useState({
    name: '',
    description: '',
    points_required: 0,
    icon_url: '',
    badge_type: 'achievement'
  });
  const [participantBadges, setParticipantBadges] = useState([]);
  const [isLoadingParticipantBadges, setIsLoadingParticipantBadges] = useState(false);
  const [participantForBadge, setParticipantForBadge] = useState(null);
  
  // States for badge deletion
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [badgeToDelete, setBadgeToDelete] = useState(null);
  const [isForceDeleteDialogOpen, setIsForceDeleteDialogOpen] = useState(false);
  const [isDeletingBadge, setIsDeletingBadge] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleteDefinitionDialogOpen, setIsDeleteDefinitionDialogOpen] = useState(false);
  
  // New state variables for manual assignment
  const [relationships, setRelationships] = useState([]);
  const [isLoadingRelationships, setIsLoadingRelationships] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Add batched assignment states
  const [showBatchAssignmentModal, setShowBatchAssignmentModal] = useState(false);
  const [batchAssignmentParticipant, setBatchAssignmentParticipant] = useState(null);
  const [selectedBatchParticipants, setSelectedBatchParticipants] = useState([]);
  const [isBatchAssigning, setIsBatchAssigning] = useState(false);

  // Add state for relationship search
  const [relationshipSearchTerm, setRelationshipSearchTerm] = useState('');

  // Add direct registration input states
  const [mentorRegInput, setMentorRegInput] = useState('');
  const [menteeRegInput, setMenteeRegInput] = useState('');

  const router = useRouter();
  
  // Add this right after the router declaration in the AdminDashboard component
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [isDepartmentAdmin, setIsDepartmentAdmin] = useState(false);

  // Add feedback management states
  const [feedbackSettings, setFeedbackSettings] = useState({
    mentor_feedback_enabled: false,
    app_feedback_enabled: false,
    allow_anonymous_feedback: false,
    feedback_start_date: '',
    feedback_end_date: '',
    department: null,
    department_name: 'Global Settings'
  });
  const [isLoadingFeedbackSettings, setIsLoadingFeedbackSettings] = useState(false);
  const [mentorFeedback, setMentorFeedback] = useState([]);
  const [appFeedback, setAppFeedback] = useState([]);
  const [isLoadingMentorFeedback, setIsLoadingMentorFeedback] = useState(false);
  const [isLoadingAppFeedback, setIsLoadingAppFeedback] = useState(false);
  const [feedbackSelectedMentor, setFeedbackSelectedMentor] = useState(null);
  const [appFeedbackStats, setAppFeedbackStats] = useState({
    feedback_count: 0,
    average_ratings: {
      usability: 0,
      features: 0,
      performance: 0,
      overall: 0,
      nps: 0
    },
    nps: {
      score: 0,
      promoters: 0,
      passives: 0,
      detractors: 0
    }
  });
  const [isSavingFeedbackSettings, setIsSavingFeedbackSettings] = useState(false);
  const [feedbackSearchTerm, setFeedbackSearchTerm] = useState('');
  
  // Add new state variables for user eligibility management
  const [userFeedbackEligibility, setUserFeedbackEligibility] = useState([]);
  const [isLoadingUserEligibility, setIsLoadingUserEligibility] = useState(false);
  const [eligibilitySearchTerm, setEligibilitySearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userEligibilityOverrides, setUserEligibilityOverrides] = useState({
    mentor_feedback_eligible: false,
    app_feedback_eligible: false,
    override_until: ''
  });
  const [isUpdatingUserEligibility, setIsUpdatingUserEligibility] = useState(false);

  // Add state for participant proofs
  const [participantProofs, setParticipantProofs] = useState({});
  const [isLoadingProofs, setIsLoadingProofs] = useState(false);
  const proofTypes = [
    'research',
    'hackathon',
    'coding',
    'academic',
    'internship',
    'extracurricular',
  ];

  // Fetch all proofs for a participant
  const fetchParticipantProofs = async (registrationNo) => {
    setIsLoadingProofs(true);
    const proofs = {};
    const headers = getAuthHeaders();
    try {
      await Promise.all(
        proofTypes.map(async (type) => {
          try {
            // Try to fetch as PDF first
            const url = `https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/participant/${registrationNo}/proof/${type}/?filetype=pdf`;
            const response = await axios.get(url, { headers, responseType: 'blob' });
            if (response.status === 200 && response.data) {
              proofs[type] = {
                url: URL.createObjectURL(response.data),
                filetype: 'pdf',
              };
            }
          } catch (err) {
            // If not found as PDF, try as image (jpg)
            try {
              const imgUrl = `https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/participant/${registrationNo}/proof/${type}/?filetype=jpg`;
              const imgResponse = await axios.get(imgUrl, { headers, responseType: 'blob' });
              if (imgResponse.status === 200 && imgResponse.data) {
                proofs[type] = {
                  url: URL.createObjectURL(imgResponse.data),
                  filetype: 'jpg',
                };
              }
            } catch (imgErr) {
              // No proof found for this type
            }
          }
        })
      );
      setParticipantProofs(proofs);
    } catch (error) {
      setParticipantProofs({});
    } finally {
      setIsLoadingProofs(false);
    }
  };

  // Update the useEffect that checks auth and department status
  useEffect(() => {
    if (!isLoggedIn() || !isAdmin()) {
      router.push('/login');
      return;
    }
    
    // Get department info if department admin
    const isDeptAdmin = localStorage.getItem("isDepartmentAdmin") === "true";
    setIsDepartmentAdmin(isDeptAdmin);
    
    if (isDeptAdmin) {
      try {
        const deptInfo = JSON.parse(localStorage.getItem("adminDepartment"));
        setDepartmentInfo(deptInfo);
        console.log("Department admin for:", deptInfo?.name, "ID:", deptInfo?.id, "Code:", deptInfo?.code);
        
        // Debug the auth token
        const token = localStorage.getItem("authToken");
        console.log("Using auth token:", token ? "Token exists" : "No token found");
      } catch (error) {
        console.error("Error parsing department info:", error);
      }
    } else {
      console.log("Not a department admin");
    }
  }, [router]);

  // Stats counters
  const stats = useMemo(() => {
    // Check if participants is an array and has items
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return { total: 0, mentors: 0, mentees: 0 };
    }
    
    const mentors = participants.filter(p => 
      p.mentoring_preferences && 
      p.mentoring_preferences.toLowerCase() === "mentor"
    ).length;
    
    const mentees = participants.filter(p => 
      p.mentoring_preferences && 
      p.mentoring_preferences.toLowerCase() === "mentee"
    ).length;
    
    return {
      total: participants.length,
      mentors,
      mentees
    };
  }, [participants]);
  
  // Add relationship statistics state
  const [relationshipStats, setRelationshipStats] = useState({
    totalRelationships: 0,
    uniqueMentors: 0,
    uniqueMentees: 0
  });
  
  // Add new state for timestamp tracking
  const [lastMatchFetchTime, setLastMatchFetchTime] = useState(0);
  const [lastRelationshipModificationTime, setLastRelationshipModificationTime] = useState(0);
  
  // Fetch participants data on load and at intervals
  useEffect(() => {
    fetchParticipants();
    fetchUnmatchedParticipants();
    fetchRelationships();
    
    if (activeTab === "approvals") {
      fetchPendingApprovals();
    }
    
    if (activeTab === "badges") {
      fetchBadges();
    }
    
    // Load persistent state from localStorage
    const storedMatchFetchTime = localStorage.getItem(getDepartmentStorageKey('lastMatchFetchTime'));
    const storedModificationTime = localStorage.getItem('lastRelationshipModificationTime');
    const storedMatches = localStorage.getItem(getDepartmentStorageKey('mentorMenteesData'));
    
    if (storedMatchFetchTime) {
      setLastMatchFetchTime(parseInt(storedMatchFetchTime));
    }
    
    if (storedModificationTime) {
      setLastRelationshipModificationTime(parseInt(storedModificationTime));
    } else {
      // If no modification time is set, set it to the same as fetch time to avoid false stale warnings
      if (storedMatchFetchTime) {
        setLastRelationshipModificationTime(parseInt(storedMatchFetchTime));
        localStorage.setItem('lastRelationshipModificationTime', storedMatchFetchTime);
      }
    }
    
    if (storedMatches) {
      try {
        const parsedMatches = JSON.parse(storedMatches);
        
        // Only use stored matches if there is actual data
        if (Object.keys(parsedMatches).length > 0) {
          setMentorMentees(parsedMatches);
          setMatchesFetched(true);
          
          // Generate CSV content from stored matches
          let csvContent = "Mentor Registration No,Mentor Name,Mentor's Semester,Mentee Registration No,Mentee Name,Mentee's Semester\n";
          
          for (const [mentorName, data] of Object.entries(parsedMatches)) {
            const { mentorInfo, mentees } = data;
            
            mentees.forEach(({ name, registration_no, semester }) => {
              csvContent += `${mentorInfo.registration_no},${mentorName},${mentorInfo.semester},${registration_no},${name},${semester}\n`;
            });
          }
          
          setCsvData(csvContent);
        } else {
          console.log("Stored matches data is empty, not using it.");
        }
      } catch (error) {
        console.error("Error parsing stored matches:", error);
      }
    }
    
    const intervalId = setInterval(() => {
      fetchParticipants();
      fetchUnmatchedParticipants();
      fetchRelationships();
    }, statsRefreshInterval * 1000);
    
    return () => clearInterval(intervalId);
  }, [statsRefreshInterval, activeTab, statusFilter]);
  
  // Helper function to get authorization headers
  const getAuthHeaders = () => {
    const authToken = localStorage.getItem("authToken");
    const tokenType = localStorage.getItem("tokenType") || "Bearer"; // Default to Bearer if not set
    
    if (!authToken) return {};
    
    return { 
      'Authorization': `${tokenType} ${authToken}`
    };
  };
  
  // Update the fetchParticipants function with the helper
  const fetchParticipants = async () => {
    try {
      // Update to use the status-filtered endpoint if a status filter is applied
      let url;
      if (statusFilter !== 'all') {
        url = `https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/participants/status/list/${statusFilter}/`;
      } else {
        url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/participants/list/";
      }
      
      const headers = getAuthHeaders();
      console.log("Fetching participants with auth:", headers);
      
      const response = await axios.get(url, { headers });
      console.log("Participants response:", response.data);
      
      // Check if the response has department_filter from a department admin
      if (response.data.department_filter) {
        console.log("Department filter info from API:", response.data.department_filter);
        setDepartmentInfo(response.data.department_filter);
      }
      
      // Ensure we're always setting an array of participants
      const participantsData = response.data.participants || response.data;
      setParticipants(Array.isArray(participantsData) ? participantsData : []);
      
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching participants:", error);
      console.error("Error details:", error.response?.data || error.message);
      setErrorMessage("Failed to fetch participants. Please try again.");
      // Set empty array on error
      setParticipants([]);
    }
  };

  // Update the fetchUnmatchedParticipants function
  const fetchUnmatchedParticipants = async () => {
    setIsLoadingUnmatched(true);
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/unmatched";
      const headers = getAuthHeaders();
      
      const response = await axios.get(url, { headers });
      setUnmatchedParticipants(response.data.unmatched_participants || []);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching unmatched participants:", error);
    } finally {
      setIsLoadingUnmatched(false);
    }
  };

  // Update the fetchMatches function to use the auth headers
  const fetchMatches = async (forceRefresh = false) => {
    // Check if matches are already fetched to prevent redundancy
    if (!forceRefresh && matchesFetched && Object.keys(mentorMentees).length > 0 && !areMatchesStale) {
      const confirmAgain = confirm(
        "Matches have already been fetched. Fetching again might cause data redundancy. Do you want to proceed anyway?"
      );
      if (!confirmAgain) {
        return;
      }
    }
    
    setIsLoading(true);
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/match/";
      const headers = getAuthHeaders();
      
      console.log("Fetching matches with auth:", headers);
      const response = await axios.get(url, { headers });
      const data = response.data;
      
      // Log the full response data to debug
      console.log("Match API response:", data);

      // If the API returns a message that all participants are already matched
      if (data.message && data.message.includes("already matched")) {
        // In this case, we'll fetch the relationships directly and convert them to the mentorMentees format
        const relationshipsData = await fetchRelationships(true); // pass true to get the data returned
        
        const mentorMenteesObj = {};
        
        // Process relationships into mentorMentees format
        relationshipsData.forEach(relationship => {
          const mentor = relationship.mentor;
          const mentee = relationship.mentee;
          
          if (!mentor || !mentee) return; // Skip if missing data
          
          const mentorName = mentor.name;
          
          if (!mentorMenteesObj[mentorName]) {
            mentorMenteesObj[mentorName] = {
              mentorInfo: {
                name: mentorName,
                registration_no: mentor.registration_no,
                semester: mentor.semester,
                branch: mentor.branch
              },
              mentees: []
            };
          }
          
          mentorMenteesObj[mentorName].mentees.push({
            name: mentee.name,
            registration_no: mentee.registration_no,
            semester: mentee.semester,
            branch: mentee.branch
          });
        });
        
        // Update the mentor-mentee data with the current relationships
        setMentorMentees(mentorMenteesObj);
        setMatchesFetched(true);
        
        // Save to localStorage and update timestamp
        const now = Date.now();
        setLastMatchFetchTime(now);
        localStorage.setItem(getDepartmentStorageKey('lastMatchFetchTime'), now.toString());
        localStorage.setItem(getDepartmentStorageKey('mentorMenteesData'), JSON.stringify(mentorMenteesObj));
        
        // Generate CSV content
        let csvContent = "Mentor Registration No,Mentor Name,Mentor's Semester,Mentee Registration No,Mentee Name,Mentee's Semester\n";
        
        for (const [mentorName, data] of Object.entries(mentorMenteesObj)) {
          const { mentorInfo, mentees } = data;
          
          mentees.forEach(({ name, registration_no, semester }) => {
            csvContent += `${mentorInfo.registration_no},${mentorName},${mentorInfo.semester},${registration_no},${name},${semester}\n`;
          });
        }
        
        setCsvData(csvContent);
        setErrorMessage(`${data.message}. Showing current mentor-mentee relationships.`);
        setIsLoading(false);
        return;
      }

      // Check if data.matches exists and is an array
      if (!data || !data.matches || !Array.isArray(data.matches)) {
        console.error("Invalid response format: Expected data.matches to be an array", data);
        setErrorMessage("Received an invalid response format from the server. Please try again.");
        setIsLoading(false);
        return;
      }

      const mentorMenteesObj = {};
      data.matches.forEach(({ mentor, mentee }) => {
        const { registration_no, name, semester: menteeSemester } = mentee;
        const { name: mentorName, semester: mentorSemester, registration_no: mentorRegistrationNo } = mentor;
        
        if (!mentorMenteesObj[mentorName]) {
          mentorMenteesObj[mentorName] = {
            mentorInfo: {
              name: mentorName,
              registration_no: mentorRegistrationNo,
              semester: mentorSemester
            },
            mentees: []
          };
        }
        
        mentorMenteesObj[mentorName].mentees.push({ 
          name, 
          registration_no, 
          semester: menteeSemester
        });
      });

      setMentorMentees(mentorMenteesObj);
      setMatchesFetched(true);

      // Save to localStorage and update timestamp
      const now = Date.now();
      setLastMatchFetchTime(now);
      localStorage.setItem(getDepartmentStorageKey('lastMatchFetchTime'), now.toString());
      localStorage.setItem(getDepartmentStorageKey('mentorMenteesData'), JSON.stringify(mentorMenteesObj));

      // Refresh unmatched participants after matching
      fetchUnmatchedParticipants();

      // Generate CSV content
      let csvContent = "Mentor Registration No,Mentor Name,Mentor's Semester,Mentee Registration No,Mentee Name,Mentee's Semester\n";
      
      for (const [mentorName, data] of Object.entries(mentorMenteesObj)) {
        const { mentorInfo, mentees } = data;
        
        mentees.forEach(({ name, registration_no, semester }) => {
          csvContent += `${mentorInfo.registration_no},${mentorName},${mentorInfo.semester},${registration_no},${name},${semester}\n`;
        });
      }

      setCsvData(csvContent);
      setErrorMessage("");
      
    } catch (error) {
      console.error("Error fetching matches:", error);
      
      // Extract detailed error information from the API response
      const errorData = error.response?.data;
      console.error("Error response data:", errorData);
      
      if (errorData) {
        // Handle structured error responses
        if (errorData.error === "Approval required before matching") {
          // Display specific message for approval required
          setErrorMessage(
            `${errorData.message || "There are participants pending approval"}. ${errorData.action_required || "Please approve or reject pending participants before matching."} (Pending: ${errorData.pending_count || "unknown number"})`
          );
          
          // Auto-switch to approval tab if there are pending approvals
          if (errorData.pending_count > 0) {
            setActiveTab("participants");
            setActiveFilter("pending");
          }
        } else if (errorData.error === "Not enough participants") {
          // Handle case where there aren't enough participants
          setErrorMessage(
            `${errorData.message || "Not enough participants for matching"}. ${errorData.action_required || "Please ensure there are enough mentors and mentees in the system."}`
          );
        } else if (errorData.error === "No mentors available") {
          // Handle case where there are no mentors
          setErrorMessage(
            `${errorData.message || "No mentors available for matching"}. ${errorData.action_required || "Please ensure there are approved mentor participants in the system."}`
          );
        } else if (errorData.error === "No mentees available") {
          // Handle case where there are no mentees
          setErrorMessage(
            `${errorData.message || "No mentees available for matching"}. ${errorData.action_required || "Please ensure there are approved mentee participants in the system."}`
          );
        } else if (errorData.message) {
          // Use generic message from API if available
          setErrorMessage(`Error: ${errorData.message}`);
        } else {
          // Fallback to generic error message
          setErrorMessage(`Failed to fetch matches: ${error.message || "Unknown error"}`);
        }
      } else {
        // Default error message if no structured response
        setErrorMessage(`Failed to fetch matches: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = () => {
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mentor_mentee_matches.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredMentorMentees = useMemo(() => {
    if (!searchTerm) return mentorMentees;
    
    return Object.entries(mentorMentees).reduce((acc, [mentor, data]) => {
      const { mentees, mentorInfo } = data;
      
      // Filter mentees by search term
      const matchedMentees = mentees.filter(
        ({ name }) => name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // If mentor name matches OR any mentee matches, include this entry
      if (
        mentor.toLowerCase().includes(searchTerm.toLowerCase()) || 
        matchedMentees.length > 0
      ) {
        acc[mentor] = {
          mentorInfo,
          mentees: matchedMentees.length > 0 ? matchedMentees : mentees
        };
      }
      return acc;
    }, {});
  }, [mentorMentees, searchTerm]);

  // Count mentors and mentees from the matches
  const matchesStats = useMemo(() => {
    if (Object.keys(mentorMentees).length === 0) return { mentors: 0, mentees: 0 };
    
    const uniqueMentors = new Set(Object.keys(mentorMentees));
    const uniqueMentees = new Set();
    
    Object.values(mentorMentees).forEach(({ mentees }) => {
      mentees.forEach(mentee => {
        uniqueMentees.add(mentee.registration_no);
      });
    });
    
    return {
      mentors: uniqueMentors.size,
      mentees: uniqueMentees.size
    };
  }, [mentorMentees]);

  // Calculate unmatched stats
  const unmatchedStats = useMemo(() => {
    if (!unmatchedParticipants.length) return { mentors: 0, mentees: 0 };
    
    const mentors = unmatchedParticipants.filter(p => 
      p.mentoring_preferences && 
      p.mentoring_preferences.toLowerCase() === "mentor"
    ).length;
    
    const mentees = unmatchedParticipants.filter(p => 
      p.mentoring_preferences && 
      p.mentoring_preferences.toLowerCase() === "mentee"
    ).length;
    
    return { mentors, mentees };
  }, [unmatchedParticipants]);

  const viewParticipantDetails = (participant) => {
    setSelectedParticipant(participant);
    setShowParticipantModal(true);
    if (participant.registration_no) {
      fetchParticipantBadges(participant.registration_no);
      fetchParticipantProofs(participant.registration_no);
    }
  };

  const closeParticipantModal = () => {
    setShowParticipantModal(false);
    setSelectedParticipant(null);
  };

  const viewUnmatchedParticipantDetails = (participant) => {
    setSelectedUnmatchedParticipant(participant);
    setShowUnmatchedParticipantModal(true);
  };

  const closeUnmatchedParticipantModal = () => {
    setShowUnmatchedParticipantModal(false);
    setSelectedUnmatchedParticipant(null);
  };

  const filteredUnmatchedParticipants = useMemo(() => {
    return unmatchedParticipants.filter(participant => {
      const matchesTechStack = !techStackFilter || 
        (participant.tech_stack && 
         participant.tech_stack.toLowerCase().includes(techStackFilter.toLowerCase()));
      
      const matchesPreference = !mentoringPreferenceFilter || 
        (participant.mentoring_preferences && 
         participant.mentoring_preferences.toLowerCase() === mentoringPreferenceFilter.toLowerCase());
      
      return matchesTechStack && matchesPreference;
    });
  }, [unmatchedParticipants, techStackFilter, mentoringPreferenceFilter]);

  // Update the fetchRelationships function
  const fetchRelationships = async (returnData = false) => {
    setIsLoadingRelationships(true);
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/relationships/list/";
      const headers = getAuthHeaders();
      
      const response = await axios.get(url, { headers });
      
      // The response contains an array of relationships directly
      let relationshipsData = response.data.relationships || response.data || [];
      
      // Ensure relationshipsData is an array
      if (!Array.isArray(relationshipsData)) {
        console.warn("relationshipsData is not an array:", relationshipsData);
        relationshipsData = [];
      }
      
      // Check if the response has department_filter from a department admin
      if (response.data.department_filter) {
        console.log("Department filter from relationships:", response.data.department_filter);
        setDepartmentInfo(response.data.department_filter);
      }
      
      setRelationships(relationshipsData);
      
      // Calculate relationship statistics
      const uniqueMentorIds = new Set();
      const uniqueMenteeIds = new Set();
      
      relationshipsData.forEach(rel => {
        if (rel.mentor && rel.mentor.registration_no) {
          uniqueMentorIds.add(rel.mentor.registration_no);
        }
        if (rel.mentee && rel.mentee.registration_no) {
          uniqueMenteeIds.add(rel.mentee.registration_no);
        }
      });
      
      setRelationshipStats({
        totalRelationships: relationshipsData.length,
        uniqueMentors: uniqueMentorIds.size,
        uniqueMentees: uniqueMenteeIds.size
      });
      
      setErrorMessage("");
      
      // Return data if requested
      if (returnData) {
        return relationshipsData;
      }
      
      return relationshipsData;
    } catch (error) {
      console.error("Error fetching relationships:", error);
      setErrorMessage("Failed to fetch mentor-mentee relationships. Please try again.");
      
      // Set empty array on error
      setRelationships([]);
      return [];
    } finally {
      setIsLoadingRelationships(false);
    }
  };
  
  // Function to manually assign a mentee to a mentor
  const assignMenteesToMentor = async () => {
    if (!selectedMentor || !selectedMentee) {
      setErrorMessage("Please select both a mentor and a mentee.");
      return;
    }
    
    setIsAssigning(true);
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/relationships/create/";
      const headers = getAuthHeaders();
      
      const response = await axios.post(url, {
        mentor_registration_no: selectedMentor.registration_no,
        mentee_registration_no: selectedMentee.registration_no
      }, { headers });
      
      if (response.status === 201 || response.status === 200) {
        // Refresh relationships
        await fetchRelationships();
        // Refresh unmatched participants
        await fetchUnmatchedParticipants();
        
        // Update modification time
        updateRelationshipModificationTime();
        
        setErrorMessage("");
        setShowAssignmentModal(false);
        setSelectedMentor(null);
        setSelectedMentee(null);
        
        alert("Mentor-mentee relationship created successfully!");
      }
    } catch (error) {
      console.error("Error assigning mentee to mentor:", error);
      
      // Add specific error message for department validation failures
      if (error.response?.data?.error?.includes('department')) {
        setErrorMessage("You can only create relationships within your department.");
      } else {
        setErrorMessage("Failed to create mentor-mentee relationship. Please try again.");
      }
    } finally {
      setIsAssigning(false);
    }
  };
  
  // Function to open the assignment modal
  const openAssignmentModal = (participant = null) => {
    if (participant) {
      // Determine if participant is likely to be a mentor or mentee based on
      // preference, or if not set, based on semester (higher semester = likely mentor)
      const preferredRole = participant.mentoring_preferences?.toLowerCase();
      
      if (preferredRole === "mentor") {
        setSelectedMentor(participant);
        setMentorRegInput(participant.registration_no);
      } else if (preferredRole === "mentee") {
        setSelectedMentee(participant);
        setMenteeRegInput(participant.registration_no);
      } else {
        // If no preference is set, try to guess based on semester
        const semester = parseInt(participant.semester);
        if (semester && semester >= 5) { // Higher semester students are likely mentors
          setSelectedMentor(participant);
          setMentorRegInput(participant.registration_no);
        } else {
          setSelectedMentee(participant);
          setMenteeRegInput(participant.registration_no);
        }
      }
    }
    setShowAssignmentModal(true);
  };

  // Function to open batch assignment modal
  const openBatchAssignmentModal = (participant) => {
    setBatchAssignmentParticipant(participant);
    setSelectedBatchParticipants([]);
    setShowBatchAssignmentModal(true);
  };

  // Function to handle batch assignment
  const handleBatchAssignment = async () => {
    if (!batchAssignmentParticipant || selectedBatchParticipants.length === 0) {
      alert("Please select at least one participant to assign.");
      return;
    }
    
    setIsBatchAssigning(true);
    
    try {
      const isMentor = batchAssignmentParticipant.mentoring_preferences?.toLowerCase() === "mentor" || 
                       (parseInt(batchAssignmentParticipant.semester) >= 5);
      
      // Filter out any participants that have the same registration number as the batch assignment participant
      const validParticipants = selectedBatchParticipants.filter(
        participant => participant.registration_no !== batchAssignmentParticipant.registration_no
      );
      
      if (validParticipants.length < selectedBatchParticipants.length) {
        alert("Warning: Removed participant(s) that had the same registration number as the mentor/mentee.");
      }
      
      if (validParticipants.length === 0) {
        alert("No valid participants to assign. Cannot assign someone to themselves.");
        setIsBatchAssigning(false);
        return;
      }
      
      const promises = validParticipants.map(participant => {
        const payload = isMentor ? 
          {
            mentor_registration_no: batchAssignmentParticipant.registration_no,
            mentee_registration_no: participant.registration_no
          } : 
          {
            mentor_registration_no: participant.registration_no,
            mentee_registration_no: batchAssignmentParticipant.registration_no
          };
        
        return axios.post("https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/relationships/create/", payload);
      });
      
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;
      
      await fetchRelationships();
      await fetchUnmatchedParticipants();
      
      // Update modification time
      updateRelationshipModificationTime();
      
      alert(`Assignment complete!\n${successful} relationships created successfully.\n${failed} relationships failed to create.`);
      
      setShowBatchAssignmentModal(false);
      setBatchAssignmentParticipant(null);
      setSelectedBatchParticipants([]);
    } catch (error) {
      console.error("Error in batch assignment:", error);
      alert("Error performing batch assignment. Please try again.");
    } finally {
      setIsBatchAssigning(false);
    }
  };

  // Then in the Relationships tab section, replace the search input
  <div className="flex flex-col md:flex-row gap-4">
    <div className="relative w-full md:w-64">
      <input
        type="text"
        placeholder="Search by name or ID..."
        value={relationshipSearchTerm}
        onChange={(e) => setRelationshipSearchTerm(e.target.value)}
        className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
          clipRule="evenodd"
        />
      </svg>
    </div>
    <Button
      onClick={() => openAssignmentModal()}
      className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg"
    >
      Manually Assign Mentor-Mentee
    </Button>
  </div>

  // Then in the table add filterred relationships directly in the JSX
  {relationships
    .filter(rel => {
      if (!relationshipSearchTerm) return true;
      
      const searchLower = relationshipSearchTerm.toLowerCase();
      const mentorName = rel.mentor?.name?.toLowerCase() || '';
      const mentorId = rel.mentor?.registration_no?.toLowerCase() || '';
      const menteeName = rel.mentee?.name?.toLowerCase() || '';
      const menteeId = rel.mentee?.registration_no?.toLowerCase() || '';
      
      return (
        mentorName.includes(searchLower) ||
        mentorId.includes(searchLower) ||
        menteeName.includes(searchLower) ||
        menteeId.includes(searchLower)
      );
    })
    .map((relationship, index) => (
      <tr key={index} className="hover:bg-teal-50">
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{relationship.mentor.registration_no}</td>
        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{relationship.mentor.name}</td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{relationship.mentor.semester}</td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{relationship.mentee.registration_no}</td>
        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{relationship.mentee.name}</td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{relationship.mentee.semester}</td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
          {new Date(relationship.created_at).toLocaleDateString()}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm">
          <button
            onClick={async () => {
              if (confirm(`Are you sure you want to remove the relationship between mentor ${relationship.mentor.name} and mentee ${relationship.mentee.name}?`)) {
                try {
                  const response = await axios.delete(`https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/relationships/delete/${relationship.id}/`);
                  if (response.status === 200 || response.status === 204) {
                    await fetchRelationships();
                    await fetchUnmatchedParticipants();
                    
                    // Update modification time
                    updateRelationshipModificationTime();
                    
                    alert("Relationship deleted successfully!");
                  }
                } catch (error) {
                  console.error("Error deleting relationship:", error);
                  alert("Failed to delete relationship. Please try again.");
                }
              }
            }}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Remove
          </button>
        </td>
      </tr>
    ))}

  // Also let's update the manual assignment modal to improve searching
  function handleMentorSearch(e) {
    const searchQuery = e.target.value.toLowerCase();
    const mentorItems = document.querySelectorAll('.mentor-item');
    
    mentorItems.forEach(item => {
      const name = item.getAttribute('data-name')?.toLowerCase() || '';
      const regNo = item.getAttribute('data-reg-no')?.toLowerCase() || '';
      const techStack = item.getAttribute('data-tech-stack')?.toLowerCase() || '';
      
      if (name.includes(searchQuery) || regNo.includes(searchQuery) || techStack.includes(searchQuery)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }

  function handleMenteeSearch(e) {
    const searchQuery = e.target.value.toLowerCase();
    const menteeItems = document.querySelectorAll('.mentee-item');
    
    menteeItems.forEach(item => {
      const name = item.getAttribute('data-name')?.toLowerCase() || '';
      const regNo = item.getAttribute('data-reg-no')?.toLowerCase() || '';
      
      if (name.includes(searchQuery) || regNo.includes(searchQuery)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }

  // Replace the assignMenteesToMentor function to use direct registration numbers
  const assignByRegistrationNumbers = async () => {
    if (!mentorRegInput || !menteeRegInput) {
      setErrorMessage("Please enter both mentor and mentee registration numbers.");
      return;
    }
    
    // Prevent assigning a person to themselves
    if (mentorRegInput === menteeRegInput) {
      setErrorMessage("Cannot assign a person to themselves. Please use different registration numbers.");
      return;
    }
    
    setIsAssigning(true);
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/relationships/create/";
      const headers = getAuthHeaders();
      
      const response = await axios.post(url, {
        mentor_registration_no: mentorRegInput,
        mentee_registration_no: menteeRegInput
      }, { headers });
      
      if (response.status === 201 || response.status === 200) {
        // Refresh relationships
        await fetchRelationships();
        // Refresh unmatched participants
        await fetchUnmatchedParticipants();
        
        // Update modification time
        updateRelationshipModificationTime();
        
        setErrorMessage("");
        setMentorRegInput('');
        setMenteeRegInput('');
        
        alert("Mentor-mentee relationship created successfully!");
      }
    } catch (error) {
      console.error("Error assigning mentee to mentor:", error);
      
      // Add specific error message for department validation failures
      if (error.response?.data?.error?.includes('department')) {
        setErrorMessage("You can only create relationships within your department.");
      } else {
        setErrorMessage("Failed to create mentor-mentee relationship. Please check registration numbers and try again.");
      }
    } finally {
      setIsAssigning(false);
    }
  };

  // Add states for tech stack matching assignment
  const [showTechStackMatchModal, setShowTechStackMatchModal] = useState(false);
  const [currentUnmatchedParticipant, setCurrentUnmatchedParticipant] = useState(null);
  const [potentialMentors, setPotentialMentors] = useState([]);
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);

  // Function to find mentors based on tech stack
  const findMentorsByTechStack = async (participant) => {
    if (!participant) return;
    
    setCurrentUnmatchedParticipant(participant);
    setIsLoadingMentors(true);
    
    try {
      // Find potential mentors from participants list
      const potentialMentorsList = participants.filter(p => {
        // Must be a mentor or higher semester student
        const isMentor = p.mentoring_preferences?.toLowerCase() === "mentor";
        const isHigherSemester = parseInt(p.semester) > parseInt(participant.semester || "0");
        
        // Tech stack comparison (case insensitive)
        const matchingTechStack = p.tech_stack && participant.tech_stack && 
          p.tech_stack.toLowerCase().includes(participant.tech_stack.toLowerCase());
        
        // Must not be the same person
        const isDifferentPerson = p.registration_no !== participant.registration_no;
        
        return isDifferentPerson && (isMentor || isHigherSemester) && matchingTechStack;
      });
      
      // Sort mentors by tech stack similarity and semester (higher semester first)
      const sortedMentors = potentialMentorsList.sort((a, b) => {
        // First sort by exact tech stack match
        const aExactMatch = a.tech_stack?.toLowerCase() === participant.tech_stack?.toLowerCase();
        const bExactMatch = b.tech_stack?.toLowerCase() === participant.tech_stack?.toLowerCase();
        
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
        
        // Then by semester (higher first)
        return parseInt(b.semester || "0") - parseInt(a.semester || "0");
      });
      
      setPotentialMentors(sortedMentors);
      setShowTechStackMatchModal(true);
    } catch (error) {
      console.error("Error finding mentors:", error);
      alert("Error finding matching mentors");
    } finally {
      setIsLoadingMentors(false);
    }
  };

  // Function to assign directly to selected mentor
  const assignToMentor = async (mentor) => {
    if (!currentUnmatchedParticipant || !mentor) {
      alert("Missing mentor or mentee information");
      return;
    }
    
    setIsAssigning(true);
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/relationships/create/";
      
      // Determine who is mentor and who is mentee
      let mentorRegNo, menteeRegNo;
      
      // If the current unmatched participant is a mentee, assign to selected mentor
      if (currentUnmatchedParticipant.mentoring_preferences?.toLowerCase() === "mentee" || 
          parseInt(currentUnmatchedParticipant.semester || "0") < parseInt(mentor.semester || "0")) {
        mentorRegNo = mentor.registration_no;
        menteeRegNo = currentUnmatchedParticipant.registration_no;
      } else {
        // If unmatched is a mentor, they become the mentor for the selected "mentor" (who is actually a mentee)
        mentorRegNo = currentUnmatchedParticipant.registration_no;
        menteeRegNo = mentor.registration_no;
      }
      
      const response = await axios.post(url, {
        mentor_registration_no: mentorRegNo,
        mentee_registration_no: menteeRegNo
      });
      
      if (response.status === 201 || response.status === 200) {
        // Refresh relationships and unmatched participants
        await fetchRelationships();
        await fetchUnmatchedParticipants();
        
        // Update modification time
        updateRelationshipModificationTime();
        
        setShowTechStackMatchModal(false);
        setCurrentUnmatchedParticipant(null);
        setPotentialMentors([]);
        
        alert("Mentor-mentee relationship created successfully!");
      }
    } catch (error) {
      console.error("Error assigning to mentor:", error);
      alert("Failed to create mentor-mentee relationship. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  // Add helper function to update relationship modification timestamp
  const updateRelationshipModificationTime = () => {
    const now = Date.now();
    setLastRelationshipModificationTime(now);
    localStorage.setItem('lastRelationshipModificationTime', now.toString());
  };

  // Computed property to check if matches are stale
  const areMatchesStale = useMemo(() => {
    // If times are not set or equal, matches are not stale
    if (!matchesFetched || lastMatchFetchTime === 0 || lastRelationshipModificationTime === 0) {
      return false;
    }
    
    const isStale = lastRelationshipModificationTime > lastMatchFetchTime;
    
    // Debug information
    console.log("Checking if matches are stale:", {
      matchesFetched,
      lastRelationshipModificationTime,
      lastMatchFetchTime,
      isStale,
      timeDifference: lastRelationshipModificationTime - lastMatchFetchTime
    });
    
    return isStale;
  }, [matchesFetched, lastRelationshipModificationTime, lastMatchFetchTime]);

  // Helper function to convert branch abbreviation to full name
  const getBranchFullName = (branchCode) => {
    const branchMap = {
      'cse': 'Computer Science and Engineering',
      'ct': 'Computer Technology',
      'aids': 'Artificial Intelligence and Data Science',
      'aiml': 'Artificial Intelligence and Machine Learning',
      'cse-iot': 'Computer Science and Engineering (IoT)',
      'etc': 'Electronics and Telecommunication Engineering',
      'ee': 'Electrical Engineering',
      'me': 'Mechanical Engineering',
      'ce': 'Civil Engineering',
      'it': 'Information Technology',
      'csd': 'Computer Science and Design'
    };
  
    return branchMap[branchCode.toLowerCase()] || 'Unknown Branch';
  };
  

  // Then add the fetchPendingApprovals function after other fetch functions
  const fetchPendingApprovals = async () => {
    setIsLoadingApprovals(true);
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/admin/approvals/pending/";
      const response = await axios.get(url);
      setPendingApprovals(response.data.participants || []);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      // Don't set error message here as it would override other errors
    } finally {
      setIsLoadingApprovals(false);
    }
  };

  // Add function to handle approval/rejection
  const handleApprovalUpdate = async (registrationNo, approvalStatus, reason = '') => {
    setIsProcessingApproval(true);
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/admin/approvals/update/";
      const payload = {
        registration_no: registrationNo,
        approval_status: approvalStatus
      };
      
      // Add reason if rejecting
      if (approvalStatus === 'rejected') {
        if (!reason.trim()) {
          alert('Please provide a reason for rejection');
          setIsProcessingApproval(false);
          return;
        }
        payload.reason = reason;
      }
      
      const response = await axios.post(url, payload);
      
      if (response.status === 200) {
        // Refresh pending approvals
        await fetchPendingApprovals();
        // Also refresh participants since approval status may have changed
        await fetchParticipants();
        
        setRejectionReason('');
        setShowApprovalDetailModal(false);
        setSelectedApprovalParticipant(null);
        
        alert(`Participant ${approvalStatus === 'approved' ? 'approved' : 'rejected'} successfully!`);
      }
    } catch (error) {
      console.error(`Error ${approvalStatus === 'approved' ? 'approving' : 'rejecting'} participant:`, error);
      alert(`Failed to ${approvalStatus === 'approved' ? 'approve' : 'reject'} participant. Please try again.`);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // Add viewApprovalDetails function to view participant details
  const viewApprovalDetails = (participant) => {
    setSelectedApprovalParticipant(participant);
    setShowApprovalDetailModal(true);
    setRejectionReason(''); // Clear previous rejection reason
  };

  const closeApprovalDetailModal = () => {
    setShowApprovalDetailModal(false);
    setSelectedApprovalParticipant(null);
    setRejectionReason('');
  };

  const pendingApprovalCount = useMemo(() => {
    return participants.filter(p => p.approval_status === 'pending').length;
  }, [participants]);

  // Add function to handle participant status update
  const updateParticipantStatus = async (registrationNo, newStatus, reason = '') => {
    setIsUpdatingStatus(true);
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/participants/status/update/";
      const payload = {
        registration_no: registrationNo,
        status: newStatus
      };
      
      // Add reason if deactivating
      if (newStatus === 'deactivated') {
        if (!reason.trim()) {
          alert('Please provide a reason for deactivation');
          setIsUpdatingStatus(false);
          return;
        }
        payload.reason = reason;
      }
      
      const response = await axios.post(url, payload);
      
      if (response.status === 200) {
        // Refresh participants list
        await fetchParticipants();
        
        setDeactivationReason('');
        setShowStatusModal(false);
        setParticipantForStatus(null);
        
        // Check if any mentee relationships were affected
        if (response.data.note && response.data.note.includes('mentee relationships')) {
          alert(`Status updated successfully. ${response.data.note}`);
        } else {
          alert(`Participant status successfully updated to ${newStatus}`);
        }
      }
    } catch (error) {
      console.error(`Error updating participant status:`, error);
      alert(`Failed to update participant status. Please try again.`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  // Open status update modal
  const openStatusUpdateModal = (participant) => {
    setParticipantForStatus(participant);
    setDeactivationReason('');
    setShowStatusModal(true);
  };
  
  // Close status update modal
  const closeStatusModal = () => {
    setShowStatusModal(false);
    setParticipantForStatus(null);
    setDeactivationReason('');
  };

  // Fetch all badges
  const fetchBadges = async () => {
    setIsLoadingBadges(true);
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/badges/list/";
      const response = await axios.get(url);
      setBadges(response.data);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching badges:", error);
      setErrorMessage("Failed to fetch badges. Please try again.");
    } finally {
      setIsLoadingBadges(false);
    }
  };
  
  // Fetch participant badges
  const fetchParticipantBadges = async (registrationNo) => {
    if (!registrationNo) return;
    
    setIsLoadingParticipantBadges(true);
    try {
      const url = `https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/participants/badges/${registrationNo}/`;
      const response = await axios.get(url);
      setParticipantBadges(response.data.badges);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching participant badges:", error);
      setErrorMessage("Failed to fetch participant badges. Please try again.");
    } finally {
      setIsLoadingParticipantBadges(false);
    }
  };
  
  // Create a new badge
  const createBadge = async () => {
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/badges/create/";
      const response = await axios.post(url, badgeFormData);
      
      if (response.status === 201) {
        // Refresh badges list
        await fetchBadges();
        
        // Reset form and close modal
        setBadgeFormData({
          name: '',
          description: '',
          points_required: 0,
          icon_url: '',
          badge_type: 'achievement'
        });
        setShowBadgeCreateModal(false);
        
        alert("Badge created successfully!");
      }
    } catch (error) {
      console.error("Error creating badge:", error);
      alert("Failed to create badge. Please try again.");
    }
  };
  
  // Award badge to participant
  const awardBadge = async (badgeId, participantId) => {
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/badges/award/";
      const response = await axios.post(url, {
        badge_id: badgeId,
        participant_id: participantId
      });
      
      if (response.status === 201) {
        // Refresh participant badges if viewing that participant
        if (participantForBadge && participantForBadge.registration_no === participantId) {
          await fetchParticipantBadges(participantId);
        }
        
        setShowBadgeAwardModal(false);
        setSelectedBadge(null);
        
        alert("Badge awarded successfully!");
      }
    } catch (error) {
      console.error("Error awarding badge:", error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert("Failed to award badge. Please try again.");
      }
    }
  };
  
  // Handle badge form input changes
  const handleBadgeFormChange = (e) => {
    const { name, value } = e.target;
    setBadgeFormData(prev => ({
      ...prev,
      [name]: name === 'points_required' ? parseInt(value) || 0 : value
    }));
  };
  
  // Open badge award modal for a participant
  const openBadgeAwardModal = (participant) => {
    setParticipantForBadge(participant);
    fetchParticipantBadges(participant.registration_no);
    fetchBadges();
    setShowBadgeAwardModal(true);
  };

  // Delete badge from participant
  const deleteBadge = async (force = false) => {
    if (!badgeToDelete || !participantForBadge) return;
    
    setIsDeletingBadge(true);
    setDeleteError(null);
    
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/badges/delete/";
      const response = await axios.delete(url, {
        data: {
          participant_id: participantForBadge.registration_no,
          badge_id: badgeToDelete.badge?.id || badgeToDelete.badge_details?.id,
          force: force
        }
      });
      
      // Refresh participant badges
      await fetchParticipantBadges(participantForBadge.registration_no);
      
      // Close dialogs
      setIsDeleteDialogOpen(false);
      setIsForceDeleteDialogOpen(false);
      setBadgeToDelete(null);
      
      alert("Badge deleted successfully!");
    } catch (error) {
      console.error("Error deleting badge:", error);
      
      // Check if it's a claimed badge and we need to force delete
      if (error.response?.data?.claimed && !force) {
        setIsDeleteDialogOpen(false);
        setIsForceDeleteDialogOpen(true);
        return;
      }
      
      setDeleteError(error.response?.data?.error || "Failed to delete badge. Please try again.");
    } finally {
      setIsDeletingBadge(false);
    }
  };

  // Delete badge definition (removes badge completely from system)
  const deleteBadgeDefinition = async () => {
    if (!badgeToDelete) return;
    
    setIsDeletingBadge(true);
    setDeleteError(null);
    
    try {
      const url = `https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/badges/delete-type/${badgeToDelete.id}/`;
      const response = await axios.delete(url);
      
      // Refresh badges list
      await fetchBadges();
      
      // Close dialog
      setIsDeleteDefinitionDialogOpen(false);
      setBadgeToDelete(null);
      
      alert("Badge definition deleted successfully!");
    } catch (error) {
      console.error("Error deleting badge definition:", error);
      
      if (error.response?.data?.error === "Badge is in use") {
        setDeleteError("This badge has been awarded to participants and cannot be deleted. Remove all instances first.");
      } else {
        setDeleteError(error.response?.data?.error || "Failed to delete badge. Please try again.");
      }
    } finally {
      setIsDeletingBadge(false);
    }
  };

  // Add effect to fetch feedback data when tab is active
  useEffect(() => {
    if (activeTab === "feedback") {
      fetchFeedbackSettings();
      fetchAppFeedbackSummary();
      
      // Reset user eligibility search when tab becomes active
      setEligibilitySearchTerm('');
      setSelectedUser(null);
    }
  }, [activeTab]);
  
  // Fetch feedback settings
  const fetchFeedbackSettings = async () => {
    setIsLoadingFeedbackSettings(true);
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/feedback/settings/";
      const headers = getAuthHeaders();
      
      const response = await axios.get(url, { headers });
      setFeedbackSettings(response.data);
    } catch (error) {
      console.error("Error fetching feedback settings:", error);
      alert("Failed to fetch feedback settings. Please try again.");
    } finally {
      setIsLoadingFeedbackSettings(false);
    }
  };
  
  // Update feedback settings
  const updateFeedbackSettings = async () => {
    setIsSavingFeedbackSettings(true);
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/feedback/settings/update/";
      const headers = getAuthHeaders();
      
      const payload = {
        mentor_feedback_enabled: feedbackSettings.mentor_feedback_enabled,
        app_feedback_enabled: feedbackSettings.app_feedback_enabled,
        allow_anonymous_feedback: feedbackSettings.allow_anonymous_feedback,
        feedback_start_date: feedbackSettings.feedback_start_date,
        feedback_end_date: feedbackSettings.feedback_end_date
      };
      
      const response = await axios.post(url, payload, { headers });
      
      if (response.status === 200) {
        setFeedbackSettings(response.data.settings);
        alert("Feedback settings updated successfully!");
      }
    } catch (error) {
      console.error("Error updating feedback settings:", error);
      alert("Failed to update feedback settings. Please try again.");
    } finally {
      setIsSavingFeedbackSettings(false);
    }
  };
  
  const sendFeedbackReminders = async (feedbackType = 'all') => {
    try {
      setIsLoadingFeedbackSettings(true);
      const response = await axios.post(
        `https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/feedback/send-reminders/`,
        { feedback_type: feedbackType },
        { headers: getAuthHeaders() }
      );
      
      if (response.status === 200) {
        toast.success("Reminders sent successfully", {
          description: `Feedback reminders for ${feedbackType === 'all' ? 'all types' : feedbackType + ' feedback'} have been sent.`
        });
      }
    } catch (error) {
      console.error("Error sending feedback reminders:", error);
      toast.error("Error sending reminders", {
        description: error.response?.data?.detail || "Failed to send feedback reminders."
      });
    } finally {
      setIsLoadingFeedbackSettings(false);
    }
  };
  
  // Get mentor feedback data
  const fetchMentorFeedback = async (mentorId) => {
    setIsLoadingMentorFeedback(true);
    try {
      const url = `https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/feedback/mentor/${mentorId}/`;
      const headers = getAuthHeaders();
      
      const response = await axios.get(url, { headers });
      setMentorFeedback(response.data.feedback || []);
      setFeedbackSelectedMentor(response.data.mentor);
    } catch (error) {
      console.error("Error fetching mentor feedback:", error);
      alert("Failed to fetch mentor feedback. Please try again.");
    } finally {
      setIsLoadingMentorFeedback(false);
    }
  };
  
  // Get application feedback summary
  const fetchAppFeedbackSummary = async () => {
    setIsLoadingAppFeedback(true);
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/feedback/app/summary/";
      const headers = getAuthHeaders();
      
      const response = await axios.get(url, { headers });
      setAppFeedback(response.data.feedback || []);
      
      // Extract stats
      const stats = {
        feedback_count: response.data.feedback_count || 0,
        average_ratings: response.data.average_ratings || {
          usability: 0,
          features: 0,
          performance: 0,
          overall: 0,
          nps: 0
        },
        nps: response.data.nps || {
          score: 0,
          promoters: 0,
          passives: 0,
          detractors: 0
        }
      };
      
      setAppFeedbackStats(stats);
    } catch (error) {
      console.error("Error fetching application feedback:", error);
      alert("Failed to fetch application feedback. Please try again.");
    } finally {
      setIsLoadingAppFeedback(false);
    }
  };
  
  // Delete feedback item
  const deleteFeedback = async (feedbackType, feedbackId) => {
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/feedback/delete/";
      const headers = getAuthHeaders();
      
      const payload = {
        feedback_type: feedbackType,
        feedback_id: feedbackId
      };
      
      const response = await axios.delete(url, { 
        headers,
        data: payload
      });
      
      if (response.status === 200) {
        alert(response.data.message || "Feedback deleted successfully!");
        
        // Refresh the appropriate feedback list
        if (feedbackType === 'mentor') {
          if (feedbackSelectedMentor) {
            fetchMentorFeedback(feedbackSelectedMentor.registration_no);
          }
        } else {
          fetchAppFeedbackSummary();
        }
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("Failed to delete feedback. Please try again.");
    }
  };
  
  // Handle feedback setting changes
  const handleFeedbackSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFeedbackSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Fetch user eligibility status
  const fetchUserEligibility = async (registrationNo) => {
    setIsLoadingUserEligibility(true);
    try {
      const url = `https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/feedback/eligibility/${registrationNo}/`;
      const headers = getAuthHeaders();
      
      const response = await axios.get(url, { headers });
      setSelectedUser({
        registration_no: registrationNo,
        ...response.data
      });
      
      // Initialize override values with current values
      setUserEligibilityOverrides({
        mentor_feedback_eligible: response.data.mentor_feedback_eligible,
        app_feedback_eligible: response.data.app_feedback_eligible,
        override_until: response.data.override_until || ''
      });
      
    } catch (error) {
      console.error("Error fetching user eligibility:", error);
      alert("Failed to fetch user eligibility. Please try again.");
    } finally {
      setIsLoadingUserEligibility(false);
    }
  };

  // Update user eligibility overrides
  const updateUserEligibility = async () => {
    setIsUpdatingUserEligibility(true);
    try {
      const url = "https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/feedback/eligibility/update/";
      const headers = getAuthHeaders();
      
      const payload = {
        registration_no: selectedUser.registration_no,
        mentor_feedback_eligible: userEligibilityOverrides.mentor_feedback_eligible,
        app_feedback_eligible: userEligibilityOverrides.app_feedback_eligible,
        override_until: userEligibilityOverrides.override_until
      };
      
      const response = await axios.post(url, payload, { headers });
      
      if (response.status === 200) {
        // Refresh the user's eligibility status
        await fetchUserEligibility(selectedUser.registration_no);
        alert("User feedback eligibility updated successfully!");
      }
    } catch (error) {
      console.error("Error updating user eligibility:", error);
      alert("Failed to update user eligibility. Please try again.");
    } finally {
      setIsUpdatingUserEligibility(false);
    }
  };

  // Handle eligibility override changes
  const handleEligibilityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserEligibilityOverrides(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add a function to handle navigation back to home
  const handleBackToHome = () => {
    router.push('/');
  };

  // Add this helper function near the top, after departmentInfo state is defined
  function getDepartmentStorageKey(suffix) {
    const code = departmentInfo?.code || "global";
    return `${suffix}_${code}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-indigo-100 shadow-lg border-b-2 border-indigo-200 px-8 py-7 flex items-center justify-between rounded-b-xl">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleBackToHome}
            className="flex items-center text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-extrabold text-indigo-800 tracking-tight drop-shadow-sm">
            {isDepartmentAdmin && departmentInfo 
              ? `${departmentInfo.name} Admin Dashboard` 
              : "Admin Dashboard"}
          </h1>
        </div>
        <span className="text-sm font-semibold text-indigo-700 bg-indigo-100 px-4 py-1 rounded-full shadow">
          Admin {isDepartmentAdmin && departmentInfo ? `(${departmentInfo.code})` : ""}
        </span>
      </div>

      {/* Main content container with padding */}
      <div className="container mx-auto py-8 px-6">
        {/* Department info display */}
        {departmentInfo && (
          <div className={`mb-8 p-5 bg-gradient-to-r from-${getDepartmentThemeColor(departmentInfo.code).light} to-indigo-50 border-l-8 border-${getDepartmentThemeColor(departmentInfo.code).border} rounded-xl shadow-md`}> 
            <div className="flex items-center justify-center">
              <div className={`p-3 bg-${getDepartmentThemeColor(departmentInfo.code).light} text-${getDepartmentThemeColor(departmentInfo.code).text}-700 rounded-full mr-4 shadow-sm`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-bold text-${getDepartmentThemeColor(departmentInfo.code).text}-900`}> 
                  {departmentInfo.name} Department Admin
                </h3>
                <p className={`text-sm text-${getDepartmentThemeColor(departmentInfo.code).text}-700`}> 
                  You are viewing data for the {departmentInfo.name} ({departmentInfo.code}) department only
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs - Modern, spacious, and centered design */}
        <div className="bg-white shadow-lg rounded-xl mb-10 overflow-x-auto">
          <div className="flex justify-center w-full min-w-max border-b-2 border-indigo-100">
            <button
              className={`px-6 py-4 mx-1 whitespace-nowrap font-medium text-sm border-b-2 transition-colors duration-200 ${activeTab === "participants" ? "border-blue-600 text-blue-700 bg-blue-50" : "border-transparent text-gray-500 hover:text-blue-700 hover:bg-gray-50"}`}
              onClick={() => setActiveTab("participants")}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                All Participants
                {pendingApprovalCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {pendingApprovalCount}
                  </span>
                )}
              </div>
            </button>
            <button
              className={`px-6 py-4 mx-1 whitespace-nowrap font-medium text-sm border-b-2 transition-colors duration-200 ${activeTab === "unmatched" ? "border-purple-600 text-purple-700 bg-purple-50" : "border-transparent text-gray-500 hover:text-purple-700 hover:bg-gray-50"}`}
              onClick={() => setActiveTab("unmatched")}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Unmatched Students
              </div>
            </button>
            <button
              className={`px-6 py-4 mx-1 whitespace-nowrap font-medium text-sm border-b-2 transition-colors duration-200 ${activeTab === "relationships" ? "border-teal-600 text-teal-700 bg-teal-50" : "border-transparent text-gray-500 hover:text-teal-700 hover:bg-gray-50"}`}
              onClick={() => setActiveTab("relationships")}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Mentor-Mentee Pairs
              </div>
            </button>
            <button
              className={`px-6 py-4 mx-1 whitespace-nowrap font-medium text-sm border-b-2 transition-colors duration-200 ${activeTab === "matching" ? "border-green-600 text-green-700 bg-green-50" : "border-transparent text-gray-500 hover:text-green-700 hover:bg-gray-50"}`}
              onClick={() => setActiveTab("matching")}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Auto-Match
              </div>
            </button>
            <button
              className={`px-6 py-4 mx-1 whitespace-nowrap font-medium text-sm border-b-2 transition-colors duration-200 ${activeTab === "badges" ? "border-indigo-600 text-indigo-700 bg-indigo-50" : "border-transparent text-gray-500 hover:text-indigo-700 hover:bg-gray-50"}`}
              onClick={() => setActiveTab("badges")}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Badges & Rewards
              </div>
            </button>
            <button
              className={`px-6 py-4 mx-1 whitespace-nowrap font-medium text-sm border-b-2 transition-colors duration-200 ${activeTab === "feedback" ? "border-amber-600 text-amber-700 bg-amber-50" : "border-transparent text-gray-500 hover:text-amber-700 hover:bg-gray-50"}`}
              onClick={() => setActiveTab("feedback")}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                User Feedback
              </div>
            </button>
          </div>
        </div>

        <main className="space-y-10">
          {/* Stats Cards */}
          <section className="grid md:grid-cols-4 gap-8">
            <div className="bg-white shadow-xl rounded-xl p-7 border-l-8 border-indigo-400">
              <h3 className="text-xl font-semibold text-gray-700">Total Participants</h3>
              <p className="text-4xl font-extrabold text-indigo-700 mt-2">{stats.total}</p>
              <div className="flex justify-between mt-2">
                <p className="text-sm text-gray-500">Registered Students</p>
                {pendingApprovalCount > 0 && (
                  <span className="text-sm font-medium text-red-600">
                    {pendingApprovalCount} pending approval
                  </span>
                )}
              </div>
            </div>
            <div className="bg-white shadow-xl rounded-xl p-7 border-l-8 border-green-400">
              <h3 className="text-xl font-semibold text-gray-700">Matched Mentors</h3>
              <p className="text-4xl font-extrabold text-green-700 mt-2">
                {relationshipStats.uniqueMentors}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Active Mentors with Mentees
              </p>
            </div>
            <div className="bg-white shadow-xl rounded-xl p-7 border-l-8 border-purple-400">
              <h3 className="text-xl font-semibold text-gray-700">Matched Mentees</h3>
              <p className="text-4xl font-extrabold text-purple-700 mt-2">
                {relationshipStats.uniqueMentees}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Students with Assigned Mentors
              </p>
            </div>
            
            <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-amber-500">
              <h3 className="text-xl font-semibold text-gray-700">Total Connections</h3>
              <p className="text-4xl font-bold text-amber-600 mt-2">{relationshipStats.totalRelationships}</p>
              <p className="text-sm text-gray-500 mt-2">Active Mentor-Mentee Pairs</p>
            </div>
          </section>
          
          {errorMessage && (
            <div className={`border-l-4 p-4 rounded mb-8 ${
              errorMessage.includes("pending approval") 
                ? "bg-amber-50 border-amber-500 text-amber-800" 
                : errorMessage.includes("Not enough") 
                  ? "bg-blue-50 border-blue-500 text-blue-800"
                  : "bg-red-50 border-red-500 text-red-800"
            }`} role="alert">
              <div className="flex items-start">
                {errorMessage.includes("pending approval") ? (
                  <div className="flex-shrink-0 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                ) : errorMessage.includes("Not enough") ? (
                  <div className="flex-shrink-0 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex-shrink-0 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">
                    {errorMessage.includes("pending approval") 
                      ? "Action Required: Approval Needed" 
                      : errorMessage.includes("Not enough") 
                        ? "Information: Not Enough Participants"
                        : errorMessage.includes("No mentors") 
                          ? "Information: No Mentors Available"
                          : errorMessage.includes("No mentees") 
                            ? "Information: No Mentees Available"
                            : "Error Occurred"}
                  </h3>
                  <p className="mb-3">{errorMessage}</p>
                  
                  {/* Show action buttons for specific errors */}
                  {errorMessage.includes("pending approval") && (
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          setActiveTab("participants");
                          setActiveFilter("pending");
                        }}
                        className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors mr-3"
                      >
                        View Pending Approvals
                      </button>
                    </div>
                  )}
                  
                  {(errorMessage.includes("Not enough") || 
                   errorMessage.includes("No mentors") || 
                   errorMessage.includes("No mentees")) && (
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          // Open tab with unmatched participants
                          setActiveTab("unmatched");
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-3"
                      >
                        View Unmatched Participants
                      </button>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => setErrorMessage("")}
                  className="ml-auto text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === "participants" && (
            <section className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6 bg-gray-50 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">Participant Management</h2>
                  <span className="tooltip" title="Manage all program participants, approve new registrations, and view participant details">
                    <Info className="w-4 h-4 text-gray-400" />
                  </span>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <div className="relative w-full md:w-64">
                    <input
                      type="text"
                      placeholder="Search participants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-4 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="graduated">Graduated</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                  <select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="pl-4 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Approvals</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              
              {participants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg. No</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {participants
                        .filter(p => 
                          (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.registration_no?.includes(searchTerm) ||
                          p.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.mentoring_preferences?.toLowerCase().includes(searchTerm.toLowerCase())) &&
                          (statusFilter === 'all' || p.status === statusFilter) &&
                          (activeFilter === 'all' || p.approval_status === activeFilter)
                        )
                        .map((participant, index) => (
                          <tr key={index} className={`hover:bg-blue-50 ${participant.approval_status === 'pending' ? 'bg-amber-50' : participant.approval_status === 'rejected' ? 'bg-red-50' : ''}`}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {participant.approval_status === 'pending' ? (
                                <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">Pending</span>
                              ) : participant.approval_status === 'approved' ? (
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {participant.status === 'active' ? (
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Active</span>
                              ) : participant.status === 'graduated' ? (
                                <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">Graduated</span>
                              ) : participant.status === 'deactivated' ? (
                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Deactivated</span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Active</span> // Default to active
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{participant.registration_no}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{participant.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{participant.semester}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{getBranchFullName(participant.branch)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {participant.mentoring_preferences === 'mentor' ? (
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Mentor</span>
                              ) : participant.mentoring_preferences === 'mentee' ? (
                                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">Mentee</span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => viewParticipantDetails(participant)}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs"
                                >
                                  View Details
                                </button>
                                {participant.approval_status === 'approved' && (
                                  <button
                                    onClick={() => openStatusUpdateModal(participant)}
                                    className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors text-xs"
                                  >
                                    Change Status
                                  </button>
                                )}
                                {participant.approval_status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApprovalUpdate(participant.registration_no, 'approved')}
                                      className="px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs"
                                      disabled={isProcessingApproval}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedApprovalParticipant(participant);
                                        setShowApprovalDetailModal(true);
                                        // Set focus to rejection reason textarea when modal opens
                                        setTimeout(() => {
                                          const textarea = document.getElementById('rejection-reason');
                                          if (textarea) textarea.focus();
                                        }, 100);
                                      }}
                                      className="px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs"
                                      disabled={isProcessingApproval}
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No participants found
                </div>
              )}
            </section>
          )}

          {activeTab === "unmatched" && (
            <section className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6 bg-gray-50 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">Unmatched Participants</h2>
                  <span className="tooltip" title="This is the preference selected by the participant. Actual roles are assigned after matching.">
                    <Info className="w-4 h-4 text-gray-400" />
                  </span>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filter by tech stack..."
                      value={techStackFilter}
                      onChange={(e) => setTechStackFilter(e.target.value)}
                      className="pl-4 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={mentoringPreferenceFilter}
                    onChange={(e) => setMentoringPreferenceFilter(e.target.value)}
                    className="pl-4 pr-4 py-2 border rounded-lg w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Preferences</option>
                    <option value="mentor">Mentors</option>
                    <option value="mentee">Mentees</option>
                  </select>
                </div>
              </div>
              
              {/* Direct Registration Number Assignment Form */}
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="text-lg font-semibold mb-3">Direct Assignment by Registration Number</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label htmlFor="mentorRegInput" className="block text-sm font-medium text-gray-700 mb-1">
                      Mentor Registration Number
                    </label>
                    <input
                      id="mentorRegInput"
                      type="text"
                      placeholder="Enter mentor reg. no."
                      value={mentorRegInput}
                      onChange={(e) => setMentorRegInput(e.target.value)}
                      className="w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="menteeRegInput" className="block text-sm font-medium text-gray-700 mb-1">
                      Mentee Registration Number
                    </label>
                    <input
                      id="menteeRegInput"
                      type="text"
                      placeholder="Enter mentee reg. no."
                      value={menteeRegInput}
                      onChange={(e) => setMenteeRegInput(e.target.value)}
                      className="w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Button
                      onClick={assignByRegistrationNumbers}
                      disabled={isAssigning || !mentorRegInput || !menteeRegInput}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md w-full"
                    >
                      {isAssigning ? "Assigning..." : "Create Relationship"}
                    </Button>
                  </div>
                </div>
                {errorMessage && activeTab === "unmatched" && (
                  <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {errorMessage}
                  </div>
                )}
              </div>
              
              {isLoadingUnmatched ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
                </div>
              ) : filteredUnmatchedParticipants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg. No</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentoring Preference</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tech Stack</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUnmatchedParticipants.map((participant, index) => (
                        <tr key={index} className="hover:bg-purple-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{participant.registration_no}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{participant.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{participant.semester}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{getBranchFullName(participant.branch)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{participant.mentoring_preferences || "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{participant.tech_stack}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => viewUnmatchedParticipantDetails(participant)}
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => openAssignmentModal(participant)}
                                className="px-2 py-1 bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 transition-colors text-xs"
                              >
                                Assign
                              </button>
                              <button
                                onClick={() => openBatchAssignmentModal(participant)}
                                className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-xs"
                              >
                                Batch Assign
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No unmatched participants found
                </div>
              )}
            </section>
          )}

          {activeTab === "matching" && (
            <>
              <div className="flex justify-center mb-6">
                <Button 
                  onClick={() => fetchMatches(true)}
                  disabled={isLoading}
                  className={`${matchesFetched ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2`}
                >
                  {isLoading && <div className="animate-spin h-5 w-5 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>}
                  {isLoading ? "Fetching Matches..." : matchesFetched ? "Refresh Matches" : "Fetch Mentor-Mentee Matches"}
                </Button>
                {matchesFetched && !areMatchesStale && (
                  <div className="ml-4 text-green-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Matches up to date</span>
                  </div>
                )}
              </div>
              
              {matchesFetched && areMatchesStale && (
                <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-700 rounded">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-bold">Matches may be outdated</p>
                      <p>Relationships have been modified since you last fetched matches. We recommend refreshing the matches.</p>
                      <div className="mt-2">
                        <button 
                          onClick={() => fetchMatches(true)}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-sm"
                        >
                          Refresh Matches Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : Object.keys(mentorMentees).length > 0 && (
                <section className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <div className="p-6 bg-gray-50 border-b flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-2xl font-semibold">Mentor-Mentee Matches</h2>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search mentors or mentees..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      {csvData && (
                        <Button 
                          onClick={downloadCSV}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                        >
                          Download CSV
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {Object.entries(filteredMentorMentees).map(([mentorName, data], index) => {
                      const { mentorInfo, mentees } = data;
                      return (
                        <div key={index} className="p-4">
                          {/* Mentor Info */}
                          <div className="mb-4 bg-gray-50 p-3 rounded-lg flex items-center gap-4">
                            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-sm">Mentor</span>
                            <h3 className="text-lg font-medium text-blue-700">
                              {mentorName} (Registration: {mentorInfo.registration_no}, Semester: {mentorInfo.semester})
                            </h3>
                          </div>
                          {/* Mentee Table */}
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {mentees.map((mentee, menteeIndex) => (
                                  <tr key={menteeIndex} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mentee.registration_no}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mentee.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mentee.semester}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getBranchFullName(mentee.branch)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold text-xs">Mentee</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {/* Space between mentor groups */}
                          {index < Object.entries(filteredMentorMentees).length - 1 && 
                            <div className="border-b border-gray-200 my-4"></div>
                          }
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}

          {activeTab === "relationships" && (
            <section className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6 bg-gray-50 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Mentor-Mentee Relationships</h2>
                  <p className="text-gray-500 text-sm">View and manage existing mentor-mentee relationships</p>
                </div>
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={relationshipSearchTerm}
                    onChange={(e) => setRelationshipSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              
              
              {/* Direct Registration Assignment Form */}
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="text-lg font-semibold mb-3">Direct Assignment by Registration Number</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label htmlFor="mentorRegInput" className="block text-sm font-medium text-gray-700 mb-1">
                      Mentor Registration Number
                    </label>
                    <input
                      id="mentorRegInput"
                      type="text"
                      placeholder="Enter mentor reg. no."
                      value={mentorRegInput}
                      onChange={(e) => setMentorRegInput(e.target.value)}
                      className="w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="menteeRegInput" className="block text-sm font-medium text-gray-700 mb-1">
                      Mentee Registration Number
                    </label>
                    <input
                      id="menteeRegInput"
                      type="text"
                      placeholder="Enter mentee reg. no."
                      value={menteeRegInput}
                      onChange={(e) => setMenteeRegInput(e.target.value)}
                      className="w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Button
                      onClick={assignByRegistrationNumbers}
                      disabled={isAssigning || !mentorRegInput || !menteeRegInput}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md w-full"
                    >
                      {isAssigning ? "Assigning..." : "Create Relationship"}
                    </Button>
                  </div>
                </div>
                {errorMessage && (
                  <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {errorMessage}
                  </div>
                )}
              </div>
              
              {isLoadingRelationships ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                </div>
              ) : relationships.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor ID</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor Name</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor Semester</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentee ID</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentee Name</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentee Semester</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(relationships) ? relationships
                        .filter(rel => {
                          if (!relationshipSearchTerm) return true;
                          
                          const searchLower = relationshipSearchTerm.toLowerCase();
                          const mentorName = rel.mentor?.name?.toLowerCase() || '';
                          const mentorId = rel.mentor?.registration_no?.toLowerCase() || '';
                          const menteeName = rel.mentee?.name?.toLowerCase() || '';
                          const menteeId = rel.mentee?.registration_no?.toLowerCase() || '';
                          
                          return (
                            mentorName.includes(searchLower) ||
                            mentorId.includes(searchLower) ||
                            menteeName.includes(searchLower) ||
                            menteeId.includes(searchLower)
                          );
                        })
                        .map((relationship, index) => (
                          <tr key={index} className="hover:bg-teal-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{relationship.mentor.registration_no}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{relationship.mentor.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{relationship.mentor.semester}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{relationship.mentee.registration_no}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{relationship.mentee.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{relationship.mentee.semester}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {new Date(relationship.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <button
                                onClick={async () => {
                                  if (confirm(`Are you sure you want to remove the relationship between mentor ${relationship.mentor.name} and mentee ${relationship.mentee.name}?`)) {
                                    try {
                                      const response = await axios.delete(`https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/relationships/delete/${relationship.id}/`);
                                      if (response.status === 200 || response.status === 204) {
                                        await fetchRelationships();
                                        await fetchUnmatchedParticipants();
                                        
                                        // Update modification time
                                        updateRelationshipModificationTime();
                                        
                                        alert("Relationship deleted successfully!");
                                      }
                                    } catch (error) {
                                      console.error("Error deleting relationship:", error);
                                      alert("Failed to delete relationship. Please try again.");
                                    }
                                  }
                                }}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="8" className="px-4 py-3 text-center text-gray-500">
                              No relationships data available
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No mentor-mentee relationships found</p>
                  <p className="text-sm mt-2">Use the form above to assign mentors to mentees</p>
                </div>
              )}
            </section>
          )}

          {/* Participant Details Modal */}
          {showParticipantModal && selectedParticipant && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Participant Details
                    {selectedParticipant.approval_status === 'pending' && (
                      <span className="ml-3 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">Pending Approval</span>
                    )}
                    {selectedParticipant.approval_status === 'approved' && (
                      <span className="ml-3 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>
                    )}
                    {selectedParticipant.approval_status === 'rejected' && (
                      <span className="ml-3 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>
                    )}
                    {selectedParticipant.status && (
                      <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {selectedParticipant.status === 'active' ? 'Active' : 
                         selectedParticipant.status === 'graduated' ? 'Graduated' : 
                         selectedParticipant.status === 'deactivated' ? 'Deactivated' : 'Active'}
                      </span>
                    )}
                  </h2>
                  <button 
                    onClick={closeParticipantModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Personal Information Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Name</span>
                        <span className="block text-base">{selectedParticipant.name}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Registration No</span>
                        <span className="block text-base">{selectedParticipant.registration_no}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Semester</span>
                        <span className="block text-base">{selectedParticipant.semester}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Branch</span>
                        <span className="block text-base">{getBranchFullName(selectedParticipant.branch)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mentoring Preferences Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Mentoring Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Preference</span>
                        <span className="block text-base">{selectedParticipant.mentoring_preferences}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Previous Experience</span>
                        <span className="block text-base">{selectedParticipant.previous_mentoring_experience || "None"}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="block text-sm font-medium text-gray-500">Tech Stack</span>
                        <span className="block text-base">{selectedParticipant.tech_stack}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="block text-sm font-medium text-gray-500">Areas of Interest</span>
                        <span className="block text-base">{selectedParticipant.areas_of_interest}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Academic Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Academic Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm font-medium text-gray-500">CGPA</span>
                        <span className="block text-base">{selectedParticipant.cgpa}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">SGPA</span>
                        <span className="block text-base">{selectedParticipant.sgpa}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="block text-sm font-medium text-gray-500">Research Papers</span>
                        <span className="block text-base">{selectedParticipant.published_research_papers || "None"}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Experience Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Professional & Extracurricular Experience</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Internship Experience</span>
                        <span className="block text-base">{selectedParticipant.internship_experience && (selectedParticipant.internship_experience.toLowerCase() === "yes" || selectedParticipant.internship_experience === true) ? "Yes" : "No"}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Number of Internships</span>
                        <span className="block text-base">{selectedParticipant.number_of_internships || "0"}</span>
                      </div>
                      {selectedParticipant.internship_description && selectedParticipant.internship_description !== "nan" && (
                        <div className="md:col-span-2">
                          <span className="block text-sm font-medium text-gray-500">Internship Description</span>
                          <span className="block text-base">{selectedParticipant.internship_description}</span>
                        </div>
                      )}
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Seminars/Workshops</span>
                        <span className="block text-base">{selectedParticipant.seminars_or_workshops_attended && (selectedParticipant.seminars_or_workshops_attended.toLowerCase() === "yes" || selectedParticipant.seminars_or_workshops_attended === true) ? "Yes" : "No"}</span>
                      </div>
                      {selectedParticipant.describe_seminars_or_workshops && selectedParticipant.describe_seminars_or_workshops !== "nan" && (
                        <div className="md:col-span-2">
                          <span className="block text-sm font-medium text-gray-500">Seminars/Workshops Description</span>
                          <span className="block text-base">{selectedParticipant.describe_seminars_or_workshops}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Competitions Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Competitions & Hackathons</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Hackathon Participation</span>
                        <span className="block text-base">{selectedParticipant.hackathon_participation || "None"}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Hackathon Wins</span>
                        <span className="block text-base">{selectedParticipant.number_of_wins || "0"}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Total Hackathons</span>
                        <span className="block text-base">{selectedParticipant.number_of_participations || "0"}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Hackathon Role</span>
                        <span className="block text-base">{selectedParticipant.hackathon_role || "None"}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Coding Competitions</span>
                        <span className="block text-base">{selectedParticipant.coding_competitions_participate && (selectedParticipant.coding_competitions_participate.toLowerCase() === "yes" || selectedParticipant.coding_competitions_participate === true) ? "Yes" : "No"}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Competition Level</span>
                        <span className="block text-base">{selectedParticipant.level_of_competition || "N/A"}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Number of Competitions</span>
                        <span className="block text-base">{selectedParticipant.number_of_coding_competitions || "0"}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Rejection Reason Section - show only if rejected */}
                  {selectedParticipant.approval_status === 'rejected' && selectedParticipant.deactivation_reason && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-red-700">Rejection Reason</h3>
                      <p className="text-red-700">{selectedParticipant.deactivation_reason}</p>
                    </div>
                  )}
                  
                  {/* If pending, show approval/rejection options */}
                  {selectedParticipant.approval_status === 'pending' && (
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-amber-700">Approval Decision</h3>
                      <p className="mb-4 text-amber-700">This application is pending your approval. You can approve or reject it below.</p>
                      
                      {/* Rejection reason field */}
                      <div className="mb-4">
                        <label htmlFor="modal-rejection-reason" className="block text-sm font-medium text-gray-700 mb-2">
                          Rejection Reason (required if rejecting)
                        </label>
                        <textarea
                          id="modal-rejection-reason"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Please provide a reason for rejecting this application..."
                          className="w-full p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white h-24"
                        ></textarea>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleApprovalUpdate(selectedParticipant.registration_no, 'approved')}
                          disabled={isProcessingApproval}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300"
                        >
                          {isProcessingApproval ? "Processing..." : "Approve Application"}
                        </button>
                        <button
                          onClick={() => handleApprovalUpdate(selectedParticipant.registration_no, 'rejected', rejectionReason)}
                          disabled={isProcessingApproval || !rejectionReason.trim()}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-300"
                        >
                          {isProcessingApproval ? "Processing..." : "Reject Application"}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Submission Date */}
                  <div className="text-right text-sm text-gray-500">
                    Submitted on: {new Date(selectedParticipant.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  {/* Proofs & Certificates Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Proofs & Certificates</h3>
                    {isLoadingProofs ? (
                      <div className="text-gray-500">Loading proofs...</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {proofTypes.map((type) => (
                          <div key={type} className="flex items-center gap-3 border-b last:border-b-0 py-2">
                            <span className="font-medium capitalize w-40">{type.replace(/_/g, ' ')}</span>
                            {participantProofs[type] ? (
                              <>
                                {participantProofs[type].filetype === 'pdf' ? (
                                  <a
                                    href={participantProofs[type].url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    View PDF
                                  </a>
                                ) : (
                                  <a
                                    href={participantProofs[type].url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    View Image
                                  </a>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400">No proof uploaded</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t p-4 flex justify-end">
                  <button
                    onClick={closeParticipantModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Unmatched Participant Details Modal */}
          {showUnmatchedParticipantModal && selectedUnmatchedParticipant && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Unmatched Participant Details
                  </h2>
                  <button 
                    onClick={closeUnmatchedParticipantModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Personal Information Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Name</span>
                        <span className="block text-base">{selectedUnmatchedParticipant.name}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Registration No</span>
                        <span className="block text-base">{selectedUnmatchedParticipant.registration_no}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Semester</span>
                        <span className="block text-base">{selectedUnmatchedParticipant.semester}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Branch</span>
                        <span className="block text-base">{getBranchFullName(selectedUnmatchedParticipant.branch)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mentoring Preferences Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Mentoring Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Preference</span>
                        <span className="block text-base">{selectedUnmatchedParticipant.mentoring_preferences}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Tech Stack</span>
                        <span className="block text-base">{selectedUnmatchedParticipant.tech_stack}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="block text-sm font-medium text-gray-500">Areas of Interest</span>
                        <span className="block text-base">{selectedUnmatchedParticipant.areas_of_interest}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Academic Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Academic Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm font-medium text-gray-500">CGPA</span>
                        <span className="block text-base">{selectedUnmatchedParticipant.cgpa || "—"}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">SGPA</span>
                        <span className="block text-base">{selectedUnmatchedParticipant.sgpa || "—"}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Experience Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Experience</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Internship Experience</span>
                        <span className="block text-base">{selectedUnmatchedParticipant.internship_experience || "None"}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Hackathon Participation</span>
                        <span className="block text-base">{selectedUnmatchedParticipant.hackathon_participation || "None"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t p-4 flex justify-end">
                  <button
                    onClick={closeUnmatchedParticipantModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Manual Assignment Modal */}
          {showAssignmentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full">
                <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Manually Assign Mentor-Mentee
                  </h2>
                  <button 
                    onClick={() => {
                      setShowAssignmentModal(false);
                      setSelectedMentor(null);
                      setSelectedMentee(null);
                      setMentorRegInput('');
                      setMenteeRegInput('');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mentor Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Select Mentor</h3>
                      
                      {selectedMentor ? (
                        <div className="p-4 border rounded-lg bg-green-50">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{selectedMentor.name}</p>
                              <p className="text-sm text-gray-500">Registration: {selectedMentor.registration_no}</p>
                              <p className="text-sm text-gray-500">Tech Stack: {selectedMentor.tech_stack}</p>
                            </div>
                            <button 
                              onClick={() => {
                                setSelectedMentor(null);
                                setMentorRegInput('');
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Search for mentors..."
                            className="w-full p-2 border rounded-lg"
                            onChange={handleMentorSearch}
                          />
                          
                          <div className="max-h-64 overflow-y-auto border rounded-lg">
                            {unmatchedParticipants
                              .filter(p => p.mentoring_preferences?.toLowerCase() === "mentor")
                              .map((mentor, index) => (
                                <div 
                                  key={index}
                                  className="mentor-item p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                  onClick={() => {
                                    setSelectedMentor(mentor);
                                    setMentorRegInput(mentor.registration_no);
                                  }}
                                  data-name={mentor.name}
                                  data-reg-no={mentor.registration_no}
                                  data-tech-stack={mentor.tech_stack}
                                >
                                  <p className="font-medium">{mentor.name}</p>
                                  <p className="text-sm text-gray-500">Registration: {mentor.registration_no}</p>
                                  <p className="text-sm text-gray-500">Tech Stack: {mentor.tech_stack}</p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Mentee Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Select Mentee</h3>
                      
                      {selectedMentee ? (
                        <div className="p-4 border rounded-lg bg-purple-50">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{selectedMentee.name}</p>
                              <p className="text-sm text-gray-500">Registration: {selectedMentee.registration_no}</p>
                              <p className="text-sm text-gray-500">Semester: {selectedMentee.semester}</p>
                            </div>
                            <button 
                              onClick={() => {
                                setSelectedMentee(null);
                                setMenteeRegInput('');
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Search for mentees..."
                            className="w-full p-2 border rounded-lg"
                            onChange={handleMenteeSearch}
                          />
                          
                          <div className="max-h-64 overflow-y-auto border rounded-lg">
                            {unmatchedParticipants
                              .filter(p => p.mentoring_preferences?.toLowerCase() === "mentee")
                              .map((mentee, index) => (
                                <div 
                                  key={index}
                                  className="mentee-item p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                  onClick={() => {
                                    setSelectedMentee(mentee);
                                    setMenteeRegInput(mentee.registration_no);
                                  }}
                                  data-name={mentee.name}
                                  data-reg-no={mentee.registration_no}
                                >
                                  <p className="font-medium">{mentee.name}</p>
                                  <p className="text-sm text-gray-500">Registration: {mentee.registration_no}</p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="border-t p-4 flex justify-end gap-4">
                  <button
                    onClick={() => {
                      setShowAssignmentModal(false);
                      setSelectedMentor(null);
                      setSelectedMentee(null);
                      setMentorRegInput('');
                      setMenteeRegInput('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={assignByRegistrationNumbers}
                    disabled={isAssigning || !mentorRegInput || !menteeRegInput}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    {isAssigning ? "Assigning..." : "Create Relationship"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tech Stack Matching Modal - Removed */}

          {/* Batch Assignment Modal */}
          {showBatchAssignmentModal && batchAssignmentParticipant && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full">
                <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Batch Assign Mentor-Mentee
                  </h2>
                  <button 
                    onClick={() => {
                      setShowBatchAssignmentModal(false);
                      setBatchAssignmentParticipant(null);
                      setSelectedBatchParticipants([]);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Main Participant */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                        {batchAssignmentParticipant.mentoring_preferences?.toLowerCase() === "mentor" ? "Mentor" : "Mentee"}
                      </h3>
                      
                      <div className="p-4 border rounded-lg bg-green-50">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{batchAssignmentParticipant.name}</p>
                            <p className="text-sm text-gray-500">Registration: {batchAssignmentParticipant.registration_no}</p>
                            <p className="text-sm text-gray-500">Tech Stack: {batchAssignmentParticipant.tech_stack}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Multiple Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                        {batchAssignmentParticipant.mentoring_preferences?.toLowerCase() === "mentor" ? "Select Mentees" : "Select Mentors"}
                      </h3>
                      
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder={`Search for ${batchAssignmentParticipant.mentoring_preferences?.toLowerCase() === "mentor" ? "mentees" : "mentors"}...`}
                          className="w-full p-2 border rounded-lg"
                          onChange={batchAssignmentParticipant.mentoring_preferences?.toLowerCase() === "mentor" ? handleMenteeSearch : handleMentorSearch}
                        />
                        
                        {/* Display selected participants */}
                        {selectedBatchParticipants.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Selected {batchAssignmentParticipant.mentoring_preferences?.toLowerCase() === "mentor" ? "Mentees" : "Mentors"} ({selectedBatchParticipants.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedBatchParticipants.map((participant, index) => (
                                <div key={index} className="flex items-center bg-purple-50 rounded-full py-1 px-3">
                                  <span className="text-sm mr-1">{participant.name}</span>
                                  <button
                                    onClick={() => setSelectedBatchParticipants(prev => 
                                      prev.filter(p => p.registration_no !== participant.registration_no)
                                    )}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="max-h-64 overflow-y-auto border rounded-lg">
                          {unmatchedParticipants
                            .filter(p => {
                              // Only show participants with the opposite role
                              const oppositeRole = batchAssignmentParticipant.mentoring_preferences?.toLowerCase() === "mentor" ? "mentee" : "mentor";
                              // Don't show the current participant
                              const notSelf = p.registration_no !== batchAssignmentParticipant.registration_no;
                              return p.mentoring_preferences?.toLowerCase() === oppositeRole && notSelf;
                            })
                            .map((participant, index) => {
                              // Check if this participant is already selected
                              const isSelected = selectedBatchParticipants.some(
                                p => p.registration_no === participant.registration_no
                              );
                              
                              return (
                                <div 
                                  key={index}
                                  className={`participant-item p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 ${isSelected ? 'bg-purple-50' : ''}`}
                                  onClick={() => {
                                    if (isSelected) {
                                      // If already selected, remove from selection
                                      setSelectedBatchParticipants(prev => 
                                        prev.filter(p => p.registration_no !== participant.registration_no)
                                      );
                                    } else {
                                      // Otherwise add to selection
                                      setSelectedBatchParticipants(prev => [...prev, participant]);
                                    }
                                  }}
                                  data-name={participant.name}
                                  data-reg-no={participant.registration_no}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-medium">{participant.name}</p>
                                      <p className="text-sm text-gray-500">Registration: {participant.registration_no}</p>
                                    </div>
                                    {isSelected && (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t p-4 flex justify-end gap-4">
                  <button
                    onClick={() => {
                      setShowBatchAssignmentModal(false);
                      setBatchAssignmentParticipant(null);
                      setSelectedBatchParticipants([]);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={handleBatchAssignment}
                    disabled={isBatchAssigning || !batchAssignmentParticipant || selectedBatchParticipants.length === 0}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    {isBatchAssigning ? "Assigning..." : "Create Relationships"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Add the Approval Participant Detail Modal */}
          {showApprovalDetailModal && selectedApprovalParticipant && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Participant Approval
                  </h2>
                  <button 
                    onClick={closeApprovalDetailModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Personal Information Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Name</span>
                        <span className="block text-base">{selectedApprovalParticipant.name}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Registration No</span>
                        <span className="block text-base">{selectedApprovalParticipant.registration_no}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Semester</span>
                        <span className="block text-base">{selectedApprovalParticipant.semester}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Branch</span>
                        <span className="block text-base">{getBranchFullName(selectedApprovalParticipant.branch)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mentoring Preferences Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Mentoring Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Preference</span>
                        <span className="block text-base">{selectedApprovalParticipant.mentoring_preferences}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Previous Experience</span>
                        <span className="block text-base">{selectedApprovalParticipant.previous_mentoring_experience || "None"}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="block text-sm font-medium text-gray-500">Tech Stack</span>
                        <span className="block text-base">{selectedApprovalParticipant.tech_stack}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="block text-sm font-medium text-gray-500">Areas of Interest</span>
                        <span className="block text-base">{selectedApprovalParticipant.areas_of_interest}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Academic Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Academic Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm font-medium text-gray-500">CGPA</span>
                        <span className="block text-base">{selectedApprovalParticipant.cgpa}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">SGPA</span>
                        <span className="block text-base">{selectedApprovalParticipant.sgpa}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="block text-sm font-medium text-gray-500">Research Papers</span>
                        <span className="block text-base">{selectedApprovalParticipant.published_research_papers || "None"}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Rejection Reason Section */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-red-700">Rejection Reason (Required if rejecting)</h3>
                    <textarea
                      id="rejection-reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejecting this application..."
                      className="w-full p-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white h-24"
                    ></textarea>
                  </div>
                  
                  {/* Submission Date */}
                  <div className="text-right text-sm text-gray-500">
                    Submitted on: {new Date(selectedApprovalParticipant.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                <div className="border-t p-4 flex justify-end space-x-4">
                  <button
                    onClick={closeApprovalDetailModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApprovalUpdate(selectedApprovalParticipant.registration_no, 'approved')}
                    disabled={isProcessingApproval}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300"
                  >
                    {isProcessingApproval ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleApprovalUpdate(selectedApprovalParticipant.registration_no, 'rejected', rejectionReason)}
                    disabled={isProcessingApproval || !rejectionReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-300"
                  >
                    {isProcessingApproval ? "Processing..." : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Status Update Modal */}
          {showStatusModal && participantForStatus && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    Update Participant Status
                  </h2>
                  <button 
                    onClick={closeStatusModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium">Participant:</span> {participantForStatus.name}
                    </p>
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium">Current Status:</span> {participantForStatus.status || 'Active'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      New Status
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => updateParticipantStatus(participantForStatus.registration_no, 'active')}
                        className={`py-2 px-3 rounded-md border text-center ${participantForStatus.status === 'active' ? 'bg-blue-100 border-blue-300 text-blue-800' : 'border-gray-300 hover:bg-blue-50'}`}
                        disabled={isUpdatingStatus}
                      >
                        Active
                      </button>
                      <button
                        onClick={() => updateParticipantStatus(participantForStatus.registration_no, 'graduated')}
                        className={`py-2 px-3 rounded-md border text-center ${participantForStatus.status === 'graduated' ? 'bg-indigo-100 border-indigo-300 text-indigo-800' : 'border-gray-300 hover:bg-indigo-50'}`}
                        disabled={isUpdatingStatus}
                      >
                        Graduated
                      </button>
                      <button
                        onClick={() => {
                          // For deactivation, we'll require a reason, so just highlight the box
                          document.getElementById('deactivation-reason-input').focus();
                        }}
                        className={`py-2 px-3 rounded-md border text-center ${participantForStatus.status === 'deactivated' ? 'bg-gray-100 border-gray-300 text-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}
                        disabled={isUpdatingStatus}
                      >
                        Deactivate
                      </button>
                    </div>
                  </div>
                  
                  {/* Deactivation reason field */}
                  <div className="space-y-2">
                    <label htmlFor="deactivation-reason-input" className="block text-sm font-medium text-gray-700">
                      Deactivation Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="deactivation-reason-input"
                      value={deactivationReason}
                      onChange={(e) => setDeactivationReason(e.target.value)}
                      placeholder="Required if deactivating the participant..."
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-24"
                    ></textarea>
                    <p className="text-xs text-gray-500">
                      <strong>Note:</strong> Deactivating a mentor will remove all their mentee relationships.
                    </p>
                  </div>
                </div>
                
                <div className="border-t p-4 flex justify-between">
                  <button
                    onClick={closeStatusModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    disabled={isUpdatingStatus}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateParticipantStatus(participantForStatus.registration_no, 'deactivated', deactivationReason)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-300"
                    disabled={isUpdatingStatus || !deactivationReason.trim()}
                  >
                    {isUpdatingStatus ? "Processing..." : "Deactivate Participant"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add the Badges tab content */}
          {activeTab === "badges" && (
            <section className="space-y-8">
              {/* Badges List */}
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6 bg-gray-50 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">Badges & Super Mentors</h2>
                    <p className="text-sm text-gray-500">Create badges and award them to participants</p>
                  </div>
                  <button
                    onClick={() => setShowBadgeCreateModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Create New Badge
                  </button>
                </div>
                
                {isLoadingBadges ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
                  </div>
                ) : badges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                    {badges.map((badge, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          {badge.icon_url ? (
                            <img src={badge.icon_url} alt={badge.name} className="w-10 h-10 object-contain" />
                          ) : (
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-grow">
                            <h3 className="font-semibold text-lg">{badge.name}</h3>
                            <p className="text-sm text-gray-500">{badge.badge_type}</p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setBadgeToDelete(badge);
                              setIsDeleteDefinitionDialogOpen(true);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                            title="Delete badge definition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-gray-700 mb-3">{badge.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Points: {badge.points_required}</span>
                          <button
                            onClick={() => {
                              setSelectedBadge(badge);
                              setShowBadgeAwardModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            Award to Participant
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <p>No badges created yet.</p>
                    <p className="text-sm mt-2">Create badges to reward participants for their achievements.</p>
                  </div>
                )}
              </div>
              
              {/* Super Mentors List */}
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6 bg-gray-50 border-b">
                  <h2 className="text-2xl font-semibold">Super Mentors</h2>
                  <p className="text-sm text-gray-500">Participants with 5 or more badges</p>
                </div>
                
                <div className="p-6">
                  {participants.filter(p => p.is_super_mentor).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {participants
                        .filter(p => p.is_super_mentor)
                        .map((participant, index) => (
                          <div key={index} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-indigo-50 transition-colors">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-medium">{participant.name}</h3>
                              <p className="text-sm text-gray-500">{participant.badges_earned || 0} Badges Earned</p>
                            </div>
                            <button
                              onClick={() => {
                                fetchParticipantBadges(participant.registration_no);
                                setParticipantForBadge(participant);
                                setShowBadgeAwardModal(true);
                              }}
                              className="ml-auto text-indigo-600 hover:text-indigo-800"
                            >
                              View Badges
                            </button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>No super mentors yet.</p>
                      <p className="text-sm mt-2">Participants who earn 5 or more badges will become super mentors.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeTab === "feedback" && (
            <section className="space-y-8">
              {/* Feedback Settings Card */}
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6 bg-gray-50 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">Feedback Settings</h2>
                    <p className="text-sm text-gray-500">Configure feedback collection for mentors and the application</p>
                  </div>
                  <Button
                    onClick={updateFeedbackSettings}
                    disabled={isSavingFeedbackSettings}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {isSavingFeedbackSettings ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
                
                {isLoadingFeedbackSettings ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500"></div>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    {/* Feedback Types */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium border-b pb-2">Feedback Collection</h3>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="mentor_feedback_enabled"
                            name="mentor_feedback_enabled"
                            checked={feedbackSettings.mentor_feedback_enabled}
                            onChange={handleFeedbackSettingChange}
                            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          <label htmlFor="mentor_feedback_enabled" className="text-sm font-medium text-gray-700">
                            Enable Mentor Feedback Collection
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="app_feedback_enabled"
                            name="app_feedback_enabled"
                            checked={feedbackSettings.app_feedback_enabled}
                            onChange={handleFeedbackSettingChange}
                            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          <label htmlFor="app_feedback_enabled" className="text-sm font-medium text-gray-700">
                            Enable Application Feedback Collection
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="allow_anonymous_feedback"
                            name="allow_anonymous_feedback"
                            checked={feedbackSettings.allow_anonymous_feedback}
                            onChange={handleFeedbackSettingChange}
                            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          <label htmlFor="allow_anonymous_feedback" className="text-sm font-medium text-gray-700">
                            Allow Anonymous Feedback
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium border-b pb-2">Feedback Window</h3>
                        
                        <div className="space-y-2">
                          <label htmlFor="feedback_start_date" className="block text-sm font-medium text-gray-700">
                            Start Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            id="feedback_start_date"
                            name="feedback_start_date"
                            value={feedbackSettings.feedback_start_date}
                            onChange={handleFeedbackSettingChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="feedback_end_date" className="block text-sm font-medium text-gray-700">
                            End Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            id="feedback_end_date"
                            name="feedback_end_date"
                            value={feedbackSettings.feedback_end_date}
                            onChange={handleFeedbackSettingChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Feedback Status */}
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                      <h3 className="font-medium mb-2">Current Feedback Status</h3>
                      <p>
                        Feedback collection is {feedbackSettings.mentor_feedback_enabled || feedbackSettings.app_feedback_enabled ? (
                          <span className="font-semibold text-green-600">active</span>
                        ) : (
                          <span className="font-semibold text-red-600">inactive</span>
                        )}
                        {feedbackSettings.feedback_start_date && feedbackSettings.feedback_end_date && (
                          <> from {new Date(feedbackSettings.feedback_start_date).toLocaleString()} to {new Date(feedbackSettings.feedback_end_date).toLocaleString()}</>
                        )}
                      </p>
                      <p className="mt-1">
                        Mentor Feedback: <span className={`font-semibold ${feedbackSettings.mentor_feedback_enabled ? 'text-green-600' : 'text-red-600'}`}>
                          {feedbackSettings.mentor_feedback_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                        &nbsp;&nbsp;|&nbsp;&nbsp;
                        App Feedback: <span className={`font-semibold ${feedbackSettings.app_feedback_enabled ? 'text-green-600' : 'text-red-600'}`}>
                          {feedbackSettings.app_feedback_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </p>
                    </div>
                    
                    {/* Feedback Reminders */}
                    <div className="mt-6">
                      <h3 className="text-lg font-medium border-b pb-2 mb-3">Send Feedback Reminders</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Send email reminders to eligible users to submit their feedback during the active feedback window.
                      </p>
                      
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => sendFeedbackReminders('all')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={isLoadingFeedbackSettings || (!feedbackSettings.mentor_feedback_enabled && !feedbackSettings.app_feedback_enabled)}
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Send All Reminders
                          </div>
                        </Button>
                        
                        <Button
                          onClick={() => sendFeedbackReminders('mentor')}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          disabled={isLoadingFeedbackSettings || !feedbackSettings.mentor_feedback_enabled}
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Mentor Feedback Reminders
                          </div>
                        </Button>
                        
                        <Button
                          onClick={() => sendFeedbackReminders('app')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={isLoadingFeedbackSettings || !feedbackSettings.app_feedback_enabled}
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          App Feedback Reminders
                        </div>
                      </Button>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <Info className="w-3 h-3 mr-1" /> 
                      Reminders will only be sent to eligible users during the active feedback window.
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* App Feedback Summary */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6 bg-gray-50 border-b">
                <h2 className="text-2xl font-semibold">Application Feedback Summary</h2>
                <p className="text-sm text-gray-500">Overview of user feedback about the VidyaSangam platform</p>
              </div>
              
              {isLoadingAppFeedback ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500"></div>
                </div>
              ) : (
                <div className="p-6">
                  {/* NPS and Rating Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-amber-50 p-4 rounded-lg shadow-sm border border-amber-200">
                      <h3 className="text-sm font-medium text-amber-800 mb-1">Net Promoter Score</h3>
                      <p className="text-2xl font-bold text-amber-600">{appFeedbackStats.nps.score}</p>
                      <div className="mt-2 text-xs text-amber-700">
                        <div className="flex justify-between">
                          <span>Promoters: {appFeedbackStats.nps.promoters}</span>
                          <span>Passives: {appFeedbackStats.nps.passives}</span>
                          <span>Detractors: {appFeedbackStats.nps.detractors}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
                      <h3 className="text-sm font-medium text-blue-800 mb-1">Usability Rating</h3>
                      <p className="text-2xl font-bold text-blue-600">{appFeedbackStats.average_ratings.usability.toFixed(1)}/5</p>
                      <div className="mt-2 text-xs text-blue-700">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(appFeedbackStats.average_ratings.usability / 5) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-200">
                      <h3 className="text-sm font-medium text-purple-800 mb-1">Features Rating</h3>
                      <p className="text-2xl font-bold text-purple-600">{appFeedbackStats.average_ratings.features.toFixed(1)}/5</p>
                      <div className="mt-2 text-xs text-purple-700">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(appFeedbackStats.average_ratings.features / 5) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
                      <h3 className="text-sm font-medium text-green-800 mb-1">Overall Rating</h3>
                      <p className="text-2xl font-bold text-green-600">{appFeedbackStats.average_ratings.overall.toFixed(1)}/5</p>
                      <div className="mt-2 text-xs text-green-700">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(appFeedbackStats.average_ratings.overall / 5) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium border-b pb-2 mb-4">All Application Feedback ({appFeedbackStats.feedback_count})</h3>
                  
                  {appFeedback.length > 0 ? (
                    <div className="space-y-4">
                      {appFeedback.map((feedback, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium">{feedback.anonymous ? 'Anonymous User' : feedback.participant_name}</h4>
                              <p className="text-xs text-gray-500">{new Date(feedback.created_at).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-1">
                              <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Usability: {feedback.usability_rating}/5</div>
                              <div className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Features: {feedback.features_rating}/5</div>
                              <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Overall: {feedback.overall_rating}/5</div>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-sm font-medium mb-1">What they like:</h5>
                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{feedback.what_you_like || "No comments provided"}</p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium mb-1">What could be improved:</h5>
                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{feedback.what_to_improve || "No comments provided"}</p>
                              </div>
                            </div>
                            {feedback.feature_requests && (
                              <div className="mt-2">
                                <h5 className="text-sm font-medium mb-1">Feature requests:</h5>
                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{feedback.feature_requests}</p>
                              </div>
                            )}
                            {feedback.additional_comments && (
                              <div className="mt-2">
                                <h5 className="text-sm font-medium mb-1">Additional comments:</h5>
                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{feedback.additional_comments}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3 text-right">
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this feedback?')) {
                                  deleteFeedback('app', feedback.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Delete Feedback
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 text-gray-500">
                      No application feedback has been submitted yet.
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Mentor Feedback Section */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6 bg-gray-50 border-b">
                <h2 className="text-2xl font-semibold">Mentor Feedback</h2>
                <p className="text-sm text-gray-500">View feedback submitted by mentees for their mentors</p>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <label htmlFor="mentorFeedbackSearch" className="block text-sm font-medium text-gray-700 mb-2">
                    Search for a mentor by registration number to view their feedback:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="mentorFeedbackSearch"
                      placeholder="Enter mentor registration number"
                      value={feedbackSearchTerm}
                      onChange={(e) => setFeedbackSearchTerm(e.target.value)}
                      className="w-full md:w-64 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <Button
                      onClick={() => {
                        if (feedbackSearchTerm) {
                          fetchMentorFeedback(feedbackSearchTerm);
                        } else {
                          alert('Please enter a mentor registration number');
                        }
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Search
                    </Button>
                  </div>
                </div>
                
                {isLoadingMentorFeedback ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500"></div>
                  </div>
                ) : feedbackSelectedMentor ? (
                  <div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                      <h3 className="font-medium">Feedback for: {feedbackSelectedMentor.name} ({feedbackSelectedMentor.registration_no})</h3>
                      {mentorFeedback.length > 0 ? (
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white p-3 rounded shadow-sm">
                            <h4 className="text-xs font-medium text-gray-500">COMMUNICATION</h4>
                            <p className="text-xl font-bold text-amber-600">{feedbackSelectedMentor.average_ratings?.communication.toFixed(1)}/5</p>
                          </div>
                          <div className="bg-white p-3 rounded shadow-sm">
                            <h4 className="text-xs font-medium text-gray-500">KNOWLEDGE</h4>
                            <p className="text-xl font-bold text-amber-600">{feedbackSelectedMentor.average_ratings?.knowledge.toFixed(1)}/5</p>
                          </div>
                          <div className="bg-white p-3 rounded shadow-sm">
                            <h4 className="text-xs font-medium text-gray-500">AVAILABILITY</h4>
                            <p className="text-xl font-bold text-amber-600">{feedbackSelectedMentor.average_ratings?.availability.toFixed(1)}/5</p>
                          </div>
                          <div className="bg-white p-3 rounded shadow-sm">
                            <h4 className="text-xs font-medium text-gray-500">OVERALL</h4>
                            <p className="text-xl font-bold text-amber-600">{feedbackSelectedMentor.average_ratings?.overall.toFixed(1)}/5</p>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-gray-600">No feedback has been submitted for this mentor yet.</p>
                      )}
                    </div>
                    
                    {mentorFeedback.length > 0 ? (
                      <div className="space-y-4">
                        {mentorFeedback.map((feedback, index) => (
                          <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium">{feedback.anonymous ? 'Anonymous Mentee' : feedback.mentee_name}</h4>
                                <p className="text-xs text-gray-500">{new Date(feedback.created_at).toLocaleString()}</p>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Comm: {feedback.communication_rating}/5</div>
                                <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Knowledge: {feedback.knowledge_rating}/5</div>
                                <div className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Avail: {feedback.availability_rating}/5</div>
                                <div className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">Help: {feedback.helpfulness_rating}/5</div>
                                <div className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">Overall: {feedback.overall_rating}/5</div>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-sm font-medium mb-1">Strengths:</h5>
                                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{feedback.strengths || "No strengths mentioned"}</p>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium mb-1">Areas for improvement:</h5>
                                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{feedback.areas_for_improvement || "No improvements suggested"}</p>
                                </div>
                              </div>
                              {feedback.additional_comments && (
                                <div className="mt-2">
                                  <h5 className="text-sm font-medium mb-1">Additional comments:</h5>
                                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{feedback.additional_comments}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-3 text-right">
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this feedback?')) {
                                    deleteFeedback('mentor', feedback.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                Delete Feedback
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 text-gray-500">
                        No feedback has been submitted for this mentor yet.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    Search for a mentor to view their feedback.
                  </div>
                )}
              </div>
            </div>

            {/* User Feedback Eligibility Management Section */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-8">
              <div className="p-6 bg-gray-50 border-b">
                <h2 className="text-2xl font-semibold">User Eligibility Management</h2>
                <p className="text-sm text-gray-500">Override feedback eligibility for specific users</p>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <label htmlFor="eligibilitySearch" className="block text-sm font-medium text-gray-700 mb-2">
                    Search for a user by registration number to manage their feedback eligibility:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="eligibilitySearch"
                      placeholder="Enter user registration number"
                      value={eligibilitySearchTerm}
                      onChange={(e) => setEligibilitySearchTerm(e.target.value)}
                      className="w-full md:w-64 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <Button
                      onClick={() => {
                        if (eligibilitySearchTerm) {
                          fetchUserEligibility(eligibilitySearchTerm);
                        } else {
                          alert('Please enter a user registration number');
                        }
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Search
                    </Button>
                  </div>
                </div>
                
                {isLoadingUserEligibility ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500"></div>
                  </div>
                ) : selectedUser ? (
                  <div className="space-y-6">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h3 className="font-medium mb-2">Eligibility Status for User: {selectedUser.registration_no}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Eligibility</h4>
                          <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${selectedUser.mentor_feedback_eligible ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              <span>Mentor Feedback: {selectedUser.mentor_feedback_eligible ? 'Eligible' : 'Not Eligible'}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${selectedUser.app_feedback_eligible ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              <span>App Feedback: {selectedUser.app_feedback_eligible ? 'Eligible' : 'Not Eligible'}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${selectedUser.is_mentee ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                              <span>Is Mentee: {selectedUser.is_mentee ? 'Yes' : 'No'}</span>
                            </li>
                          </ul>
                          
                          {selectedUser.already_submitted_mentor_feedback && (
                            <div className="mt-3 py-1 px-2 bg-blue-100 text-blue-800 text-xs inline-block rounded">
                              Has already submitted mentor feedback
                            </div>
                          )}
                          
                          {selectedUser.already_submitted_app_feedback && (
                            <div className="mt-1 py-1 px-2 bg-purple-100 text-purple-800 text-xs inline-block rounded">
                              Has already submitted app feedback
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Feedback Window</h4>
                          {selectedUser.window ? (
                            <div className="text-sm">
                              <p>Start: {new Date(selectedUser.window.start_date).toLocaleString()}</p>
                              <p>End: {new Date(selectedUser.window.end_date).toLocaleString()}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No feedback window active</p>
                          )}
                          
                          {selectedUser.override_until && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-amber-700">Override active until:</p>
                              <p className="text-sm">{new Date(selectedUser.override_until).toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-5">
                      <h3 className="font-medium border-b pb-2 mb-4">Manage Eligibility Overrides</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="mentor_feedback_eligible"
                            name="mentor_feedback_eligible"
                            checked={userEligibilityOverrides.mentor_feedback_eligible}
                            onChange={handleEligibilityChange}
                            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          <label htmlFor="mentor_feedback_eligible" className="text-sm font-medium text-gray-700">
                            Allow Mentor Feedback Submission
                          </label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="app_feedback_eligible"
                            name="app_feedback_eligible"
                            checked={userEligibilityOverrides.app_feedback_eligible}
                            onChange={handleEligibilityChange}
                            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          <label htmlFor="app_feedback_eligible" className="text-sm font-medium text-gray-700">
                            Allow Application Feedback Submission
                          </label>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="override_until" className="block text-sm font-medium text-gray-700">
                            Override Until (Leave empty for permanent override)
                          </label>
                          <input
                            type="datetime-local"
                            id="override_until"
                            name="override_until"
                            value={userEligibilityOverrides.override_until}
                            onChange={handleEligibilityChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                          />
                          <p className="text-xs text-gray-500">If set, the override will expire after this date and time</p>
                        </div>
                        
                        <div className="pt-3 border-t mt-4">
                          <Button
                            onClick={updateUserEligibility}
                            disabled={isUpdatingUserEligibility}
                            className="bg-amber-600 hover:bg-amber-700 text-white w-full"
                          >
                            {isUpdatingUserEligibility ? "Updating..." : "Update Eligibility Overrides"}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-lg text-sm">
                      <h4 className="font-medium text-amber-800 mb-2">About Eligibility Overrides</h4>
                      <p className="text-amber-700 mb-2">
                        Overrides allow you to make specific users eligible or ineligible for feedback submission,
                        regardless of the global feedback settings. This is useful for:
                      </p>
                      <ul className="list-disc pl-5 text-amber-700 space-y-1">
                        <li>Extending feedback windows for specific users</li>
                        <li>Testing feedback forms outside of the normal collection period</li>
                        <li>Allowing a user to resubmit feedback in special circumstances</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    Search for a user to manage their feedback eligibility.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Badge Create Modal */}
      {showBadgeCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Create New Badge
              </h2>
              <button 
                onClick={() => setShowBadgeCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="badge-name" className="block text-sm font-medium text-gray-700">
                  Badge Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="badge-name"
                  type="text"
                  name="name"
                  value={badgeFormData.name}
                  onChange={handleBadgeFormChange}
                  placeholder="e.g. Outstanding Mentor"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="badge-description" className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="badge-description"
                  name="description"
                  value={badgeFormData.description}
                  onChange={handleBadgeFormChange}
                  placeholder="Describe what this badge represents"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                  required
                ></textarea>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="badge-points" className="block text-sm font-medium text-gray-700">
                  Points Required
                </label>
                <input
                  id="badge-points"
                  type="number"
                  name="points_required"
                  value={badgeFormData.points_required}
                  onChange={handleBadgeFormChange}
                  min="0"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="badge-icon" className="block text-sm font-medium text-gray-700">
                  Icon URL
                </label>
                <input
                  id="badge-icon"
                  type="text"
                  name="icon_url"
                  value={badgeFormData.icon_url}
                  onChange={handleBadgeFormChange}
                  placeholder="https://example.com/badge-icon.png"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="badge-type" className="block text-sm font-medium text-gray-700">
                  Badge Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="badge-type"
                  name="badge_type"
                  value={badgeFormData.badge_type}
                  onChange={handleBadgeFormChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="achievement">Achievement</option>
                  <option value="participation">Participation</option>
                  <option value="skill">Skill</option>
                  <option value="milestone">Milestone</option>
                </select>
              </div>
            </div>
            
            <div className="border-t p-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowBadgeCreateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createBadge}
                disabled={!badgeFormData.name || !badgeFormData.description}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
              >
                Create Badge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Award Badge Modal */}
      {showBadgeAwardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {participantForBadge ? `Badges for ${participantForBadge.name}` : 'Award Badge to Participant'}
              </h2>
              <button 
                onClick={() => {
                  setShowBadgeAwardModal(false);
                  setParticipantForBadge(null);
                  setSelectedBadge(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Select Participant section, shown if no participant is selected yet */}
              {!participantForBadge && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Select a Participant</h3>
                  <input
                    type="text"
                    placeholder="Search by name or registration number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  
                  <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
                    {participants
                      .filter(p => 
                        p.approval_status === 'approved' && 
                        (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.registration_no?.includes(searchTerm))
                      )
                      .map((participant, index) => (
                        <div 
                          key={index}
                          className="p-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center"
                          onClick={() => {
                            setParticipantForBadge(participant);
                            fetchParticipantBadges(participant.registration_no);
                          }}
                        >
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-sm text-gray-500">
                              {participant.registration_no} • 
                              {participant.mentoring_preferences === 'mentor' ? ' Mentor' : ' Mentee'}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {participant.badges_earned || 0} badges
                            {participant.is_super_mentor && (
                              <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                                Super Mentor
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Participant's current badges, shown if a participant is selected */}
              {participantForBadge && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-medium text-gray-900">Current Badges</h3>
                    <div className="text-sm text-gray-500">
                      Total: {participantForBadge.badges_earned || 0}
                      {participantForBadge.is_super_mentor && (
                        <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                          Super Mentor
                        </span>
                      )}
                    </div>
                    {participantForBadge && !selectedBadge && (
                      <button
                        onClick={() => setParticipantForBadge(null)}
                        className="ml-auto text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Change Participant
                      </button>
                    )}
                  </div>
                  
                  {isLoadingParticipantBadges ? (
                    <div className="flex justify-center items-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500"></div>
                    </div>
                  ) : participantBadges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {participantBadges.map((participantBadge, index) => (
                        <div key={index} className="border rounded-lg p-3 flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-medium">{participantBadge.badge_details?.name || participantBadge.badge?.name}</h4>
                            <p className="text-xs text-gray-500">
                              {participantBadge.is_claimed ? 'Claimed' : 'Not claimed yet'} • 
                              {new Date(participantBadge.earned_date || participantBadge.awarded_date).toLocaleDateString()}
                            </p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setBadgeToDelete(participantBadge);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                            title="Delete badge"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">
                      <p>No badges awarded yet.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Select Badge to award, shown if a participant is selected and no badge is selected yet */}
              {participantForBadge && !selectedBadge && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900">Select a Badge to Award</h3>
                  
                  {isLoadingBadges ? (
                    <div className="flex justify-center items-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500"></div>
                    </div>
                  ) : badges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {badges.map((badge, index) => {
                        const alreadyAwarded = participantBadges.some(pb => pb.badge.id === badge.id);
                        return (
                          <div 
                            key={index} 
                            className={`border rounded-lg p-3 ${alreadyAwarded ? 'opacity-50' : 'hover:bg-indigo-50 cursor-pointer'}`}
                            onClick={() => !alreadyAwarded && setSelectedBadge(badge)}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="font-medium">{badge.name}</h4>
                                <p className="text-xs text-gray-500">{badge.badge_type}</p>
                              </div>
                              {alreadyAwarded && (
                                <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                                  Already Awarded
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">{badge.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">
                      <p>No badges available. Create badges first.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Badge confirmation, shown if both participant and badge are selected */}
              {participantForBadge && selectedBadge && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900">Confirm Badge Award</h3>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-indigo-100 text-indigo-700 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">{selectedBadge.name}</h4>
                        <p className="text-gray-700 mb-3">{selectedBadge.description}</p>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Type: {selectedBadge.badge_type}</span>
                          <span>Points: {selectedBadge.points_required}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium">Award to:</p>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        <p>{participantForBadge.name}</p>
                        <p className="text-sm text-gray-500">{participantForBadge.registration_no}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Current badges: {participantForBadge.badges_earned || 0}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Note: The participant will need to claim this badge for it to count toward their Super Mentor status.
                  </p>
                </div>
              )}
            </div>
            
            <div className="border-t p-4 flex justify-between">
              <button
                onClick={() => {
                  if (selectedBadge) {
                    // If badge selected, go back to badge selection
                    setSelectedBadge(null);
                  } else {
                    // Otherwise close the modal
                    setShowBadgeAwardModal(false);
                    setParticipantForBadge(null);
                  }
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                {selectedBadge ? 'Back' : 'Cancel'}
              </button>
              
              {participantForBadge && selectedBadge && (
                <button
                  onClick={() => awardBadge(selectedBadge.id, participantForBadge.registration_no)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Award Badge
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Badge Delete Confirmation Dialog */}
      {isDeleteDialogOpen && badgeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Delete Badge</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete the badge <span className="font-bold">{badgeToDelete.badge_details?.name || badgeToDelete.badge?.name}</span> from {participantForBadge.name}?
              </p>
              
              {deleteError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {deleteError}
                </div>
              )}
            </div>
            
            <div className="border-t p-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setBadgeToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isDeletingBadge}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteBadge(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-300"
                disabled={isDeletingBadge}
              >
                {isDeletingBadge ? "Deleting..." : "Delete Badge"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Delete Confirmation Dialog */}
      {isForceDeleteDialogOpen && badgeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-red-800">Badge Already Claimed</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                The badge <span className="font-bold">{badgeToDelete.badge_details?.name || badgeToDelete.badge?.name}</span> has already been claimed by {participantForBadge.name}.
              </p>
              <p className="text-gray-700">
                Deleting a claimed badge will also remove any points and benefits associated with it. This action cannot be undone.
              </p>
              
              {deleteError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {deleteError}
                </div>
              )}
            </div>
            
            <div className="border-t p-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsForceDeleteDialogOpen(false);
                  setBadgeToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isDeletingBadge}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteBadge(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-300"
                disabled={isDeletingBadge}
              >
                {isDeletingBadge ? "Deleting..." : "Force Delete Badge"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Badge Definition Delete Dialog */}
      {isDeleteDefinitionDialogOpen && badgeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-red-800">Delete Badge Definition</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete the badge <span className="font-bold">{badgeToDelete.name}</span>?
              </p>
              <p className="text-gray-700">
                This will remove the badge definition from the system. If this badge has been awarded to any participants, the deletion will fail unless all instances are removed first.
              </p>
              
              {deleteError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {deleteError}
                </div>
              )}
            </div>
            
            <div className="border-t p-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteDefinitionDialogOpen(false);
                  setBadgeToDelete(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isDeletingBadge}
              >
                Cancel
              </button>
              <button
                onClick={deleteBadgeDefinition}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-300"
                disabled={isDeletingBadge}
              >
                {isDeletingBadge ? "Deleting..." : "Delete Badge Definition"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
</div>
  )}

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}