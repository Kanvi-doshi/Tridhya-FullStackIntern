export interface Student {
  id: number;
  name: string;
  age: number;
  course: string;
}

export const students: Student[] = [
  {
    id: 1,
    name: "Kanvi",
    age: 22,
    course: "Information Technology",
  },
  {
    id: 2,
    name: "Rahul",
    age: 21,
    course: "Computer Engineering",
  },
];

export function getStudents() {
  return students;
}

export function getStudentById(id: number) {
  return students.find((student) => student.id === id);
}

export function addStudent(student: Omit<Student, "id">) {
  const newStudent: Student = {
    id: students.length + 1,
    ...student,
  };

  students.push(newStudent);

  return newStudent;
}

export function updateStudent(id: number, updatedStudent: Omit<Student, "id">) {
  const student = students.find((student) => student.id === id);

  if (!student) return null;

  student.name = updatedStudent.name;
  student.age = updatedStudent.age;
  student.course = updatedStudent.course;

  return student;
}

export function deleteStudent(id: number) {
  const index = students.findIndex((student) => student.id === id);

  if (index === -1) return null;

  return students.splice(index, 1)[0];
}
