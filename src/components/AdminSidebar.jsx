import React from "react";
import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <aside className="w-full md:w-64 bg-gray-900 text-white min-h-screen flex flex-col py-6 px-4">
      <h2 className="text-2xl font-bold mb-8 text-center">Admin Panel</h2>
      <nav className="flex flex-col gap-4">
  <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? "font-semibold text-blue-400" : "hover:text-blue-300"}>Dashboard</NavLink>
        <NavLink to="/admin/existing-products" className={({isActive}) => isActive ? "font-semibold text-blue-400" : "hover:text-blue-300"}>Existing Products</NavLink>
        <NavLink to="/admin/add-product" className={({isActive}) => isActive ? "font-semibold text-blue-400" : "hover:text-blue-300"}>Add Product</NavLink>
        <NavLink to="/admin/orders" className={({isActive}) => isActive ? "font-semibold text-blue-400" : "hover:text-blue-300"}>Orders</NavLink>
        <NavLink to="/admin/customers" className={({isActive}) => isActive ? "font-semibold text-blue-400" : "hover:text-blue-300"}>Customers</NavLink>
        <NavLink to="/admin/feedback" className={({isActive}) => isActive ? "font-semibold text-blue-400" : "hover:text-blue-300"}>Feedback</NavLink>
        <NavLink to="/admin/login" className="hover:text-red-400 mt-8">Logout</NavLink>
      </nav>
    </aside>
  );
}
