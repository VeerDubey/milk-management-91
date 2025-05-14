
import React, { useState, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Banknote,
  CalendarIcon,
  Edit,
  File,
  FileText,
  Filter,
  Plus,
  Search,
  Trash,
  XCircle,
} from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useData();

  // Add/Edit expense state
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpenseId, setCurrentExpenseId] = useState<string>("");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseDate, setExpenseDate] = useState<Date | undefined>(new Date());
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expensePaidTo, setExpensePaidTo] = useState("");
  const [expensePaymentMethod, setExpensePaymentMethod] = useState("cash");

  // Filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  
  // Category options for dropdown
  const expenseCategories = [
    "Rent",
    "Utilities",
    "Salaries",
    "Inventory",
    "Transportation",
    "Maintenance",
    "Marketing",
    "Office Supplies",
    "Insurance",
    "Taxes",
    "Miscellaneous",
  ];

  // Handle adding a new expense
  const handleAddExpense = () => {
    if (!expenseTitle || !expenseAmount || !expenseCategory || !expenseDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const amount = parseFloat(expenseAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      if (isEditing && currentExpenseId) {
        // Update existing expense
        updateExpense(currentExpenseId, {
          title: expenseTitle,
          amount,
          category: expenseCategory,
          date: expenseDate.toISOString(),
          description: expenseDescription,
          paidTo: expensePaidTo,
          paymentMethod: expensePaymentMethod,
        });
        toast.success("Expense updated successfully");
      } else {
        // Add new expense
        addExpense({
          title: expenseTitle,
          amount,
          category: expenseCategory,
          date: expenseDate.toISOString(),
          description: expenseDescription,
          paidTo: expensePaidTo,
          paymentMethod: expensePaymentMethod,
        });
        toast.success("Expense added successfully");
      }

      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error adding/updating expense:", error);
      toast.error("Failed to save expense");
    }
  };

  const resetForm = () => {
    setExpenseTitle("");
    setExpenseAmount("");
    setExpenseCategory("");
    setExpenseDate(new Date());
    setExpenseDescription("");
    setExpensePaidTo("");
    setExpensePaymentMethod("cash");
    setIsEditing(false);
    setCurrentExpenseId("");
  };

  const handleEditExpense = (expense: any) => {
    setIsEditing(true);
    setCurrentExpenseId(expense.id);
    setExpenseTitle(expense.title);
    setExpenseAmount(expense.amount.toString());
    setExpenseCategory(expense.category);
    setExpenseDate(new Date(expense.date));
    setExpenseDescription(expense.description || "");
    setExpensePaidTo(expense.paidTo || "");
    setExpensePaymentMethod(expense.paymentMethod || "cash");
  };

  const handleDeleteExpense = (id: string) => {
    try {
      deleteExpense(id);
      toast.success("Expense deleted successfully");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };

  // Apply filters
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(expense => {
        // Search query filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            expense.title.toLowerCase().includes(query) ||
            expense.description?.toLowerCase().includes(query) ||
            expense.paidTo?.toLowerCase().includes(query) ||
            expense.category.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .filter(expense => {
        // Category filter
        if (categoryFilter) {
          return expense.category === categoryFilter;
        }
        return true;
      })
      .filter(expense => {
        // Date range filter
        const expenseDate = new Date(expense.date);
        if (startDate && endDate) {
          return expenseDate >= startDate && expenseDate <= endDate;
        }
        if (startDate) {
          return expenseDate >= startDate;
        }
        if (endDate) {
          return expenseDate <= endDate;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchQuery, categoryFilter, startDate, endDate]);

  // Calculate total expenses based on filters
  const totalFilteredExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track and manage business expenses</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Expense" : "Add New Expense"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Update expense details" : "Enter the details of the expense"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="expense-title">Expense Title</Label>
                <Input
                  id="expense-title"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="E.g. Office Rent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expense-amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                    <Input
                      id="expense-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-category">Category</Label>
                  <Select
                    value={expenseCategory}
                    onValueChange={setExpenseCategory}
                  >
                    <SelectTrigger id="expense-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !expenseDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expenseDate ? format(expenseDate, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={expenseDate}
                        onSelect={setExpenseDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-payment-method">Payment Method</Label>
                  <Select
                    value={expensePaymentMethod}
                    onValueChange={setExpensePaymentMethod}
                  >
                    <SelectTrigger id="expense-payment-method">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense-paid-to">Paid To</Label>
                <Input
                  id="expense-paid-to"
                  value={expensePaidTo}
                  onChange={(e) => setExpensePaidTo(e.target.value)}
                  placeholder="Vendor/Person name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense-description">Description</Label>
                <Textarea
                  id="expense-description"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="Additional details about this expense..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleAddExpense}>
                {isEditing ? "Update Expense" : "Add Expense"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
          <CardDescription>
            Total expenses: ₹{totalFilteredExpenses.toLocaleString()}
            {(searchQuery || categoryFilter || startDate || endDate) && " (filtered)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search expenses..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    {(categoryFilter || startDate || endDate) && (
                      <span className="ml-1 rounded-full bg-primary w-2 h-2" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-4">
                  <div className="space-y-4">
                    <h4 className="font-medium leading-none mb-3">Filter Options</h4>
                    <div className="space-y-2">
                      <Label htmlFor="category-filter">Category</Label>
                      <Select
                        value={categoryFilter}
                        onValueChange={setCategoryFilter}
                      >
                        <SelectTrigger id="category-filter">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Categories</SelectItem>
                          {expenseCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date Range</Label>
                      <div className="space-y-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left text-xs font-normal",
                                !startDate && "text-muted-foreground"
                              )}
                              size="sm"
                            >
                              <CalendarIcon className="mr-2 h-3 w-3" />
                              {startDate ? format(startDate, "PPP") : "Start date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left text-xs font-normal",
                                !endDate && "text-muted-foreground"
                              )}
                              size="sm"
                            >
                              <CalendarIcon className="mr-2 h-3 w-3" />
                              {endDate ? format(endDate, "PPP") : "End date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCategoryFilter("");
                          setStartDate(undefined);
                          setEndDate(undefined);
                          setSearchQuery("");
                        }}
                        className="h-8"
                      >
                        <XCircle className="mr-2 h-3.5 w-3.5" />
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Separator className="mb-6" />
          <ScrollArea className="h-[400px] rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Paid To</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">
                        {format(new Date(expense.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={expense.title}>
                        {expense.title}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full bg-muted text-xs">
                          {expense.category}
                        </span>
                      </TableCell>
                      <TableCell>{expense.paidTo || "-"}</TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{expense.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditExpense(expense)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{isEditing ? "Edit Expense" : "Add New Expense"}</DialogTitle>
                                <DialogDescription>
                                  {isEditing ? "Update expense details" : "Enter the details of the expense"}
                                </DialogDescription>
                              </DialogHeader>
                              {/* Dialog content is duplicated here, which is not ideal but necessary for the DialogTrigger to work */}
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete
                                  the expense record.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteExpense(expense.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="h-12 w-12 mb-2 opacity-20" />
                        <p className="text-sm">No expenses found</p>
                        {(searchQuery || categoryFilter || startDate || endDate) ? (
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchQuery("");
                              setCategoryFilter("");
                              setStartDate(undefined);
                              setEndDate(undefined);
                            }}
                            className="mt-2"
                          >
                            Clear filters
                          </Button>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="link" className="mt-2">
                                Add your first expense
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredExpenses.length} of {expenses.length} expenses
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
