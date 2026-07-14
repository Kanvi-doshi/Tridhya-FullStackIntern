import "../styles/Table.css";
import type { Student } from "../types";

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: number) => void;
}

function StudentList({ students, onEdit, onDelete }: StudentListProps) {
  return (
    <div className="table-container">
      <h2>Student List</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Course</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.length > 0 ? (
            students.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.age}</td>
                <td>{student.course}</td>

                <td>
                  <div className="action-buttons"></div>
                  <button className="edit-btn" onClick={() => onEdit(student)}>
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => onDelete(student.id)}
                    style={{ marginLeft: "10px" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>No students found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StudentList;
