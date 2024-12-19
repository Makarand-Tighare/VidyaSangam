"use client";

import React, { useState, useMemo } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const [mentorMentees, setMentorMentees] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [csvData, setCsvData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAndGenerateCSV = async () => {
    setIsLoading(true);
    try {
      const url = "http://127.0.0.1:5000/match";
      const response = await axios.get(url);
      const data = response.data;

      const mentorMenteesObj = {};
      data.matches.forEach(({ mentor, mentee }) => {
        const { registration_no, name, semester: menteeSemester } = mentee;
        const { name: mentorName, semester: mentorSemester, registration_no: mentorRegistrationNo } = mentor;
        if (!mentorMenteesObj[mentorName]) {
          mentorMenteesObj[mentorName] = [];
        }
        mentorMenteesObj[mentorName].push({ 
          name, 
          registration_no, 
          semester: menteeSemester,
          mentor_semester: mentorSemester,
          mentor_registration_no: mentorRegistrationNo
        });
      });

      setMentorMentees(mentorMenteesObj);

      // Generate CSV content
      let csvContent = "Mentor Registration No,Mentor's Semester,Name,Registration No,Mentee's Semester\n";
      for (const [mentor, mentees] of Object.entries(mentorMenteesObj)) {
        mentees.forEach(({ name, registration_no, semester, mentor_semester, mentor_registration_no }) => {
          csvContent += `${mentor_registration_no},${mentor_semester},${name},${registration_no},${semester}\n`;
        });
      }

      setCsvData(csvContent);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching data or generating CSV:", error);
      setErrorMessage("Failed to fetch matches or generate CSV. Please try again.");
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
    return Object.entries(mentorMentees).reduce((acc, [mentor, mentees]) => {
      const matchedMentees = mentees.filter(({ name }) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (mentor.toLowerCase().includes(searchTerm.toLowerCase()) || matchedMentees.length > 0) {
        acc[mentor] = matchedMentees.length > 0 ? matchedMentees : mentees;
      }
      return acc;
    }, {});
  }, [mentorMentees, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage mentor-mentee matches and generate reports</p>
      </header>
      
      <main className="space-y-8">
        <section className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-center">Generate Matches</h2>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={fetchAndGenerateCSV} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            >
              {isLoading ? "Generating..." : "Generate Matches and CSV"}
            </Button>
            {csvData && (
              <Button 
                onClick={downloadCSV}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
              >
                Download CSV
              </Button>
            )}
          </div>
        </section>

        {errorMessage && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
            <p className="font-bold">Error</p>
            <p>{errorMessage}</p>
          </div>
        )}

        {Object.keys(mentorMentees).length > 0 && (
          <section className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6 bg-gray-50 border-b flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-2xl font-semibold">Mentor-Mentee Matches</h2>
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
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor&apos;s Registration No</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor&apos;s Semester</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentee&apos;s Registration No</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentee Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentee Semester</th>
                    
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(filteredMentorMentees).map(([mentor, mentees], index) => (
                    mentees.map(({ name, registration_no, semester, mentor_semester, mentor_registration_no }, menteeIndex) => (
                      <tr key={`${index}-${menteeIndex}`} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{mentor_registration_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{mentor_semester}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mentor}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{registration_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 ">{name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{semester}</td>

                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
