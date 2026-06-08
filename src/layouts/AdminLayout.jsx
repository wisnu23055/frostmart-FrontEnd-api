import { Outlet } from "react-router-dom";

import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";

function AdminLayout() {
  return (
    <div className="bg-gray-100 min-h-screen">

      <AdminNavbar />

      <div className="flex">

        <AdminSidebar />

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>

      </div>

    </div>
  );
}

export default AdminLayout;