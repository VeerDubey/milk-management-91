
import { Order, Customer, Product, TrackSheet, TrackSheetRow } from '@/types';
import { format } from 'date-fns';

export class DeliverySheetService {
  /**
   * Generate delivery sheet from orders for a specific date and area
   */
  static generateDeliverySheet(
    orders: Order[],
    customers: Customer[],
    products: Product[],
    date: Date,
    area?: string,
    vehicleId?: string
  ): TrackSheet {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Filter orders by date and area
    const filteredOrders = orders.filter(order => {
      const orderDate = format(new Date(order.date), 'yyyy-MM-dd');
      const customer = customers.find(c => c.id === order.customerId);
      
      const matchesDate = orderDate === dateStr;
      const matchesArea = !area || customer?.area === area;
      const matchesVehicle = !vehicleId || order.vehicleId === vehicleId;
      
      return matchesDate && matchesArea && matchesVehicle;
    });

    // Group orders by customer
    const customerGroups: { [customerId: string]: Order[] } = {};
    filteredOrders.forEach(order => {
      if (!customerGroups[order.customerId]) {
        customerGroups[order.customerId] = [];
      }
      customerGroups[order.customerId].push(order);
    });

    // Generate track sheet rows
    const rows: TrackSheetRow[] = [];
    
    Object.entries(customerGroups).forEach(([customerId, customerOrders]) => {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      // Aggregate quantities by product
      const productQuantities: Record<string, number> = {};
      let totalAmount = 0;

      customerOrders.forEach(order => {
        order.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const productCode = product.code || this.generateProductCode(product.name);
            productQuantities[productCode] = (productQuantities[productCode] || 0) + item.quantity;
            totalAmount += item.quantity * item.unitPrice;
          }
        });
      });

      // Calculate total quantity
      const totalQty = Object.values(productQuantities).reduce((sum, qty) => sum + qty, 0);

      const row: TrackSheetRow = {
        customerId: customer.id,
        name: customer.name,
        quantities: productQuantities,
        total: totalQty,
        amount: totalAmount,
        products: Object.keys(productQuantities)
      };

