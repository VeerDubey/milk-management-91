
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Extended options for PDF export
export interface PdfExportOptions {
  title?: string;
  subtitle?: string;
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: string;
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  autoPrint?: boolean;
  dateInfo?: string;
  additionalInfo?: Array<{label: string, value: string}>;
  landscape?: boolean;
  columnStyles?: Record<string, any>;
  rowStyles?: Record<number, any>;
}

// Export function to create PDF from tabular data
export const exportToPdf = (
  headers: string[],
  rows: (string | number)[][],
  options: PdfExportOptions = {}
) => {
  try {
    const {
      title = 'Export Report',
      subtitle = '',
      filename = 'export.pdf',
      orientation = 'portrait',
      pageSize = 'a4',
      margins = { top: 30, right: 15, bottom: 20, left: 15 },
      autoPrint = false,
      dateInfo = '',
      landscape = false,
      columnStyles = {},
      rowStyles = {}
    } = options;

    // Initialize PDF document
    const doc = new jsPDF({
      orientation: landscape ? 'landscape' : orientation,
      unit: 'mm',
      format: pageSize,
    });

    // Add title and subtitle
    const defaultFontSize = 10;
    doc.setFontSize(16);
    doc.text(title, 15, 15);
    
    doc.setFontSize(11);
    doc.text(subtitle, 15, 22);
    
    // Add date info if provided
    if (dateInfo) {
      doc.setFontSize(10);
      doc.text(dateInfo, 15, 28);
    }
    
    // Add additional info if provided
    if (options.additionalInfo && options.additionalInfo.length > 0) {
      doc.setFontSize(10);
      let yPosition = 28;
      
      options.additionalInfo.forEach((info, index) => {
        if (dateInfo && index === 0) yPosition += 5; // Add spacing if date info exists
        yPosition += 5;
        doc.text(`${info.label}: ${info.value}`, 15, yPosition);
      });
    }
    
    doc.setFontSize(defaultFontSize);

    // Convert headers and rows to expected format
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: options.additionalInfo && options.additionalInfo.length > 0 ? 40 : 30,
      margin: { top: margins.top, right: margins.right, bottom: margins.bottom, left: margins.left },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      styles: { fontSize: 8 },
      columnStyles: columnStyles,
      didParseCell: function(data) {
        // Apply row-specific styling
        if (data.row.index in rowStyles) {
          Object.assign(data.cell.styles, rowStyles[data.row.index]);
        }
      }
    });

    // Auto print if requested
    if (autoPrint) {
      doc.autoPrint();
    }

    // Save or open PDF
    doc.save(filename);
    
    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Function to generate a PDF preview
export const generatePdfPreview = (
  columns: string[],
  data: (string | number)[][],
  options: {
    title?: string;
    subtitle?: string;
    dateInfo?: string;
    additionalInfo?: Array<{label: string, value: string}>;
    landscape?: boolean;
    fontSizeAdjustment?: number;
    filename?: string;
    style?: {
      primaryColor?: string;
      fontFamily?: string;
      showHeader?: boolean;
      showFooter?: boolean;
    };
    logoUrl?: string;
    columnStyles?: Record<string, any>;
  } = {}
) => {
  try {
    const {
      title = 'Preview',
      subtitle = '',
      dateInfo = '',
      additionalInfo = [],
      landscape = false,
      fontSizeAdjustment = 0,
      filename = 'preview.pdf',
      style = {},
      columnStyles = {}
    } = options;

    // Export settings
    const pdfOptions: PdfExportOptions = {
      title,
      subtitle,
      dateInfo,
      additionalInfo,
      filename,
      landscape,
      orientation: landscape ? 'landscape' : 'portrait',
      pageSize: 'a4',
      columnStyles
    };

    // Create PDF
    return exportToPdf(columns, data, pdfOptions);
  } catch (error) {
    console.error('Error generating PDF preview:', error);
    throw new Error('Failed to generate PDF preview: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Function to safely format numbers to currency
export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '₹0.00';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '₹0.00';
  }
  
  return `₹${numValue.toFixed(2)}`;
};

// Function to safely get number value
export const safeNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return isNaN(numValue) ? 0 : numValue;
};
