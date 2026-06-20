import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import StaffMenu from "./pages/StaffMenu.jsx";

import AdminLayout from "./admin/AdminLayout.jsx";
import AdminMenuPage from "./admin/pages/AdminMenuPage.jsx";
import CategoriesPage from "./admin/pages/CategoriesPage.jsx";
import AppearancePage from "./admin/pages/AppearancePage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />

      {/* ✅ отдельная страница персонала */}
      <Route path="/staff" element={<StaffMenu />} />

      {/* ✅ админка */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="menu" replace />} />
        <Route path="menu" element={<AdminMenuPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="appearance" element={<AppearancePage />} />
      </Route>
    </Routes>
  );
}
