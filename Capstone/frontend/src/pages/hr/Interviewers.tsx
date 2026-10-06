import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, UserCheck, Users } from "lucide-react";
import api from "../../services/api";
import { HRRealtimeContext } from "../../context/RealtimeContext";

interface Account {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export default function Interviewers() {
  const revision = useContext(HRRealtimeContext);
  const [interviewers, setInterviewers] = useState<Account[]>([]);
  const [candidates, setCandidates] = useState<Account[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [staff, accounts] = await Promise.all([
          api.get("/hr/interviewers"),
          api.get("/hr/candidates"),
        ]);
        if (!cancelled) {
          setInterviewers(staff.data.interviewers || []);
          setCandidates(accounts.data.candidates || []);
          setError("");
        }
      } catch {
        if (!cancelled) setError("Unable to load accounts. Please retry.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [revision, refreshKey]);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Link to="/dashboard" className="mb-5 inline-flex items-center gap-2 text-sm text-violet-600">
          <ArrowLeft size={17} /> Back to Dashboard
        </Link>
        <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
          <h1 className="flex items-center gap-3 text-2xl font-bold">
            <Users size={25} /> Interviewer Management
          </h1>
          <p className="mt-2 text-sm text-violet-100">Manage interviewer accounts and availability for new bookings.</p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            { label: "Total Interviewers", value: interviewers.length },
            { label: "Active Interviewers", value: interviewers.filter((item) => item.isActive).length },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
              <UserCheck className="text-violet-600" size={24} />
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-800">{loading ? "—" : value}</p>
              </div>
            </div>
          ))}
        </div>

        <form className="mt-6 rounded-2xl border border-slate-200 bg-white p-5"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!selectedId || savingId) return;
            setSavingId(selectedId);
            setError("");
            try {
              await api.patch(`/hr/users/${selectedId}/role`, { role: "INTERVIEWER" });
              setSelectedId("");
              setRefreshKey((value) => value + 1);
            } catch (error) {
              setError(axios.isAxiosError(error)
                ? error.response?.data?.message || "Unable to update role."
                : "Unable to update role.");
            } finally {
              setSavingId(null);
            }
          }}>
          <h2 className="font-semibold text-slate-800">Assign Interviewer Role</h2>
          <p className="mt-2 text-sm text-slate-500">
            This converts an existing candidate account into an interviewer account. Choose an account intended for your interview staff.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <select aria-label="Account to assign interviewer role" required value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)} disabled={loading || savingId !== null}
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2">
              <option value="">Choose an existing active account</option>
              {candidates.filter((candidate) => candidate.isActive).map((candidate) => (
                <option key={candidate.id} value={candidate.id}>{candidate.name} — {candidate.email}</option>
              ))}
            </select>
            <button type="submit" disabled={!selectedId || savingId !== null}
              className="rounded-lg bg-violet-600 px-4 py-2 text-white disabled:opacity-50">Assign Role</button>
          </div>
        </form>

        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-800">Interviewers</h2>
            <button type="button" onClick={() => setRefreshKey((value) => value + 1)}
              className="text-sm font-medium text-violet-600">Refresh</button>
          </div>
          <p className="mt-2 text-sm text-slate-500">Deactivation blocks login and new bookings. Reassign or cancel existing interviews separately.</p>
          {loading ? <p className="mt-4 text-slate-500">Loading...</p>
            : interviewers.length === 0 ? <p className="mt-4 text-slate-500">No interviewers found.</p>
            : <div className="mt-4 space-y-3">
              {interviewers.map((interviewer) => (
                <div key={interviewer.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
                  <div>
                    <p className="font-semibold text-slate-800">{interviewer.name}</p>
                    <p className="text-sm text-slate-500">{interviewer.email}</p>
                    <p className={`mt-1 text-sm ${interviewer.isActive ? "text-emerald-600" : "text-slate-500"}`}>
                      {interviewer.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <button type="button" disabled={savingId !== null}
                    onClick={async () => {
                      if (savingId) return;
                      setSavingId(interviewer.id);
                      setError("");
                      try {
                        await api.patch(`/hr/users/${interviewer.id}/status`, { isActive: !interviewer.isActive });
                        setRefreshKey((value) => value + 1);
                      } catch (error) {
                        setError(axios.isAxiosError(error)
                          ? error.response?.data?.message || "Unable to update account."
                          : "Unable to update account.");
                      } finally {
                        setSavingId(null);
                      }
                    }} className="rounded-lg border border-violet-200 px-4 py-2 text-sm font-medium text-violet-600 disabled:opacity-50">
                    {savingId === interviewer.id ? "Saving..." : interviewer.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ))}
            </div>}
        </section>
      </main>
    </div>
  );
}