      rows.push(row);
    });

    // Sort rows by customer name
    rows.sort((a, b) => a.name.localeCompare(b.name));

    const trackSheet: TrackSheet = {
      id: `ds_${Date.now()}`,
      name: `Delivery Sheet - ${format(date, 'dd/MM/yyyy')}${area ? ` - ${area}` : ''}`,
      date: dateStr,
      rows,
      vehicleId,
      routeName: area,
      createdAt: new Date().toISOString(),
      notes: `Auto-generated from ${filteredOrders.length} orders`,
      summary: this.calculateSummary(rows)
    };

    return trackSheet;
  }

  /**
   * Calculate summary for track sheet
   */
  static calculateSummary(rows: TrackSheetRow[]) {
    const productTotals: Record<string, number> = {};
    let totalItems = 0;
    let totalAmount = 0;

    rows.forEach(row => {
      totalItems += row.total;
      totalAmount += row.amount;
      
      Object.entries(row.quantities).forEach(([productCode, quantity]) => {
        if (typeof quantity === 'number') {
          productTotals[productCode] = (productTotals[productCode] || 0) + quantity;
        }
      });
    });

    return {
      totalItems,
      totalAmount,
      productTotals
    };
  }

  /**
   * Generate product code from name
   */
  static generateProductCode(productName: string): string {
    const words = productName.toUpperCase().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 3);
    }
    
    let code = words.map(word => word.charAt(0)).join('');
    if (code.length > 6) {
      code = code.substring(0, 6);
    }
    
    const numbers = productName.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      code += numbers[0];
    }
    
    return code;
  }

  /**
   * Update delivery sheet when orders change
   */
  static updateDeliverySheetFromOrders(
    existingSheet: TrackSheet,
    orders: Order[],
    customers: Customer[],
    products: Product[]
  ): TrackSheet {
    const date = new Date(existingSheet.date);
    const area = existingSheet.routeName;
    const vehicleId = existingSheet.vehicleId;
    
    return this.generateDeliverySheet(orders, customers, products, date, area, vehicleId);
  }

  /**
   * Export delivery sheet to printable format
   */
  static exportToPrint(trackSheet: TrackSheet, companyInfo?: any): string {
    const date = format(new Date(trackSheet.date), 'dd/MM/yyyy');
    const area = trackSheet.routeName || 'All Areas';
    
    let html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; color: #333;">VIKAS MILK CENTRE</h1>
          <p style="margin: 5px 0; color: #666;">SINCE 1975</p>
          <div style="margin-top: 20px;">
            <span style="margin-right: 20px;">Date: ${date}</span>
            <span>Area: ${area}</span>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">S.NO</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">CUSTOMER NAME</th>
    `;

    // Add product code headers
    const allProductCodes = new Set<string>();
    trackSheet.rows.forEach(row => {
      Object.keys(row.quantities).forEach(code => allProductCodes.add(code));
    });
    
    Array.from(allProductCodes).sort().forEach(code => {
      html += `<th style="border: 1px solid #ddd; padding: 8px; text-align: center;">${code}</th>`;
    });
    
    html += `
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">QTY</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
    `;

    // Add data rows
    trackSheet.rows.forEach((row, index) => {
      html += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${row.name}</td>
      `;
      
      Array.from(allProductCodes).sort().forEach(code => {
        const quantity = row.quantities[code] || '';
        html += `<td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${quantity}</td>`;
      });
      
      html += `
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">${row.total}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">₹${row.amount.toFixed(2)}</td>
        </tr>
      `;
    });

    // Add totals row
    html += `
      <tr style="background-color: #f9f9f9; font-weight: bold;">
        <td style="border: 1px solid #ddd; padding: 8px;" colspan="2">TOTAL</td>
    `;
    
    Array.from(allProductCodes).sort().forEach(code => {
      const total = trackSheet.summary?.productTotals[code] || 0;
      html += `<td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${total}</td>`;
    });
    
    html += `
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${trackSheet.summary?.totalItems || 0}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">₹${(trackSheet.summary?.totalAmount || 0).toFixed(2)}</td>
      </tr>
    `;

    html += `
          </tbody>
        </table>
        
        <div style="margin-top: 50px; display: flex; justify-content: space-between;">
          <div style="text-align: center;">
            <div style="border-bottom: 2px solid #333; width: 200px; margin-bottom: 10px;"></div>
            <p style="margin: 0; font-size: 14px; color: #666;">Driver's Signature</p>
          </div>
          <div style="text-align: center;">
            <div style="border-bottom: 2px solid #333; width: 200px; margin-bottom: 10px;"></div>
            <p style="margin: 0; font-size: 14px; color: #666;">Supervisor's Signature</p>
          </div>
        </div>
      </div>
    `;

    return html;
  }

  /**
   * Generate delivery sheet for multiple areas/vehicles
   */
  static generateMultipleDeliverySheets(
    orders: Order[],
    customers: Customer[],
    products: Product[],
    date: Date,
    groupBy: 'area' | 'vehicle' = 'area'
  ): TrackSheet[] {
    const sheets: TrackSheet[] = [];
    const groups = new Set<string>();

    // Collect unique groups
    orders.forEach(order => {
      const customer = customers.find(c => c.id === order.customerId);
      if (groupBy === 'area' && customer?.area) {
        groups.add(customer.area);
      } else if (groupBy === 'vehicle' && order.vehicleId) {
        groups.add(order.vehicleId);
      }
    });

    // Generate sheet for each group
    groups.forEach(group => {
      const sheet = this.generateDeliverySheet(
        orders,
        customers,
        products,
        date,
        groupBy === 'area' ? group : undefined,
        groupBy === 'vehicle' ? group : undefined
      );
      
      if (sheet.rows.length > 0) {
        sheets.push(sheet);
      }
    });

    return sheets;
  }
}
