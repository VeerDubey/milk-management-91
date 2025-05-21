import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Expense } from '@/types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

const ExpensesRevamped = () => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useData();
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm<Expense>();

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
    };
    addExpense(newExpense);
    setShowExpenseForm(false);
    reset();
    toast.success("Expense added successfully");
  };

  const handleUpdateExpense = (id: string, data: Partial<Expense>) => {
    updateExpense(id, {
      ...data,
    });
    setEditingExpenseId(null);
    reset();
    toast.success("Expense updated successfully");
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    toast.success("Expense deleted successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <Button onClick={() => setShowExpenseForm(true)}>Add Expense</Button>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map(expense => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.title}</TableCell>
                  <TableCell>₹{expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(expense.date), 'PPP')}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>
                    <Button onClick={() => {
                      setEditingExpenseId(expense.id);
                      setShowExpenseForm(true);
                    }}>Edit</Button>
                    <Button onClick={() => handleDeleteExpense(expense.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpenseId ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
            <DialogDescription>
              {editingExpenseId ? 'Edit your expense details' : 'Fill in the details to add a new expense'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(data => editingExpenseId ? handleUpdateExpense(editingExpenseId, data) : handleAddExpense(data))}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register("title", { required: true })} />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" {...register("amount", { required: true })} />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...register("date", { required: true })} />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" {...register("category", { required: true })} />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" {...register("description")} />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Input id="paymentMethod" {...register("paymentMethod", { required: true })} />
              </div>
              <div>
                <Label htmlFor="reference">Reference</Label>
                <Input id="reference" {...register("reference")} />
              </div>
              <div>
                <Label htmlFor="recurring">Recurring</Label>
                <Input id="recurring" type="checkbox" {...register("recurring")} />
              </div>
              {editingExpenseId && (
                <div>
                  <Label htmlFor="recurringFrequency">Recurring Frequency</Label>
                  <Input id="recurringFrequency" {...register("recurringFrequency")} />
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
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
