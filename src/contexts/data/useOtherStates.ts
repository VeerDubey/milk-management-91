
import { useState, useEffect } from 'react';

export function useOtherStates() {
  const [customerProductRates, setCustomerProductRates] = useState<any[]>(() => {
    const saved = localStorage.getItem("customerProductRates");
    return saved ? JSON.parse(saved) : [];
  });

  const [invoices, setInvoices] = useState<any[]>(() => {
    const saved = localStorage.getItem("invoices");
    return saved ? JSON.parse(saved) : [];
  });

  const [trackSheets, setTrackSheets] = useState<any[]>(() => {
    const saved = localStorage.getItem("trackSheets");
    return saved ? JSON.parse(saved) : [];
  });

  const [uiSettings, setUiSettings] = useState<any>(() => {
    const saved = localStorage.getItem("uiSettings");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("customerProductRates", JSON.stringify(customerProductRates));
  }, [customerProductRates]);

  useEffect(() => {
    localStorage.setItem("invoices", JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem("trackSheets", JSON.stringify(trackSheets));
  }, [trackSheets]);

  useEffect(() => {
    localStorage.setItem("uiSettings", JSON.stringify(uiSettings));
  }, [uiSettings]);

  const addCustomerProductRate = (rate: any) => {
    const newRate = { ...rate, id: `rate${Date.now()}` };
    setCustomerProductRates([...customerProductRates, newRate]);
    return newRate;
  };

  const updateCustomerProductRate = (id: string, rateData: any) => {
    setCustomerProductRates(customerProductRates.map(r => r.id === id ? { ...r, ...rateData } : r));
  };

  const addInvoice = (invoice: any) => {
    const newInvoice = { ...invoice, id: `inv${Date.now()}` };
    setInvoices([...invoices, newInvoice]);
    return newInvoice.id;
  };

  const updateInvoice = (id: string, invoiceData: any) => {
    setInvoices(invoices.map(i => i.id === id ? { ...i, ...invoiceData } : i));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(invoices.filter(i => i.id !== id));
  };

  const getInvoiceById = (id: string) => {
    return invoices.find(i => i.id === id);
  };

  const generateInvoiceFromOrder = (orderId: string) => {
    return `inv${Date.now()}`;
  };

  const addTrackSheet = (trackSheet: any) => {
    const newTrackSheet = { ...trackSheet, id: `track${Date.now()}` };
    setTrackSheets([...trackSheets, newTrackSheet]);
    return newTrackSheet;
  };

  const updateTrackSheet = (id: string, trackSheetData: any) => {
    setTrackSheets(trackSheets.map(t => t.id === id ? { ...t, ...trackSheetData } : t));
  };

  const deleteTrackSheet = (id: string) => {
    setTrackSheets(trackSheets.filter(t => t.id !== id));
  };

  const updateUISettings = (settings: any) => {
    setUiSettings({ ...uiSettings, ...settings });
  };

  return {
    customerProductRates,
    invoices,
    trackSheets,
    uiSettings,
    addCustomerProductRate,
    updateCustomerProductRate,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceById,
    generateInvoiceFromOrder,
    addTrackSheet,
    updateTrackSheet,
    deleteTrackSheet,
    updateUISettings
  };
}
