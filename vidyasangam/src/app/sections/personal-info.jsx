import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PersonalInfo({ data, updateData }) {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    updateData({ [name]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name" 
          name="name" 
          value={data?.name || ''} 
          onChange={handleChange} 
          required 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="registrationNumber">Registration Number</Label>
        <Input 
          id="registrationNumber" 
          name="registrationNumber" 
          value={data?.registrationNumber || ''} 
          onChange={handleChange} 
          required 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="semester">Semester</Label>
        <Select 
          onValueChange={(value) => handleSelectChange('semester', value)} 
          value={data?.semester || ''}
        >
          <SelectTrigger>
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
      </div>
      <div className="space-y-2">
        <Label htmlFor="branch">Branch</Label>
        <Select 
          onValueChange={(value) => handleSelectChange('branch', value)} 
          value={data?.branch || ''}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cs">Computer Science</SelectItem>
            <SelectItem value="it">Information Technology</SelectItem>
            <SelectItem value="ece">Electronics and Communication</SelectItem>
            <SelectItem value="ee">Electrical Engineering</SelectItem>
            <SelectItem value="me">Mechanical Engineering</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
