import React from "react";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-6 transition-all duration-500 ease-in-out">
        {children}
      </main>
    </div>
  );
}
