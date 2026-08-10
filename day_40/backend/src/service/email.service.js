import transporter from "../components/utils/email.js";

export const sendWelcomeEmail = async (user) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Welcome to EventHub 🎉",

    html: `
      <h2>Welcome to EventHub!</h2>

      <p>Hello <strong>${user.name}</strong>,</p>

      <p>Your account has been created successfully.</p>
      <br/>

      <p>Happy Eventing </p>
    `,
  });
};

// Event Registration Email
export const sendEventRegistrationEmail = async (user, event) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Event Registration Confirmed ",

    html: `
      <h2>Registration Successful</h2>

      <p>Hello <strong>${user.name}</strong>,</p>

      <p>You have successfully registered for:</p>

      <h3>${event.title}</h3>

      <p><b>Date:</b> ${event.date}</p>
      <p><b>Location:</b> ${event.location}</p>

      <br/>

      <p>See you there! 🎉</p>
    `,
  });
};

// Event Cancellation Email
export const sendEventCancellationEmail = async (user, event) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Registration Cancelled",

    html: `
      <h2>Registration Cancelled</h2>

      <p>Hello <strong>${user.name}</strong>,</p>

      <p>Your registration for <b>${event.title}</b> has been cancelled.</p>

      <p>We hope to see you at another EventHub event.</p>
    `,
  });
};

// Event Created Email
export const sendEventCreatedEmail = async (user, event) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Your Event Has Been Created 🎉",

    html: `
      <h2>Congratulations!</h2>

      <p>Hello <strong>${user.name}</strong>,</p>

      <p>Your event has been created successfully.</p>

      <h3>${event.title}</h3>

      <p><b>Date:</b> ${event.date}</p>
      <p><b>Location:</b> ${event.location}</p>

      <br/>

      <p>We wish you a successful event!</p>
    `,
  });
};
