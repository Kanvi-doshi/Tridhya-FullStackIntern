import ProfileCard from "./components/profile";
import "./App.css";
import charizad from "./assets/charizad.jpg";
import mew from "./assets/mew.jpg";
import pikachu from "./assets/pikachu.jpg";

function App() {
  return (
    <div className="container">
      <ProfileCard
        image={charizad}
        name="Satish Doshi"
        role="Frontend Developer"
        location="Ahmedabad, Gujarat"
        about="Passionate frontend developer with an interest in building clean, responsive, and user-friendly web applications."
        skills="React • JavaScript • HTML • CSS • Tailwind CSS"
        education="B.Tech Information Technology, Indus University"
        experience="Frontend Developer Intern (6 Months)"
        email="kanvi@gmail.com"
        phone="+91 98765 43210"
        interests="Music • Reading • Coding"
      />

      <ProfileCard
        image={pikachu}
        name="Kanvi Doshi"
        role="Backend Developer"
        location="Pune, Maharashtra"
        about="Backend developer passionate about APIs, databases, and scalable server-side applications."
        skills="Node.js • Express • PostgreSQL • TypeScript"
        education="B.Tech Computer Engineering"
        experience="Backend Intern (1 Year)"
        email="rahul@gmail.com"
        phone="+91 99887 77665"
        interests="Gaming • Cricket • Coding"
      />

      <ProfileCard
        image={mew}
        name="Sangita Doshi"
        role="UI/UX Designer"
        location="Surat, Gujarat"
        about="Creative UI/UX designer who enjoys creating modern, user-friendly interfaces."
        skills="Figma • Adobe XD • Photoshop"
        education="B.Des Graphic Design"
        experience="UI Designer (2 Years)"
        email="akshat@gmail.com"
        phone="+91 98700 12345"
        interests="Photography • Sketching • Travel"
      />
    </div>
  );
}


export default App;
