import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { User } from "./User";
import { Job } from "./Job";

export enum ApplicationStatus {
  APPLIED = "APPLIED",
  SHORTLISTED = "SHORTLISTED",
  INTERVIEWING = "INTERVIEWING",
  SELECTED = "SELECTED",
  REJECTED = "REJECTED",
}

@Entity("applications")
export class Application {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "candidate_id",
  })
  candidate!: User;

  @ManyToOne(() => Job, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "job_id",
  })
  job!: Job;

  @Column({
    type: "enum",
    enum: ApplicationStatus,
    default: ApplicationStatus.APPLIED,
  })
  status!: ApplicationStatus;

  @Column({
    name: "overall_score",
    type: "decimal",
    precision: 5,
    scale: 2,
    nullable: true,
  })
  overallScore!: number | null;

  @Column({
    name: "current_round",
    type: "integer",
    default: 0,
  })
  currentRound!: number;

  @Column({
    name: "resume_path",
    type: "text",
    nullable: true,
  })
  resumePath!: string | null;

  @Column({
    name: "resume_original_name",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  resumeOriginalName!: string | null;

  @Column({
    name: "resume_text",
    type: "text",
    nullable: true,
  })
  resumeText!: string | null;

  @Column({
    name: "resume_summary",
    type: "text",
    nullable: true,
  })
  resumeSummary!: string | null;

  @Column({
    name: "resume_skills",
    type: "jsonb",
    nullable: true,
  })
  resumeSkills!: string[] | null;

  @Column({
    name: "resume_experience",
    type: "text",
    nullable: true,
  })
  resumeExperience!: string | null;

  @Column({
    name: "resume_education",
    type: "text",
    nullable: true,
  })
  resumeEducation!: string | null;

  @Column({
    name: "resume_strengths",
    type: "jsonb",
    nullable: true,
  })
  resumeStrengths!: string[] | null;

  @Column({
    name: "resume_missing_skills",
    type: "jsonb",
    nullable: true,
  })
  resumeMissingSkills!: string[] | null;

  @Column({
    name: "job_match_score",
    type: "decimal",
    precision: 5,
    scale: 2,
    nullable: true,
  })
  jobMatchScore!: number | null;

  @Column({
    name: "ai_candidate_summary",
    type: "text",
    nullable: true,
  })
  aiCandidateSummary!: string | null;

  @Column({
    name: "ai_recommendation",
    type: "varchar",
    length: 50,
    nullable: true,
  })
  aiRecommendation!: string | null;

  @Column({
    name: "ai_strengths",
    type: "jsonb",
    nullable: true,
  })
  aiStrengths!: string[] | null;

  @Column({
    name: "ai_concerns",
    type: "jsonb",
    nullable: true,
  })
  aiConcerns!: string[] | null;

  @CreateDateColumn({
    name: "applied_at",
  })
  appliedAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt!: Date;
}


