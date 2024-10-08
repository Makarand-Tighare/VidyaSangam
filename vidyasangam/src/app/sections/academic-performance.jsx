import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from '../file-upload';

export function AcademicPerformance({ data, updateData }) {
  const handleChange = (name, value) => {
    updateData({ [name]: value });
  };

  const handleFileChange = (name, files) => {
    if (files) {
      updateData({ [name]: Array.from(files) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="cgpa">CGPA (Last Semester)</Label>
        <Input 
          id="cgpa" 
          type="number" 
          step="0.01" 
          min="0" 
          max="10" 
          value={data?.cgpa || ''} 
          onChange={(e) => handleChange('cgpa', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sgpa">SGPA (Last Semester)</Label>
        <Input 
          id="sgpa" 
          type="number" 
          step="0.01" 
          min="0" 
          max="10" 
          value={data?.sgpa || ''} 
          onChange={(e) => handleChange('sgpa', e.target.value)}
        />
      </div>

      <FileUpload 
        label="Proof of Academic Performance"
        name="academicProof"
        accept=".pdf,.png,.jpg,.jpeg"
        multiple={true}
        maxSize={5}
        tooltip="Upload PDFs or images of your academic transcripts. Max 5MB per file."
        onChange={(files) => handleFileChange('academicProof', files)}
      />
    </div>
  );
}
