function InputField({ type, name, placeholder, value, onChange, error, children }) {
  return (
    <div className="input-container">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {children}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default InputField;
