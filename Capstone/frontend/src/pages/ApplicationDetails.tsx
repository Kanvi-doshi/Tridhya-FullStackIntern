import { useAuth } from "../context/authContext";

import CandidateApplicationDetails from "./candidate/ApplicationDetails";
import HRApplicationDetails from "./hr/ApplicationDetails";

const ApplicationDetails = () => {
  const { user } = useAuth();

  if (user?.role === "CANDIDATE") {
    return <CandidateApplicationDetails />;
  }

  if (user?.role === "HR") {
    return <HRApplicationDetails />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-slate-500">You do not have access to this page.</p>
    </div>
  );
};

export default ApplicationDetails;
