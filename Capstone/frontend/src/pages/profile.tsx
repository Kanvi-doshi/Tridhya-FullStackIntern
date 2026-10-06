import axios from "axios";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Mail,
  LogOut,
  ShieldCheck,
  Sparkles,
  User,
  UserRound,
  Pencil,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/authContext";

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  role: "CANDIDATE" | "HR" | "INTERVIEWER";
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { logout, updateUser } = useAuth();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/auth/me");

        setProfile(response.data.user || response.data);
      } catch (error: any) {
        console.error("Failed to fetch profile:", error);

        setError(error.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setEditError("Name must contain between 2 and 100 characters.");
      return;
    }

    setSaving(true);
    setEditError("");
    setSuccessMessage("");

    try {
      const response = await api.patch<{
        success: boolean;
        message: string;
        user: ProfileUser;
      }>("/auth/me", {
        name: trimmedName,
        email: email.trim().toLowerCase(),
      });

      setProfile(response.data.user);
      updateUser(response.data.user);
      setEditing(false);
      setSuccessMessage("Profile updated successfully.");
    } catch (error: unknown) {
      setEditError(
        axios.isAxiosError<{
          message?: string;
          errors?: { field: string; message: string }[];
        }>(error)
          ? error.response?.data?.errors
              ?.map((issue) => issue.message)
              .join(" ") ||
              error.response?.data?.message ||
              "Unable to update profile."
          : "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = () => {
    switch (profile?.role) {
      case "HR":
        return "HR Administrator";
      case "INTERVIEWER":
        return "Interviewer";
      case "CANDIDATE":
        return "Candidate";
      default:
        return "User";
    }
  };

  const getRoleDescription = () => {
    switch (profile?.role) {
      case "HR":
        return "Manage jobs, candidates, interviews and the recruitment process.";
      case "INTERVIEWER":
        return "Manage assigned interviews and candidate evaluations.";
      case "CANDIDATE":
        return "Track applications, assessments and  can view interview schedules.";
      default:
        return "SmartHire AI user account.";
    }
  };

  const getRoleIcon = () => {
    switch (profile?.role) {
      case "HR":
        return <ShieldCheck size={22} />;
      case "INTERVIEWER":
        return <UserRound size={22} />;
      default:
        return <BriefcaseBusiness size={22} />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="mt-4 text-sm text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <User size={22} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Unable to load profile
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {error || "Profile information is unavailable."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div
            onClick={handleBack}
            className="flex cursor-pointer items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
              <Sparkles size={19} />
            </div>
            <h1 className="text-lg font-bold text-slate-800">SmartHire AI</h1>
          </div>

          <button
            onClick={handleBack}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl py-2">
        <div className="mb-3">
          <h2 className="text-2xl font-bold text-slate-800">Profile</h2>
          <p className="mt-1 text-sm text-slate-500">
            View your account and role information.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-4">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
              <div className="ml-6 flex h-15 w-15 items-center justify-center rounded-full border-3 border-white/30 bg-white text-3xl font-bold text-violet-600 shadow-sm">
                {profile.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className=" text-2xl font-bold text-white">
                  {profile.name}
                </h2>

                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
                  {getRoleIcon()}
                  {getRoleLabel()}
                </div>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Personal information */}
              <div className="lg:col-span-2">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      Personal Information
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Your basic account details
                    </p>
                  </div>

                  {!editing && (
                    <button
                      type="button"
                      onClick={() => {
                        setName(profile.name);
                        setEmail(profile.email);
                        setEditError("");
                        setSuccessMessage("");
                        setEditing(true);
                      }}
                      className="flex items-center gap-2 rounded-lg border border-violet-200 px-3 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-50"
                    >
                      <Pencil size={16} />
                      Edit Profile
                    </button>
                  )}
                </div>

                {successMessage && (
                  <p
                    role="status"
                    className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
                  >
                    {successMessage}
                  </p>
                )}

                {editing && (
                  <form
                    onSubmit={handleSaveProfile}
                    className="mb-5 rounded-xl border border-violet-200 bg-violet-50 p-4"
                  >
                    <label
                      htmlFor="profile-name"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Full Name
                    </label>

                    <input
                      id="profile-name"
                      type="text"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={100}
                      value={name}
                      disabled={saving}
                      onChange={(event) => setName(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-violet-500 disabled:opacity-60"
                    />
                    <label
                      htmlFor="profile-email"
                      className="mt-4 block text-sm font-semibold text-slate-700"
                    >
                      Email Address
                    </label>

                    <input
                      id="profile-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      disabled={saving}
                      onChange={(event) => setEmail(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-violet-500 disabled:opacity-60"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Use your updated email address the next time you log in.
                    </p>

                    {editError && (
                      <p role="alert" className="mt-3 text-sm text-red-600">
                        {editError}
                      </p>
                    )}

                    <div className="mt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => {
                          setEditing(false);
                          setEditError("");
                        }}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        <Save size={16} />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoCard
                    icon={<User size={19} />}
                    label="Full Name"
                    value={profile.name}
                  />

                  <InfoCard
                    icon={<Mail size={19} />}
                    label="Email Address"
                    value={profile.email}
                  />

                  {profile.createdAt && (
                    <InfoCard
                      icon={<CalendarDays size={19} />}
                      label="Member Since"
                      value={new Date(profile.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    />
                  )}

                  <InfoCard
                    icon={<CheckCircle2 size={19} />}
                    label="Account Status"
                    value={profile.isActive === false ? "Inactive" : "Active"}
                  />
                </div>

                <button
                  onClick={handleLogout}
                  className=" mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-6 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>

              <div>
                <div className="mb-2">
                  <h3 className="font-bold text-slate-800">Role Information</h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Your SmartHire access
                  </p>
                </div>

                <div className="rounded-xl bg-violet-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center gap-5 rounded-xl bg-violet-600 text-white">
                      {getRoleIcon()}
                    </div>

                    <h4 className="font-bold text-slate-700">
                      {getRoleLabel()}
                    </h4>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {getRoleDescription()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoCard = ({ icon, label, value }: InfoCardProps) => {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">{label}</p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-700">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
