import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import Tires from "./pages/Tires";
import Alerts from "./pages/Alerts";

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
          <Route path="/maintenance" element={<div>Manutenção</div>} />
          <Route path="/fuel" element={<div>Abastecimento</div>} />
          <Route path="/reports" element={<div>Relatórios</div>} />
          <Route path="/routes" element={<div>Rotas</div>} />
          <Route path="/settings" element={<div>Configurações</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
