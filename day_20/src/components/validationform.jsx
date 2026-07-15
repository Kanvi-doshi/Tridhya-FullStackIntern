function validateForm(formData) {
  let errors = {};

  if (!formData.name.trim()) {
    errors.name = "Name is required";
  }

  if (!formData.email.includes("@")) {
    errors.email = "Invalid Email";
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!passwordRegex.test(formData.password)) {
    errors.password =
      "Password must contain uppercase, lowercase, number, special character and be at least 8 characters";
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Confirm password does not match password";
  }

  return errors;
  console.log(formData.password);
  console.log(passwordRegex.test(formData.password));
}

export default validateForm;
