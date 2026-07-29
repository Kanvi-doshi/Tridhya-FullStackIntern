function DashboardCard({ title, value, subtitle }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
      <h2 className="text-lg font-semibold text-gray-500">{title}</h2>

      <p className="text-3xl font-bold text-blue-600 mt-3">{value}</p>

      {subtitle && <p className="text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );
}

export default DashboardCard;
