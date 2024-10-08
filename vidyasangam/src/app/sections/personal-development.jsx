import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from  "@/components/ui/select";

export function PersonalDevelopment({ data, updateData }) {
  const handleChange = (name, value) => {
    updateData({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="shortTermGoals">Short-term Career Goals</Label>
        <Textarea 
          id="shortTermGoals" 
          value={data?.shortTermGoals || ''} 
          onChange={(e) => handleChange('shortTermGoals', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="longTermGoals">Long-term Career Goals</Label>
        <Textarea 
          id="longTermGoals" 
          value={data?.longTermGoals || ''} 
          onChange={(e) => handleChange('longTermGoals', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="strengthsWeaknesses">Personal Strengths and Weaknesses</Label>
        <Textarea 
          id="strengthsWeaknesses" 
          value={data?.strengthsWeaknesses || ''} 
          onChange={(e) => handleChange('strengthsWeaknesses', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="learningStyle">Preferred Learning or Mentorship Style</Label>
        <Select 
          onValueChange={(value) => handleChange('learningStyle', value)} 
          value={data?.learningStyle || ''}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select learning style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="handsOn">Hands-on guidance</SelectItem>
            <SelectItem value="projectBased">Project-based learning</SelectItem>
            <SelectItem value="discussionOriented">Discussion-oriented</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="areasForGrowth">Areas for Personal Growth</Label>
        <Textarea 
          id="areasForGrowth" 
          value={data?.areasForGrowth || ''} 
          onChange={(e) => handleChange('areasForGrowth', e.target.value)}
        />
      </div>
    </div>
  );
}
