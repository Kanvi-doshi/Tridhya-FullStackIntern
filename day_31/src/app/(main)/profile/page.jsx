export const revalidate = 60;
 const generatedAt = new Date().toLocaleString();
export default function Profile() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-5">My Profile</h1>

      <p className="text-gray-500">Generated At: {generatedAt}</p>
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <p>
          <strong>Name:</strong> Kanvi Doshi
        </p>

        <p className="mt-3">
          <strong>Email:</strong> kanvi@example.com
        </p>

        <p className="mt-3">
          <strong>Role:</strong> Recipe Enthusiast
        </p>
      </div>
    </div>
  );
}
