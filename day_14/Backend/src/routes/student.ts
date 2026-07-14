import { Router } from "express";
import {
  getStudents,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent,
} from "../service/students";

const router = Router();

router.get("/", (req, res) => {
  res.json(getStudents());
});

router.get("/:id", (req, res) => {
  const student = getStudentById(Number(req.params.id));

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json(student);
});

router.post("/", (req, res) => {
  const student = addStudent(req.body);
  res.status(201).json(student);
});

router.put("/:id", (req, res) => {
  const student = updateStudent(Number(req.params.id), req.body);
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }
  res.json(student);
});

router.delete("/:id", (req, res) => {
  const student = deleteStudent(Number(req.params.id));
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json({
    message: "Student deleted successfully",
    student,
  });
});

export default router;
