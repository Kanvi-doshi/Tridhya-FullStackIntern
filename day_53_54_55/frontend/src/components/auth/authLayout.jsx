import { Car } from "lucide-react";

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
              <Car className="h-7 w-7 text-white" />
            </div>
              <h1 className="text-3xl font-bold text-slate-900">DriveEasy</h1>
          </div>

          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
