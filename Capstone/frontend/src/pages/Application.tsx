import { useAuth } from "../context/authContext";

import MyApplications from "./candidate/MyApplication";
import HRApplications from "./hr/Application";

const Application = () => {
  const { user } = useAuth();

  if (user?.role === "CANDIDATE") {
    return <MyApplications />;
  }

  if (user?.role === "HR") {
    return <HRApplications />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-slate-500">You do not have access to this page.</p>
    </div>
  );
};

export default Application;
