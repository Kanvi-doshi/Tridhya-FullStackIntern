function ProfileCard({
  image,
  name,
  role,
  location,
  about,
  skills,
  education,
  experience,
  email,
  phone,
  interests,
}) {
  return (
    <div className="card">
      <img src={image} alt={name} />
      <h2>{name}</h2>
      <h4>{role}</h4>
      <p className="location"> {location}</p>
      <hr />
      <h3>About</h3>
      <p>{about}</p>
      <h3>Skills</h3>
      <p>{skills}</p>
      <h3>Education</h3>
      <p>{education}</p>
      <h3>Experience</h3>
      <p>{experience}</p>
      <h3>Contact</h3>
      <p> {email} | {phone}</p>
      <h3>Interests</h3>
      <p>{interests}</p>
      <div className="buttons">
        <button>Follow</button>
        <button>Message</button>
      </div>
    </div>
  );
}

export default ProfileCard;
