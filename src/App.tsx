import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import Schools from "./views/Schools";
import Students from "./views/Students";
import SchoolDetail from "./views/SchoolDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<SuperAdminDashboard />} />
          <Route path="/schools" element={<Schools />} />
          <Route path="/schools/:id" element={<SchoolDetail />} />
          <Route path="/students" element={<Students />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
