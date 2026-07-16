import { useState } from "react";
import InputField from "./inputfields";
import validateForm from "./validationform";

function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccess("");
    } else {
      setErrors({});
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      console.log(formData);
      setSuccess("Registration Successful");
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h1>Registration Form</h1>

      <InputField
        type="text"
        name="name"
        placeholder="Enter Name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
      />

      <InputField
        type="email"
        name="email"
        placeholder="Enter Email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      <InputField
        type={showPassword ? "text" : "password"}
        name="password"
        placeholder="Enter Password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
      >
        <button
          type="button"
          className="toggle-btn"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </InputField>

      <InputField
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
      />

      <button type="submit">Register</button>
      {success && <p className="success">{success}</p>}
    </form>
  );
}

export default RegistrationForm;
