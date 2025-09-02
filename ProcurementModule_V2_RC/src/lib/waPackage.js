import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

// Helper function to safely access nested properties
const getNested = (obj, path, defaultValue = '') => {
  return path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : defaultValue), obj);
};

export async function createWorkAuthorization({ vendor, rfp, selections, waNumber }) {
  try {
    console.log('Generating Work Authorization with data:', { vendor, rfp, selections, waNumber });
  // Create a new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  // Add company header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('WORK AUTHORIZATION', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Authorization #: ${waNumber}`, margin, yPos);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 15;

  // Vendor and Project Info
  doc.setFont('helvetica', 'bold');
  doc.text('Vendor Information:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 8;
  doc.text(`Name: ${getNested(vendor, 'name', 'Not Provided')}`, margin + 5, yPos);
  yPos += 7;
  doc.text(`Contact: ${getNested(vendor, 'contactPerson', 'Not Provided')}`, margin + 5, yPos);
  yPos += 7;
  doc.text(`Email: ${getNested(vendor, 'email', 'Not Provided')}`, margin + 5, yPos);
  yPos += 7;
  doc.text(`Phone: ${getNested(vendor, 'phone', 'Not Provided')}`, margin + 5, yPos);
  yPos += 15;

  doc.setFont('helvetica', 'bold');
  doc.text('Project Information:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 8;
  const projects = Array.isArray(rfp?.projects) ? rfp.projects.join(', ') : 'Not Specified';
  doc.text(`Projects: ${projects}`, margin + 5, yPos);
  yPos += 7;
  doc.text(`RFP #: ${getNested(rfp, 'id', 'N/A')}`, margin + 5, yPos);
  yPos += 7;
  const dueDate = rfp?.dueDate ? new Date(rfp.dueDate).toLocaleDateString() : 'Not Specified';
  doc.text(`Due Date: ${dueDate}`, margin + 5, yPos);
  yPos += 15;

  // Add a line separator
  doc.setDrawColor(200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Add items tables
  doc.setFont('helvetica', 'bold');
  doc.text('AUTHORIZED ITEMS', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Helper function to add a table
  const addTable = (title, data) => {
    if (data.length === 0) return yPos;
    
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPos);
    yPos += 8;

    const headers = ['Item', 'Description', 'Unit Price', 'Qty', 'Total'];
    const tableData = data.map(item => [
      item.name || '-',
      item.description || '-',
      item.price ? `$${parseFloat(item.price).toFixed(2)}` : '-',
      item.quantity || 1,
      item.price ? `$${parseFloat(item.price * (item.quantity || 1)).toFixed(2)}` : '-',
    ]);

autoTable(doc, {
      startY: yPos,
      head: [headers],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: { 
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      didDrawPage: (data) => {
        yPos = data.cursor.y + 10;
      }
    });

    return yPos;
  };

  // Add Global Items
  yPos = addTable('Global Items:', selections.globals || []);
  
  // Add Model Items
  for (const [model, items] of Object.entries(selections.models || {})) {
    if (!items?.length) continue;
    yPos = addTable(`Model: ${model}`, items);
  }
  
  // Add Unit Rates
  yPos = addTable('Unit Rates:', selections.unitRates || []);

  // Add total
  const total = [
    ...(selections.globals || []),
    ...Object.values(selections.models || {}).flat(),
    ...(selections.unitRates || [])
  ].reduce((sum, item) => sum + (parseFloat(item.price) * (item.quantity || 1) || 0), 0);

  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Authorized Amount: $${total.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });

  // Add terms and conditions
  yPos += 20;
  doc.setFont('helvetica', 'bold');
  doc.text('Terms and Conditions:', margin, yPos);
  yPos += 8;
  
  const terms = [
    '1. This work authorization is valid for 30 days from the date of issue.',
    '2. Any changes to the scope of work must be approved in writing.',
    '3. Invoices must reference this work authorization number.',
    '4. Payment terms: Net 30 days from receipt of invoice.',
    '5. All work must be completed in accordance with local building codes and regulations.'
  ];
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  terms.forEach(term => {
    doc.text(term, margin + 5, yPos, { maxWidth: pageWidth - margin * 2 });
    yPos += 7;
  });

  // Add signature lines
  yPos += 15;
  doc.setDrawColor(0);
  doc.line(margin, yPos, pageWidth / 2 - 10, yPos);
  doc.line(pageWidth / 2 + 10, yPos, pageWidth - margin, yPos);
  yPos += 5;
  doc.text('Authorized Company Representative', margin, yPos);
  doc.text('Vendor Representative', pageWidth / 2 + 10, yPos);
  yPos += 20;
  doc.line(margin, yPos, pageWidth / 2 - 10, yPos);
  doc.line(pageWidth / 2 + 10, yPos, pageWidth - margin, yPos);
  yPos += 5;
  doc.setFontSize(8);
  doc.text('Signature', margin, yPos);
  doc.text('Date', margin + 30, yPos);
  doc.text('Signature', pageWidth / 2 + 10, yPos);
  doc.text('Date', pageWidth / 2 + 40, yPos);

  // Save the PDF
  const pdfBlob = doc.output('blob');
  saveAs(pdfBlob, `Work_Authorization_${waNumber}.pdf`);
  } catch (error) {
    console.error('Error generating work authorization:', error);
    throw new Error(`Failed to generate work authorization: ${error.message}`);
  }
}
