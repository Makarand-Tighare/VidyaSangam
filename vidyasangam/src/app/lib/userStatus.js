// Function to check if a user is already a mentor or mentee
import { authenticatedFetch } from './auth';

export async function checkUserMentorMenteeStatus() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { isMentorOrMentee: false, status: 'Student' };
    }

    // Fetch user profile to get registration number
    const profileResponse = await authenticatedFetch('http://54.166.190.24:8000/api/user/profile/');

    if (!profileResponse.ok) {
      return { isMentorOrMentee: false, status: 'Student' };
    }

    const profileData = await profileResponse.json();
    const regNo = profileData.reg_no;

    if (!regNo) {
      return { isMentorOrMentee: false, status: 'Student' };
    }

    // Fetch mentor/mentee status
    const statusResponse = await authenticatedFetch(`http://54.166.190.24:8000/api/mentor_mentee/profile/${regNo}/`);
    
    if (!statusResponse.ok) {
      return { isMentorOrMentee: false, status: 'Student' };
    }
    
    const statusData = await statusResponse.json();
    console.log('Mentor/Mentee API response:', statusData);
    
    // Determine status based on the mentor/mentee data
    let status = 'Student';
    let isMentorOrMentee = false;
    
    // A user is a mentee ONLY if they have a mentor assigned
    if (statusData.mentor !== null) {
      status = 'Mentee';
      isMentorOrMentee = true;
    }
    // A user is a mentor ONLY if they have at least one mentee assigned
    else if (statusData.mentees && statusData.mentees.length > 0) {
      status = 'Mentor';
      isMentorOrMentee = true;
    }
    // Otherwise, they are not yet a mentor or mentee, even if they have applied to be one
    
    console.log('Determined status:', status);
    return { isMentorOrMentee, status };
  } catch (error) {
    console.error('Error checking mentor/mentee status:', error);
    return { isMentorOrMentee: false, status: 'Student' };
  }
}

// Function to check if a user has already submitted a mentoring form application
export async function checkMentoringFormSubmitted() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { hasSubmitted: false };
    }

    // Fetch user profile to get registration number
    const profileResponse = await authenticatedFetch('http://54.166.190.24:8000/api/user/profile/');

    if (!profileResponse.ok) {
      return { hasSubmitted: false };
    }

    const profileData = await profileResponse.json();
    const regNo = profileData.reg_no;

    if (!regNo) {
      return { hasSubmitted: false };
    }

    // Use the same endpoint as checkUserMentorMenteeStatus to check if user has submitted a form
    const applicationResponse = await authenticatedFetch(`http://54.166.190.24:8000/api/mentor_mentee/profile/${regNo}/`);
    
    if (!applicationResponse.ok) {
      console.warn('Failed to check application status');
      return { hasSubmitted: false };
    }
    
    const applicationData = await applicationResponse.json();
    console.log('Application check response:', applicationData);
    
    // Check if the user has submitted a mentoring form application
    // We determine this by checking if there's data in key fields
    const hasSubmitted = Boolean(
      applicationData.tech_stack || 
      applicationData.mentoring_preferences || 
      applicationData.areas_of_interest
    );
    
    // If the user has a mentor or mentees, they're already matched
    const isMatched = Boolean(
      applicationData.mentor !== null || 
      (applicationData.mentees && applicationData.mentees.length > 0)
    );
    
    return { 
      hasSubmitted,
      applicationStatus: isMatched ? 'matched' : 'pending',
      applicationData // Return the full data for more context if needed
    };
  } catch (error) {
    console.error('Error checking application status:', error);
    return { hasSubmitted: false };
  }
} 