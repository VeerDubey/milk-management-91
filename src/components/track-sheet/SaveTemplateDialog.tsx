
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { TrackSheetRow } from '@/types';
import { createTrackSheetTemplate } from '@/utils/trackSheetUtils';

export interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: TrackSheetRow[]; 
}

export function SaveTemplateDialog({ open, onOpenChange, rows }: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState('');
  const [saveWithValues, setSaveWithValues] = useState(false);

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    try {
      // Process the rows based on the saveWithValues option
      const templateRows = saveWithValues 
        ? rows 
        : rows.map(row => ({
            ...row,
            quantities: Object.keys(row.quantities).reduce((acc, key) => {
              acc[key] = ''; // Clear values but keep structure
              return acc;
            }, {} as Record<string, string | number>),
            total: 0,
            amount: 0
          }));

      // Use the createTrackSheetTemplate function with processed rows
      const template = createTrackSheetTemplate(templateName, templateRows);
      
      // Save template to localStorage directly
      const savedTemplates = localStorage.getItem("trackSheetTemplates");
      const templates = savedTemplates ? JSON.parse(savedTemplates) : [];
      templates.push(template);
      localStorage.setItem("trackSheetTemplates", JSON.stringify(templates));
      
      toast.success(`Template "${templateName}" saved successfully`);
      
      // Close dialog and reset state
      onOpenChange(false);
      setTemplateName('');
      setSaveWithValues(false);
    } catch (error) {
      toast.error("Failed to save template");
      console.error("Error saving template:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Save this layout as a template for future use. Choose whether to save only the structure or include current values.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Morning Route Template"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="saveWithValues" 
              checked={saveWithValues}
              onCheckedChange={(checked) => setSaveWithValues(!!checked)}
            />
            <Label htmlFor="saveWithValues" className="text-sm font-medium">
              Save with current values
            </Label>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {saveWithValues 
              ? "Values will be saved along with the structure."
              : "Only the structure will be saved, not the values."}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
