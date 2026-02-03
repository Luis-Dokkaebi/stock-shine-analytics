import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WarehouseProvider } from "@/context/WarehouseContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import KPIsDashboard from "./pages/KPIsDashboard";
import Inventory from "./pages/Inventory";
import ItemCatalog from "./pages/ItemCatalog";
import Sales from "./pages/Sales";
import Costs from "./pages/Costs";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Technician from "./pages/Technician";
import OrderExitSlip from "./pages/OrderExitSlip";
import PersonalControl from "./pages/PersonalControl";

// Department pages
import DepartmentInventory from "./pages/department/DepartmentInventory";
import DepartmentTechnician from "./pages/department/DepartmentTechnician";
import DepartmentSales from "./pages/department/DepartmentSales";
import DepartmentCosts from "./pages/department/DepartmentCosts";
import DepartmentReports from "./pages/department/DepartmentReports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WarehouseProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/kpis" element={<ProtectedRoute><KPIsDashboard /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/catalog" element={<ProtectedRoute><ItemCatalog /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
            <Route path="/technician" element={<ProtectedRoute><Technician /></ProtectedRoute>} />
            <Route path="/print-order/:orNumber" element={<ProtectedRoute><OrderExitSlip /></ProtectedRoute>} />
            <Route path="/costs" element={<ProtectedRoute><Costs /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/personal/:module" element={<ProtectedRoute><PersonalControl /></ProtectedRoute>} />
            
            {/* Department routes - each department has full functionality */}
            <Route path="/departments/:dept/inventory" element={<ProtectedRoute><DepartmentInventory /></ProtectedRoute>} />
            <Route path="/departments/:dept/technician" element={<ProtectedRoute><DepartmentTechnician /></ProtectedRoute>} />
            <Route path="/departments/:dept/sales" element={<ProtectedRoute><DepartmentSales /></ProtectedRoute>} />
            <Route path="/departments/:dept/costs" element={<ProtectedRoute><DepartmentCosts /></ProtectedRoute>} />
            <Route path="/departments/:dept/reports" element={<ProtectedRoute><DepartmentReports /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WarehouseProvider>
  </QueryClientProvider>
);

export default App;
