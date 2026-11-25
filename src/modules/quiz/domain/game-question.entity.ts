import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Game } from './game.entity';
import { PlayerAnswer, type PlayerAnswerList } from './player-answer.entity';
import { Question } from './question.entity';
import { CreateGameQuestionDomainDTO } from './domain-dto/create-game-question.domain-dto';

/*Класс для сущности вопроса в игре.*/
@Entity({ name: 'game_questions', schema: 'public' })
@Unique('UQ_game_questions_game_id_position', ['gameId', 'position'])
@Unique('UQ_game_questions_game_id_question_id', ['gameId', 'questionId'])
@Check('CHK_game_questions_position_positive', '"position" > 0')
export class GameQuestion {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  public id: number;

  @Column({ name: 'game_id', type: 'uuid', nullable: false })
  public gameId: string;

  @Column({ name: 'question_id', type: 'uuid', nullable: false })
  public questionId: string;

  @Column({ name: 'position', type: 'integer', nullable: false })
  public position: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: (): string => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;

  @OneToMany((): typeof PlayerAnswer => PlayerAnswer, (answer: PlayerAnswer): GameQuestion => answer.gameQuestion)
  public playerAnswerList: PlayerAnswerList;

  @ManyToOne((): typeof Game => Game, (game: Game): GameQuestionList => game.gameQuestionList)
  @JoinColumn({ name: 'game_id' })
  public game: Game;

  /*Опция "RESTRICT" делает так, чтобы нельзя было удалить вопрос, который использовался как вопрос в игре.*/
  @ManyToOne((): typeof Question => Question, (question: Question): GameQuestionList => question.gameQuestionList, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'question_id' })
  public question: Question;

  public static create(dto: CreateGameQuestionDomainDTO): GameQuestion {
    const gameQuestion: GameQuestion = new GameQuestion();
    gameQuestion.gameId = dto.gameId;
    gameQuestion.questionId = dto.questionId;
    gameQuestion.position = dto.position;
    return gameQuestion;
  }
}

/*Тип для списка сущностей вопросов в играх.*/
export type GameQuestionList = GameQuestion[];
