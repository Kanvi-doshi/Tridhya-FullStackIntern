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
  PENDING_EVALUATION = "PENDING_EVALUATION",
  PASSED = "PASSED",
  FAILED = "FAILED",
}

export enum AssessmentAutoSubmitReason {
  TIME_EXPIRED = "TIME_EXPIRED",
  TAB_SWITCH = "TAB_SWITCH",
  CAMERA_VIOLATION = "CAMERA_VIOLATION",
}

@Entity("assessment_attempts")
export class AssessmentAttempt {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Application, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "application_id",
  })
  application!: Application;

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

  @Column({
    name: "auto_submit_reason",
    type: "enum",
    enum: AssessmentAutoSubmitReason,
    nullable: true,
  })
  autoSubmitReason!: AssessmentAutoSubmitReason | null;

  @Column({
    name: "tab_switch_count",
    type: "integer",
    default: 0,
  })
  tabSwitchCount!: number;

  @Column({
    name: "violation_count",
    type: "integer",
    default: 0,
  })
  violationCount!: number;

  @Column({
    name: "camera_enabled",
    type: "boolean",
    default: false,
  })
  cameraEnabled!: boolean;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt!: Date;
}
