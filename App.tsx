import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import { SuperAdminDashboard } from "./components/SuperAdminDashboard";
import Schools from "./views/Schools";
import Students from "./views/Students";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          {/* Dashboard principal */}
          <Route path="/" element={<SuperAdminDashboard />} />

          {/* Gestión */}
          <Route path="/schools" element={<Schools />} />
          <Route path="/students" element={<Students />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
