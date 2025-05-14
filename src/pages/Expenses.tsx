import { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Calendar, ArrowUpDown, FileDown, Printer, Filter } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    category: "",
    description: "",
    paymentMethod: "cash",
    paidTo: "",
    title: "",
    notes: "",
    receiptImage: "",
    isRecurring: false,
    recurringFrequency: "monthly"
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.date.includes(searchTerm)
  );

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
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

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddExpense = () => {
    if (!formData.amount || !formData.date || !formData.category || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    addExpense({
      amount: parseFloat(formData.amount),
      date: formData.date,
      category: formData.category,
      description: formData.description,
      paymentMethod: formData.paymentMethod as 'cash' | 'bank' | 'upi' | 'other',
      paidTo: formData.paidTo,
      title: formData.title,
      notes: formData.notes,
      receiptImage: formData.receiptImage,
      isRecurring: formData.isRecurring,
      recurringFrequency: formData.recurringFrequency
    });

    setIsAddingExpense(false);
    setFormData({
      amount: "",
      date: format(new Date(), "yyyy-MM-dd"),
      category: "",
      description: "",
      paymentMethod: "cash",
      paidTo: "",
      title: "",
      notes: "",
      receiptImage: "",
      isRecurring: false,
      recurringFrequency: "monthly"
    });

    toast.success("Expense added successfully!");
  };

  const handleUpdateExpense = (id: string) => {
    if (!formData.amount || !formData.date || !formData.category || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    updateExpense(id, {
      amount: parseFloat(formData.amount),
      date: formData.date,
      category: formData.category,
      description: formData.description,
      paymentMethod: formData.paymentMethod as 'cash' | 'bank' | 'upi' | 'other',
      paidTo: formData.paidTo,
      title: formData.title,
      notes: formData.notes,
      receiptImage: formData.receiptImage,
      isRecurring: formData.isRecurring,
      recurringFrequency: formData.recurringFrequency
    });

    setIsAddingExpense(false);
    setFormData({
      amount: "",
      date: format(new Date(), "yyyy-MM-dd"),
      category: "",
      description: "",
      paymentMethod: "cash",
      paidTo: "",
      title: "",
      notes: "",
      receiptImage: "",
      isRecurring: false,
      recurringFrequency: "monthly"
    });

    toast.success("Expense updated successfully!");
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    toast.success("Expense deleted successfully!");
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Manage your business expenses
          </p>
        </div>
        <Button onClick={() => setIsAddingExpense(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2">
          <div>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>
              View and manage all business expenses
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full sm:w-[200px]"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { }} size="sm" className="gap-1">
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <Button variant="outline" onClick={() => { }} size="sm" className="gap-1">
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isAddingExpense ? (
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paidTo">Paid To</Label>
                  <Input
                    type="text"
                    id="paidTo"
                    name="paidTo"
                    value={formData.paidTo}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  type="text"
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="receiptImage">Receipt Image</Label>
                <Input
                  type="text"
                  id="receiptImage"
                  name="receiptImage"
                  value={formData.receiptImage}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setIsAddingExpense(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddExpense}>Add Expense</Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                      <div className="flex items-center">
                        Date
                        {sortBy === 'date' && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>
                      <div className="flex items-center">
                        Category
                        {sortBy === 'category' && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('description')}>
                      <div className="flex items-center">
                        Description
                        {sortBy === 'description' && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('amount')}>
                      <div className="flex items-center justify-end">
                        Amount
                        {sortBy === 'amount' && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedExpenses.length > 0 ? (
                    sortedExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            {expense.date}
                          </div>
                        </TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="text-right">₹{expense.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleUpdateExpense(expense.id)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(expense.id)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {searchTerm
                          ? "No expenses match your search criteria."
                          : "No expenses found. Add your first expense to get started."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
          <CardDescription>
            Total amount spent on expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">₹{totalExpenses.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
