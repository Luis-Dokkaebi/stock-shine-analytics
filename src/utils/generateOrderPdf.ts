import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Order, Part, Project } from "@/context/WarehouseContext";

interface GeneratePdfParams {
  order: Order;
  inventory: Part[];
  projects: Project[];
  type?: "exit" | "request";
}

export const generateOrderPdf = ({ order, inventory, projects, type = "exit" }: GeneratePdfParams) => {
  const doc = new jsPDF();
  const project = projects.find((p) => p.id === order.projectId);
  const currentDate = new Date();

  // Collect agents
  const agents = Array.from(new Set(order.fulfillmentLogs.map((log) => log.assignedBy)));
  const agentDisplay = agents.length > 0 ? agents.join(", ") : (type === "exit" ? "Almacén" : "Pendiente");

  // Load date
  const loadDate =
    order.fulfillmentLogs.length > 0
      ? order.fulfillmentLogs[0].assignedAt.split(",")[0]
      : currentDate.toLocaleDateString();

  // Colors
  const primaryColor: [number, number, number] = [20, 184, 166]; // Teal
  const darkColor: [number, number, number] = [30, 30, 30];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("HOLTMONT SERVICES", 105, 15, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Departamento de Almacén", 105, 22, { align: "center" });

  doc.setFontSize(10);
  const title = type === "request" ? "SOLICITUD DE HERRAMIENTAS" : "ORDEN DE SALIDA DE HERRAMIENTAS";
  doc.text(title, 105, 30, { align: "center" });

  // Reset text color
  doc.setTextColor(...darkColor);

  // Order info box
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  
  const infoY = 45;
  const leftCol = 15;
  const rightCol = 110;

  // Left column
  doc.text("Remisión No.:", leftCol, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(order.or_number, leftCol + 30, infoY);

  doc.setFont("helvetica", "bold");
  doc.text("Técnico:", leftCol, infoY + 7);
  doc.setFont("helvetica", "normal");
  doc.text(order.technician.toUpperCase(), leftCol + 30, infoY + 7);

  doc.setFont("helvetica", "bold");
  doc.text("Proyecto:", leftCol, infoY + 14);
  doc.setFont("helvetica", "normal");
  doc.text(`${order.projectId} - ${project?.name || "N/A"}`, leftCol + 30, infoY + 14);

  // Right column
  doc.setFont("helvetica", "bold");
  doc.text("Fecha:", rightCol, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(currentDate.toLocaleDateString(), rightCol + 25, infoY);

  doc.setFont("helvetica", "bold");
  doc.text("Hora:", rightCol, infoY + 7);
  doc.setFont("helvetica", "normal");
  doc.text(currentDate.toLocaleTimeString(), rightCol + 25, infoY + 7);

  doc.setFont("helvetica", "bold");
  doc.text("Agente:", rightCol, infoY + 14);
  doc.setFont("helvetica", "normal");
  doc.text(agentDisplay.toUpperCase(), rightCol + 25, infoY + 14);

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(15, infoY + 20, 195, infoY + 20);

  // Build table data from fulfillment logs to show all movements including removals
  const tableData: string[][] = [];
  
  order.fulfillmentLogs.forEach((log) => {
    const part = inventory.find((p) => p.id === log.partId);
    const price = part ? part.salePrice : 0;
    const amount = price * Math.abs(log.quantity);
    const isRemoval = log.type === "remove" || log.quantity < 0;
    
    tableData.push([
      part?.category?.substring(0, 3).toUpperCase() || "GEN",
      part?.sku || "N/A",
      part?.name?.toUpperCase() || "UNKNOWN ITEM",
      log.quantity.toString(), // Will show negative for removals
      `$${price.toFixed(2)}`,
      isRemoval ? `-$${amount.toFixed(2)}` : `$${amount.toFixed(2)}`,
    ]);
  });

  // Calculate net total from logs
  const totalAmount = order.fulfillmentLogs.reduce((sum, log) => {
    const part = inventory.find((p) => p.id === log.partId);
    const price = part ? part.salePrice : 0;
    return sum + price * log.quantity; // Negative quantities will subtract
  }, 0);

  autoTable(doc, {
    startY: infoY + 25,
    head: [["GPO", "SKU", "DESCRIPCIÓN", "CANT.", "PRECIO U.", "IMPORTE"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkColor,
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 25, font: "courier" },
      2: { cellWidth: 60 },
      3: { cellWidth: 15, halign: "center" },
      4: { cellWidth: 25, halign: "right" },
      5: { cellWidth: 25, halign: "right" },
    },
    margin: { left: 15, right: 15 },
    didParseCell: function(data) {
      // Highlight negative quantities in red
      if (data.section === 'body' && data.column.index === 3) {
        const value = parseFloat(data.cell.text[0] || '0');
        if (value < 0) {
          data.cell.styles.textColor = [220, 38, 38]; // Red color
          data.cell.styles.fontStyle = 'bold';
        }
      }
      // Highlight negative amounts in red
      if (data.section === 'body' && data.column.index === 5) {
        const text = data.cell.text[0] || '';
        if (text.startsWith('-')) {
          data.cell.styles.textColor = [220, 38, 38]; // Red color
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Total
  const finalY = (doc as any).lastAutoTable.finalY || 150;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", 145, finalY + 10);
  doc.setFontSize(12);
  doc.text(`$${totalAmount.toFixed(2)}`, 175, finalY + 10, { align: "right" });

  // Signature section
  const sigY = finalY + 35;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  // Left signature
  if (type === "exit") {
    doc.text("Entregó:", 35, sigY);
    doc.line(20, sigY + 15, 80, sigY + 15);
    doc.text(agentDisplay.toUpperCase(), 50, sigY + 22, { align: "center" });
  } else {
    // For request, maybe just 'Autorizó' or blank?
    // User didn't specify, but 'Entregó' implies stock movement.
    // Leaving it blank or just a line for Warehouse to sign later makes sense.
    // However, if it's a request, maybe 'Solicitó' (Technician) is the key.
    // But Technician signs on the Right ('Recibió' / 'Solicitante').
    // Let's put 'Autorizó (Almacén)' on the left for Request.
    doc.text("Autorizó (Almacén):", 35, sigY);
    doc.line(20, sigY + 15, 80, sigY + 15);
  }

  // Right signature
  doc.text(type === "request" ? "Solicitante:" : "Recibió:", 145, sigY);
  doc.line(130, sigY + 15, 190, sigY + 15);
  doc.text(order.technician.toUpperCase(), 160, sigY + 22, { align: "center" });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generado: ${currentDate.toLocaleString()}`, 105, 285, { align: "center" });
  doc.text("Holtmont Services - Sistema de Control de Almacén", 105, 290, { align: "center" });

  // Save PDF
  const filename = type === "request" ? `Solicitud_${order.or_number}.pdf` : `Orden_Salida_${order.or_number}.pdf`;
  doc.save(filename);
};
