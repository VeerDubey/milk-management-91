
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface TrackSheetRow {
  id: string;
  customerName: string;
  quantities: Record<string, number>;
  total: number;
  amount: number;
}

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: TrackSheetRow[];
}

export function SaveTemplateDialog({ open, onOpenChange, rows }: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    setIsLoading(true);
    try {
      // Create template structure (without actual values)
      const templateStructure = {
        id: `template_${Date.now()}`,
        name: templateName.trim(),
        description: templateDescription.trim(),
        createdAt: new Date().toISOString(),
        structure: rows.map(row => ({
          customerName: row.customerName,
          productColumns: Object.keys(row.quantities),
        }))
      };
      
      // Save to localStorage (in a real app, this would be saved to a database)
      const existingTemplates = JSON.parse(localStorage.getItem('track-sheet-templates') || '[]');
      existingTemplates.push(templateStructure);
      localStorage.setItem('track-sheet-templates', JSON.stringify(existingTemplates));
      
      toast.success(`Template "${templateName}" saved successfully`);
      
      // Close dialog and reset state
      onOpenChange(false);
      setTemplateName('');
      setTemplateDescription('');
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setTemplateName('');
    setTemplateDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle className="gradient-text">Save as Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Morning Route Template"
              className="modern-input"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Describe when to use this template..."
              className="modern-input resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>
          
          <div className="p-3 bg-muted/20 rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This template will save the structure and customer names from your current track sheet. 
              You can use it to quickly create new track sheets with the same layout.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Customers: {rows.length} | Products: {rows.length > 0 ? Object.keys(rows[0].quantities || {}).length : 0}
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading || !templateName.trim()}
            className="modern-button"
          >
            {isLoading ? "Saving..." : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
