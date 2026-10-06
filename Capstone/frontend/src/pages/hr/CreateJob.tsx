import { ArrowLeft, BriefcaseBusiness, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

interface JobForm {
  title: string;
  description: string;
  location: string;
  experienceRequired: string;
  skills: string;
  status: string;
}

const CreateJob = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<JobForm>({
    title: "",
    description: "",
    location: "",
    experienceRequired: "",
    skills: "",
    status: "OPEN",
  });

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await api.post("/job", {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        experienceRequired: form.experienceRequired.trim(),
        skills: form.skills.trim(),
        status: form.status,
      });

      setSuccess(response.data.message || "Job created successfully");

      // After creation go to the new job
      setTimeout(() => {
        navigate(`/job/${response.data.job.id}`, {
          replace: true,
        });
      }, 700);
    } catch (error: any) {
      console.error("Failed to create job:", error);

      setError(error.response?.data?.message || "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-8xl items-center gap-4 px-6 py-5">
          <button
            type="button"
            onClick={() => navigate("/job")}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-violet-600"
            title="Back to jobs"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-xl font-bold text-slate-800">Create Job</h1>

            <p className="text-sm text-slate-400">
              Add a new position for candidates to apply
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

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
            {success}
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
                Enter the details for the new job opening.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
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

          <div className="mt-6">
            <FormField label="Job Description" required>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={7}
                placeholder="Describe the role, responsibilities and requirements..."
                className={`${inputStyle} resize-none`}
              />
            </FormField>
          </div>

          <div className="mt-8 flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/job")}
              disabled={submitting}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={17} />

              {submitting ? "Creating..." : "Create Job"}
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

export default CreateJob;
