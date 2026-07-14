import "../styles/Table.css";
import type { Course } from "../types";

interface CourseListProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (id: number) => void;
}

function CourseList({ courses, onEdit, onDelete }: CourseListProps) {
  return (
    <div>
      <h2>Course List</h2>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Course Name</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {courses.length > 0 ? (
            courses.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.name}</td>
                <td>{course.duration}</td>
                <td>
                  <button className="edit-btn" onClick={() => onEdit(course)}>
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => onDelete(course.id)}
                    style={{ marginLeft: "10px" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>No courses found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CourseList;
