import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold">
            Event<span className="text-blue-500">Hub</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-lg px-5 py-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium transition hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex min-h-[calc(100vh-81px)] items-center">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="mb-5 font-medium tracking-widest text-blue-500">
              EVENT MANAGEMENT PLATFORM
            </p>

            <h1 className="text-5xl font-bold leading-tight md:text-7xl">
              Manage Events.
              <br />
              Create Experiences.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Create, discover and manage events from one powerful platform.
              EventHub makes event management simple for organizers and
              attendees.
            </p>

            <div className="mt-8 flex gap-4">
              <Link
                href="/events"
                className="rounded-lg bg-blue-600 px-7 py-3 font-medium transition hover:bg-blue-700"
              >
                Explore Events
              </Link>

              <Link
                href="/register"
                className="rounded-lg border border-slate-700 px-7 py-3 font-medium transition hover:bg-slate-800"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
