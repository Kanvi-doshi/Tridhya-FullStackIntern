import { useAuth } from "../context/authContext";

import CandidateJobs from "./candidate/Job";
import HRJobs from "./hr/Job";

const Job = () => {
  const { user } = useAuth();

  if (user?.role === "HR") {
    return <HRJobs />;
  }

  if (user?.role === "CANDIDATE") {
    return <CandidateJobs />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-slate-500">You do not have access to this page.</p>
    </div>
  );
};

export default Job;
