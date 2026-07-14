import "./App.css";
import { useEffect, useState } from "react";
import Modal from "./components/modal";
import StudentForm from "./components/studentForm";
import CourseForm from "./components/courseForm";
import StudentList from "./components/studentList";
import CourseList from "./components/courseList";

import type { Student, Course } from "./types";

function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [activeTab, setActiveTab] = useState<"students" | "courses">(
    "students",
  );
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);

  async function fetchStudents() {
    const response = await fetch("http://localhost:4000/students");
    const data = await response.json();

    setStudents(data);
  }

  async function deleteStudent(id: number) {
    await fetch(`http://localhost:4000/students/${id}`, {
      method: "DELETE",
    });

    fetchStudents();
  }

  function clearStudentSelection() {
    setSelectedStudent(null);
  }

  async function fetchCourses() {
    const response = await fetch("http://localhost:4000/courses");
    const data = await response.json();

    setCourses(data);
  }

  async function deleteCourse(id: number) {
    await fetch(`http://localhost:4000/courses/${id}`, {
      method: "DELETE",
    });

    fetchCourses();
  }

  function clearCourseSelection() {
    setSelectedCourse(null);
  }

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1>College Management System</h1>
        <p>Manage Students and Courses Easily</p>
      </header>

      <div className="dashboard">
        <div className="dashboard-card">
          <h3>Total Students</h3>
          <span>{students.length}</span>
        </div>

        <div className="dashboard-card">
          <h3>Total Courses</h3>
          <span>{courses.length}</span>
        </div>
      </div>
      <div className="tabs">
        <button
          className={activeTab === "students" ? "tab active" : "tab"}
          onClick={() => setActiveTab("students")}
        >
          Students
        </button>

        <button
          className={activeTab === "courses" ? "tab active" : "tab"}
          onClick={() => setActiveTab("courses")}
        >
          Courses
        </button>
      </div>

      {activeTab === "students" && (
        <section className="module">
          <h2 className="module-title">Students</h2>

          <div className="table-header">
            <button
              className="add-btn"
              onClick={() => {
                clearStudentSelection();
                setShowStudentModal(true);
              }}
            >
              + Add Student
            </button>
          </div>

          <div className="card">
            <StudentList
              students={students}
              onEdit={(student) => {
                setSelectedStudent(student);
                setShowStudentModal(true);
              }}
              onDelete={deleteStudent}
            />
          </div>
        </section>
      )}
      <Modal
        isOpen={showStudentModal}
        onClose={() => {
          setShowStudentModal(false);
          clearStudentSelection();
        }}
      >
        <StudentForm
          selectedStudent={selectedStudent}
          onSuccess={() => {
            fetchStudents();
            setShowStudentModal(false);
          }}
          clearSelection={() => {
            setShowStudentModal(false);
            clearStudentSelection();
          }}
        />
      </Modal>

      {activeTab === "courses" && (
        <section className="module">
          <h2 className="module-title">Courses</h2>

          <div className="table-header">
            <button
              className="add-btn"
              onClick={() => {
                clearCourseSelection();
                setShowCourseModal(true);
              }}
            >
              + Add Course
            </button>
          </div>

          <div className="card">
            <CourseList
              courses={courses}
              onEdit={(course) => {
                setSelectedCourse(course);
                setShowCourseModal(true);
              }}
              onDelete={deleteCourse}
            />
          </div>
        </section>
      )}

      <Modal
        isOpen={showCourseModal}
        onClose={() => {
          setShowCourseModal(false);
          clearCourseSelection();
        }}
      >
        <CourseForm
          selectedCourse={selectedCourse}
          onSuccess={() => {
            fetchCourses();
            setShowCourseModal(false);
          }}
          clearSelection={() => {
            setShowCourseModal(false);
            clearCourseSelection();
          }}
        />
      </Modal>
    </div>
  );
}

export default App;
