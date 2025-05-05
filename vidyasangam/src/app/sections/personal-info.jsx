import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export function PersonalInfo({ data, updateData, errors = {}, required = false }) {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    updateData({ [name]: value });
  };

  // Check if the basic fields are pre-filled from the user profile
  const hasPreFilledData = data?.name && data?.registrationNumber;

  return (
    <div className="space-y-4">
      {hasPreFilledData && (
        <Alert variant="info" className="bg-blue-50 text-blue-800 border-blue-200 mb-4">
          <InfoIcon className="h-4 w-4 mr-2" />
          <AlertDescription>
            Your basic information has been automatically filled from your profile. These fields cannot be modified here.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center">
          Name
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input 
          id="name" 
          name="name" 
          value={data?.name || ''} 
          onChange={handleChange} 
          required 
          className={errors.name ? "border-red-500" : ""}
          disabled={hasPreFilledData}
          readOnly={hasPreFilledData}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="registrationNumber" className="flex items-center">
          Registration Number
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input 
          id="registrationNumber" 
          name="registrationNumber" 
          value={data?.registrationNumber || ''} 
          onChange={handleChange} 
          required 
          className={errors.registrationNumber ? "border-red-500" : ""}
          disabled={hasPreFilledData}
          readOnly={hasPreFilledData}
        />
        {errors.registrationNumber && (
          <p className="text-sm text-red-500">{errors.registrationNumber}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="semester" className="flex items-center">
          Semester
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select 
          onValueChange={(value) => handleSelectChange('semester', value)} 
          value={data?.semester || ''}
          disabled={hasPreFilledData}
        >
          <SelectTrigger className={errors.semester ? "border-red-500" : ""}>
            <SelectValue placeholder="Select semester" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <SelectItem key={sem} value={sem.toString()}>
                Semester {sem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.semester && (
          <p className="text-sm text-red-500">{errors.semester}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="section" className="flex items-center">
          Section
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input 
          id="section" 
          name="section" 
          value={data?.section || ''} 
          onChange={handleChange} 
          required 
          className={errors.section ? "border-red-500" : ""}
          disabled={hasPreFilledData}
          readOnly={hasPreFilledData}
        />
        {errors.section && (
          <p className="text-sm text-red-500">{errors.section}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="branch" className="flex items-center">
          Branch/Department
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input 
          id="branch" 
          name="branch" 
          value={data?.branch || ''} 
          onChange={handleChange} 
          required 
          className={errors.branch ? "border-red-500" : ""}
          disabled={hasPreFilledData}
          readOnly={hasPreFilledData}
        />
        {errors.branch && (
          <p className="text-sm text-red-500">{errors.branch}</p>
        )}
      </div>
    </div>
  );
}
