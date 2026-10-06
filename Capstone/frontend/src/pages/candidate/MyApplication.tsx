import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
} from "lucide-react";
import api from "../../services/api";
import { HRRealtimeContext } from "../../context/RealtimeContext";

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  job: {
    id: string;
    title: string;
    location: string;
  };
}

const MyApplications = () => {
  const navigate = useNavigate();
  const revision = useContext(HRRealtimeContext);

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchApplications = async () => {
      try {
        const response = await api.get("/application/my");

        if (cancelled) return;
        setError("");
        setApplications(response.data.applications || []);
      } catch (error: any) {
        if (cancelled) return;
        setError(
          error.response?.data?.message || "Failed to load applications",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchApplications();
    return () => { cancelled = true; };
  }, [revision]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "SHORTLISTED":
        return "bg-blue-100 text-blue-700";

      case "INTERVIEWING":
        return "bg-violet-100 text-violet-700";

      case "SELECTED":
        return "bg-emerald-100 text-emerald-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-6xl px-6 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">My Applications</h1>

          <p className="mt-1 text-slate-500">
            Track your job applications and interview progress.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {!error && applications.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <BriefcaseBusiness size={36} className="mx-auto text-slate-300" />

            <h2 className="mt-4 font-semibold text-slate-700">
              No applications yet
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Start exploring available opportunities.
            </p>

            <button
              onClick={() => navigate("/job")}
              className="mt-5 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Browse Jobs
            </button>
          </div>
        )}

        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                      <BriefcaseBusiness size={21} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-800">
                        {application.job.title}
                      </h2>

                      <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                        <MapPin size={14} />
                        {application.job.location}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                    <CalendarDays size={15} />
                    Applied on{" "}
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                      application.status,
                    )}`}
                  >
                    {application.status}
                  </span>

                  <button
                    onClick={() => navigate(`/application/${application.id}`)}
                    className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => navigate(`/job/${application.job.id}`)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-600"
                  >
                    View Job
                  </button>

                  {application.status === "APPLIED" && (
                    <button
                      type="button"
                      disabled={cancellingId !== null}
                      onClick={async () => {
                        if (cancellingId !== null) return;
                        if (!window.confirm("Cancel and remove this application?")) return;
                        try {
                          setCancellingId(application.id);
                          setError("");
                          await api.delete(`/application/${application.id}`);
                          setApplications((previous) =>
                            previous.filter((item) => item.id !== application.id),
                          );
                        } catch (error: any) {
                          setError(error.response?.data?.message || "Unable to cancel application");
                        } finally {
                          setCancellingId(null);
                        }
                      }}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancellingId === application.id ? "Cancelling..." : "Cancel Application"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MyApplications;
