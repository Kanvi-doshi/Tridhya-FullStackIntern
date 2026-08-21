import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/protectedRoute";
import Admin from "./pages/admin";
import Home from "./pages/Home";
import Payment from "./pages/Payment";
import ProductDetails from "./pages/productDetails";
import Profile from "./pages/profile";
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import { getUser } from "./components/utils/auth";

function App() {
  const user = getUser();
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/home"
        element={user?.role === "user" ? <Home /> : <Navigate to="/admin" />}
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
