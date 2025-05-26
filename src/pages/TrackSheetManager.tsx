
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Search, 
  Plus,
  Printer,
  Eye
} from 'lucide-react';
import { generateTrackSheetPdf, savePdf, exportTrackSheetToCSV } from '@/utils/trackSheetUtils';
import { TrackSheetDetails } from '@/components/track-sheet/TrackSheetDetails';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function TrackSheetManager() {
  const { trackSheets, deleteTrackSheet } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrackSheet, setSelectedTrackSheet] = useState<any>(null);
  
  // Filter track sheets based on search term
  const filteredTrackSheets = trackSheets.filter(sheet =>
    sheet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sheet.routeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    format(new Date(sheet.date), 'PP').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get all product names used in track sheet
  const getProductNames = (trackSheet: any) => {
    const productNames = new Set<string>();
    trackSheet.rows.forEach((row: any) => {
      if (row.quantities) {
        Object.keys(row.quantities).forEach(productName => {
          if (row.quantities[productName] !== '' && row.quantities[productName] !== 0) {
            productNames.add(productName);
          }
        });
      }
    });
    return Array.from(productNames);
  };
  
  // Download PDF
  const downloadPDF = (trackSheet: any) => {
    const productNames = getProductNames(trackSheet);
    const doc = generateTrackSheetPdf(trackSheet, productNames, []);
    savePdf(doc, `tracksheet-${format(new Date(trackSheet.date), 'yyyy-MM-dd')}-${trackSheet.name}.pdf`);
  };
  
  // Download CSV
  const downloadCSV = (trackSheet: any) => {
    const productNames = getProductNames(trackSheet);
    exportTrackSheetToCSV(trackSheet, productNames);
  };
  
  // Delete track sheet
  const handleDelete = (id: string) => {
    deleteTrackSheet(id);
  };
  
  // Calculate totals for a track sheet
  const calculateTotals = (trackSheet: any) => {
    const totalQuantity = trackSheet.rows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    const totalAmount = trackSheet.rows.reduce((sum: number, row: any) => sum + (row.amount || 0), 0);
    return { totalQuantity, totalAmount };
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-purple-600">Track Sheet Manager</h1>
          <p className="text-muted-foreground">View, edit, and download saved track sheets</p>
        </div>
        <Button 
          onClick={() => window.location.href = '/track-sheet-advanced'} 
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Track Sheet
        </Button>
      </div>
      
      {/* Search and Filters */}
      <Card className="border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search track sheets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border-purple-200 focus:border-purple-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-purple-600 text-purple-600">
                {filteredTrackSheets.length} track sheets
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Track Sheets Table */}
      <Card className="border-purple-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-purple-50">
                <TableHead className="text-purple-700">Name</TableHead>
                <TableHead className="text-purple-700">Date</TableHead>
                <TableHead className="text-purple-700">Route</TableHead>
                <TableHead className="text-purple-700">Items</TableHead>
                <TableHead className="text-purple-700">Total Qty</TableHead>
                <TableHead className="text-purple-700">Total Amount</TableHead>
                <TableHead className="text-purple-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrackSheets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No track sheets found</p>
                      <Button 
                        onClick={() => window.location.href = '/track-sheet-advanced'} 
                        variant="outline"
                        className="border-purple-600 text-purple-600 hover:bg-purple-50"
                      >
                        Create your first track sheet
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrackSheets.map((trackSheet) => {
                  const { totalQuantity, totalAmount } = calculateTotals(trackSheet);
                  
                  return (
                    <TableRow key={trackSheet.id} className="hover:bg-purple-25">
                      <TableCell className="font-medium">{trackSheet.name}</TableCell>
                      <TableCell>{format(new Date(trackSheet.date), 'PP')}</TableCell>
                      <TableCell>{trackSheet.routeName || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-blue-600 text-blue-600">
                          {trackSheet.rows.length} items
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-green-600 text-green-600">
                          {totalQuantity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-orange-600 text-orange-600">
                          ₹{totalAmount.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedTrackSheet(trackSheet)}
                                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Track Sheet Details</DialogTitle>
                              </DialogHeader>
                              {selectedTrackSheet && (
                                <TrackSheetDetails trackSheet={selectedTrackSheet} />
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadPDF(trackSheet)}
                            className="border-green-600 text-green-600 hover:bg-green-50"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadCSV(trackSheet)}
                            className="border-purple-600 text-purple-600 hover:bg-purple-50"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-600 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Track Sheet</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{trackSheet.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(trackSheet.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Summary Cards */}
      {filteredTrackSheets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-blue-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredTrackSheets.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Track Sheets</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredTrackSheets.reduce((sum, sheet) => {
                    const { totalQuantity } = calculateTotals(sheet);
                    return sum + totalQuantity;
                  }, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Quantity</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ₹{filteredTrackSheets.reduce((sum, sheet) => {
                    const { totalAmount } = calculateTotals(sheet);
                    return sum + totalAmount;
                  }, 0).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Amount</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
