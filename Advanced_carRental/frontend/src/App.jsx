import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/authContext";

import Login from "./pages/auth/login";
import Register from "./pages/auth/register";

import Dashboard from "./pages/dashboard/dashboard";

import CustomerCars from "./pages/customer/car";
import CustomerRentals from "./pages/customer/myRental";
import CustomerPayments from "./pages/customer/payment";
import CarDetails from "./pages/customer/carDetails";
import RentCar from "./pages/customer/rentCar";

import StaffCars from "./pages/staff/staffCar";
import StaffRentals from "./pages/staff/staffRentals";
import StaffPayments from "./pages/staff/staffPayment";

import AdminUsers from "./pages/admin/adminUsers";
import AdminCars from "./pages/admin/adminCars";
import AdminAnalytics from "./pages/admin/adminAnalytics";

import Profile from "./pages/profile/profile";
import ProtectedRoute from "./routes/protectedRoute";

const Cars = () => {
  const { user } = useAuth();

  if (user?.role_name === "Admin") {
    return <AdminCars />;
  }

  if (user?.role_name === "Staff" ){
    return <StaffCars />;
  }

  return <CustomerCars />;
};

const Rentals = () => {
  const { user } = useAuth();

  if (user?.role_name === "Staff" || user?.role_name === "Admin") {
    return <StaffRentals />;
  }

  return <CustomerRentals />;
};

const Payments = () => {
  const { user } = useAuth();

  if (user?.role_name === "Staff" || user?.role_name === "Admin") {
    return <StaffPayments />;
  }

  return <CustomerPayments />;
};

const App = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* All authenticated users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/rentals" element={<Rentals />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Customer-only */}
      <Route element={<ProtectedRoute allowedRoles={["Customer"]} />}>
        <Route path="/cars/:id" element={<CarDetails />} />

        <Route path="/cars/:id/rent" element={<RentCar />} />
      </Route>

      {/* Admin-only */}
      <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/analytics" element={<AdminAnalytics />} />
      </Route>

      {/* Unknown route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
