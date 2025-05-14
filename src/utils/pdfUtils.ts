
// Import jsPDF and jspdf-autotable
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Define types for the PDF export function
interface PdfExportOptions {
  title: string;
  subtitle?: string;
  additionalInfo?: Array<{
    label: string;
    value: string;
  }>;
  filename: string;
  landscape?: boolean;
  dateInfo?: string;
  style?: {
    primaryColor?: string;
    fontFamily?: string;
    showHeader?: boolean;
    showFooter?: boolean;
  };
  logoUrl?: string;
  fontSizeAdjustment?: number;
}

// Export PDF function
export const exportToPdf = (
  headers: string[], 
  rows: string[][], 
  options: PdfExportOptions
) => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: options.landscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set font size and style for the title
  doc.setFontSize(18);
  doc.text(options.title, 14, 15);
  
  // Add subtitle if provided
  if (options.subtitle) {
    doc.setFontSize(12);
    doc.text(options.subtitle, 14, 23);
  }
  
  // Add date info if provided
  let yPos = 30;
  if (options.dateInfo) {
    doc.setFontSize(10);
    doc.text(options.dateInfo, 14, yPos);
    yPos += 6;
  }
  
  // Add additional info if provided
  if (options.additionalInfo) {
    doc.setFontSize(10);
    
    options.additionalInfo.forEach(info => {
      doc.text(`${info.label}: ${info.value}`, 14, yPos);
      yPos += 6;
    });
  }
  
  // Calculate starting position for the table
  const startY = yPos;
  
  // Add table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY,
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });
  
  // Save the PDF
  doc.save(options.filename);
};

// Generate PDF preview function (for invoice templates)
export const generatePdfPreview = (
  columns: string[],
  data: string[][],
  options: PdfExportOptions
) => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: options.landscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const primaryColor = options.style?.primaryColor || [41, 128, 185];
  const fontFamily = options.style?.fontFamily || 'helvetica';
  const fontSizeAdjustment = options.fontSizeAdjustment || 0;
  
  // Set font
  doc.setFont(fontFamily);
  
  // Company info / header
  if (options.style?.showHeader !== false) {
    doc.setFontSize(18 + fontSizeAdjustment);
    doc.text(options.title, 14, 15);
    
    if (options.subtitle) {
      doc.setFontSize(12 + fontSizeAdjustment);
      doc.text(options.subtitle, 14, 23);
    }
    
    if (options.dateInfo) {
      doc.setFontSize(10 + fontSizeAdjustment);
      doc.text(options.dateInfo, 14, 30);
    }
  }
  
  // Calculate starting position for the table
  let startY = options.style?.showHeader !== false ? 40 : 15;
  
  // Add additional info if provided
  if (options.additionalInfo) {
    doc.setFontSize(10 + fontSizeAdjustment);
    
    options.additionalInfo.forEach(info => {
      doc.text(`${info.label}: ${info.value}`, 14, startY);
      startY += 6;
    });
    
    startY += 5; // Add some space after additional info
  }
  
  // Add table
  autoTable(doc, {
    head: [columns],
    body: data,
    startY,
    styles: {
      fontSize: 9 + fontSizeAdjustment,
      cellPadding: 3,
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: typeof primaryColor === 'string' 
        ? hexToRgb(primaryColor) 
        : primaryColor,
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });
  
  // Add footer if needed
  if (options.style?.showFooter !== false) {
    const pageCount = (doc as any).internal.getNumberOfPages();
    doc.setFontSize(8 + fontSizeAdjustment);
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
  }
  
  // For preview, return the PDF as base64 data URI
  const pdfBase64 = doc.output('datauristring');
  
  // Also save the PDF if filename provided
  if (options.filename) {
    doc.save(options.filename);
  }
  
  return pdfBase64;
};

// Helper function to convert hex color to RGB array
function hexToRgb(hex: string): number[] {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse the hex values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  
  return [r, g, b];
}
