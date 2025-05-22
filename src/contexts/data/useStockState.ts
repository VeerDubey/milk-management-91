
import { useState, useEffect } from 'react';
import { StockRecord, StockEntry, StockEntryItem, StockTransaction } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function useStockState(updateSupplier: Function) {
  const [stockRecords, setStockRecords] = useState<StockRecord[]>(() => {
    const saved = localStorage.getItem("stockRecords");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [stockEntries, setStockEntries] = useState<StockEntry[]>(() => {
    const saved = localStorage.getItem("stockEntries");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(() => {
    const saved = localStorage.getItem("stockTransactions");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("stockRecords", JSON.stringify(stockRecords));
  }, [stockRecords]);
  
  useEffect(() => {
    localStorage.setItem("stockEntries", JSON.stringify(stockEntries));
  }, [stockEntries]);
  
  useEffect(() => {
    localStorage.setItem("stockTransactions", JSON.stringify(stockTransactions));
  }, [stockTransactions]);

  const addStockRecord = (record: Omit<StockRecord, "id">) => {
    const newRecord = {
      ...record,
      id: `sr${Date.now()}`
    };
    setStockRecords([...stockRecords, newRecord]);
    return newRecord;
  };

  const updateStockRecord = (id: string, recordData: Partial<StockRecord>) => {
    setStockRecords(
      stockRecords.map((record) =>
        record.id === id ? { ...record, ...recordData } : record
      )
    );
  };

  const deleteStockRecord = (id: string) => {
    setStockRecords(stockRecords.filter((record) => record.id !== id));
  };
  
  const addStockTransaction = (transaction: Omit<StockTransaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: `st${Date.now()}`
    };
    setStockTransactions(prev => [...prev, newTransaction]);
    return newTransaction;
  };
  
  const updateStockTransaction = (id: string, transactionData: Partial<StockTransaction>) => {
    setStockTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id ? { ...transaction, ...transactionData } : transaction
      )
    );
  };
  
  const deleteStockTransaction = (id: string) => {
    setStockTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };
  
  const addStockEntry = (entry: Omit<StockEntry, "id">) => {
    // Generate a new ID since it might not be provided
    const newEntryId = `se${Date.now()}`;
    const newEntry = {
      ...entry,
      id: newEntryId
    };
    
    setStockEntries([...stockEntries, newEntry]);
    
    // Update stock records based on stock entry
    if (entry.items && entry.items.length > 0) {
      entry.items.forEach(item => {
        const latestRecord = [...stockRecords]
          .filter(record => record.productId === item.productId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        if (latestRecord) {
          const closingStock = latestRecord.closingStock + item.quantity;
          addStockRecord({
            date: entry.date,
            productId: item.productId,
            quantity: item.quantity,
            type: 'in',
            openingStock: latestRecord.closingStock,
            received: item.quantity,
            dispatched: 0,
            closingStock: closingStock,
            minStockLevel: latestRecord.minStockLevel
          });
        } else {
          addStockRecord({
            date: entry.date,
            productId: item.productId,
            quantity: item.quantity,
            type: 'in',
            openingStock: 0,
            received: item.quantity,
            dispatched: 0,
            closingStock: item.quantity
          });
        }
      });
    }
    
    // Update supplier outstanding balance
    if (entry.supplierId) {
      const supplier = { id: entry.supplierId, outstandingBalance: 0 }; // Using dummy object with required props
      const newBalance = (supplier.outstandingBalance || 0) + entry.totalAmount;
      updateSupplier(supplier.id, {
        outstandingBalance: newBalance
      });
    }
    
    return newEntry;
  };

  const updateStockEntry = (id: string, entryData: Partial<StockEntry>) => {
    setStockEntries(
      stockEntries.map((entry) =>
        entry.id === id ? { ...entry, ...entryData } : entry
      )
    );
  };

  const deleteStockEntry = (id: string) => {
    setStockEntries(stockEntries.filter((entry) => entry.id !== id));
  };

  // Add stock function that matches the interface
  const addStock = (entry: Omit<StockEntry, "id">) => {
    return addStockEntry(entry);
  };

  return {
    stockRecords,
    stockEntries,
    stockTransactions,
    addStockRecord,
    updateStockRecord,
    deleteStockRecord,
    addStockTransaction,
    updateStockTransaction,
    deleteStockTransaction,
    addStockEntry,
    updateStockEntry,
    deleteStockEntry,
    addStock
  };
}
