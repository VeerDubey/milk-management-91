
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Calendar, 
  FileSpreadsheet, 
  Search, 
  Copy, 
  Eye, 
  Download, 
  Trash2, 
  Filter 
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

// Sample track sheet data
const sampleTrackSheets = [
  {
    id: "TS-001",
    date: "2025-05-10",
    routeName: "Morning Route",
    customerCount: 12,
    productCount: 5,
    totalAmount: 5680,
    createdBy: "John Operator"
  },
  {
    id: "TS-002",
    date: "2025-05-11",
    routeName: "Evening Route",
    customerCount: 8,
    productCount: 4,
    totalAmount: 3420,
    createdBy: "Jane Manager"
  },
  {
    id: "TS-003",
    date: "2025-05-12",
    routeName: "South Area",
    customerCount: 15,
    productCount: 6,
    totalAmount: 7850,
    createdBy: "John Operator"
  },
  {
    id: "TS-004",
    date: "2025-05-13",
    routeName: "North Area",
    customerCount: 10,
    productCount: 3,
    totalAmount: 4200,
    createdBy: "Jane Manager"
  },
  {
    id: "TS-005",
    date: "2025-05-14",
    routeName: "Central Route",
    customerCount: 18,
    productCount: 7,
    totalAmount: 9300,
    createdBy: "John Operator"
  }
];

const TrackSheetHistory = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [routeFilter, setRouteFilter] = useState("");

  // Filter sheets based on search and filters
  const filteredSheets = sampleTrackSheets.filter(sheet => {
    // Search by ID or route name
    if (
      searchQuery && 
      !sheet.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !sheet.routeName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    // Date filter
    if (dateFilter && sheet.date !== dateFilter) {
      return false;
    }
    
    // Route filter
    if (routeFilter && sheet.routeName !== routeFilter) {
      return false;
    }
    
    return true;
  });

  // Get unique route names for filter
  const uniqueRoutes = Array.from(new Set(sampleTrackSheets.map(sheet => sheet.routeName)));

  const handleViewSheet = (id: string) => {
    navigate(`/track-sheet?id=${id}`);
  };

  const handleDuplicateSheet = (id: string) => {
    navigate(`/track-sheet?duplicate=${id}`);
    toast.success("Track sheet duplicated. You can now edit the copy.");
  };

  const handleDownloadPDF = (id: string) => {
    toast.success(`PDF downloaded for track sheet ${id}`);
  };

  const handleDownloadExcel = (id: string) => {
    toast.success(`Excel file downloaded for track sheet ${id}`);
  };

  const handleDeleteSheet = (id: string) => {
    toast.success(`Track sheet ${id} deleted`);
    // In a real implementation, you would remove the sheet from state/database
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Track Sheet History</h1>
        <p className="text-muted-foreground">
          View and manage all saved track sheets
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filter Track Sheets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by ID or route name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <div>
              <Select 
                value={dateFilter} 
                onValueChange={setDateFilter}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{dateFilter ? format(parseISO(dateFilter), "dd MMM yyyy") : "Select Date"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Dates</SelectItem>
                  {Array.from(new Set(sampleTrackSheets.map(sheet => sheet.date))).map(date => (
                    <SelectItem key={date} value={date}>
                      {format(parseISO(date), "dd MMM yyyy")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select 
                value={routeFilter} 
                onValueChange={setRouteFilter}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>{routeFilter || "Select Route"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Routes</SelectItem>
                  {uniqueRoutes.map(route => (
                    <SelectItem key={route} value={route}>
                      {route}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Track Sheets ({filteredSheets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Track Sheet ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Route Name</TableHead>
                <TableHead>Customers</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSheets.map((sheet) => (
                <TableRow key={sheet.id}>
                  <TableCell className="font-medium">{sheet.id}</TableCell>
                  <TableCell>{format(parseISO(sheet.date), "dd MMM yyyy")}</TableCell>
                  <TableCell>{sheet.routeName}</TableCell>
                  <TableCell>{sheet.customerCount}</TableCell>
                  <TableCell>{sheet.productCount}</TableCell>
                  <TableCell>₹{sheet.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{sheet.createdBy}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleViewSheet(sheet.id)}
                        title="View Track Sheet"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDuplicateSheet(sheet.id)}
                        title="Duplicate Track Sheet"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDownloadPDF(sheet.id)}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteSheet(sheet.id)}
                        title="Delete Track Sheet"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredSheets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No track sheets found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="flex justify-center">
        <Button onClick={() => navigate("/track-sheet")} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Create New Track Sheet
        </Button>
      </div>
    </div>
  );
};

export default TrackSheetHistory;
