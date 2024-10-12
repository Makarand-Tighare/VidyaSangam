import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function MentoringPreferences({ data, updateData, errors }) {
  const handleChange = (name, value) => {
    updateData({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="mentoringPreference">Mentoring Preferences</Label>
        <Select
          onValueChange={(value) => handleChange('mentoringPreference', value)}
          value={data?.mentoringPreference || ''}
        >
          <SelectTrigger id="mentoringPreference">
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
        <Label htmlFor="previousExperience">Previous Mentoring Experience</Label>
        <Textarea 
          id="previousExperience" 
          value={data?.previousExperience || ''} 
          onChange={(e) => handleChange('previousExperience', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="techStack">Tech Stack</Label>
        <Input 
          id="techStack" 
          placeholder="e.g., JavaScript, Python, React" 
          value={data?.techStack || ''} 
          onChange={(e) => handleChange('techStack', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="areasOfInterest">Areas of Interest for Learning or Mentoring</Label>
        <Textarea 
          id="areasOfInterest" 
          value={data?.areasOfInterest || ''} 
          onChange={(e) => handleChange('areasOfInterest', e.target.value)}
        />
      </div>
    </div>
  );
}
