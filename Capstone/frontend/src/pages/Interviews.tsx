import { useAuth } from "../context/authContext";

import HRInterviews from "./hr/Interviews";
import CanMyInterviews from "./candidate/MyInterviews";
import InterviewerConductInterviews from "./interviewer/Interviews";

const Interviews = () => {
  const { user } = useAuth();

  if (user?.role === "HR") {
    return <HRInterviews />;
  }

  if (user?.role === "CANDIDATE") {
    return <CanMyInterviews />;
  }

   if (user?.role === "INTERVIEWER") {
     return <InterviewerConductInterviews />;
   }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-slate-500">You do not have access to this page.</p>
    </div>
  );
};

export default Interviews;
