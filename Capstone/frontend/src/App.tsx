import { Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/auth/register";
import Login from "./pages/auth/login";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/profile";
import Job from "./pages/Job";
import Application from "./pages/Application";
import ApplicationDetails from "./pages/ApplicationDetails";
import JobDetails from "./pages/JobDetails";
import Interviews from "./pages/Interviews";

import ProtectedRoute from "./component/protectedRoute";

// HR
import CreateJob from "./pages/hr/CreateJob";
import EditJob from "./pages/hr/EditJob";
import JobApplications from "./pages/hr/JobApplications";
import Candidates from "./pages/hr/Candidates";
import Interviewers from "./pages/hr/Interviewers";
import CandidateDetails from "./pages/hr/candidateDetails";
import Questions from "./pages/hr/Questions";

// Candidate
import ApplyJob from "./pages/candidate/ApplyJob";
import Assessment from "./pages/candidate/Assessment";
import AssessmentResult from "./pages/candidate/AssessmentResult";

// Interviewer
import InterviewDetails from "./pages/interviewer/InterviewDetails";
import SubmitFeedback from "./pages/interviewer/SubmitFeedback";
import InterviewerFeedback from "./pages/interviewer/Feedback";


function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/*  AUTHENTICATED*/}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/job" element={<Job />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/application" element={<Application />} />
        <Route path="/application/:id" element={<ApplicationDetails />} />
        <Route path="/interview" element={<Interviews />} />

        {/*  CANDIDATE*/}
        <Route path="/job/:id/apply" element={<ApplyJob />} />
        <Route path="/assessment/:attemptId" element={<Assessment />} />
        <Route path="/assessment/start/:roundId" element={<Assessment />} />
        <Route
          path="/assessment/:attemptId/result"
          element={<AssessmentResult />}
        />

      </Route>

      <Route element={<ProtectedRoute allowedRoles={["INTERVIEWER"]} />}>
        <Route path="/interview/:id" element={<InterviewDetails />} />
        <Route path="/interview/:id/feedback" element={<SubmitFeedback />} />
        <Route path="/feedback" element={<InterviewerFeedback />} />
      </Route>

      {/* ================= HR ONLY ================= */}
      <Route element={<ProtectedRoute allowedRoles={["HR"]} />}>
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/interviewers" element={<Interviewers />} />
        <Route path="/candidates/:id" element={<CandidateDetails />} />
        <Route path="/round/:roundId/questions" element={<Questions />} />
        <Route path="/job/new" element={<CreateJob />} />
        <Route path="/job/:id/edit" element={<EditJob />} />
        <Route path="/job/:jobId/application" element={<JobApplications />} />
      </Route>
      {/* </Route> */}

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
