const AuthInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = true,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
};

export default AuthInput;
