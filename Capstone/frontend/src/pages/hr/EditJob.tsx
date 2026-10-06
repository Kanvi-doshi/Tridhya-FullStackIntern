import { ArrowLeft, BriefcaseBusiness, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

interface JobForm {
  title: string;
  description: string;
  location: string;
  experienceRequired: string;
  skills: string;
  status: string;
}

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<JobForm>({
    title: "",
    description: "",
    location: "",
    experienceRequired: "",
    skills: "",
    status: "OPEN",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) {
        setError("Job ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/job/${id}`);

        const job = response.data.job;

        setForm({
          title: job.title || "",
          description: job.description || "",
          location: job.location || "",
          experienceRequired: job.experienceRequired || "",
          skills: job.skills || "",
          status: job.status || "OPEN",
        });
      } catch (error: any) {
        console.error("Failed to load job:", error);

        setError(error.response?.data?.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id) return;

    try {
      setSaving(true);
      setError("");

      await api.put(`/job/${id}`, {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        experienceRequired: form.experienceRequired.trim(),
        skills: form.skills.trim(),
        status: form.status,
      });

      navigate(`/job/${id}`, {
        replace: true,
      });
    } catch (error: any) {
      console.error("Failed to update job:", error);

      setError(error.response?.data?.message || "Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="mt-4 text-sm text-slate-500">Loading job...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-8">
          <button
            type="button"
            onClick={() => navigate(`/job/${id}`)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-violet-600"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-xl font-bold text-slate-800">Edit Job</h1>

            <p className="text-sm text-slate-400">
              Update position information and requirements
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-7"
        >
          <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <BriefcaseBusiness size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">Position Information</h2>

              <p className="text-sm text-slate-400">
                Modify the details of this job opening.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* TITLE */}

            <FormField label="Job Title" required>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Full Stack Developer"
                className={inputStyle}
              />
            </FormField>

            {/* LOCATION */}

            <FormField label="Location" required>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                placeholder="Ahmedabad"
                className={inputStyle}
              />
            </FormField>

            {/* EXPERIENCE */}

            <FormField label="Experience Required" required>
              <input
                type="text"
                name="experienceRequired"
                value={form.experienceRequired}
                onChange={handleChange}
                required
                placeholder="1-3 years"
                className={inputStyle}
              />
            </FormField>

            {/* STATUS */}

            <FormField label="Job Status" required>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="DRAFT">Draft</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
            </FormField>
          </div>

          {/* SKILLS */}

          <div className="mt-6">
            <FormField label="Required Skills" required>
              <input
                type="text"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                required
                placeholder="React, Next.js, Node.js, TypeScript, PostgreSQL"
                className={inputStyle}
              />

              <p className="mt-2 text-xs text-slate-400">
                Separate multiple skills using commas.
              </p>
            </FormField>
          </div>

          {/* DESCRIPTION */}

          <div className="mt-6">
            <FormField label="Job Description" required>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={7}
                placeholder="Enter job description..."
                className={`${inputStyle} resize-none`}
              />
            </FormField>
          </div>

          {/* BUTTONS */}

          <div className="mt-8 flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(`/job/${id}`)}
              disabled={saving}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={16} />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

const inputStyle =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormField = ({ label, required, children }: FormFieldProps) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}
    </div>
  );
};

export default EditJob;
