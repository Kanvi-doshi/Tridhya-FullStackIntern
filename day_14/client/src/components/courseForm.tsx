import "../styles/Form.css";
import { useEffect, useState } from "react";
import type { Course } from "../types";

interface CourseFormProps {
  selectedCourse: Course | null;
  onSuccess: () => void;
  clearSelection: () => void;
}

function CourseForm({
  selectedCourse,
  onSuccess,
  clearSelection,
}: CourseFormProps) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (selectedCourse) {
      setName(selectedCourse.name);
      setDuration(selectedCourse.duration);
    } else {
      setName("");
      setDuration("");
    }
  }, [selectedCourse]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const course = {
      name,
      duration,
    };

    try {
      if (selectedCourse) {
        await fetch(`http://localhost:4000/courses/${selectedCourse.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(course),
        });
      } else {
        await fetch("http://localhost:4000/courses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(course),
        });
      }

      setName("");
      setDuration("");
      clearSelection();
      onSuccess();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>{selectedCourse ? "Update Course" : "Add Course"}</h2>

      <div className="input-group">
        <label>Course Name</label>
        <br />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <br />

      <div className="input-group">
        <label>Duration</label>
        <br />
        <input
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />
      </div>

      <br />

      <div className="buttons">
        <button type="submit">
          {selectedCourse ? "Update Course" : "Add Course"}
        </button>
      </div>
    </form>
  );
}

export default CourseForm;
