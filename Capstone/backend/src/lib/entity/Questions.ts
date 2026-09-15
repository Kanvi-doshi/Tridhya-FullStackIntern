import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { InterviewRound } from "./InterviewRound";

export enum QuestionType {
  MCQ = "MCQ",
  CODING = "CODING",
  WRITTEN = "WRITTEN",
}

@Entity("questions")
export class Question {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

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
    enum: QuestionType,
  })
  type!: QuestionType;

  @Column({
    type: "text",
  })
  question!: string;

  // MCQ
  @Column({
    type: "jsonb",
    nullable: true,
  })
  options!: string[] | null;

  @Column({
    name: "correct_answer",
    type: "text",
    nullable: true,
  })
  correctAnswer!: string | null;

  // CODING
  @Column({
    name: "starter_code",
    type: "text",
    nullable: true,
  })
  starterCode!: string | null;

  @Column({
    name: "test_cases",
    type: "jsonb",
    nullable: true,
  })
  testCases!:
    | {
        input: string;
        expectedOutput: string;
      }[]
    | null;

  @Column({
    type: "integer",
    default: 1,
  })
  marks!: number;

  @Column({
    name: "order_number",
    type: "integer",
    default: 1,
  })
  orderNumber!: number;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt!: Date;
}
