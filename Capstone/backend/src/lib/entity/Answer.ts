import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { AssessmentAttempt } from "./AssessmentAttempt";
import { Question } from "./Questions";

@Entity("answers")
export class Answer {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => AssessmentAttempt, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "attempt_id",
  })
  attempt!: AssessmentAttempt;

  @ManyToOne(() => Question, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "question_id",
  })
  question!: Question;

  // Used mainly for MCQ / Written answers
  @Column({
    name: "answer_text",
    type: "text",
    nullable: true,
  })
  answerText!: string | null;

  // Result of automatic evaluation
  @Column({
    name: "is_correct",
    type: "boolean",
    nullable: true,
  })
  isCorrect!: boolean | null;

  @Column({
    name: "marks_obtained",
    type: "decimal",
    precision: 6,
    scale: 2,
    nullable: true,
  })
  marksObtained!: number | null;

  // Useful for coding questions
  @Column({
    name: "passed_test_cases",
    type: "integer",
    nullable: true,
  })
  passedTestCases!: number | null;

  @Column({
    name: "total_test_cases",
    type: "integer",
    nullable: true,
  })
  totalTestCases!: number | null;

  @Column({
    name: "evaluation_feedback",
    type: "text",
    nullable: true,
  })
  evaluationFeedback!: string | null;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt!: Date;
}
