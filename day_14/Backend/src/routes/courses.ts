import { Router } from "express";
import {
  getCourses,
  getCourseById,
  addCourse,
  updateCourse,
  deleteCourse,
} from "../service/courses";

const router = Router();

router.get("/", (req, res) => {
  res.json(getCourses());
});

router.get("/:id", (req, res) => {
  const course = getCourseById(Number(req.params.id));

  if (!course) {
    return res.status(404).json({
      message: "Course not found",});
  }
  res.json(course);
});

router.post("/", (req, res) => {
  const course = addCourse(req.body);
  res.status(201).json(course);
});

router.put("/:id", (req, res) => {
  const course = updateCourse(Number(req.params.id), req.body);
  if (!course) {
    return res.status(404).json({
      message: "Course not found",});
  }
  res.json(course);
});

router.delete("/:id", (req, res) => {
  const course = deleteCourse(Number(req.params.id));

  if (!course) {
    return res.status(404).json({
      message: "Course not found",
    });
  }

  res.json({
    message: "Course deleted successfully",
    course,
  });
});

export default router;
