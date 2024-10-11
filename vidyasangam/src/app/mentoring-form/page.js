'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const savedData = localStorage.getItem('mentoringFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would implement the form submission logic
    console.log('Form submitted:', formData);
  };

  const updateFormData = (sectionData) => {
    setFormData({ ...formData, ...sectionData });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#e6f3ff] via-[#f0f8ff] to-[#f5faff] flex flex-col items-center justify-center p-4">
      <header className="w-full text-center mb-8">
        <h1 className="text-4xl font-bold text-primary">Vidya Sangam</h1>
      </header>
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Mentor Mentee Program Application</CardTitle>
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
            <Button onClick={handleSubmit}>Submit</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
