import express from "express";
import cors from "cors";

import studentRouter from "./routes/student";
import courseRouter from "./routes/courses";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/students", studentRouter);
app.use("/courses", courseRouter);

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
