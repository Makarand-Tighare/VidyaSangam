'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalInfo } from '../sections/personal-info';
import { MentoringPreferences } from '../sections/mentoring-preferences';
import { AcademicAchievements } from '../sections/academic-achievements';
import { CodingCompetitions } from '../sections/coding-competitions';
import { AcademicPerformance } from '../sections/academic-performance';
import { ProfessionalExperience } from '../sections/professional-experience';
import { ExtracurricularActivities } from '../sections/extracurricular-activities';
import { Declaration } from '../sections/declaration';
import { ProgressBar } from '../progress-bar';
import NavBar from '../components/navBar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from "@/components/ui/alert";
import AlreadyPartAnimation from '../components/AlreadyPartAnimation';
import { checkUserMentorMenteeStatus } from '../lib/userStatus';

const sections = [
  'Personal Information',
  'Mentoring Preferences',
  'Academic Achievements',
  'Coding Competitions',
  'Academic Performance',
  'Professional Experience',
  'Extracurricular Activities',
  'Declaration'
];

// Validation rules for each section
const createValidationRules = (formData) => ({
  0: { // Personal Information
    name: (value) => value?.trim() ? null : 'Name is required',
    registrationNumber: (value) => value?.trim() ? null : 'Registration number is required',
    semester: (value) => value ? null : 'Semester is required',
    branch: (value) => value ? null : 'Branch is required',
  },
  1: { // Mentoring Preferences
    mentoringPreference: (value) => value ? null : 'Mentoring preference is required',
    previousExperience: (value) => value !== undefined ? null : 'Please select yes or no',
    techStack: (value) => value?.trim() ? null : 'Tech stack is required',
    areasOfInterest: (value) => value?.trim() ? null : 'Areas of interest are required',
  },
  2: { // Academic Achievements
    researchPapers: (value) => value !== undefined ? null : 'Please select an option',
    hackathonParticipation: (value) => value !== undefined ? null : 'Please select an option',
    hackathonWins: (value) => {
      if (formData?.hackathonParticipation && formData.hackathonParticipation !== 'None') {
        return value !== undefined ? (isNaN(parseInt(value)) || parseInt(value) < 0 ? 'Must be a non-negative number' : null) : 'Number of wins is required';
      }
      return null;
    },
    hackathonParticipations: (value) => {
      if (formData?.hackathonParticipation && formData.hackathonParticipation !== 'None') {
        return value !== undefined ? (isNaN(parseInt(value)) || parseInt(value) < 0 ? 'Must be a non-negative number' : null) : 'Number of participations is required';
      }
      return null;
    },
    hackathonRole: (value) => {
      if (formData?.hackathonParticipation && formData.hackathonParticipation !== 'None' && 
          parseInt(formData.hackathonParticipations) > 0) {
        return value ? null : 'Role is required';
      }
      return null;
    },
    hackathonProof: (value) => {
      if (formData?.hackathonParticipation && formData.hackathonParticipation !== 'None' && 
          parseInt(formData.hackathonParticipations) > 0) {
        const uploadCount = Array.isArray(value) ? value.length : 0;
        return uploadCount === 0 ? 'Please upload proof of hackathon participation' : null;
      }
      return null;
    },
  },
  3: { // Coding Competitions
    codingCompetitions: (value) => value !== undefined ? null : 'Please select yes or no',
    competitionLevel: (value) => {
      if (formData?.codingCompetitions === 'yes') {
        return value ? null : 'Competition level is required';
      }
      return null;
    },
    competitionsCount: (value) => {
      if (formData?.codingCompetitions === 'yes') {
        return value !== undefined ? (isNaN(parseInt(value)) || parseInt(value) < 0 ? 'Must be a non-negative number' : null) : 'Number of competitions is required';
      }
      return null;
    },
    codingCompetitionsProof: (value) => {
      if (formData?.codingCompetitions === 'yes' && 
          parseInt(formData.competitionsCount) > 0) {
        const uploadCount = Array.isArray(value) ? value.length : 0;
        return uploadCount === 0 ? 'Please upload proof of coding competitions' : null;
      }
      return null;
    },
  },
  4: { // Academic Performance
    cgpa: (value) => {
      if (!value) return 'CGPA is required';
      const num = parseFloat(value);
      return (isNaN(num) || num < 0 || num > 10) ? 'CGPA must be between 0 and 10' : null;
    },
    sgpa: (value) => {
      if (!value) return 'SGPA is required';
      const num = parseFloat(value);
      return (isNaN(num) || num < 0 || num > 10) ? 'SGPA must be between 0 and 10' : null;
    },
    academicProof: (value) => {
      const uploadCount = Array.isArray(value) ? value.length : 0;
      return uploadCount === 0 ? 'Please upload proof of academic performance' : null;
    }
  },
  5: { // Professional Experience
    hasInternship: (value) => value !== undefined ? null : 'Please select yes or no',
    internshipCount: (value) => {
      if (formData?.hasInternship === 'yes') {
        return value !== undefined ? (isNaN(parseInt(value)) || parseInt(value) < 0 ? 'Must be a non-negative number' : null) : 'Number of internships is required';
      }
      return null;
    },
    internshipDescription: (value) => {
      if (formData?.hasInternship === 'yes' && parseInt(formData.internshipCount) > 0) {
        return value?.trim() ? null : 'Internship description is required';
      }
      return null;
    },
    internshipProof: (value) => {
      if (formData?.hasInternship === 'yes' && parseInt(formData.internshipCount) > 0) {
        const uploadCount = Array.isArray(value) ? value.length : 0;
        return uploadCount === 0 ? 'Please upload proof of internships' : null;
      }
      return null;
    },
    hasSeminarsWorkshops: (value) => value !== undefined ? null : 'Please select yes or no',
    describeSeminarsWorkshops: (value) => {
      if (formData?.hasSeminarsWorkshops === 'yes') {
        return value?.trim() ? null : 'Please describe the seminars/workshops attended';
      }
      return null;
    },
  },
  6: { // Extracurricular Activities
    hasExtracurricularActivities: (value) => value !== undefined ? null : 'Please select yes or no',
    describeExtracurricularActivities: (value) => {
      if (formData?.hasExtracurricularActivities === 'yes') {
        return value?.trim() ? null : 'Please describe your extracurricular activities';
      }
      return null;
    },
    extracurricularActivitiesProof: (value) => {
      if (formData?.hasExtracurricularActivities === 'yes') {
        const uploadCount = Array.isArray(value) ? value.length : 0;
        return uploadCount === 0 ? 'Please upload proof of extracurricular activities' : null;
      }
      return null;
    },
  },
  7: { // Declaration
    // date is automatically set by backend
    declaration: (value) => value === true ? null : 'You must agree to the declaration',
    signature: (value) => value?.trim() ? null : 'Signature is required',
    date: (value) => value ? null : 'Date is required',
  }
});

