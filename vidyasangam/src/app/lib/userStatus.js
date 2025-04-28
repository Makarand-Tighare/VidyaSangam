// Function to check if a user is already a mentor or mentee
export async function checkUserMentorMenteeStatus() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { isMentorOrMentee: false, status: 'Student' };
    }

    // Fetch user profile to get registration number
    const profileResponse = await fetch('http://127.0.0.1:8000/api/user/profile/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!profileResponse.ok) {
      return { isMentorOrMentee: false, status: 'Student' };
    }

    const profileData = await profileResponse.json();
    const regNo = profileData.reg_no;

    if (!regNo) {
      return { isMentorOrMentee: false, status: 'Student' };
    }

    // Fetch mentor/mentee status
    const statusResponse = await fetch(`http://127.0.0.1:8000/api/mentor_mentee/profile/${regNo}/`);
    
    if (!statusResponse.ok) {
      return { isMentorOrMentee: false, status: 'Student' };
    }
    
    const statusData = await statusResponse.json();
    console.log('Mentor/Mentee API response:', statusData);
    
    // Determine status based on the mentor/mentee data
    let status = 'Student';
    let isMentorOrMentee = false;
    
    // First check if they have a mentor assigned
    if (statusData.mentor !== null) {
      status = 'Mentee';
      isMentorOrMentee = true;
    }
    // Then check if the person has mentoring_preferences set to mentor in the API
    // or if they have mentees assigned
    else if ((statusData.mentoring_preferences && statusData.mentoring_preferences.toLowerCase() === 'mentor') ||
        (statusData.mentees && statusData.mentees.length > 0)) {
      status = 'Mentor';
      isMentorOrMentee = true;
    }
    
    console.log('Determined status:', status);
    return { isMentorOrMentee, status };
  } catch (error) {
    console.error('Error checking mentor/mentee status:', error);
    return { isMentorOrMentee: false, status: 'Student' };
  }
} 