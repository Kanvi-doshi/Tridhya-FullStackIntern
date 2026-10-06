import { useAuth } from "../context/authContext";

import CanJobDetails from "./candidate/JobDetails";
import HRJobDetails from "./hr/JobDetails";

const JobDetails = () => {
  const { user } = useAuth();

  if (user?.role === "CANDIDATE") {
    return <CanJobDetails />;
  }

  if (user?.role === "HR") {
    return <HRJobDetails />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-slate-500">You do not have access to this page.</p>
    </div>
  );
};

export default JobDetails;
