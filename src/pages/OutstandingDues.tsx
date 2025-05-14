import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarDays } from "lucide-react"
import { DateRange } from "react-day-picker"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function OutstandingDues() {
  const { customers, orders, payments, addPayment } = useData();
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [date, setDate] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  })

  useEffect(() => {
    if (customers.length > 0 && !selectedCustomer) {
      setSelectedCustomer(customers[0]);
    }
  }, [customers, selectedCustomer]);

  const customerOrders = selectedCustomer
    ? orders.filter(order => order.customerId === selectedCustomer.id)
    : [];

  const totalOutstanding = selectedCustomer
    ? selectedCustomer.outstandingBalance
    : 0;

  const handleAddPayment = () => {
    if (selectedCustomer && paymentAmount > 0) {
      addPayment({
        customerId: selectedCustomer.id,
        amount: parseFloat(paymentAmount),
        date: paymentDate,
        notes: paymentNotes,
        paymentMethod: "cash" // Add the required paymentMethod property
      });

      toast.success('Payment recorded successfully!');
      setPaymentAmount('');
      setPaymentNotes('');
    } else {
      toast.error('Please select a customer and enter a valid payment amount.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Outstanding Dues</h1>
          <p className="text-muted-foreground">Manage customer outstanding payments</p>
        </div>
        <Button onClick={() => navigate('/customers')}>
          View Customers
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customer">Select Customer</Label>
            <select
              id="customer"
              className="w-full rounded-md border shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={selectedCustomer ? selectedCustomer.id : ''}
              onChange={(e) => {
                const customer = customers.find(c => c.id === e.target.value);
                setSelectedCustomer(customer || null);
              }}
            >
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="paymentAmount">Payment Amount</Label>
            <Input
              type="number"
              id="paymentAmount"
              placeholder="Enter amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </div>

          <div>
            <Label>Payment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date.from && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      `${format(date.from, "MMM dd, yyyy")} - ${format(
                        date.to,
                        "MMM dd, yyyy"
                      )}`
                    ) : (
                      format(date.from, "MMM dd, yyyy")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center" side="bottom">
                <Calendar
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  onDayClick={(date) => {
                    setDate({ from: date, to: date });
                    setPaymentDate(date.toISOString().split('T')[0]);
                  }}
                  numberOfMonths={1}
                  pagedNavigation
                  className="border-0 overflow-hidden rounded-md"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="paymentNotes">Payment Notes</Label>
            <Textarea
              id="paymentNotes"
              placeholder="Enter notes"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button onClick={handleAddPayment}>Record Payment</Button>
          </div>
        </div>
      </Card>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Outstanding Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedCustomer ? (
              <TableRow key={selectedCustomer.id}>
                <TableCell className="font-medium">{selectedCustomer.name}</TableCell>
                <TableCell>{selectedCustomer.phone}</TableCell>
                <TableCell>{selectedCustomer.address}</TableCell>
                <TableCell>₹{selectedCustomer.outstandingBalance.toFixed(2)}</TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No customer selected.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
