
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Expense } from '@/types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ExpensesRevamped = () => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useData();
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const { register, handleSubmit, reset, setValue, control } = useForm<Expense>();

  // Common expense categories
  const expenseCategories = [
    'Salary',
    'Utilities',
    'Rent',
    'Supplies',
    'Transportation',
    'Maintenance',
    'Marketing',
    'Insurance',
    'Office',
    'Miscellaneous'
  ];

  // Common payment methods
  const paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'UPI',
    'Cheque',
    'PayTM',
    'GPay',
    'PhonePe',
    'Other'
  ];

  useEffect(() => {
    if (editingExpenseId) {
      const expense = expenses.find(exp => exp.id === editingExpenseId);
      if (expense) {
        setValue('title', expense.title);
        setValue('amount', expense.amount);
        setValue('date', expense.date);
        setValue('category', expense.category);
        setValue('description', expense.description || '');
        setValue('paymentMethod', expense.paymentMethod);
        setValue('reference', expense.reference || '');
        setValue('recurring', expense.recurring || false);
        if (expense.recurring) {
          setValue('recurringFrequency', expense.recurringFrequency || 'monthly');
        }
      }
    }
  }, [editingExpenseId, expenses, setValue]);

  const handleAddExpense = (data: Omit<Expense, "id">) => {
    const newExpense = {
      ...data,
      id: uuidv4(),
      // Ensure amount is stored as a number
      amount: Number(data.amount)
    };
    addExpense(newExpense);
    setShowExpenseForm(false);
    reset();
    toast.success("Expense added successfully");
  };

  const handleUpdateExpense = (id: string, data: Partial<Expense>) => {
    updateExpense(id, {
      ...data,
      // Ensure amount is stored as a number when updating
      amount: data.amount !== undefined ? Number(data.amount) : undefined
    });
    setEditingExpenseId(null);
    setShowExpenseForm(false);
    reset();
    toast.success("Expense updated successfully");
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    toast.success("Expense deleted successfully");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <Button onClick={() => {
          setEditingExpenseId(null);
          reset();
          setShowExpenseForm(true);
        }}>Add Expense</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No expenses found. Add your first expense to get started.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map(expense => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.title}</TableCell>
                    <TableCell>₹{Number(expense.amount).toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(expense.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.paymentMethod}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setEditingExpenseId(expense.id);
                            setShowExpenseForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{editingExpenseId ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
            <DialogDescription>
              {editingExpenseId ? 'Edit your expense details' : 'Fill in the details to add a new expense'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(data => editingExpenseId ? handleUpdateExpense(editingExpenseId, data) : handleAddExpense(data))}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register("title", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  step="0.01" 
                  {...register("amount", { 
                    required: true,
                    valueAsNumber: true 
                  })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...register("date", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  onValueChange={(value) => setValue("category", value)}
                  defaultValue={editingExpenseId ? expenses.find(e => e.id === editingExpenseId)?.category : ""}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  id="category-input" 
                  className="mt-2" 
                  placeholder="Or enter a custom category" 
                  {...register("category", { required: true })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select 
                  onValueChange={(value) => setValue("paymentMethod", value)}
                  defaultValue={editingExpenseId ? expenses.find(e => e.id === editingExpenseId)?.paymentMethod : ""}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  id="payment-method-input" 
                  className="mt-2" 
                  placeholder="Or enter a custom payment method" 
                  {...register("paymentMethod", { required: true })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Reference (Optional)</Label>
                <Input id="reference" {...register("reference")} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    {...register("recurring")}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="recurring">Recurring Expense</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" {...register("description")} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => setShowExpenseForm(false)}>Cancel</Button>
              </DialogClose>
              <Button type="submit">{editingExpenseId ? 'Update' : 'Add'} Expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesRevamped;
