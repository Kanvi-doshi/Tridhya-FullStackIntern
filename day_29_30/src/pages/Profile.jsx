import { FiEdit } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("personal");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(user);

  const profileLetter =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (formData.age < 1 || formData.age > 120) {
      alert("Please enter a valid age.");
      return;
    }
    localStorage.setItem("user", JSON.stringify(formData));
    setShowModal(false);
    window.location.reload();
  };

  return (
    <>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />

        <div className="ml-64 flex-1 p-10">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-bold">MY PROFILE</h1>

            <div className="flex items-center gap-5">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {profileLetter}
              </div>
            </div>
          </div>

          <hr />

          <div className="flex gap-4 mt-8 mb-8">
            <button
              onClick={() => setActiveTab("personal")}
              className={`px-5 py-2 rounded-lg ${
                activeTab === "personal"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Personal Info
            </button>

            <button
              onClick={() => setActiveTab("fitness")}
              className={`px-5 py-2 rounded-lg ${
                activeTab === "fitness"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Fitness Info
            </button>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            {activeTab === "personal" ? (
              <>
                <h2 className="text-2xl font-semibold mb-6">
                  Personal Information
                </h2>

                <div className="space-y-5">
                  <p>Age: {user?.age || "Not Added"}</p>
                  <p>Gender: {user?.gender || "Not Added"}</p>
                  <p>Phone: {user?.phone || "Not Added"}</p>
                  <p>Address: {user?.address || "Not Added"}</p>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-6">
                  Fitness Information
                </h2>

                <div className="space-y-5">
                  <p>Goal: {user?.goal}</p>
                  <p>Diet: {user?.diet}</p>
                  <p>Height: {user?.height || "Not Added"} cm</p>
                  <p>Weight: {user?.weight || "Not Added"} kg</p>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              <FiEdit size={18} />
              Edit Profile
            </button>
          </div>
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-[500px] rounded-2xl shadow-xl p-8">
              <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

              <div className="space-y-4">
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="100"
                  placeholder="Enter Age"
                  value={formData.age || ""}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-lg"
                />

                <select
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-lg"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="tel"
                  name="phone"
                  maxLength={10}
                  placeholder="Enter Phone Number"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-lg"
                />

                <input
                  type="text"
                  name="address"
                  placeholder="Enter Address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-lg"
                />

                <input
                  type="number"
                  name="height"
                  min="50"
                  max="250"
                  placeholder="Enter Height (cm)"
                  value={formData.height || ""}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-lg"
                />

                <input
                  type="number"
                  name="weight"
                  min="10"
                  max="300"
                  placeholder="Enter Weight (kg)"
                  value={formData.weight || ""}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Profile;
