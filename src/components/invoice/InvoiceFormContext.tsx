
import React, { createContext, useContext, useState, useEffect } from 'react';
import { InvoiceFormData, Currency } from '@/types/invoice';
import { CURRENCIES, DEFAULT_COMPANY_PROFILE } from '@/utils/invoiceTemplates';

interface InvoiceFormContextType {
  formData: InvoiceFormData;
  updateFormData: (updates: Partial<InvoiceFormData>) => void;
  calculateTotals: () => void;
  resetForm: () => void;
  fillDummyData: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

const InvoiceFormContext = createContext<InvoiceFormContextType | undefined>(undefined);

const getInitialFormData = (): InvoiceFormData => ({
  customerName: '',
  customerAddress: '',
  customerPhone: '',
  customerEmail: '',
  deliveryAddress: '',
  deliveryDate: new Date().toISOString().split('T')[0],
  deliveryTime: '06:00',
  companyName: DEFAULT_COMPANY_PROFILE.name,
  companyAddress: DEFAULT_COMPANY_PROFILE.address,
  companyPhone: DEFAULT_COMPANY_PROFILE.phone,
  companyEmail: DEFAULT_COMPANY_PROFILE.email,
  companyGST: DEFAULT_COMPANY_PROFILE.gstNumber,
  invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency: CURRENCIES[0],
  items: [],
  subtotal: 0,
  taxPercentage: 0,
  taxAmount: 0,
  discountAmount: 0,
  grandTotal: 0,
  notes: '',
  terms: '',
  templateId: 'professional_blue'
});

export const InvoiceFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<InvoiceFormData>(getInitialFormData);

  const updateFormData = (updates: Partial<InvoiceFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * formData.taxPercentage) / 100;
    const grandTotal = subtotal + taxAmount - formData.discountAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      grandTotal
    }));
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
    localStorage.removeItem('invoiceFormData');
  };

  const fillDummyData = () => {
    const dummyData: Partial<InvoiceFormData> = {
      customerName: 'Rajesh Kumar',
      customerAddress: '456 Green Valley, Sector 7, Mumbai - 400012',
      customerPhone: '+91 87654 32109',
      customerEmail: 'rajesh.kumar@email.com',
      deliveryAddress: 'Same as billing address',
      items: [
        {
          id: '1',
          productId: 'whole_milk_1l',
          productName: 'Whole Milk',
          description: 'Fresh whole milk with 3.5% fat content',
          quantity: 2,
          unit: 'liter',
          rate: 60,
          total: 120
        },
        {
          id: '2',
          productId: 'paneer_250g',
          productName: 'Fresh Paneer',
          description: 'Fresh cottage cheese - 250g pack',
          quantity: 1,
          unit: 'pack',
          rate: 120,
          total: 120
        }
      ],
      taxPercentage: 5,
      notes: 'Thank you for your business! Fresh milk delivered daily.',
      terms: 'Payment due within 7 days. Quality guaranteed.'
    };

    setFormData(prev => ({ ...prev, ...dummyData }));
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('invoiceFormData', JSON.stringify(formData));
  };

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('invoiceFormData');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setFormData({ ...getInitialFormData(), ...parsedData });
      } catch (error) {
        console.error('Failed to load saved form data:', error);
      }
    }
  };

  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.taxPercentage, formData.discountAmount]);

  useEffect(() => {
    saveToLocalStorage();
  }, [formData]);

  return (
    <InvoiceFormContext.Provider value={{
      formData,
      updateFormData,
      calculateTotals,
      resetForm,
      fillDummyData,
      saveToLocalStorage,
      loadFromLocalStorage
    }}>
      {children}
    </InvoiceFormContext.Provider>
  );
};

export const useInvoiceForm = () => {
  const context = useContext(InvoiceFormContext);
  if (!context) {
    throw new Error('useInvoiceForm must be used within InvoiceFormProvider');
  }
  return context;
};
