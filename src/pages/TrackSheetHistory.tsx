
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Calendar as CalendarIcon, Copy } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";

interface SavedTrackSheet {
  id: string;
  name: string;
  date: Date;
  routeName: string;
  rows: any[];
  createdAt: Date;
}

export default function TrackSheetHistory() {
  const navigate = useNavigate();
  const [savedTemplates, setSavedTemplates] = useState<SavedTrackSheet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  // Load saved templates from local storage
  useEffect(() => {
    const savedData = localStorage.getItem('savedTrackSheets');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Convert string dates back to Date objects
        const templatesWithDates = parsedData.map((template: any) => ({
          ...template,
          date: new Date(template.date),
          createdAt: new Date(template.createdAt)
        }));
        setSavedTemplates(templatesWithDates);
      } catch (error) {
        console.error("Error loading saved track sheets:", error);
        toast.error("Failed to load saved track sheets");
      }
    }
  }, []);

  // Filter templates based on search query and date
  const filteredTemplates = savedTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         template.routeName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = !dateFilter || format(new Date(template.date), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');
    
    return matchesSearch && matchesDate;
  });

  // Function to carry forward a template to a new date
  const carryForwardTemplate = (template: SavedTrackSheet) => {
    // Navigate to track sheet page with template data
    navigate('/track-sheet', { 
      state: { 
        templateData: {
          ...template,
          date: new Date(), // Set to today's date
          name: `${template.name} (Carried Forward)`
        } 
      } 
    });
    toast.success(`Template "${template.name}" carried forward to today`);
  };

  // Delete a template
  const deleteTemplate = (id: string) => {
    const updatedTemplates = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updatedTemplates);
    
    // Update local storage
    localStorage.setItem('savedTrackSheets', JSON.stringify(updatedTemplates));
    toast.success("Track sheet deleted");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Track Sheet History</h1>
        <p className="text-muted-foreground">
          View and manage your saved track sheets
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Track Sheets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Label>Date:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[180px] pl-3 text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, 'PPP') : 'Filter by date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {dateFilter && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setDateFilter(undefined)}
                >
                  Clear
                </Button>
              )}
            </div>

            <Button 
              onClick={() => navigate('/track-sheet')}
            >
              Create New Track Sheet
            </Button>
          </div>

          {filteredTemplates.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Created On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{format(new Date(template.date), "PPP")}</TableCell>
                      <TableCell>{template.routeName || "—"}</TableCell>
                      <TableCell>{format(new Date(template.createdAt), "PPP")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/track-sheet`, { state: { templateData: template }})}
                          >
                            View/Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => carryForwardTemplate(template)}
                          >
                            <Copy className="mr-1 h-4 w-4" />
                            Carry Forward
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No saved track sheets found</p>
              {searchQuery || dateFilter ? (
                <p className="text-sm">Try changing your search criteria</p>
              ) : (
                <p className="text-sm">Create and save track sheets to see them here</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
