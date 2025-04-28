import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PersonalInfo({ data, updateData, errors = {}, required = false }) {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    updateData({ [name]: value });
  };

  return (
    <div className="space-y-4">
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
        <Label htmlFor="branch" className="flex items-center">
          Branch
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select 
          onValueChange={(value) => handleSelectChange('branch', value)} 
          value={data?.branch || ''}
        >
          <SelectTrigger className={errors.branch ? "border-red-500" : ""}>
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ct">Computer Technology</SelectItem>
            <SelectItem value="aids">Artificial Intelligence and Data Science</SelectItem>
            {/* <SelectItem value="ece">Electronics and Communication</SelectItem>
            <SelectItem value="ee">Electrical Engineering</SelectItem>
            <SelectItem value="me">Mechanical Engineering</SelectItem> */}
          </SelectContent>
        </Select>
        {errors.branch && (
          <p className="text-sm text-red-500">{errors.branch}</p>
        )}
      </div>
    </div>
  );
}
