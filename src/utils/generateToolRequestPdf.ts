import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface RequestItem {
  name: string;
  sku: string;
  quantity: number;
}

interface GenerateToolRequestPdfParams {
  orNumber: string;
  technician: string;
  projectId: number;
  projectName: string;
  requestedItems: RequestItem[];
}

export const generateToolRequestPdf = ({
  orNumber,
  technician,
  projectId,
  projectName,
  requestedItems
}: GenerateToolRequestPdfParams) => {
  const doc = new jsPDF();
  const currentDate = new Date();

  // Colors
  const primaryColor: [number, number, number] = [59, 130, 246]; // Blue
  const darkColor: [number, number, number] = [30, 30, 30];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("HOLTMONT SERVICES", 105, 15, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Departamento de Almacén", 105, 23, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("SOLICITUD DE HERRAMIENTAS", 105, 34, { align: "center" });

  // Reset text color
  doc.setTextColor(...darkColor);

  // Order info box
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  
  const infoY = 52;
  const leftCol = 15;
  const rightCol = 110;

  // Left column
  doc.text("Orden de Trabajo:", leftCol, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(orNumber, leftCol + 40, infoY);

  doc.setFont("helvetica", "bold");
  doc.text("Técnico:", leftCol, infoY + 8);
  doc.setFont("helvetica", "normal");
  doc.text(technician.toUpperCase(), leftCol + 40, infoY + 8);

  doc.setFont("helvetica", "bold");
  doc.text("Proyecto:", leftCol, infoY + 16);
  doc.setFont("helvetica", "normal");
  doc.text(`${projectId} - ${projectName}`, leftCol + 40, infoY + 16);

  // Right column
  doc.setFont("helvetica", "bold");
  doc.text("Fecha:", rightCol, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(currentDate.toLocaleDateString(), rightCol + 25, infoY);

  doc.setFont("helvetica", "bold");
  doc.text("Hora:", rightCol, infoY + 8);
  doc.setFont("helvetica", "normal");
  doc.text(currentDate.toLocaleTimeString(), rightCol + 25, infoY + 8);

  // Notice box
  doc.setFillColor(255, 243, 205);
  doc.rect(15, infoY + 25, 180, 12, "F");
  doc.setFontSize(9);
  doc.setTextColor(133, 77, 14);
  doc.text("NOTA: Este documento es una SOLICITUD. Los items serán verificados y entregados por el almacén.", 105, infoY + 32, { align: "center" });

  doc.setTextColor(...darkColor);

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(15, infoY + 42, 195, infoY + 42);

  // Table of requested items
  const tableData = requestedItems.map((item, index) => [
    (index + 1).toString(),
    item.sku,
    item.name.toUpperCase(),
    item.quantity.toString(),
    "", // Empty for warehouse to fill
    ""  // Empty for notes
  ]);

  autoTable(doc, {
    startY: infoY + 47,
    head: [["#", "SKU", "DESCRIPCIÓN", "SOLICITADO", "ENTREGADO", "OBSERVACIONES"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkColor,
      minCellHeight: 10,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 25, font: "courier" },
      2: { cellWidth: 55 },
      3: { cellWidth: 22, halign: "center" },
      4: { cellWidth: 25, halign: "center" }, // For warehouse to fill
      5: { cellWidth: 40 }, // For notes
    },
    margin: { left: 15, right: 15 },
  });

  // Get final Y position
  const finalY = (doc as any).lastAutoTable.finalY || 150;

  // Signature section
  const sigY = finalY + 25;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  // Left signature (Technician requesting)
  doc.text("Solicita:", 35, sigY);
  doc.line(20, sigY + 15, 80, sigY + 15);
  doc.text(technician.toUpperCase(), 50, sigY + 22, { align: "center" });
  doc.setFontSize(8);
  doc.text("TÉCNICO", 50, sigY + 27, { align: "center" });

  // Right signature (Warehouse)
  doc.setFontSize(9);
  doc.text("Entrega:", 145, sigY);
  doc.line(130, sigY + 15, 190, sigY + 15);
  doc.text("_______________________", 160, sigY + 22, { align: "center" });
  doc.setFontSize(8);
  doc.text("ALMACÉN", 160, sigY + 27, { align: "center" });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generado: ${currentDate.toLocaleString()}`, 105, 280, { align: "center" });
  doc.text("Holtmont Services - Sistema de Control de Almacén", 105, 285, { align: "center" });
  doc.text(`Referencia: ${orNumber}`, 105, 290, { align: "center" });

  // Save PDF
  doc.save(`Solicitud_Herramientas_${orNumber}.pdf`);
};