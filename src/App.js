
import AdminPanel from "./pages/AdminPanel";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
// import OrderHistory from "./pages/OrderHistory";
// import TrackOrder from "./pages/TrackOrder";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
// import Orders from "./pages/Orders";
import Products from "./pages/Products";  
import Accessories from './pages/Accessories'; // ✅ NEW
import AccessoriesDetailsPage from './pages/AccessoriesDetailsPage';
import Help from "./pages/Help";              // ✅ NEW
// import Review from "./pages/Review";   // ✅ FIXED
import ReviewsPage from "./pages/ReviewsPage"; // ✅ NEW
import AddReview from "./components/AddReview"; // ✅ NEW
import SearchResults from "./pages/SearchResults";
import AdminDashboard from "./pages/AdminDashboard";
import ClerkSessionSync from "./components/ClerkSessionSync";
import ProductDetails from "./pages/ProductDetails";
import OrderNow from "./pages/OrderNow";
import About from "./pages/About"; // ✅ NEW
import AdminProducts from "./pages/AdminProducts";
import AdminLogin from "./pages/AdminLogin";
import AdminOrders from "./pages/AdminOrders";
import AdminCustomers from "./pages/AdminCustomers";
import AdminFeedback from "./pages/AdminFeedback";
import AdminLayout from "./components/AdminLayout";
import AdminExistingProducts from "./pages/AdminExistingProducts";
import AdminAddProduct from "./pages/AdminAddProduct";
import AdminEditProduct from "./pages/AdminEditProduct";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function AdminProtectedRoute({ children }) {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const location = useLocation();
  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
}

function Layout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">{children}</main>
      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ClerkSessionSync />
      <Router>
        <Layout>
           <ToastContainer position="top-center" autoClose={500} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            {/* <Route path="/orders" element={<Orders />} /> */}
            <Route path="/products" element={<Products />} />
            <Route path="/accessory" element={<Accessories />} />    
            <Route path="/accessory/:id" element={<AccessoriesDetailsPage />} /> 
            <Route path="/search" element={<SearchResults />} />
            <Route path="/review" element={<ReviewsPage />} />
            <Route path="/add-review" element={<AddReview />} />
            <Route path="/help" element={<Help />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminProtectedRoute>} />
            {/* <Route path="/order-history" element={<OrderHistory orders={JSON.parse(localStorage.getItem('orders')) || []} />} /> */}
            {/* <Route path="/track-order" element={<TrackOrder orders={JSON.parse(localStorage.getItem('orders')) || []} />} /> */}
            <Route path="/productdetails/:id" element={<ProductDetails />} />
            <Route path="/ordernow" element={<OrderNow />} />
            {/* <Route path="/ordernow/:id" element={<OrderNow />} /> */}
            <Route path="/admin/products" element={<AdminProtectedRoute><AdminLayout><AdminProducts /></AdminLayout></AdminProtectedRoute>} />
            <Route path="/admin/existing-products" element={<AdminProtectedRoute><AdminLayout><AdminExistingProducts /></AdminLayout></AdminProtectedRoute>} />
            <Route path="/admin/add-product" element={<AdminProtectedRoute><AdminLayout><AdminAddProduct /></AdminLayout></AdminProtectedRoute>} />
            <Route path="/admin/edit-product/:id" element={<AdminProtectedRoute><AdminLayout><AdminEditProduct /></AdminLayout></AdminProtectedRoute>} />
            <Route path="/admin/orders" element={<AdminProtectedRoute><AdminLayout><AdminOrders /></AdminLayout></AdminProtectedRoute>} />
            <Route path="/admin/customers" element={<AdminProtectedRoute><AdminLayout><AdminCustomers /></AdminLayout></AdminProtectedRoute>} />
            <Route path="/admin/feedback" element={<AdminProtectedRoute><AdminLayout><AdminFeedback /></AdminLayout></AdminProtectedRoute>} />
            <Route path="/admin/login" element={<AdminLogin />} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}

export default App;