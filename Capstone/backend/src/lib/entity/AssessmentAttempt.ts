import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { Application } from "./Application";
import { InterviewRound } from "./InterviewRound";

export enum AssessmentStatus {
  IN_PROGRESS = "IN_PROGRESS",
  // SUBMITTED = "SUBMITTED",
  // AUTO_SUBMITTED = "AUTO_SUBMITTED",
  PENDING_EVALUATION = "PENDING_EVALUATION",
  PASSED = "PASSED",
  FAILED = "FAILED",
}

@Entity("assessment_attempts")
export class AssessmentAttempt {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Which candidate application this assessment belongs to
  @ManyToOne(() => Application, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "application_id",
  })
  application!: Application;

  // Which interview round candidate is attempting
  @ManyToOne(() => InterviewRound, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "round_id",
  })
  round!: InterviewRound;

  @Column({
    type: "enum",
    enum: AssessmentStatus,
    default: AssessmentStatus.IN_PROGRESS,
  })
  status!: AssessmentStatus;

  @Column({
    name: "score",
    type: "decimal",
    precision: 5,
    scale: 2,
    nullable: true,
  })
  score!: number | null;

  @Column({
    name: "total_marks",
    type: "integer",
    nullable: true,
  })
  totalMarks!: number | null;

  @Column({
    name: "obtained_marks",
    type: "decimal",
    precision: 6,
    scale: 2,
    nullable: true,
  })
  obtainedMarks!: number | null;

  @Column({
    name: "started_at",
    type: "timestamp",
    nullable: true,
  })
  startedAt!: Date | null;

  @Column({
    name: "submitted_at",
    type: "timestamp",
    nullable: true,
  })
  submittedAt!: Date | null;

  @Column({
    name: "auto_submitted",
    type: "boolean",
    default: false,
  })
  autoSubmitted!: boolean;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt!: Date;
}
