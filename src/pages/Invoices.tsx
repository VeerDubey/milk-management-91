
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/data/DataContext";
import { useInvoices } from "@/contexts/InvoiceContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Calendar, 
  ArrowUpDown, 
  Download, 
  FileText, 
  Eye, 
  Edit,
  Trash2,
  Send,
  Check
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InvoiceDownloadButton from '@/components/invoices/InvoiceDownloadButton';
import { toast } from "sonner";

export default function Invoices() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string | null>("date");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { invoices, deleteInvoice } = useInvoices();
  const { customers } = useData();

  // Sample invoices for demo if actual invoices are empty
  const displayInvoices = invoices.length > 0 ? invoices.map(invoice => {
    const customer = customers.find(c => c.id === invoice.customerId);
    return {
      ...invoice,
      customerName: customer?.name || 'Unknown Customer'
    };
  }) : [
    { id: 'INV-2023-001', date: '2023-05-01', customerName: 'Rahul Sharma', total: 1200, status: 'paid' },
    { id: 'INV-2023-002', date: '2023-05-03', customerName: 'Priya Patel', total: 850, status: 'unpaid' },
    { id: 'INV-2023-003', date: '2023-05-05', customerName: 'Amit Kumar', total: 2100, status: 'paid' },
    { id: 'INV-2023-004', date: '2023-05-08', customerName: 'Sita Verma', total: 950, status: 'overdue' },
    { id: 'INV-2023-005', date: '2023-05-12', customerName: 'Vikram Singh', total: 1650, status: 'unpaid' },
  ];

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Filter invoices based on search term
  const filteredInvoices = displayInvoices.filter(invoice => 
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    invoice.date?.includes(searchTerm) ||
    invoice.status?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  // Sort the filtered invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortBy) return 0;
    
    const fieldA = a[sortBy as keyof typeof a];
    const fieldB = b[sortBy as keyof typeof b];
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sortDirection === 'asc'
        ? fieldA - fieldB
        : fieldB - fieldA;
    }
    return 0;
  });

  // Get status badge color based on invoice status
  const getStatusBadge = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'unpaid':
        return <Badge className="bg-yellow-500">Unpaid</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">Overdue</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
    }
  };
  
  const handleDownload = (id: string) => {
    // In a real implementation, this would trigger the download
    toast.success('Invoice download started');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage your customer invoices
          </p>
        </div>
        <Button onClick={() => navigate("/invoice-create")}>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="space-y-1">
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              View and manage all customer invoices
            </CardDescription>
          </div>
          <div className="ml-auto w-64 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortBy === 'date' && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center">
                      Invoice #
                      {sortBy === 'id' && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('customerName')}
                  >
                    <div className="flex items-center">
                      Customer
                      {sortBy === 'customerName' && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer text-right"
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center justify-end">
                      Amount
                      {sortBy === 'total' && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortBy === 'status' && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {invoice.date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        {invoice.id}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{invoice.customerName}</TableCell>
                    <TableCell className="text-right">₹{invoice.total?.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status || 'Unknown')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <span className="sr-only">Open menu</span>
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/invoice-detail/${invoice.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/invoice-edit/${invoice.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(invoice.id)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success(`Invoice sent to ${invoice.customerName}`)}>
                            <Send className="mr-2 h-4 w-4" />
                            Send to Customer
                          </DropdownMenuItem>
                          {invoice.status !== 'paid' && (
                            <DropdownMenuItem onClick={() => toast.success('Invoice marked as paid')}>
                              <Check className="mr-2 h-4 w-4" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive" 
                            onClick={() => handleDelete(invoice.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
