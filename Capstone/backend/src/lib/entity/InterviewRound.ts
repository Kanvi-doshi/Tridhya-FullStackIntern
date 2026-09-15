import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { Job } from "./Job";

export enum RoundType {
  MCQ = "MCQ",
  CODING = "CODING",
  WRITTEN = "WRITTEN",
  INTERVIEW = "INTERVIEW",
}

@Entity("interview_rounds")
export class InterviewRound {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Job, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "job_id",
  })
  job!: Job;

  @Column({
    name: "round_number",
    type: "integer",
  })
  roundNumber!: number;

  @Column({
    type: "varchar",
    length: 150,
  })
  title!: string;

  @Column({
    type: "enum",
    enum: RoundType,
  })
  type!: RoundType;

  @Column({
    type: "text",
    nullable: true,
  })
  description!: string | null;

  @Column({
    name: "duration_minutes",
    type: "integer",
    nullable: true,
  })
  durationMinutes!: number | null;

  @Column({
    name: "passing_score",
    type: "decimal",
    precision: 5,
    scale: 2,
    nullable: true,
  })
  passingScore!: number | null;

  @Column({
    name: "is_active",
    type: "boolean",
    default: true,
  })
  isActive!: boolean;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt!: Date;
}
