import "../styles/form.css";
import { useEffect, useState } from "react";
import type { Student, Course } from "../types";

interface StudentFormProps {
  selectedStudent: Student | null;
  onSuccess: () => void;
  clearSelection: () => void;
}

function StudentForm({
  selectedStudent,
  onSuccess,
  clearSelection,
}: StudentFormProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [course, setCourse] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);

  async function fetchCourses() {
    try {
      const response = await fetch("http://localhost:4000/courses");
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      setName(selectedStudent.name);
      setAge(selectedStudent.age.toString());
      setCourse(selectedStudent.course);
    } else {
      setName("");
      setAge("");
      setCourse("");
    }
  }, [selectedStudent]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const student = {
      name,
      age: Number(age),
      course,
    };

    try {
      if (selectedStudent) {
        await fetch(`http://localhost:4000/students/${selectedStudent.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(student),
        });
      } else {
        await fetch("http://localhost:4000/students", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(student),
        });
      }

      setName("");
      setAge("");
      setCourse("");

      clearSelection();
      onSuccess();
    } catch (error) {
      console.log("Error:", error);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>{selectedStudent ? "Update Student" : "Add Student"}</h2>

      <div className="input-group">
        <label>Name</label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="input-group">
        <label>Age</label>

        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        />
      </div>

      <div className="input-group">
        <label>Course</label>

        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          required
        >
          <option value="">Select Course</option>

          {courses.map((courseItem) => (
            <option key={courseItem.id} value={courseItem.name}>
              {courseItem.name}
            </option>
          ))}
        </select>
      </div>

      <div className="buttons">
        <button type="submit">
          {selectedStudent ? "Update Student" : "Add Student"}
        </button>
      </div>
    </form>
  );
}

export default StudentForm;
