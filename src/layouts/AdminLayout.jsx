import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";

function AdminLayout() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-gray-100 min-h-screen">

      <AdminNavbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="flex">

        <AdminSidebar />

        <div className="flex-1 overflow-auto">
          <Outlet context={{ searchQuery, setSearchQuery }} />
        </div>

      </div>

    </div>
  );
}

export default AdminLayout;