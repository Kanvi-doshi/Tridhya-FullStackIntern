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

import { InterviewAssignment } from "./interviewAssignment";
import { User } from "./User";

export enum InterviewRecommendation {
  STRONGLY_RECOMMEND = "STRONGLY_RECOMMEND",
  RECOMMEND = "RECOMMEND",
  NEUTRAL = "NEUTRAL",
  NOT_RECOMMEND = "NOT_RECOMMEND",
}

@Entity("interview_feedback")
@Unique(["assignment"])
export class InterviewFeedback {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Which scheduled interview this feedback belongs to
  @ManyToOne(() => InterviewAssignment, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "assignment_id",
  })
  assignment!: InterviewAssignment;

  // Interviewer who submitted the feedback
  @ManyToOne(() => User, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "interviewer_id",
  })
  interviewer!: User;

  @Column({
    name: "technical_rating",
    type: "integer",
  })
  technicalRating!: number;

  @Column({
    name: "communication_rating",
    type: "integer",
  })
  communicationRating!: number;

  @Column({
    name: "problem_solving_rating",
    type: "integer",
  })
  problemSolvingRating!: number;

  @Column({
    name: "overall_rating",
    type: "decimal",
    precision: 3,
    scale: 2,
  })
  overallRating!: number;

  @Column({
    type: "text",
    nullable: true,
  })
  strengths!: string | null;

  @Column({
    type: "text",
    nullable: true,
  })
  weaknesses!: string | null;

  @Column({
    type: "text",
    nullable: true,
  })
  comments!: string | null;

  @Column({
    type: "enum",
    enum: InterviewRecommendation,
  })
  recommendation!: InterviewRecommendation;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt!: Date;
}
