import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from '../file-upload';
import { useState, useEffect } from 'react';
import axios from 'axios';

export function AcademicPerformance({ data, updateData, updateFiles, errors = {}, required = false }) {
  const [currentSemester, setCurrentSemester] = useState(data?.semester || '');

  useEffect(() => {
    // Check if semester is already available in data, if so use it
    if (data?.semester) {
      setCurrentSemester(data.semester);
    } 
    // If not available, fetch it from the API using registration number
    else if (data?.registration_no) {
      const fetchSemester = async () => {
        try {
          const response = await axios.get(`https://df33-54-166-190-24.ngrok-free.app/api/mentor_mentee/profile/${data.registration_no}`);
          if (response.data && response.data.semester) {
            setCurrentSemester(response.data.semester);
            // Update the parent component with the semester info
            updateData({ semester: response.data.semester });
          }
        } catch (error) {
          console.error('Error fetching semester:', error);
        }
      };
      
      fetchSemester();
    }
  }, [data?.registration_no, data?.semester]);

  const handleChange = (name, value) => {
    updateData({ [name]: value });
  };

  const handleFileChange = (name, files) => {
    if (files) {
      updateFiles(name, Array.from(files));
    }
  };

  return (
    <div className="space-y-6">
      

      <div className="space-y-2">
        <Label htmlFor="cgpa" className="flex items-center">
          CGPA
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input 
          id="cgpa" 
          type="number" 
          step="0.01" 
          min="0" 
          max="10" 
          value={data?.cgpa || ''} 
          onChange={(e) => handleChange('cgpa', e.target.value)}
          className={errors.cgpa ? "border-red-500" : ""}
        />
        {errors.cgpa && (
          <p className="text-sm text-red-500">{errors.cgpa}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sgpa" className="flex items-center">
          SGPA
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input 
          id="sgpa" 
          type="number" 
          step="0.01" 
          min="0" 
          max="10" 
          value={data?.sgpa || ''} 
          onChange={(e) => handleChange('sgpa', e.target.value)}
          className={errors.sgpa ? "border-red-500" : ""}
        />
        {errors.sgpa && (
          <p className="text-sm text-red-500">{errors.sgpa}</p>
        )}
      </div>

      {/* Admin verification info for academic proofs */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-900 text-sm mb-2">
        Proofs are verified and approved by the admin. 
        {currentSemester && parseInt(currentSemester) > 1 ? 
          `Please upload marksheets for all ${parseInt(currentSemester) - 1} previous semesters in a single collated PDF file.` : 
          'Please upload all Marksheets or Results in a single PDF and submit.'}
      </div>
      <FileUpload 
        label="Proof of Academic Performance"
        name="academicProof"
        accept=".pdf,.png,.jpg,.jpeg"
        multiple={true}
        maxSize={5}
        tooltip="Upload PDFs or images of your academic transcripts. Max 5MB per file."
        onChange={handleFileChange}
        required={required}
        error={errors.academicProof}
      />
    </div>
  );
}
