import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v7 } from 'uuid';
import { GameQuestion, type GameQuestionList } from './game-question.entity';
import { QUESTION_VALIDATION_CONSTRAINTS } from '../../../core/validation/constraints/question.validation-constraints';
import { CreateQuestionDomainDTO } from './domain-dto/create-question.domain-dto';
import { PlayerAnswerStatusDomainDTO } from './domain-dto/player-answer-status.domain-dto';
import { UpdateQuestionDomainDTO } from './domain-dto/update-question.domain-dto';

/*Класс для сущности вопроса.*/
@Entity({ name: 'questions', schema: 'public' })
@Check('CHK_questions_correct_answers_is_array', `jsonb_typeof("correct_answers") = 'array'`)
@Check(
  'CHK_questions_published_has_correct_answers',
  `"is_published" = false OR jsonb_array_length("correct_answers") > 0`
)
@Check('CHK_questions_body_min_length', `char_length("body") >= ${QUESTION_VALIDATION_CONSTRAINTS.BODY.MIN_LENGTH}`)
export class Question {
  @PrimaryColumn('uuid', { name: 'id' })
  public id: string;

  @Column({
    name: 'body',
    type: 'varchar',
    length: QUESTION_VALIDATION_CONSTRAINTS.BODY.MAX_LENGTH,
    nullable: false,
    collation: 'C',
  })
  public body: string;

  @Column({ name: 'correct_answers', type: 'jsonb', nullable: false, default: (): string => "'[]'::jsonb" })
  public correctAnswers: string[];

  @Column({ name: 'is_published', type: 'boolean', nullable: false, default: false })
  public isPublished: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: (): string => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: false,
    default: (): string => 'CURRENT_TIMESTAMP',
  })
  public updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true, default: null })
  public deletedAt: Date | null;

  @OneToMany((): typeof GameQuestion => GameQuestion, (gameQuestion: GameQuestion): Question => gameQuestion.question)
  public gameQuestionList: GameQuestionList;

  public static create(dto: CreateQuestionDomainDTO): Question {
    const question: Question = new Question();
    question.id = v7();
    question.body = dto.body;
    question.correctAnswers = dto.correctAnswers;
    question.isPublished = dto.isPublished ?? false;
    return question;
  }

  public update(dto: UpdateQuestionDomainDTO): void {
    this.body = dto.body;
    this.correctAnswers = dto.correctAnswers;
  }

  public publish(isPublished: boolean): void {
    this.isPublished = isPublished;
  }

  public checkAnswer(answer: string): PlayerAnswerStatusDomainDTO {
    return this.correctAnswers.includes(answer)
      ? PlayerAnswerStatusDomainDTO.Correct
      : PlayerAnswerStatusDomainDTO.Incorrect;
  }
}

/*Тип для списка сущностей вопросов.*/
export type QuestionList = Question[];
