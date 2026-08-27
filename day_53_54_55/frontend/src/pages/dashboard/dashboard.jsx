import { useAuth } from "../../context/authContext";

import CustomerDashboard from "../customer/customerDashboard";
import StaffDashboard from "../staff/staffDashboard";
import AdminDashboard from "../admin/adminDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role_name === "Customer") {
    return <CustomerDashboard />;
  }

  if (user?.role_name === "Staff") {
    return <StaffDashboard />;
  }

  if (user?.role_name === "Admin") {
    return <AdminDashboard />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-xl font-semibold">Invalid user role</h1>
    </div>
  );
};

export default Dashboard;
