import {
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Sparkles,
  Target,
  Users,
  UserRoundSearch,
  Video,
} from "lucide-react";
import {useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import api from "../../services/api";
import { HRRealtimeContext } from "../../context/RealtimeContext";

interface DashboardAnalytics {
  jobs: {
    total: number;
    open: number;
  };

  applications: {
    total: number;
    shortlisted: number;
    interviewing: number;
    selected: number;
    rejected: number;
  };

  scores: {
    averageJobMatchScore: number;
    averageOverallScore: number;
  };

  interviews: {
    total: number;
    completed: number;
  };
}

const HRDash = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hrRevision = useContext(HRRealtimeContext);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchDashboardAnalytics = async () => {
      try {
        const response = await api.get("/hr/analytics/dashboard");

        if (!cancelled) {
          setAnalytics(response.data.analytics);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Unable to refresh dashboard analytics.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchDashboardAnalytics();
    return () => {
      cancelled = true;
    };
  }, [hrRevision]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="mt-4 text-sm text-slate-500">Loading HR dashboard...</p>
        </div>
      </div>
    );
  }

  const QuickAction = ({
    title,
    description,
    icon,
    onClick,
  }: QuickActionProps) => {
    return (
      <button
        onClick={onClick}
        className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-left transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:bg-violet-50 hover:shadow-md"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
          {icon}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-700">{title}</h4>

          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
              <Sparkles size={19} />
            </div>

            <h1 className="text-lg font-bold text-slate-800">SmartHire AI</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-700">
                {user?.name}
              </p>

              <p className="text-xs text-slate-400">HR Administrator</p>
            </div>

            <button
              onClick={() => navigate("/profile")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-600 transition hover:bg-violet-200"
              title="View profile"
            >
              {user?.name?.charAt(0).toUpperCase() || "H"}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-7 text-white">
          <p className="text-sm text-violet-100">HR Dashboard</p>

          <h2 className="mt-1 text-3xl font-bold">
            Welcome back, {user?.name}
          </h2>

          <p className="mt-2 text-violet-100">
            Manage recruitment, monitor candidates and track the complete hiring
            process.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            title="Manage Jobs"
            description="Create and manage jobs"
            icon={<BriefcaseBusiness size={20} />}
            onClick={() => navigate("/job")}
          />

          <QuickAction
            title="Applications"
            description="Review applications"
            icon={<ClipboardList size={20} />}
            onClick={() => navigate("/application")}
          />

          <QuickAction
            title="Interviews"
            description="Manage interviews"
            icon={<Video size={20} />}
            onClick={() => navigate("/interview")}
          />

          <QuickAction
            title="Candidates"
            description="Manage candidates"
            icon={<Users size={20} />}
            onClick={() => navigate("/candidates")}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">
                  Recruitment Overview
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Current candidate application pipeline
                </p>
              </div>

              <BarChart3 size={29} className="text-violet-600" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <StatusCard
                title="Shortlisted"
                value={analytics?.applications.shortlisted || 0}
                icon={<UserRoundSearch size={25} />}
              />

              <StatusCard
                title="Interviewing"
                value={analytics?.applications.interviewing || 0}
                icon={<Clock3 size={25} />}
              />

              <StatusCard
                title="Selected"
                value={analytics?.applications.selected || 0}
                icon={<CheckCircle2 size={25} />}
              />

              <StatusCard
                title="Rejected"
                value={analytics?.applications.rejected || 0}
                icon={<Users size={25} />}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Score Overview</h3>

                <p className="mt-1 text-sm text-slate-400">
                  Candidate evaluation averages
                </p>
              </div>

              <Target size={29} className="text-violet-600" />
            </div>

            <ScoreCard
              title="Average Job Match"
              value={analytics?.scores.averageJobMatchScore || 0}
              description="Resume and job compatibility"
            />

            <ScoreCard
              title="Average Overall Score"
              value={analytics?.scores.averageOverallScore || 0}
              description="Complete candidate evaluation"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

interface StatusCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const StatusCard = ({ title, value, icon }: StatusCardProps) => {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-800">{value}</span>
      </div>

      <p className="mt-3 text-sm font-medium text-slate-600">{title}</p>
    </div>
  );
};

interface ScoreCardProps {
  title: string;
  value: number;
  description: string;
}

const ScoreCard = ({ title, value, description }: ScoreCardProps) => {
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100);

  return (
    <div className="mb-4 rounded-xl bg-slate-50 p-5 last:mb-0">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{title}</p>

        <span className="text-xl font-bold text-violet-600">
          {safeValue.toFixed(1)}%
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-violet-600"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">{description}</p>
    </div>
  );
};

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export default HRDash;
