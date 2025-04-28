import { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function Declaration({ data, updateData, updateFiles, errors = {}, required = false }) {
  // Get current date formatted as YYYY-MM-DD for the date input
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // Set the date automatically if it's not already set
    if (!data?.date) {
      updateData({ date: getCurrentDate() });
    }
  }, [data?.date, updateData]);

  const handleChange = (name, value) => {
    updateData({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-2">
        <Checkbox 
          id="declaration" 
          checked={data?.declaration || false}
          onCheckedChange={(checked) => handleChange('declaration', checked)}
          className={errors.declaration ? "border-red-500" : ""}
        />
        <div>
          <Label htmlFor="declaration" className="flex items-center">
            I hereby declare that the above information is true and correct to the best of my knowledge
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {errors.declaration && (
            <p className="text-sm text-red-500 mt-1">{errors.declaration}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signature" className="flex items-center">
          Signature (Type your full name)
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input 
          id="signature" 
          value={data?.signature || ''} 
          onChange={(e) => handleChange('signature', e.target.value)}
          className={errors.signature ? "border-red-500" : ""}
        />
        {errors.signature && (
          <p className="text-sm text-red-500">{errors.signature}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date" className="flex items-center">
          Date
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input 
          id="date" 
          type="date" 
          value={data?.date || getCurrentDate()} 
          onChange={(e) => handleChange('date', e.target.value)}
          className={errors.date ? "border-red-500" : ""}
          max={getCurrentDate()} // Prevent future dates
        />
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date}</p>
        )}
      </div>
    </div>
  );
}
