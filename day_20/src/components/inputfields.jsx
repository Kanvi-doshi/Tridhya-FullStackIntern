function InputField({ type, name, placeholder, value, onChange, error }) {
  return (
    <div>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default InputField;
