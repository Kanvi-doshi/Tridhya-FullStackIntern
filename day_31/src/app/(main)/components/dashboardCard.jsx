function DashboardCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-gray-500">{title}</h2>

      <p className="text-4xl font-bold mt-3">{value}</p>
    </div>
  );
}

export default DashboardCard;
