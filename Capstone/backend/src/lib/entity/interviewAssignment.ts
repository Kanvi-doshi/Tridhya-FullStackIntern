import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";

import { Application } from "./Application";
import { InterviewRound } from "./InterviewRound";
import { User } from "./User";

export enum InterviewAssignmentStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

@Entity("interview_assignments")
@Unique(["application", "round"])
export class InterviewAssignment {
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

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "interviewer_id",
  })
  interviewer!: User;

  @Column({
    name: "scheduled_at",
    type: "timestamp",
  })
  scheduledAt!: Date;

  @Column({
    type: "varchar",
    length: 255,
  })
  location!: string;

  @Column({
    type: "enum",
    enum: InterviewAssignmentStatus,
    default: InterviewAssignmentStatus.SCHEDULED,
  })
  status!: InterviewAssignmentStatus;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt!: Date;
}
