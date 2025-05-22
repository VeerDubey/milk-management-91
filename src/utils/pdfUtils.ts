
// If this file exists, we need to add the autoPrint option to the PdfExportOptions interface
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
  autoPrint?: boolean; // Added option for automatic printing
}

// Export function to create PDF from tabular data
export const exportToPdf = (
  headers: string[],
  rows: (string | number)[][],
  options: PdfExportOptions = {}
) => {
  const {
    title = 'Export Report',
    subtitle = '',
    filename = 'export.pdf',
    orientation = 'portrait',
    pageSize = 'a4',
    margins = { top: 30, right: 15, bottom: 20, left: 15 },
    autoPrint = false // Default to false
  } = options;

  // Initialize PDF document
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize,
  });

  // Add title and subtitle
  const defaultFontSize = 10;
  doc.setFontSize(16);
  doc.text(title, 15, 15);
  
  doc.setFontSize(11);
  doc.text(subtitle, 15, 22);
  
  doc.setFontSize(defaultFontSize);

  // Convert headers and rows to expected format
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 30,
    margin: { top: margins.top, right: margins.right, bottom: margins.bottom, left: margins.left },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    styles: { fontSize: 8 },
  });

  // Auto print if requested
  if (autoPrint) {
    doc.autoPrint();
  }

  // Save or open PDF
  doc.save(filename);
  
  return doc;
};
