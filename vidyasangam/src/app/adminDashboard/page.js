"use client";

import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Info } from 'lucide-react';

export default function AdminDashboardPage() {
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
    fetchUnmatchedParticipants();
    
    const intervalId = setInterval(() => {
      fetchParticipants();
      fetchUnmatchedParticipants();
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

  const fetchUnmatchedParticipants = async () => {
    setIsLoadingUnmatched(true);
    try {
      const url = "http://127.0.0.1:8000/api/mentor_mentee/unmatched";
      const response = await axios.get(url);
      setUnmatchedParticipants(response.data.unmatched_participants || []);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching unmatched participants:", error);
      // Don't set error message here as it would override other errors
    } finally {
      setIsLoadingUnmatched(false);
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
      setMatchesFetched(true);

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
  };

  const closeParticipantModal = () => {
    setShowParticipantModal(false);
    setSelectedParticipant(null);
  };

  return (
    <div className="container mx-auto px-2 md:px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage mentor-mentee matches and view program statistics</p>
      </header>
      
      {/* Tabs */}
      <div className="flex flex-wrap justify-center mb-8 gap-2 md:gap-0">
        <button
          className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-colors duration-200 ${activeTab === "participants" ? "border-blue-600 text-blue-700 bg-blue-50" : "border-transparent text-gray-500 hover:text-blue-700"}`}
          onClick={() => setActiveTab("participants")}
        >
          All Participants
        </button>
        <button
          className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-colors duration-200 ${activeTab === "unmatched" ? "border-purple-600 text-purple-700 bg-purple-50" : "border-transparent text-gray-500 hover:text-purple-700"}`}
          onClick={() => setActiveTab("unmatched")}
        >
          Unmatched
        </button>
        <button
          className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-colors duration-200 ${activeTab === "matching" ? "border-green-600 text-green-700 bg-green-50" : "border-transparent text-gray-500 hover:text-green-700"}`}
          onClick={() => setActiveTab("matching")}
        >
          Matching
        </button>
      </div>
      
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
            <p className="text-4xl font-bold text-green-600 mt-2">
              {matchesFetched ? matchesStats.mentors : '—'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {matchesFetched ? "Mentors matched with mentees" : "Click 'Matching' to see matched mentors"}
            </p>
          </div>
          
          <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-purple-500">
            <h3 className="text-xl font-semibold text-gray-700">Mentees</h3>
            <p className="text-4xl font-bold text-purple-600 mt-2">
              {matchesFetched ? matchesStats.mentees : '—'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {matchesFetched ? "Students matched with mentors" : "Click 'Matching' to see matched mentees"}
            </p>
          </div>
        </section>
        
        {errorMessage && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
            <p className="font-bold">Error</p>
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "participants" && (
          <section className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6 bg-gray-50 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">All Participants</h2>
                <span className="tooltip" title="This is the preference selected by the participant. Actual roles are assigned after matching.">
                  <Info className="w-4 h-4 text-gray-400" />
                </span>
              </div>
              <input
                type="text"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {participants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg. No</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentoring Preference</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants
                      .filter(p => 
                        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.registration_no?.includes(searchTerm) ||
                        p.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.mentoring_preferences?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((participant, index) => (
                        <tr key={index} className="hover:bg-blue-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{participant.registration_no}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{participant.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{participant.semester}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{participant.branch}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{participant.mentoring_preferences || "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <button
                              onClick={() => viewParticipantDetails(participant)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                            >
                              View Details
                            </button>
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
            <div className="p-6 bg-gray-50 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">Unmatched Participants</h2>
                <span className="tooltip" title="This is the preference selected by the participant. Actual roles are assigned after matching.">
                  <Info className="w-4 h-4 text-gray-400" />
                </span>
              </div>
            </div>
            
            {isLoadingUnmatched ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : unmatchedParticipants.length > 0 ? (
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unmatchedParticipants.map((participant, index) => (
                      <tr key={index} className="hover:bg-purple-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{participant.registration_no}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{participant.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{participant.semester}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{participant.branch}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{participant.mentoring_preferences || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{participant.tech_stack}</td>
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
                onClick={fetchMatches}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2"
              >
                {isLoading && <div className="animate-spin h-5 w-5 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>}
                {isLoading ? "Fetching Matches..." : "Fetch Mentor-Mentee Matches"}
              </Button>
            </div>
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

        {/* Participant Details Modal */}
        {showParticipantModal && selectedParticipant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Participant Details
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
                      <span className="block text-base">{selectedParticipant.branch}</span>
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
                      <span className="block text-base">{selectedParticipant.coding_competitions_participate === "Yes" ? "Yes" : "No"}</span>
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
                
                {/* Experience Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Professional & Extracurricular Experience</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-sm font-medium text-gray-500">Internship Experience</span>
                      <span className="block text-base">{selectedParticipant.internship_experience === "Yes" ? "Yes" : "No"}</span>
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
                      <span className="block text-base">{selectedParticipant.seminars_or_workshops_attended === "Yes" ? "Yes" : "No"}</span>
                    </div>
                    {selectedParticipant.describe_seminars_or_workshops && selectedParticipant.describe_seminars_or_workshops !== "nan" && (
                      <div className="md:col-span-2">
                        <span className="block text-sm font-medium text-gray-500">Seminars/Workshops Description</span>
                        <span className="block text-base">{selectedParticipant.describe_seminars_or_workshops}</span>
                      </div>
                    )}
                    <div>
                      <span className="block text-sm font-medium text-gray-500">Extracurricular Activities</span>
                      <span className="block text-base">{selectedParticipant.extracurricular_activities === "Yes" ? "Yes" : "No"}</span>
                    </div>
                    {selectedParticipant.describe_extracurricular_activities && selectedParticipant.describe_extracurricular_activities !== "nan" && (
                      <div className="md:col-span-2">
                        <span className="block text-sm font-medium text-gray-500">Extracurricular Activities Description</span>
                        <span className="block text-base">{selectedParticipant.describe_extracurricular_activities}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Submission Date */}
                <div className="text-right text-sm text-gray-500">
                  Submitted on: {new Date(selectedParticipant.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
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
      </main>
    </div>
  );
}
