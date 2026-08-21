import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, updateUser, clearAuth } from "../components/utils/auth";
import { updateProfile } from "../service/auth.service";
import { FaUser, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";

function Profile() {
  const navigate = useNavigate();

  const user = getUser();

  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">User not found</h1>

          <button
            onClick={() => navigate("/login")}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const response = await updateProfile(formData.name, formData.email);

      updateUser(response.user);

      toast.success("Profile updated successfully!");

      setEditing(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Back Button */}
      <button
        onClick={() => navigate("/home")}
        className="flex items-center gap-2 text-blue-600 font-semibold mb-4"
      >
        <FaArrowLeft />
        Back to Home
      </button>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
            <FaUser className="text-4xl text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold mt-4">My Profile</h1>
        </div>

        {/* User Information */}
        <div className="mt-10 space-y-5">
          {editing ? (
            <>
              {/* Name */}
              <div>
                <label className="text-gray-500 text-sm">Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-lg mt-1"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-gray-500 text-sm">Email</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-lg mt-1"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-gray-500 text-sm">Name</label>

                <p className="text-lg font-semibold">{user.name}</p>
              </div>

              <div>
                <label className="text-gray-500 text-sm">Email</label>

                <p className="text-lg font-semibold">{user.email}</p>
              </div>

              <div>
                <label className="text-gray-500 text-sm">Role</label>

                <p className="text-lg font-semibold capitalize">{user.role}</p>
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold"
              >
                Save Changes
              </button>

              <button
                onClick={() => {
                  setEditing(false);

                  setFormData({
                    name: user.name,
                    email: user.email,
                  });
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold"
              >
                Edit Profile
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
