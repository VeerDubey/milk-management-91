
import { useState, useEffect } from 'react';
import { Payment, Customer } from '@/types';
import { initialPayments } from '@/data/initialData';

export function usePaymentState(customers: Customer[], updateCustomer: Function) {
  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem("payments");
    return saved ? JSON.parse(saved) : initialPayments;
  });

  useEffect(() => {
    localStorage.setItem("payments", JSON.stringify(payments));
  }, [payments]);

  const addPayment = (payment: Omit<Payment, "id">) => {
    const newPayment = {
      ...payment,
      id: `pay${Date.now()}`
    };
    setPayments([...payments, newPayment]);
    
    const customer = customers.find(c => c.id === payment.customerId);
    if (customer) {
      updateCustomer(customer.id, {
        outstandingBalance: customer.outstandingBalance - payment.amount,
        lastPaymentDate: payment.date,
        lastPaymentAmount: payment.amount
      });
    }
  };

  const updatePayment = (id: string, paymentData: Partial<Payment>) => {
    const oldPayment = payments.find(p => p.id === id);
    
    setPayments(
      payments.map((payment) =>
        payment.id === id ? { ...payment, ...paymentData } : payment
      )
    );
    
    if (oldPayment && paymentData.amount && oldPayment.amount !== paymentData.amount) {
      const customer = customers.find(c => c.id === oldPayment.customerId);
      if (customer) {
        const difference = paymentData.amount - oldPayment.amount;
        updateCustomer(customer.id, {
          outstandingBalance: customer.outstandingBalance - difference,
          lastPaymentAmount: paymentData.amount,
          lastPaymentDate: paymentData.date || oldPayment.date
        });
      }
    }
  };

  const deletePayment = (id: string) => {
    const payment = payments.find(p => p.id === id);
    
    if (payment) {
      const customer = customers.find(c => c.id === payment.customerId);
      if (customer) {
        updateCustomer(customer.id, {
          outstandingBalance: customer.outstandingBalance + payment.amount
        });
      }
    }
    
    setPayments(payments.filter((payment) => payment.id !== id));
  };

  return {
    payments,
    addPayment,
    updatePayment,
    deletePayment
  };
}
