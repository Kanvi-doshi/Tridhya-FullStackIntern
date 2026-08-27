  import { useState } from "react";
  import { Link, useLocation, useNavigate } from "react-router-dom";
  import {
    Car,
    CalendarDays,
    CreditCard,
    LayoutDashboard,
    User,
    LogOut,
    Menu,
    X,
  } from "lucide-react";

  import { useAuth } from "../../context/authContext";

  const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
      logout();
      navigate("/login");
    };

    const navItems = [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Cars",
        path: "/cars",
        icon: Car,
      },
      {
        name: user?.role_name === "Customer" ? "My Rentals" : "Rentals",
        path: "/rentals",
        icon: CalendarDays,
      },
      {
        name: "Payments",
        path: "/payments",
        icon: CreditCard,
      },
    ];

    if (user?.role_name === "Admin") {
      navItems.push({
        name: "Users",
        path: "/users",
        icon: User,
      });

      navItems.push({
        name: "Analytics",
        path: "/analytics",
        icon: LayoutDashboard,
      });
    }

    const getInitials = () => {
      if (!user) return "U";

      return `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();
    };

    return (
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <Car className="h-5 w-5 text-white" />
            </div>

            <span className="text-lg font-bold text-slate-900">DriveEasy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop User Section */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                {getInitials()}
              </div>

              <div className="hidden text-left lg:block">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.first_name} {user?.last_name}
                </p>

                <p className="text-xs text-slate-500">{user?.role_name}</p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            {/* User */}
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                {getInitials()}
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {user?.first_name} {user?.last_name}
                </p>

                <p className="text-xs text-slate-500">{user?.role_name}</p>
              </div>
            </div>

            {/* Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
                      active
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <User className="h-5 w-5" />
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>
        )}
      </header>
    );
  };

  export default Navbar;
