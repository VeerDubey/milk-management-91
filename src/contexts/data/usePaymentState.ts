
import { useState, useEffect } from 'react';
import { Payment } from '@/types';

export function usePaymentState() {
  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem("payments");
    return saved ? JSON.parse(saved) : [];
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
    return newPayment;
  };

  const updatePayment = (id: string, paymentData: Partial<Payment>) => {
    setPayments(
      payments.map((payment) =>
        payment.id === id ? { ...payment, ...paymentData } : payment
      )
    );
  };

  const deletePayment = (id: string) => {
    setPayments(payments.filter((payment) => payment.id !== id));
  };

  return {
    payments,
    addPayment,
    updatePayment,
    deletePayment
  };
}
