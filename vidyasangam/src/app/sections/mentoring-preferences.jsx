import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { Info } from "lucide-react";

export function MentoringPreferences({ data, updateData, errors = {}, required = false }) {
  const [interestPreferences, setInterestPreferences] = useState({
    preference1: data?.interestPreference1 || '',
    preference2: data?.interestPreference2 || '',
    preference3: data?.interestPreference3 || '',
  });

  const [otherInterests, setOtherInterests] = useState({
    preference1Other: data?.preference1Other || '',
    preference2Other: data?.preference2Other || '',
    preference3Other: data?.preference3Other || '',
  });

  // Shared options for all computer-related departments (CSE, CSD, AIDS, AIML, CSE-IOT, CT, IT)
  const computerRelatedOptions = [
    "Web Development",
    "Mobile App Development",
    "Data Science",
    "Machine Learning",
    "Deep Learning",
    "Artificial Intelligence",
    "Natural Language Processing",
    "Computer Vision",
    "Blockchain",
    "Cloud Computing",
    "DevOps",
    "Cybersecurity",
    "UI/UX Design",
    "Frontend Development",
    "Backend Development",
    "Game Development",
    "Database Management",
    "Software Engineering",
    "Computer Networks",
    "Network Security",
    "IoT (Internet of Things)",
    "AR/VR (Augmented/Virtual Reality)",
    "Embedded Systems",
    "Big Data Analytics",
    "Statistical Analysis",
    "Competitive Programming",
    "Human-Computer Interaction",
    "System Administration",
    "Cloud Infrastructure",
    "Neural Networks",
    "Reinforcement Learning",
    "Robotics",
    "Operating Systems",
    "Information Systems",
    "Technical Support",
    "Algorithms & Data Structures",
    "Design Systems",
    "Edge Computing"
  ];

  // Department-specific interest options
  const departmentInterestOptions = {
    // Electronics related departments
    ETC: [
      "Circuit Design",
      "Signal Processing",
      "Embedded Systems",
      "Microcontrollers",
      "VLSI Design",
      "Communication Systems",
      "Antenna Design",
      "RF Engineering",
      "PCB Design",
      "Wireless Communications",
      "Telecommunication Networks",
      "Machine Learning for Signal Processing",
      "Data Science in Electronics",
      "Image Processing",
      "IoT Applications",
      "Robotics for Electronics"
    ],
    EE: [
      "Power Systems",
      "Electric Drives",
      "Control Systems",
      "Power Electronics",
      "Electrical Machines",
      "High Voltage Engineering",
      "Renewable Energy Systems",
      "Microcontrollers",
      "Smart Grid Technologies",
      "Instrumentation",
      "Energy Management"
    ],
    // Mechanical and Civil
    ME: [
      "CAD/CAM",
      "Thermodynamics",
      "Fluid Mechanics",
      "Heat Transfer",
      "Manufacturing Processes",
      "Robotics",
      "Mechanical Design",
      "Automotive Engineering",
      "HVAC Systems",
      "Aerospace Structures",
      "Industrial Automation"
    ],
    CE: [
      "Structural Engineering",
      "Geotechnical Engineering",
      "Transportation Engineering",
      "Environmental Engineering",
      "Water Resources",
      "Construction Management",
      "Surveying",
      "Building Materials",
      "Urban Planning",
      "Earthquake Engineering",
      "Sustainable Construction"
    ]
  };

  // Common options for all departments
  const commonInterestOptions = [
    "Project Management",
    "Academic Research",
    "Technical Writing",
    "Entrepreneurship",
    "Innovation & Product Development",
    "Industry-Academia Collaboration",
    "Internship Guidance",
    "Competitive Exam Preparation",
    "Career Planning",
    "Higher Education Counseling",
    "Technical Paper Writing",
    "Presentation Skills",
    "Other"
  ];

  // Get the user's department/branch
  const userDepartment = data?.branch || '';
  let departmentCode = '';
  
  // Map department name to code
  if (userDepartment.includes('Computer Science Engineering') && !userDepartment.includes('IoT')) {
    departmentCode = 'CSE';
  } else if (userDepartment.includes('Computer Science and Design')) {
    departmentCode = 'CSD';
  } else if (userDepartment.includes('Artificial Intelligence and Data Science')) {
    departmentCode = 'AIDS';
  } else if (userDepartment.includes('Artificial Intelligence and Machine Learning')) {
    departmentCode = 'AIML';
  } else if (userDepartment.includes('Computer Science Engineering (IoT)') || userDepartment.includes('CSE-IOT')) {
    departmentCode = 'CSE-IOT';
  } else if (userDepartment.includes('Computer Technology')) {
    departmentCode = 'CT';
  } else if (userDepartment.includes('Electronics and Telecommunication')) {
    departmentCode = 'ETC';
  } else if (userDepartment.includes('Electrical Engineering')) {
    departmentCode = 'EE';
  } else if (userDepartment.includes('Mechanical Engineering')) {
    departmentCode = 'ME';
  } else if (userDepartment.includes('Civil Engineering')) {
    departmentCode = 'CE';
  } else if (userDepartment.includes('Information Technology')) {
    departmentCode = 'IT';
  } else {
    // Default to CSE if no match is found
    departmentCode = 'CSE';
  }

  // Get the appropriate options for the user's department
  let specificOptions = [];
  
  // All computer-related departments share the same options
  if (['CSE', 'CSD', 'AIDS', 'AIML', 'CSE-IOT', 'CT', 'IT'].includes(departmentCode)) {
    specificOptions = computerRelatedOptions;
  } else {
    specificOptions = departmentInterestOptions[departmentCode] || computerRelatedOptions;
  }
  
  // Combine specific options with common options
  const areasOfInterestOptions = [...specificOptions, ...commonInterestOptions];

  const handleChange = (name, value) => {
    updateData({ [name]: value });
  };

  // Handle interest preference changes
  const handleInterestPreferenceChange = (preference, value) => {
    const newPreferences = { ...interestPreferences, [preference]: value };
    setInterestPreferences(newPreferences);
    
    // Reset the "Other" field if the preference is not "Other"
    if (value !== "Other") {
      const newOtherInterests = { ...otherInterests, [`${preference}Other`]: '' };
      setOtherInterests(newOtherInterests);
      updateData({ [`${preference}Other`]: '' });
    }
    
    // Map the internal preference fields to the interestPreference fields for the form
    const fieldMapping = {
      'preference1': 'interestPreference1',
      'preference2': 'interestPreference2',
      'preference3': 'interestPreference3'
    };
    
    // Combine preferences into comma-separated string for backend
    const combinedPreferences = [];
    
    // For each preference, use the "Other" value if preference is "Other", otherwise use the preference value
    if (newPreferences.preference1) {
      combinedPreferences.push(
        newPreferences.preference1 === "Other" ? otherInterests.preference1Other : newPreferences.preference1
      );
    }
    
    if (newPreferences.preference2) {
      combinedPreferences.push(
        newPreferences.preference2 === "Other" ? otherInterests.preference2Other : newPreferences.preference2
      );
    }
    
    if (newPreferences.preference3) {
      combinedPreferences.push(
        newPreferences.preference3 === "Other" ? otherInterests.preference3Other : newPreferences.preference3
      );
    }
    
    const filteredPreferences = combinedPreferences.filter(Boolean).join(", ");
    
    // Update both individual preferences and combined string
    updateData({
      [fieldMapping[preference]]: value,  // This maps preference1 -> interestPreference1, etc.
      areasOfInterest: filteredPreferences
    });
  };

  // Handle other interest text input changes
  const handleOtherInterestChange = (preference, value) => {
    const newOtherInterests = { ...otherInterests, [preference]: value };
    setOtherInterests(newOtherInterests);
    
    // Combine preferences into comma-separated string for backend
    const combinedPreferences = [];
    
    // For each preference, use the "Other" value if preference is "Other", otherwise use the preference value
    if (interestPreferences.preference1) {
      combinedPreferences.push(
        interestPreferences.preference1 === "Other" ? newOtherInterests.preference1Other : interestPreferences.preference1
      );
    }
    
    if (interestPreferences.preference2) {
      combinedPreferences.push(
        interestPreferences.preference2 === "Other" ? newOtherInterests.preference2Other : interestPreferences.preference2
      );
    }
    
    if (interestPreferences.preference3) {
      combinedPreferences.push(
        interestPreferences.preference3 === "Other" ? newOtherInterests.preference3Other : interestPreferences.preference3
      );
    }
    
    const filteredPreferences = combinedPreferences.filter(Boolean).join(", ");
    
    // Update the combined string and the specific other field
    updateData({
      [preference]: value,
      areasOfInterest: filteredPreferences
    });
  };

  // Initialize preferences from data if available
  useEffect(() => {
    if (data?.areasOfInterest && !interestPreferences.preference1) {
      const interests = data.areasOfInterest.split(", ");
      
      // Check if preferences match our predefined options, otherwise set as "Other"
      const newPreferences = {
        preference1: '',
        preference2: '',
        preference3: ''
      };
      
      const newOtherInterests = { ...otherInterests };
      
      // For each interest in the data, check if it's in our predefined list
      interests.forEach((interest, index) => {
        const preferenceKey = `preference${index + 1}`;
        if (areasOfInterestOptions.includes(interest)) {
          newPreferences[preferenceKey] = interest;
        } else if (interest) {
          newPreferences[preferenceKey] = "Other";
          newOtherInterests[`${preferenceKey}Other`] = interest;
        }
      });
      
      setInterestPreferences(newPreferences);
      setOtherInterests(newOtherInterests);
      
      updateData({
        interestPreference1: newPreferences.preference1,
        interestPreference2: newPreferences.preference2,
        interestPreference3: newPreferences.preference3,
        preference1Other: newOtherInterests.preference1Other,
        preference2Other: newOtherInterests.preference2Other,
        preference3Other: newOtherInterests.preference3Other
      });
    }
  }, [data?.areasOfInterest]);

  // Get available options for each preference dropdown
  const getAvailableOptions = (current) => {
    // Filter out options that are already selected in other dropdowns
    return areasOfInterestOptions.filter(option => {
      if (option === "Other") return true; // "Other" is always available
      
      // Check if option is selected in other dropdowns
      if (current !== "preference1" && interestPreferences.preference1 === option) return false;
      if (current !== "preference2" && interestPreferences.preference2 === option) return false;
      if (current !== "preference3" && interestPreferences.preference3 === option) return false;
      
      return true;
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="mentoringPreference" className="flex items-center">
          Mentoring Preferences
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select
          onValueChange={(value) => handleChange('mentoringPreference', value)}
          value={data?.mentoringPreference || ''}
        >
          <SelectTrigger id="mentoringPreference" className={errors.mentoringPreference ? "border-red-500" : ""}>
            <SelectValue placeholder="Select your preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mentor">Mentor</SelectItem>
            <SelectItem value="mentee">Mentee</SelectItem>
          </SelectContent>
        </Select>
        {errors?.mentoringPreference && (
          <p className="text-sm text-red-500">{errors.mentoringPreference}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="flex items-center">
          Previous Mentoring Experience
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <RadioGroup 
          value={data?.previousExperience || ''} 
          onValueChange={(value) => handleChange('previousExperience', value)}
          className={errors.previousExperience ? "border border-red-500 rounded-md p-2" : ""}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="previousExperienceYes" />
            <Label htmlFor="previousExperienceYes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="previousExperienceNo" />
            <Label htmlFor="previousExperienceNo">No</Label>
          </div>
        </RadioGroup>
        {errors?.previousExperience && (
          <p className="text-sm text-red-500">{errors.previousExperience}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="techStack" className="flex items-center">
          Tech Stack
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input 
          id="techStack" 
          placeholder="e.g., JavaScript, Python, React" 
          value={data?.techStack || ''} 
          onChange={(e) => handleChange('techStack', e.target.value)}
          className={errors.techStack ? "border-red-500" : ""}
        />
        {errors?.techStack && (
          <p className="text-sm text-red-500">{errors.techStack}</p>
        )}
      </div>

      <div className="space-y-4">
        <Label className="flex items-center">
          Areas of Interest (Select 3 preferences)
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        <div className="bg-blue-50 p-4 rounded-md flex items-start space-x-3 mb-2">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            You will be matched primarily based on your areas of interest, and then by tech stack. 
            Please select all three preferences for optimal matching.
            {departmentCode && (
              <span className="block mt-1 font-medium">
                Showing {departmentCode} department-specific options and common options.
              </span>
            )}
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="interestPreference1" className="text-sm text-gray-600">
              First Preference {required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              onValueChange={(value) => handleInterestPreferenceChange('preference1', value)}
              value={interestPreferences.preference1}
            >
              <SelectTrigger id="interestPreference1" className={errors.areasOfInterest ? "border-red-500" : ""}>
                <SelectValue placeholder="Select primary interest" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableOptions("preference1").map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {interestPreferences.preference1 === "Other" && (
              <div className="mt-2">
                <Input
                  placeholder="Specify your interest"
                  value={otherInterests.preference1Other || ''}
                  onChange={(e) => handleOtherInterestChange('preference1Other', e.target.value)}
                  className={errors.areasOfInterest && !otherInterests.preference1Other ? "border-red-500" : ""}
                />
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="interestPreference2" className="text-sm text-gray-600">
              Second Preference {required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              onValueChange={(value) => handleInterestPreferenceChange('preference2', value)}
              value={interestPreferences.preference2}
            >
              <SelectTrigger id="interestPreference2" className={errors.areasOfInterest ? "border-red-500" : ""}>
                <SelectValue placeholder="Select secondary interest" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableOptions("preference2").map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {interestPreferences.preference2 === "Other" && (
              <div className="mt-2">
                <Input
                  placeholder="Specify your interest"
                  value={otherInterests.preference2Other || ''}
                  onChange={(e) => handleOtherInterestChange('preference2Other', e.target.value)}
                  className={errors.areasOfInterest && !otherInterests.preference2Other ? "border-red-500" : ""}
                />
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="interestPreference3" className="text-sm text-gray-600">
              Third Preference {required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              onValueChange={(value) => handleInterestPreferenceChange('preference3', value)}
              value={interestPreferences.preference3}
            >
              <SelectTrigger id="interestPreference3" className={errors.areasOfInterest ? "border-red-500" : ""}>
                <SelectValue placeholder="Select tertiary interest" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableOptions("preference3").map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {interestPreferences.preference3 === "Other" && (
              <div className="mt-2">
                <Input
                  placeholder="Specify your interest"
                  value={otherInterests.preference3Other || ''}
                  onChange={(e) => handleOtherInterestChange('preference3Other', e.target.value)}
                  className={errors.areasOfInterest && !otherInterests.preference3Other ? "border-red-500" : ""}
                />
              </div>
            )}
          </div>
        </div>
        
        {errors?.areasOfInterest && (
          <p className="text-sm text-red-500">{errors.areasOfInterest}</p>
        )}
      </div>
    </div>
  );
}
