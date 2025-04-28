"use client";

import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const [mentorMentees, setMentorMentees] = useState({});
  const [participants, setParticipants] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [csvData, setCsvData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statsRefreshInterval, setStatsRefreshInterval] = useState(10); // seconds

  // Stats counters
  const stats = useMemo(() => {
    if (!participants.length) return { total: 0, mentors: 0, mentees: 0 };
    
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
  
  // Fetch participants data on load and at intervals
  useEffect(() => {
    fetchParticipants();
    fetchMatches();
    
    const intervalId = setInterval(() => {
      fetchParticipants();
    }, statsRefreshInterval * 1000);
    
    return () => clearInterval(intervalId);
  }, [statsRefreshInterval]);
  
  const fetchParticipants = async () => {
    try {
      const url = "http://127.0.0.1:8000/api/mentor_mentee/list_participants/";
      const response = await axios.get(url);
      setParticipants(response.data);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching participants:", error);
      setErrorMessage("Failed to fetch participants. Please try again.");
    }
  };

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const url = "http://127.0.0.1:8000/api/mentor_mentee/match/";
      const response = await axios.get(url);
      const data = response.data;

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
      
      // Update stats based on the matches data
      const uniqueMentors = new Set();
      const uniqueMentees = new Set();
      
      data.matches.forEach(({ mentor, mentee }) => {
        uniqueMentors.add(mentor.registration_no);
        uniqueMentees.add(mentee.registration_no);
      });
      
    } catch (error) {
      console.error("Error fetching matches:", error);
      setErrorMessage("Failed to fetch matches. Please try again.");
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

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage mentor-mentee matches and view program statistics</p>
      </header>
      
      <main className="space-y-8">
        {/* Stats Cards */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-xl font-semibold text-gray-700">Total Participants</h3>
            <p className="text-4xl font-bold text-blue-600 mt-2">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-2">Auto-refreshes every {statsRefreshInterval} seconds</p>
          </div>
          
          <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-green-500">
            <h3 className="text-xl font-semibold text-gray-700">Mentors</h3>
            <p className="text-4xl font-bold text-green-600 mt-2">{matchesStats.mentors}</p>
            <p className="text-sm text-gray-500 mt-2">Mentors matched with mentees</p>
          </div>
          
          <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-purple-500">
            <h3 className="text-xl font-semibold text-gray-700">Mentees</h3>
            <p className="text-4xl font-bold text-purple-600 mt-2">{matchesStats.mentees}</p>
            <p className="text-sm text-gray-500 mt-2">Students matched with mentors</p>
          </div>
        </section>
        
        {errorMessage && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
            <p className="font-bold">Error</p>
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Matches Display Section */}
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
                    <div className="mb-4 bg-gray-50 p-3 rounded-lg">
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
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {mentees.map((mentee, menteeIndex) => (
                            <tr key={menteeIndex} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mentee.registration_no}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mentee.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mentee.semester}</td>
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
      </main>
    </div>
  );
}
