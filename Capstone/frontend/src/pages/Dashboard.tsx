import { useAuth } from "../context/authContext";
import CandidateDash from "./candidate/Dashboard";
import HRDash from "./hr/Dashboard";
import InterviewerDashboard from "./interviewer/Dashboard";

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === "HR") {
    return <HRDash />;
  }

  if (user?.role === "INTERVIEWER") {
    return <InterviewerDashboard />;
  }

  if (user?.role === "CANDIDATE") {
    return <CandidateDash />;
  }

  return <p>Invalid user role</p>;
};

export default Dashboard;
