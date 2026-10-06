import {
  ArrowLeft,
  BriefcaseBusiness,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  Search,
  UserRoundSearch,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import ApplicationStatusSelect from "../../component/hr/ApplicationStatusSelect";
import { HRRealtimeContext } from "../../context/RealtimeContext";

interface Job {
  id: string;
  title: string;
  location: string;
  status: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
}

interface Application {
  id: string;
  status: string;
  overallScore: number | null;
  currentRound: number;

  resumeOriginalName: string | null;
  resumeSummary: string | null;
  resumeSkills: string[] | null;
  resumeExperience: string | null;
  resumeEducation: string | null;
  resumeStrengths: string[] | null;
  resumeMissingSkills: string[] | null;

  jobMatchScore: string | number | null;
  aiCandidateSummary: string | null;
  aiRecommendation: string | null;
  aiStrengths: string[] | null;
  aiConcerns: string[] | null;
  appliedAt: string;
  updatedAt: string;
  candidate: Candidate;
  job: Job;
}

const APPLICATION_STATUSES = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEWING",
  "SELECTED",
  "REJECTED",
];

const HRApplications = () => {
  const navigate = useNavigate();
  const hrRevision = useContext(HRRealtimeContext);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");

  const [applications, setApplications] = useState<Application[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [jobsLoading, setJobsLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobsLoading(true);
        setError("");

        const response = await api.get("/job");
        const fetchedJobs = response.data.jobs || [];

        setJobs(fetchedJobs);
        if (fetchedJobs.length > 0) {
          setSelectedJobId(fetchedJobs[0].id);
        }
      } catch (error: any) {
        console.error("Failed to fetch jobs:", error);

        setError(error.response?.data?.message || "Failed to load jobs");
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    if (!selectedJobId) {
      setApplications([]);
      return;
    }
    let cancelled = false;

    const fetchApplications = async () => {
      try {
        const response = await api.get(`/application/job/${selectedJobId}`);

        if (!cancelled) {
          setApplications(response.data.applications || []);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Unable to refresh applications.");
        }
      } finally {
        if (!cancelled) setApplicationsLoading(false);
      }
    };

    void fetchApplications();

    return () => {
      cancelled = true;
    };
  }, [selectedJobId, hrRevision]);

  const handleStatusChange = async (applicationId: string, status: string) => {
    try {
      setUpdatingId(applicationId);
      const response = await api.patch(`/application/${applicationId}/status`, {
        status,
      });

      setApplications((previousApplications) =>
        previousApplications.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status: response.data.application?.status || status,
              }
            : application,
        ),
      );
    } catch (error: any) {
      console.error("Failed to update application:", error);

      alert(
        error.response?.data?.message || "Failed to update application status",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewResume = async (applicationId: string) => {
    try {
      const response = await api.get(`/application/${applicationId}/resume`, {
        responseType: "blob",
      });

      const headerContentType = response.headers["content-type"];
      const contentType =
        typeof headerContentType === "string"
          ? headerContentType
          : "application/pdf";

      const blob = new Blob([response.data], {
        type: contentType,
      });
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, "_blank");

      setTimeout(() => {
        URL.revokeObjectURL(fileURL);
      }, 60000);
    } catch (error: any) {
      console.error("Failed to view resume:", error);

      alert(error.response?.data?.message || "Failed to view resume");
    }
  };

  const handleDownloadResume = async (application: Application) => {
    try {
      const response = await api.get(
        `/application/${application.id}/resume?download=true`,
        {
          responseType: "blob",
        },
      );

      const fileURL = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = fileURL;
      link.download =
        application.resumeOriginalName ||
        `${application.candidate.name}-resume.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileURL);
    } catch (error: any) {
      console.error("Failed to download resume:", error);

      alert(error.response?.data?.message || "Failed to download resume");
    }
  };

  const filteredApplications = applications.filter((application) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      application.candidate?.name?.toLowerCase().includes(query) ||
      application.candidate?.email?.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === "ALL" || application.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedJob = jobs.find((job) => job.id === selectedJobId);
  if (jobsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="mt-4 text-sm text-slate-500">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
            title="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">Applications</h1>
            <p className="mt-1 text-sm text-violet-100">
              Review and manage candidate applications
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div>
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <BriefcaseBusiness
                size={32}
                className="rounded-xl text-slate-700"
              />
              <h2 className="font-bold text-2xl text-slate-800">Select Job</h2>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Choose a job to view its applications
            </p>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center">
              <BriefcaseBusiness size={32} className="mx-auto text-slate-300" />

              <p className="mt-3 font-medium text-slate-600">
                No jobs available
              </p>

              <button
                onClick={() => navigate("/job")}
                className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Manage Jobs
              </button>
            </div>
          ) : (
            <select
              value={selectedJobId}
              onChange={(event) => {
                setApplications([]);
                setApplicationsLoading(true);
                setSelectedJobId(event.target.value);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:max-w-md"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.location}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedJobId && (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                title="Total"
                value={applications.length}
                icon={<ClipboardList size={24} aria-hidden="true" />}
              />

              <SummaryCard
                title="Shortlisted"
                value={
                  applications.filter(
                    (application) => application.status === "SHORTLISTED",
                  ).length
                }
                icon={<UserRoundSearch size={24} aria-hidden="true" />}
              />

              <SummaryCard
                title="Interviewing"
                value={
                  applications.filter(
                    (application) => application.status === "INTERVIEWING",
                  ).length
                }
                icon={<Clock3 size={24} aria-hidden="true" />}
              />

              <SummaryCard
                title="Selected"
                value={
                  applications.filter(
                    (application) => application.status === "SELECTED",
                  ).length
                }
                icon={<CheckCircle2 size={24} aria-hidden="true" />}
              />
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search candidate by name or email..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-violet-400"
              >
                <option value="ALL">All Status</option>

                {APPLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      {selectedJob?.title || "Applications"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      {filteredApplications.length} application
                      {filteredApplications.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <ClipboardList size={21} className="text-violet-600" />
                </div>
              </div>

              {applicationsLoading ? (
                <div className="py-16 text-center">
                  <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

                  <p className="mt-3 text-sm text-slate-400">
                    Loading applications...
                  </p>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="py-16 text-center">
                  <UserRoundSearch
                    size={35}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 font-medium text-slate-600">
                    No applications found
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {applications.length === 0
                      ? "No candidates have applied for this job yet."
                      : "No applications match your current filters."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredApplications.map((application) => (
                    <ApplicationRow
                      key={application.id}
                      application={application}
                      updating={updatingId === application.id}
                      onStatusChange={handleStatusChange}
                      onViewResume={handleViewResume}
                      onDownloadResume={handleDownloadResume}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

interface ApplicationRowProps {
  application: Application;
  updating: boolean;

  onStatusChange: (id: string, status: string) => void;
  onViewResume: (id: string) => void;
  onDownloadResume: (application: Application) => void;
}

const ApplicationRow = ({
  application,
  updating,
  onStatusChange,
  onViewResume,
  onDownloadResume,
}: ApplicationRowProps) => {
  const navigate = useNavigate();

  const matchScore =
    application.jobMatchScore !== null
      ? Number(application.jobMatchScore)
      : null;

  return (
    <div className="p-6">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-600">
            {application.candidate?.name?.charAt(0).toUpperCase() || "C"}
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-slate-800">
              {application.candidate?.name || "Candidate"}
            </h3>

            <p className="mt-1 truncate text-sm text-slate-400">
              {application.candidate?.email}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Applied{" "}
              {new Date(application.appliedAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="min-w-28">
          <p className="text-xs font-medium text-slate-400">Job Match</p>

          {matchScore !== null && !Number.isNaN(matchScore) ? (
            <>
              <p className="mt-1 text-lg font-bold text-violet-600">
                {matchScore.toFixed(1)}%
              </p>

              <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-violet-600"
                  style={{
                    width: `${Math.min(Math.max(matchScore, 0), 100)}%`,
                  }}
                />
              </div>
            </>
          ) : (
            <p className="mt-1 text-sm text-slate-400">Not available</p>
          )}
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-slate-400">Status</p>

          <ApplicationStatusSelect
            applicationId={application.id}
            jobId={application.job.id}
            status={application.status}
            updating={updating}
            onChange={(status) => {
              void onStatusChange(application.id, status);
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(`/application/${application.id}`)}
            className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-600 transition hover:bg-violet-100"
          >
            <ExternalLink size={14} />
            Details
          </button>

          <button
            onClick={() => onViewResume(application.id)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            <FileText size={14} />
            Resume
          </button>

          <button
            onClick={() => onDownloadResume(application)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            <Download size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: ReactNode;
}) => {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:bg-violet-50 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default HRApplications;
