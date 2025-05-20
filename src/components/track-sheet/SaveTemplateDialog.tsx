
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { TrackSheetRow } from '@/types';
import { createTrackSheetTemplate } from '@/utils/trackSheetUtils';

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: TrackSheetRow[]; // Added rows prop
}

export function SaveTemplateDialog({ open, onOpenChange, rows }: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState('');

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    try {
      // Use the createTrackSheetTemplate function with rows
      const template = createTrackSheetTemplate(templateName, rows);
      
      // In a real app, we would save this template to storage
      // For now, we'll just show a success message
      toast.success(`Template "${templateName}" saved successfully`);
      
      // Close dialog and reset state
      onOpenChange(false);
      setTemplateName('');
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
          <p className="text-sm text-muted-foreground">
            Save this layout as a template for future use. Only the structure will be saved, not the values.
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
