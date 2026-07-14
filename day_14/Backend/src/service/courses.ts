export interface Course {
  id: number;
  name: string;
  duration: string;
}

export const courses: Course[] = [
  {
    id: 1,
    name: "Information Technology",
    duration: "4 Years",
  },
  {
    id: 2,
    name: "Computer Engineering",
    duration: "4 Years",
  },
];

export function getCourses() {
  return courses;
}

export function getCourseById(id: number) {
  return courses.find((course) => course.id === id);
}

export function addCourse(course: Omit<Course, "id">) {
  const newCourse: Course = {
    id: courses.length + 1,
    ...course,
  };

  courses.push(newCourse);

  return newCourse;
}

export function updateCourse(id: number, updatedCourse: Omit<Course, "id">) {
  const course = courses.find((course) => course.id === id);

  if (!course) return null;

  course.name = updatedCourse.name;
  course.duration = updatedCourse.duration;
  return course;
}

export function deleteCourse(id: number) {
  const index = courses.findIndex((course) => course.id === id);

  if (index === -1) return null;

  return courses.splice(index, 1)[0];
}
