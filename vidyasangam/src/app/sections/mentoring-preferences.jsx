import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function MentoringPreferences({ data, updateData, errors = {}, required = false }) {
  const handleChange = (name, value) => {
    updateData({ [name]: value });
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

      <div className="space-y-2">
        <Label htmlFor="areasOfInterest" className="flex items-center">
          Areas of Interest for Learning or Mentoring
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Textarea 
          id="areasOfInterest" 
          value={data?.areasOfInterest || ''} 
          onChange={(e) => handleChange('areasOfInterest', e.target.value)}
          className={errors.areasOfInterest ? "border-red-500" : ""}
        />
        {errors?.areasOfInterest && (
          <p className="text-sm text-red-500">{errors.areasOfInterest}</p>
        )}
      </div>
    </div>
  );
}
