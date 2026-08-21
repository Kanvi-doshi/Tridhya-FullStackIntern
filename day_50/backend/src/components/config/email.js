// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: Number(process.env.EMAIL_PORT),
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USERNAME,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// export const sendRegistrationEmail = async (name, email) => {
//   try {
//     const info = await transporter.sendMail({
//       from: `"My Store" <${process.env.EMAIL_USERNAME}>`,
//       to: email,
//       subject: "Welcome to My Store!",
//       html: `
//         <h2>Welcome to My Store!</h2>

//         <p>Hi ${name},</p>

//         <p>Your account has been created successfully.</p>

//         <p>Thank you for registering with us!</p>
//       `,
//     });

//     console.log("Registration email sent");
//     console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
//   } catch (error) {
//     console.error("Email sending failed:", error.message);
//   }
// };
