import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useWarehouse } from "@/context/WarehouseContext";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const OrderExitSlip = () => {
  const { orNumber } = useParams<{ orNumber: string }>();
  const { findOrder, inventory, projects } = useWarehouse();
  const [currentDate, setCurrentDate] = useState(new Date());

  const order = orNumber ? findOrder(orNumber) : undefined;

  useEffect(() => {
    // Update date on mount to ensure client-side consistency
    setCurrentDate(new Date());
  }, []);

  if (!order) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">Order not found</h1>
        <p className="text-gray-500">Order Reference: {orNumber}</p>
      </div>
    );
  }

  const project = projects.find((p) => p.id === order.projectId);

  // Collect all unique agents from logs
  const agents = Array.from(new Set(order.fulfillmentLogs.map(log => log.assignedBy)));
  const agentDisplay = agents.length > 0 ? agents.join(", ") : "Almacén";

  // Determine "Load Date" (earliest fulfillment date or today if none)
  const loadDate = order.fulfillmentLogs.length > 0
    ? order.fulfillmentLogs[0].assignedAt.split(',')[0] // simplistic date extraction
    : currentDate.toLocaleDateString();

  const totalAmount = order.fulfillmentLogs.reduce((sum, log) => {
    const part = inventory.find(p => p.id === log.partId);
    const price = part ? part.salePrice : 0;
    return sum + (log.quantity * price);
  }, 0);

  return (
    <div className="bg-white min-h-screen text-black font-sans p-8 print:p-0">
      {/* Print Button - Hidden in Print Mode */}
      <div className="mb-8 print:hidden flex justify-end">
        <Button onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" />
          Print Exit Slip
        </Button>
      </div>

      <div className="max-w-[210mm] mx-auto print:max-w-none print:mx-0">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold uppercase tracking-wide">HOLTMONT SERVICE S.A. DE C.V</h1>
          <h2 className="text-lg font-semibold text-gray-700">Departamento de Almacén</h2>
          <h3 className="text-md font-medium uppercase mt-1 border-b border-black inline-block pb-1">
            Requisición de material de servicio
          </h3>
        </div>

        {/* Top Meta Data */}
        <div className="flex justify-between text-sm mb-2 font-mono">
          <span>{currentDate.toLocaleDateString()}</span>
          <span>{currentDate.toLocaleTimeString()}</span>
        </div>

        <div className="border-t border-b border-dashed border-gray-400 py-4 mb-6 text-sm">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div className="flex">
              <span className="w-32 font-semibold">Remisión No.:</span>
              <span>{order.or_number}</span>
            </div>
            <div className="flex">
              <span className="w-40 font-semibold">Fecha Remisión:</span>
              <span>{currentDate.toLocaleDateString()}</span>
            </div>

            <div className="flex">
              <span className="w-32 font-semibold">Tipo:</span>
              <span>Venta O.R. Cliente</span>
            </div>
            <div className="flex">
              <span className="w-40 font-semibold">Agente Refacciones:</span>
              <span className="uppercase">{agentDisplay}</span>
            </div>

            <div className="flex">
              <span className="w-32 font-semibold">N. de Proyecto:</span>
              <span>{order.projectId} - {project?.name || "Unknown"}</span>
            </div>
             <div className="flex">
              <span className="w-40 font-semibold">Fecha Carga:</span>
              <span>{loadDate}</span>
            </div>

            <div className="flex">
                <span className="w-32 font-semibold">Técnico:</span>
                <span className="uppercase">{order.technician}</span>
            </div>
             <div className="flex">
                <span className="w-40 font-semibold">Hoja:</span>
                <span>1</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-xs mb-8">
          <thead>
            <tr className="uppercase border-b border-black">
              <th className="text-left py-2 w-12">GPO</th>
              <th className="text-left py-2">Clave Parte (SKU)</th>
              <th className="text-left py-2">Descripción de Parte</th>
              <th className="text-right py-2 w-16">Cant.</th>
              <th className="text-right py-2 w-24">Precio U.</th>
              <th className="text-right py-2 w-24">Importe</th>
              <th className="text-right py-2 w-24">Fecha Salida</th>
            </tr>
          </thead>
          <tbody>
            {order.fulfillmentLogs.map((log, index) => {
               const part = inventory.find(p => p.id === log.partId);
               const price = part ? part.salePrice : 0;
               const amount = price * log.quantity;
               // Extract just the date part from "MM/DD/YYYY, HH:MM:SS PM" format if needed,
               // or just use locale date if it's already a string.
               // Assuming assignedAt is locale string as per context.
               const dateStr = log.assignedAt.split(',')[0];

               return (
                 <tr key={log.id} className="border-b border-gray-100">
                   <td className="py-2">{part?.category.substring(0, 3).toUpperCase() || "GEN"}</td>
                   <td className="py-2 font-mono">{part?.sku || "N/A"}</td>
                   <td className="py-2 uppercase">{part?.name || "Unknown Item"}</td>
                   <td className="py-2 text-right">{log.quantity}</td>
                   <td className="py-2 text-right">${price.toFixed(2)}</td>
                   <td className="py-2 text-right font-medium">${amount.toFixed(2)}</td>
                   <td className="py-2 text-right">{dateStr}</td>
                 </tr>
               );
            })}
            {order.fulfillmentLogs.length === 0 && (
                <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500 italic">No items fulfilled yet.</td>
                </tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="text-right">
            <span className="font-semibold mr-4">Total :</span>
            <span className="text-lg font-bold">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-16 mt-16 text-sm uppercase">
          <div>
            <div className="mb-2">Entregó:</div>
            <div className="border-t border-dashed border-gray-400 pt-2 text-center">
                {agentDisplay}
            </div>
          </div>
          <div>
            <div className="mb-2">Recibió:</div>
             <div className="border-t border-dashed border-gray-400 pt-2 text-center">
                {order.technician}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderExitSlip;
