import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import Tires from "./pages/Tires";
import Alerts from "./pages/Alerts";
import MaintenancePage from "./pages/Maintenance";
import InvoicePage from "./pages/Maintenance/InvoicePage";
import Fuel from "./pages/Fuel";
import VehicleAnalysis from "./pages/VehicleAnalysis"
import OrphanFuel from "./pages/OrphanFuel";
import TireAllocation from "./pages/TireAllocation";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/tires" element={<Tires />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/maintenance" element={<MaintenancePage/>} />
          <Route path="/fuel" element={<Fuel />} />
          <Route path="/orphanfuel" element={<OrphanFuel />} />
          <Route path="/reports" element={<div>Relatórios</div>} />
          <Route path="/settings" element={<div>Configurações</div>} />
          <Route path="/vehicles/analysis/:plate" element={<VehicleAnalysis />} />
          <Route path="/alocar" element={<TireAllocation />} />
          <Route path="/maintenance/invoice/:invoiceId" element={<InvoicePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};


export default AppRoutes;
