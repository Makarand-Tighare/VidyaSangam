import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from '../file-upload';

export function AcademicPerformance({ data, updateData, updateFiles, errors = {}, required = false }) {
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
