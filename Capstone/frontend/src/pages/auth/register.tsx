import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import api from "../../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      navigate("/login");
    } catch (error: any) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-400 to-violet-500 flex items-center justify-center p-5">
      <div className="w-full max-w-5xl min-h-[620px] bg-white rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2">
        <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-500 p-14 text-white">
          {/* organic blob shapes */}
          <div className="pointer-events-none absolute -top-16 -left-24 h-72 w-72 rotate-12 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-white/10 blur-sm" />
          <div className="pointer-events-none absolute top-1/3 -right-28 h-80 w-80 -rotate-6 rounded-[40%_60%_70%_30%/40%_70%_30%_60%] bg-indigo-300/25 blur-md" />
          <div className="pointer-events-none absolute bottom-0 -left-16 h-96 w-96 rotate-45 rounded-[55%_45%_35%_65%/55%_35%_65%_45%] bg-purple-800/30 blur-md" />
          <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rotate-12 rounded-[50%_50%_40%_60%/60%_40%_50%_50%] bg-violet-300/20 blur-sm" />

          <div className="relative flex items-center gap-2 font-semibold text-lg">
            <Sparkles size={22} />
            SmartHire AI
          </div>

          <div className="relative">
            <h1 className="text-5xl font-semibold leading-tight">
              Build your
              <br />
              future with us.
            </h1>

            <p className="mt-6 max-w-sm leading-7 text-purple-100">
              Discover opportunities, take smart assessments and track your
              interview journey from one place.
            </p>
          </div>

          <p className="relative text-sm text-purple-100">
            AI-Powered Recruitment Platform
          </p>
        </div>

        <div className="flex items-center justify-center px-8 py-12 sm:px-14">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100">
                <Sparkles className="text-violet-600" size={26} />
              </div>

              <h2 className="text-3xl font-bold text-slate-800">
                Create Account
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Register to start your interview journey
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 pr-11 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-3 w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-violet-600 hover:text-violet-700"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