export default function MentoringForm() {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({});
  const [formFiles, setFormFiles] = useState({});
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Add state for user status check
  const [userStatus, setUserStatus] = useState({
    isMentorOrMentee: false,
    status: 'Student',
    checking: true
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      // Redirect to login page if the user is not logged in
      router.push("/login");
      return;
    }
    
    // Check if user is already a mentor or mentee
    const checkStatus = async () => {
      try {
        const result = await checkUserMentorMenteeStatus();
        console.log('User status check result:', result);
        setUserStatus({
          isMentorOrMentee: result.isMentorOrMentee,
          status: result.status,
          checking: false
        });
      } catch (error) {
        console.error("Error checking mentor/mentee status:", error);
        setUserStatus({
          isMentorOrMentee: false,
          status: 'Student',
          checking: false
        });
      }
    };
    
    checkStatus();
    
    // Load saved form data
    const savedData = localStorage.getItem('mentoringFormData');
    const savedSection = localStorage.getItem('mentoringFormSection');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
    }
    
    if (savedSection) {
      try {
        const section = parseInt(savedSection);
        setCurrentSection(section);
      } catch (error) {
        console.error("Error parsing saved section:", error);
      }
    }
    
    setIsLoaded(true);
    
  }, [router]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('mentoringFormData', JSON.stringify(formData));
      localStorage.setItem('mentoringFormSection', currentSection.toString());
      setProgress((currentSection / (sections.length - 1)) * 100);
    }
  }, [formData, currentSection, isLoaded]);

  // Validate the current section
  const validateSection = (sectionIndex) => {
    const validationRules = createValidationRules(formData);
    const sectionRules = validationRules[sectionIndex];
    if (!sectionRules) return true;

    const newErrors = {};
    let isValid = true;

    // Apply validation rules
    Object.keys(sectionRules).forEach(field => {
      const validationFunc = sectionRules[field];
      const errorMessage = validationFunc(formData[field]);
      if (errorMessage) {
        newErrors[field] = errorMessage;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setShowErrors(!isValid);
    return isValid;
  };

  const handleNext = () => {
    if (validateSection(currentSection) && currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setShowErrors(false);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setShowErrors(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the final section before submission
    if (!validateSection(currentSection)) {
      return;
    }
    
    setIsSubmitting(true);

    // Create FormData object for file uploads
    const formDataForSubmit = new FormData();
    
    // Transform data to match backend model field names
    const transformedData = {
      name: formData.name,
      registration_no: formData.registrationNumber,
      semester: formData.semester,
      branch: formData.branch,
      mentoring_preferences: formData.mentoringPreference,
      previous_mentoring_experience: formData.previousExperience === 'yes' ? formData.previousExperienceText || 'Yes' : 'No',
      tech_stack: formData.techStack,
      areas_of_interest: formData.areasOfInterest,
      
      // Research
      published_research_papers: formData.researchPapers || 'None',
      
      // Hackathon
      hackathon_participation: formData.hackathonParticipation || 'None',
      number_of_wins: parseInt(formData.hackathonWins) || 0,
      number_of_participations: parseInt(formData.hackathonParticipations) || 0,
      hackathon_role: formData.hackathonRole || null,
      
      // Coding Competitions
      coding_competitions_participate: formData.codingCompetitions || 'no',
      level_of_competition: formData.codingCompetitions === 'yes' ? formData.competitionLevel : null,
      number_of_coding_competitions: parseInt(formData.competitionsCount) || 0,
      
      // Academic Performance
      cgpa: parseFloat(formData.cgpa),
      sgpa: parseFloat(formData.sgpa),
      
      // Internship
      internship_experience: formData.hasInternship || 'no',
      number_of_internships: parseInt(formData.internshipCount) || 0,
      internship_description: formData.internshipDescription || null,
      
      // Seminars & Workshops
      seminars_or_workshops_attended: formData.hasSeminarsWorkshops || 'no',
      describe_seminars_or_workshops: formData.describeSeminarsWorkshops || null,
      
      // Extracurricular Activities
      extracurricular_activities: formData.hasExtracurricularActivities || 'no',
      describe_extracurricular_activities: formData.describeExtracurricularActivities || null,
    };
    
    // Add form fields
    Object.keys(transformedData).forEach(key => {
      if (transformedData[key] !== null && transformedData[key] !== undefined) {
        formDataForSubmit.append(key, transformedData[key]);
      }
    });
    
    // Add file data
    if (formFiles.researchProof && formData.researchPapers !== 'None') {
      Array.from(formFiles.researchProof).forEach((file, index) => {
        formDataForSubmit.append('proof_of_research_publications', file);
      });
    }
    
    if (formFiles.hackathonProof && formData.hackathonParticipation !== 'None') {
      Array.from(formFiles.hackathonProof).forEach((file, index) => {
        formDataForSubmit.append('proof_of_hackathon_participation', file);
      });
    }
    
    if (formFiles.codingCompetitionsProof && formData.codingCompetitions === 'yes') {
      Array.from(formFiles.codingCompetitionsProof).forEach((file, index) => {
        formDataForSubmit.append('proof_of_coding_competitions', file);
      });
    }
    
    if (formFiles.academicProof) {
      Array.from(formFiles.academicProof).forEach((file, index) => {
        formDataForSubmit.append('proof_of_academic_performance', file);
      });
    }
    
    if (formFiles.internshipProof && formData.hasInternship === 'yes') {
      Array.from(formFiles.internshipProof).forEach((file, index) => {
        formDataForSubmit.append('proof_of_internships', file);
      });
    }
    
    if (formFiles.extracurricularActivitiesProof && formData.hasExtracurricularActivities === 'yes') {
      Array.from(formFiles.extracurricularActivitiesProof).forEach((file, index) => {
        formDataForSubmit.append('proof_of_extracurricular_activities', file);
      });
    }

    try {
      console.log('Form Data:', JSON.stringify(transformedData));
      // Use formDataForSubmit for actual submission with files
      const response = await axios.post('http://127.0.0.1:8000/api/mentor_mentee/create/', formDataForSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      setSubmitResult({ success: true, message: 'Application submitted successfully!' });
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitResult({ 
        success: false, 
        message: error.response?.data?.message || 'Error submitting application. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
      setShowModal(true);
    }
  };

  const updateFormData = (sectionData) => {
    const newFormData = { ...formData, ...sectionData };
    
    // Clear dependent fields when parent fields change
    if ('hasInternship' in sectionData) {
      if (sectionData.hasInternship === 'no') {
        // Clear internship-related fields if hasInternship is 'no'
        delete newFormData.internshipCount;
        delete newFormData.internshipDescription;
        // Also remove files
        if (formFiles.internshipProof) {
          const newFormFiles = { ...formFiles };
          delete newFormFiles.internshipProof;
          setFormFiles(newFormFiles);
        }
      }
    }
    
    if ('codingCompetitions' in sectionData) {
      if (sectionData.codingCompetitions === 'no') {
        // Clear coding competitions related fields
        delete newFormData.competitionLevel;
        delete newFormData.competitionsCount;
        // Also remove files
        if (formFiles.codingCompetitionsProof) {
          const newFormFiles = { ...formFiles };
          delete newFormFiles.codingCompetitionsProof;
          setFormFiles(newFormFiles);
        }
      }
    }
    
    if ('hackathonParticipation' in sectionData) {
      if (sectionData.hackathonParticipation === 'None') {
        // Clear hackathon related fields
        delete newFormData.hackathonWins;
        delete newFormData.hackathonParticipations;
        delete newFormData.hackathonRole;
        // Also remove files
        if (formFiles.hackathonProof) {
          const newFormFiles = { ...formFiles };
          delete newFormFiles.hackathonProof;
          setFormFiles(newFormFiles);
        }
      }
    }
    
    if ('researchPapers' in sectionData) {
      if (sectionData.researchPapers === 'None') {
        // Clear research papers related fields
        delete newFormData.paperCount;
        // Also remove files
        if (formFiles.researchProof) {
          const newFormFiles = { ...formFiles };
          delete newFormFiles.researchProof;
          setFormFiles(newFormFiles);
        }
      }
    }
    
    if ('hasExtracurricularActivities' in sectionData) {
      if (sectionData.hasExtracurricularActivities === 'no') {
        // Clear extracurricular activities related fields
        delete newFormData.describeExtracurricularActivities;
        // Also remove files
        if (formFiles.extracurricularActivitiesProof) {
          const newFormFiles = { ...formFiles };
          delete newFormFiles.extracurricularActivitiesProof;
          setFormFiles(newFormFiles);
        }
      }
    }
    
    if ('hasSeminarsWorkshops' in sectionData) {
      if (sectionData.hasSeminarsWorkshops === 'no') {
        // Clear seminars/workshops related fields
        delete newFormData.describeSeminarsWorkshops;
      }
    }
    
    setFormData(newFormData);
    
    // Clear errors for updated fields
    const updatedErrors = { ...errors };
    Object.keys(sectionData).forEach(field => {
      if (updatedErrors[field]) {
        delete updatedErrors[field];
      }
    });
    setErrors(updatedErrors);
  };

  const updateFormFiles = (name, files) => {
    setFormFiles({ ...formFiles, [name]: files });
    // Update form data with file information for validation purposes
    updateFormData({ [name]: files });
  };

  const closeModal = () => {
    setShowModal(false);
    if (submitResult?.success) {
      // Reset form or redirect to a thank you page
      localStorage.removeItem('mentoringFormData');
      localStorage.removeItem('mentoringFormSection');
      setFormData({});
      setFormFiles({});
      setCurrentSection(0);
      router.push('/');
    }
  };

  // Create props for section components
  const sectionProps = {
    data: formData,
    updateData: updateFormData,
    updateFiles: updateFormFiles,
    errors: errors,
    required: true
  };

  // If the component is still loading, show a loading spinner
  if (!isLoaded || userStatus.checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <NavBar />
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If user is already a mentor or mentee, show the animation
  if (userStatus.isMentorOrMentee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <NavBar />
        <AlreadyPartAnimation status={userStatus.status} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <NavBar />
      <div className="p-4 max-w-5xl mx-auto pt-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Mentorship Program Application</h1>
        
        <div className="mb-8">
          <ProgressBar progress={progress} />
        </div>
        
        {/* Error alert */}
        {showErrors && Object.values(errors).some(error => error) && (
          <Alert className="mb-6 border-red-400 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              Please fix the errors before proceeding.
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{sections[currentSection]}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Render the appropriate section based on currentSection */}
            {currentSection === 0 && (
              <PersonalInfo
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}
            {currentSection === 1 && (
              <MentoringPreferences
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}
            {currentSection === 2 && (
              <AcademicAchievements
                formData={formData}
                updateFormData={updateFormData}
                updateFormFiles={updateFormFiles}
                errors={errors}
              />
            )}
            {currentSection === 3 && (
              <CodingCompetitions
                formData={formData}
                updateFormData={updateFormData}
                updateFormFiles={updateFormFiles}
                errors={errors}
              />
            )}
            {currentSection === 4 && (
              <AcademicPerformance
                formData={formData}
                updateFormData={updateFormData}
                updateFormFiles={updateFormFiles}
                errors={errors}
              />
            )}
            {currentSection === 5 && (
              <ProfessionalExperience
                formData={formData}
                updateFormData={updateFormData}
                updateFormFiles={updateFormFiles}
                errors={errors}
              />
            )}
            {currentSection === 6 && (
              <ExtracurricularActivities
                formData={formData}
                updateFormData={updateFormData}
                updateFormFiles={updateFormFiles}
                errors={errors}
              />
            )}
            {currentSection === 7 && (
              <Declaration
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentSection === 0}
            >
              Previous
            </Button>
            
            {currentSection < sections.length - 1 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {/* Result Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {submitResult?.success ? (
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
              )}
              {submitResult?.success ? "Application Submitted" : "Submission Error"}
            </DialogTitle>
            <DialogDescription>
              {submitResult?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={closeModal}>
              {submitResult?.success ? "View Profile" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
