import React, { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Edit, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { Expense } from "@/types";
import { toast } from "sonner";

const Expenses = () => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidTo, setPaidTo] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("monthly");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleAddExpense = () => {
    if (!expenseTitle || !amount || !category || !selectedDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Make sure recurringFrequency is the correct type
    let typedRecurringFrequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | undefined = undefined;
    
    if (isRecurring) {
      if (['weekly', 'monthly', 'quarterly', 'yearly'].includes(recurringFrequency)) {
        typedRecurringFrequency = recurringFrequency as 'weekly' | 'monthly' | 'quarterly' | 'yearly';
      } else {
        // Default to monthly if invalid value
        typedRecurringFrequency = 'monthly';
      }
    }

    const expense = {
      title: expenseTitle,
      amount: parseFloat(amount),
      category: category,
      description: description,
      date: format(selectedDate, 'yyyy-MM-dd'),
      paymentMethod: paymentMethod as 'cash' | 'bank' | 'upi' | 'other',
      paidTo: paidTo,
      notes: notes,
      isRecurring: isRecurring,
      recurringFrequency: typedRecurringFrequency
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, expense);
      toast.success("Expense updated successfully");
    } else {
      addExpense(expense);
      toast.success("Expense added successfully");
    }

    resetForm();
    setDialogOpen(false);
  };

  const handleEditExpense = (expense: Expense) => {
    // Ensure correct type for recurringFrequency
    const typedRecurringFrequency = expense.recurringFrequency as 'weekly' | 'monthly' | 'quarterly' | 'yearly' | undefined;

    setExpenseTitle(expense.title || '');
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDescription(expense.description);
    setSelectedDate(new Date(expense.date));
    setPaymentMethod(expense.paymentMethod);
    setPaidTo(expense.paidTo || '');
    setNotes(expense.notes || '');
    setIsRecurring(expense.isRecurring || false);
    setRecurringFrequency(typedRecurringFrequency || 'monthly');
    setEditingExpense(expense);
    setDialogOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      deleteExpense(id);
      toast.success("Expense deleted successfully");
    }
  };

  const resetForm = () => {
    setExpenseTitle("");
    setAmount("");
    setCategory("");
    setDescription("");
    setSelectedDate(new Date());
    setPaymentMethod("cash");
    setPaidTo("");
    setNotes("");
    setIsRecurring(false);
    setRecurringFrequency("monthly");
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Manage and track your business expenses
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense List</CardTitle>
          <CardDescription>View and manage your expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.title}</TableCell>
                    <TableCell>₹{expense.amount.toFixed(2)}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{format(new Date(expense.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{expense.paymentMethod}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditExpense(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Edit Expense" : "Add Expense"}
            </DialogTitle>
            <DialogDescription>
              {editingExpense
                ? "Update the expense details below."
                : "Enter the expense details to create a new expense."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={
                      "w-[240px] justify-start text-left font-normal" +
                      (selectedDate ? " pl-3.5" : "")
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                  sideOffset={5}
                >
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    style={{ width: "300px" }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
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
            <div className="grid gap-2">
              <Label htmlFor="paidTo">Paid To</Label>
              <Input
                id="paidTo"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
              <Label htmlFor="isRecurring">Is Recurring</Label>
            </div>
            {isRecurring && (
              <div className="grid gap-2">
                <Label htmlFor="recurringFrequency">Recurring Frequency</Label>
                <Select
                  value={recurringFrequency}
                  onValueChange={setRecurringFrequency}
                >
                  <SelectTrigger id="recurringFrequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={handleAddExpense}>
              {editingExpense ? "Update Expense" : "Add Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expenses;
