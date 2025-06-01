
import { z } from 'zod';

// Customer validation schema
export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters').max(200, 'Address must be less than 200 characters'),
  area: z.string().min(2, 'Area is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
});

// Product validation schema
export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(50, 'Product name must be less than 50 characters'),
  category: z.string().min(2, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  price: z.number().min(0.01, 'Price must be greater than 0').max(10000, 'Price must be less than 10,000'),
  stock: z.number().min(0, 'Stock cannot be negative'),
});

// Order validation schema
export const orderSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    quantity: z.number().min(0.1, 'Quantity must be greater than 0'),
    rate: z.number().min(0.01, 'Rate must be greater than 0'),
  })).min(1, 'At least one item is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  salesmanId: z.string().min(1, 'Salesman is required'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

// Payment validation schema
export const paymentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0').max(100000, 'Amount must be less than 1,00,000'),
  method: z.enum(['cash', 'card', 'upi', 'bank_transfer'], {
    errorMap: () => ({ message: 'Please select a valid payment method' })
  }),
  notes: z.string().max(200, 'Notes must be less than 200 characters').optional(),
});

// Supplier validation schema
export const supplierSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters').max(200, 'Address must be less than 200 characters'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format').optional().or(z.literal('')),
});

// User validation schema
export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(50, 'Password must be less than 50 characters'),
  role: z.enum(['admin', 'employee'], {
    errorMap: () => ({ message: 'Please select a valid role' })
  }),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type SupplierFormData = z.infer<typeof supplierSchema>;
export type UserFormData = z.infer<typeof userSchema>;
