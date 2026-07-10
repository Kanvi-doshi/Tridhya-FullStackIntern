function validateEmail(email: string): boolean {
  return email.includes("@") && email.includes(".");
}

function validatePhone(phone: string): boolean {
  return phone.length === 10;
}

function validatePassword(password: string): boolean {
  return password.length >= 8;
}

function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

function validateLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

function isEmpty(value: string): boolean {
  return value.trim() === "";
}

console.log("validateEmail");
console.log(validateEmail("kan@gmail.com"));
console.log(validateEmail("kangmail.com"));

console.log("validatePhone");
console.log(validatePhone("9876543210"));
console.log(validatePhone("987654"));

console.log("validatePassword");
console.log(validatePassword("Password123"));
console.log(validatePassword("pass"));

console.log("validateRequired");
console.log(validateRequired("Kanvi"));
console.log(validateRequired("   "));

console.log("validateLength");
console.log(validateLength("Hi", 3, 10));

console.log(isEmpty("   "));
console.log(isEmpty("Kanvi"));
