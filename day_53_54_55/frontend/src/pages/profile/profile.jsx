import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Pencil,
  Save,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../service/api";
import { useAuth } from "../../context/authContext";

const Profile = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const response = await api.put("/users/me", {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
      });

      alert(response.data.message || "Profile updated successfully");

      // Update local storage user
      const updatedUser = {
        ...user,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setEditMode(false);
    } catch (error) {
      console.error("Update profile error:", error);

      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(true);

      const response = await api.delete("/users/me");

      alert(response.data.message || "Account deleted successfully");

      logout();
    } catch (error) {
      console.error("Delete account error:", error);

      alert(error.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="bg-gray-50 px-4 py-5">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-3">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          </div>

          {/* Profile Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            {/* Avatar */}
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <User size={40} />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile.first_name} {profile.last_name}
                </h2>

                <p className="text-gray-500">{profile.role_name}</p>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* First Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  First Name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="first_name"
                    value={profile.first_name}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Last Name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="last_name"
                    value={profile.last_name}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full rounded-lg border border-gray-300 bg-gray-100 py-2.5 pl-10 pr-3 text-gray-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Edit / Save Buttons */}
            <div className="mt-5  flex  items-center justify-between  ">
              <div className="flex  gap-4">
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
                  >
                    <Pencil size={18} />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}

                      {loading ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      onClick={() => {
                        setEditMode(false);

                        setProfile({
                          first_name: user?.first_name || "",
                          last_name: user?.last_name || "",
                          email: user?.email || "",
                          phone: user?.phone || "",
                          role_name: user?.role_name || "",
                        });
                      }}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 hover:bg-gray-100"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </>
                )}
              </div>

              <div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}

                  {deleteLoading ? "Deleting..." : "Delete Account"}
                </button>
              </div>

              {/* Account Actions */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
