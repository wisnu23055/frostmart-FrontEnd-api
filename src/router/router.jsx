import { createBrowserRouter, Navigate } from "react-router-dom";

// =========================
// LAYOUTS
// =========================
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProfileLayout from "../layouts/ProfileLayout"; 
import ProtectedRoute from "../components/ProtectedRoute";
import AdminProtectedRoute from "../components/AdminProtectedRoute";

// =========================
// USER PAGES (Customer)
// =========================
import Home from "../pages/user/Home";
import Menu from "../pages/user/Menu";
import Search from "../pages/user/Search";
import ProductDetail from "../pages/user/ProductDetail";
import Cart from "../pages/user/Cart";
import Checkout from "../pages/user/Checkout";
import Login from "../pages/user/Login";
import Register from "../pages/user/Register";
import Profile from "../pages/user/Profile";
import UserOrders from "../pages/user/Orders"; 
import OrderDetail from "../pages/user/OrderDetail";
import Settings from "../pages/user/Settings";
import Address from "../pages/user/Address";
import PaymentSuccess from "../pages/user/PaymentSuccess";
import RegisterStore from "../pages/user/RegisterStore";
import About from "../pages/user/About";

// =========================
// ADMIN PAGES (Dashboard)
// =========================
import Dashboard from "../pages/admin/Dashboard";
import Analytics from "../pages/admin/Analytics";
import AdminOrders from "../pages/admin/Orders"; 
import Products from "../pages/admin/Products";
import AddProduct from "../pages/admin/AddProduct";
import EditProduct from "../pages/admin/EditProduct";
import Customers from "../pages/admin/Customers";
import Invoice from "../pages/admin/Invoice";

const router = createBrowserRouter([
  // =========================
  // USER ROUTES (Punya Aditya)
  // =========================
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/menu",
        element: <Menu />, 
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/search",
        element: <Search />,
      },
      {
        path: "/product/:id",
        element: <ProductDetail />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/checkout",
        element: <Checkout />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      // =======================================
      // PROFILE PAGES (Memakai ProfileLayout)
      // =======================================
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <ProfileLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/profile/orders" replace /> 
          },
          {
            path: "orders",
            element: <UserOrders />,
          },
          {
            path: "orders/:id",
            element: <OrderDetail />,
          },
          {
            path: "settings",
            element: <Settings />,
          },
          {
            path: "address",
            element: <Address />,
          },
          {
            path: "register-store",
            element: <RegisterStore />,
          },
        ],
      },
    ],
  },

  // ===================================
  // STANDALONE ROUTES (Tanpa Layout)
  // ===================================
  {
    path: "/payment-success",
    element: <PaymentSuccess />,
  },

  {
    path: "/admin",
    element: (
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    ),
    children: [
      {
        index: true, 
        element: <Dashboard />,
      },
      {
        path: "customers", 
        element: <Customers />, 
      },
      {
        path: "orders", 
        element: <AdminOrders />, 
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "products/add",
        element: <AddProduct />,
      },
      {
        path: "products/edit/:id",
        element: <EditProduct />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
      {
        path: "invoice",
        element: <Invoice />,
      },
    ],
  },
]);

export default router;