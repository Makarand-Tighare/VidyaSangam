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
import { PersonalDevelopment } from '../sections/personal-development';
import { Declaration } from '../sections/declaration';
import { ProgressBar } from '../progress-bar';
import NavBar from '../components/navBar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const sections = [
  'Personal Information',
  'Mentoring Preferences',
  'Academic Achievements',
  'Coding Competitions',
  'Academic Performance',
  'Professional Experience',
  'Extracurricular Activities',
  'Personal Development',
  'Declaration'
];

export default function MentoringForm() {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({});
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      // Redirect to login page if the user is not logged in
      router.push("/login");
      return;
    }
    
    const savedData = localStorage.getItem('mentoringFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, [router]);

  useEffect(() => {
    localStorage.setItem('mentoringFormData', JSON.stringify(formData));
    setProgress((currentSection / (sections.length - 1)) * 100);
  }, [formData, currentSection]);

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const transformedData = {
      name: formData.name,
      registration_no: formData.registrationNumber,
      semester: formData.semester,
      branch: formData.branch,
      mentoring_preferences: formData.mentoringPreference,
      previous_mentoring_experience: formData.previousExperience,
      tech_stack: formData.techStack,
      areas_of_interest: formData.areasOfInterest,
      published_research_papers: formData.researchPapers,
      hackathon_participation: formData.hackathonParticipation,
      number_of_wins: parseInt(formData.hackathonWins),
      number_of_participations: parseInt(formData.hackathonParticipations),
      hackathon_role: formData.hackathonRole,
      coding_competitions_participate: formData.codingCompetitions,
      level_of_competition: formData.competitionLevel,
      number_of_coding_competitions: parseInt(formData.competitionsCount),
      cgpa: parseFloat(formData.cgpa),
      sgpa: parseFloat(formData.sgpa),
      internship_experience: formData.hasInternship,
      number_of_internships: parseInt(formData.internshipCount),
      seminars_or_workshops_attended: formData.hasSeminarsWorkshops,
      extracurricular_activities: formData.hasExtracurricularActivities,
      short_term_goals: formData.shortTermGoals,
      long_term_goals: formData.longTermGoals,
      strengths_and_weaknesses: formData.strengthsWeaknesses,
      preferred_learning_style: formData.learningStyle,
      areas_for_personal_growth: formData.areasForGrowth,
      date: formData.date 
    };

    try {
      console.log('Form Data:', JSON.stringify(transformedData));
      const response = await axios.post('http://127.0.0.1:8000/api/mentor_mentee/create/', transformedData);
      setSubmitResult({ success: true, message: 'Application submitted successfully!' });
    } catch (error) {
      setSubmitResult({ success: false, message: 'Error submitting application. Please try again.' });
    } finally {
      setIsSubmitting(false);
      setShowModal(true);
    }
  };

  const updateFormData = (sectionData) => {
    setFormData({ ...formData, ...sectionData });
  };

  const closeModal = () => {
    setShowModal(false);
    if (submitResult?.success) {
      // Reset form or redirect to a thank you page
      localStorage.removeItem('mentoringFormData');
      setFormData({});
      setCurrentSection(0);
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#e6f3ff] via-[#f0f8ff] to-[#f5faff] p-2">
      <NavBar/>
      <div className="flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center mb-4">Mentor Mentee Program Application</CardTitle>
            <ProgressBar progress={progress} />
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {currentSection === 0 && <PersonalInfo data={formData} updateData={updateFormData} />}
              {currentSection === 1 && <MentoringPreferences data={formData} updateData={updateFormData} />}
              {currentSection === 2 && <AcademicAchievements data={formData} updateData={updateFormData} />}
              {currentSection === 3 && <CodingCompetitions data={formData} updateData={updateFormData} />}
              {currentSection === 4 && <AcademicPerformance data={formData} updateData={updateFormData} />}
              {currentSection === 5 && <ProfessionalExperience data={formData} updateData={updateFormData} />}
              {currentSection === 6 && <ExtracurricularActivities data={formData} updateData={updateFormData} />}
              {currentSection === 7 && <PersonalDevelopment data={formData} updateData={updateFormData} />}
              {currentSection === 8 && <Declaration data={formData} updateData={updateFormData} />}
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handlePrevious} disabled={currentSection === 0}>Previous</Button>
            {currentSection < sections.length - 1 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {submitResult?.success ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-500" />
              )}
              {submitResult?.success ? 'Success' : 'Error'}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {submitResult?.message}
          </DialogDescription>
          <DialogFooter>
            <Button onClick={closeModal}>
              {submitResult?.success ? 'Close' : 'Try Again'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
