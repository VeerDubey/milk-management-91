
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
  
  // Add additional info if provided
  if (options.additionalInfo) {
    let yPos = 30;
    doc.setFontSize(10);
    
    options.additionalInfo.forEach(info => {
      doc.text(`${info.label}: ${info.value}`, 14, yPos);
      yPos += 6;
    });
  }
  
  // Calculate starting position for the table
  const startY = options.additionalInfo ? 
    30 + (options.additionalInfo.length * 6) : 
    options.subtitle ? 30 : 23;
  
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
