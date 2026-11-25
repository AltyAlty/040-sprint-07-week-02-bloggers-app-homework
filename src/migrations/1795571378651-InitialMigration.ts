import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1795571378651 implements MigrationInterface {
  name = 'InitialMigration1795571378651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "post_likes_data" ("id" uuid NOT NULL, "blog_id" uuid NOT NULL, "post_id" uuid NOT NULL, "user_id" uuid NOT NULL, "like_status" character varying(7) NOT NULL, "added_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_post_user" UNIQUE ("post_id", "user_id"), CONSTRAINT "CHK_a4764ad50fde3318ec7be48151" CHECK ("like_status" IN ('Like', 'Dislike')), CONSTRAINT "PK_bb7036a4bfffa91fecc06df7d8f" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_post_likes_data_post_id_added_at_newest_likes" ON "post_likes_data"  ("post_id", "added_at") WHERE "like_status" = 'Like' AND "deleted_at" IS NULL`
    );

    await queryRunner.query(
      `CREATE TABLE "posts" ("id" uuid NOT NULL, "blog_id" uuid NOT NULL, "title" character varying(30) COLLATE "C" NOT NULL, "short_description" character varying(100) COLLATE "C" NOT NULL, "content" character varying(1000) COLLATE "C" NOT NULL, "likes_count" integer NOT NULL DEFAULT '0', "dislikes_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "CHK_640787903dcef91d734c35cf1e" CHECK ("dislikes_count" >= 0), CONSTRAINT "CHK_f2b02f9f4039785a215ecf93cf" CHECK ("likes_count" >= 0), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(
      `CREATE TABLE "comment_likes_data" ("id" uuid NOT NULL, "blog_id" uuid NOT NULL, "post_id" uuid NOT NULL, "comment_id" uuid NOT NULL, "user_id" uuid NOT NULL, "like_status" character varying(7) NOT NULL, "added_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_comment_user" UNIQUE ("comment_id", "user_id"), CONSTRAINT "CHK_31ff9bd8fcda4d6836e03f3502" CHECK ("like_status" IN ('Like', 'Dislike')), CONSTRAINT "PK_878266ab98beb14dbdf7a729a98" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(
      `CREATE TABLE "blogs" ("id" uuid NOT NULL, "name" character varying(15) COLLATE "C" NOT NULL, "description" character varying(500) COLLATE "C" NOT NULL, "website_url" character varying(100) COLLATE "C" NOT NULL, "is_membership" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_e113335f11c926da929a625f118" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(`CREATE INDEX "IDX_blogs_name" ON "blogs"  ("name") `);

    await queryRunner.query(
      `CREATE TABLE "comments" ("id" uuid NOT NULL, "blog_id" uuid NOT NULL, "post_id" uuid NOT NULL, "user_id" uuid NOT NULL, "content" character varying(300) COLLATE "C" NOT NULL, "likes_count" integer NOT NULL DEFAULT '0', "dislikes_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "CHK_8ea57588674d166418f4a7b881" CHECK ("dislikes_count" >= 0), CONSTRAINT "CHK_b0d19264437f65d2501f41df59" CHECK ("likes_count" >= 0), CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(
      `CREATE TABLE "email_confirmations" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "confirmation_code" character varying(100) NOT NULL, "expiration_date" TIMESTAMP NOT NULL, CONSTRAINT "PK_178b5599cd7e3ec9cfdfb144b50" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(
      `CREATE TABLE "password_recovery_codes_data" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "password_recovery_code" character varying(100) NOT NULL, "expiration_date" TIMESTAMP NOT NULL, CONSTRAINT "PK_19edde3fff2e5542f205f3fb052" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(
      `CREATE TABLE "security_devices" ("device_id" uuid NOT NULL, "user_id" uuid NOT NULL, "title" character varying(1000) NOT NULL, "ip" character varying(100) NOT NULL, "last_active_date" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b71a3a02510d7a9bc8d15df7991" PRIMARY KEY ("device_id"))`
    );

    await queryRunner.query(`CREATE INDEX "IDX_security_devices_user_id" ON "security_devices"  ("user_id") `);

    await queryRunner.query(
      `CREATE TABLE "sessions" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "device_id" uuid NOT NULL, "iat" TIMESTAMP NOT NULL, "exp" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_sessions_user_id_device_id_iat" ON "sessions"  ("user_id", "device_id", "iat") `
    );

    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL, "login" character varying(10) COLLATE "C" NOT NULL, "original_email" character varying(1000) NOT NULL, "email" character varying(1000) COLLATE "C" NOT NULL, "password_hash" character varying(1000) NOT NULL, "is_confirmed" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE ("login"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(
      `CREATE TABLE "player_answers" ("id" uuid NOT NULL, "player_id" uuid NOT NULL, "game_question_id" integer NOT NULL, "body" text NOT NULL, "status" character varying(9) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_player_answers_player_id_game_question_id" UNIQUE ("player_id", "game_question_id"), CONSTRAINT "CHK_player_answers_status" CHECK ("status" IN ('Correct', 'Incorrect')), CONSTRAINT "PK_ae9d18a286e5b5e0c4bfcb057c1" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(
      `CREATE TABLE "players" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "game_id" uuid NOT NULL, "position" integer NOT NULL, "score" integer NOT NULL DEFAULT '0', "win_status" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_players_game_id_position" UNIQUE ("game_id", "position"), CONSTRAINT "UQ_players_game_id_user_id" UNIQUE ("game_id", "user_id"), CONSTRAINT "CHK_players_win_status" CHECK ("win_status" IS NULL OR "win_status" IN ('Win', 'Lose', 'Draw')), CONSTRAINT "CHK_players_score_non_negative" CHECK ("score" >= 0), CONSTRAINT "CHK_players_position_positive" CHECK ("position" > 0), CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_players_user_id_unfinished_game" ON "players"  ("user_id") WHERE "win_status" IS NULL`
    );

    await queryRunner.query(`CREATE TABLE "games" ("id" uuid NOT NULL, "status" character varying(19) NOT NULL DEFAULT 'PendingSecondPlayer', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "start_game_date" TIMESTAMP, "finish_game_date" TIMESTAMP, CONSTRAINT "CHK_games_status_matches_dates" CHECK (("status" = 'PendingSecondPlayer' AND "start_game_date" IS NULL AND "finish_game_date" IS NULL)
   OR ("status" = 'Active' AND "start_game_date" IS NOT NULL AND "finish_game_date" IS NULL)
   OR ("status" = 'Finished' AND "start_game_date" IS NOT NULL AND "finish_game_date" IS NOT NULL)), CONSTRAINT "CHK_games_status" CHECK ("status" IN ('PendingSecondPlayer', 'Active', 'Finished')), CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id"))`);

    await queryRunner.query(
      `CREATE INDEX "IDX_games_pending_second_player" ON "games"  ("status") WHERE "status" = 'PendingSecondPlayer'`
    );

    await queryRunner.query(
      `CREATE TABLE "questions" ("id" uuid NOT NULL, "body" character varying(500) COLLATE "C" NOT NULL, "correct_answers" jsonb NOT NULL DEFAULT '[]'::jsonb, "is_published" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "CHK_questions_body_min_length" CHECK (char_length("body") >= 10), CONSTRAINT "CHK_questions_published_has_correct_answers" CHECK ("is_published" = false OR jsonb_array_length("correct_answers") > 0), CONSTRAINT "CHK_questions_correct_answers_is_array" CHECK (jsonb_typeof("correct_answers") = 'array'), CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(
      `CREATE TABLE "game_questions" ("id" SERIAL NOT NULL, "game_id" uuid NOT NULL, "question_id" uuid NOT NULL, "position" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_game_questions_game_id_question_id" UNIQUE ("game_id", "question_id"), CONSTRAINT "UQ_game_questions_game_id_position" UNIQUE ("game_id", "position"), CONSTRAINT "CHK_game_questions_position_positive" CHECK ("position" > 0), CONSTRAINT "PK_8655fa1f9639162ee24c3a5582a" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(
      `ALTER TABLE "post_likes_data" ADD CONSTRAINT "FK_16227d32751879d37911440f9e8" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "post_likes_data" ADD CONSTRAINT "FK_1f1c6cc6a17b850cf5fde288550" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "post_likes_data" ADD CONSTRAINT "FK_f65af138ef339a254910a5a5cc7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_7689491fe4377a8090576a799a0" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "comment_likes_data" ADD CONSTRAINT "FK_6a991e7be7485d716d54dbd7eae" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "comment_likes_data" ADD CONSTRAINT "FK_1c195d87ddb2dbc852fe2d866cf" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "comment_likes_data" ADD CONSTRAINT "FK_8f123118146e1dbf705c1befe80" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "comment_likes_data" ADD CONSTRAINT "FK_a9fc9c68d9d47a6003c79903a0b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_6754bf738cb68004be154e1d1d5" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "email_confirmations" ADD CONSTRAINT "FK_97c4781eabb13c92ea53f21d8f9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "password_recovery_codes_data" ADD CONSTRAINT "FK_a9b75fc088dd1872439f430f05d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "security_devices" ADD CONSTRAINT "FK_6143ad1ef6f122d933239d3b050" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_97207844c19e5c27d33a07f67c0" FOREIGN KEY ("device_id") REFERENCES "security_devices"("device_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "player_answers" ADD CONSTRAINT "FK_3827c31e4b3cddf22bf97b42739" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "player_answers" ADD CONSTRAINT "FK_cb9cf1ec060bb35d46ee42d1fc0" FOREIGN KEY ("game_question_id") REFERENCES "game_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "players" ADD CONSTRAINT "FK_ba3575d2fbe71fab7155366235e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "players" ADD CONSTRAINT "FK_cef52931b331b4ec107a220fb5d" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "game_questions" ADD CONSTRAINT "FK_4c5351759926b365b1572dbdd1e" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "game_questions" ADD CONSTRAINT "FK_8b122e0afbb8b1a90a9b8c8ab56" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "game_questions" DROP CONSTRAINT "FK_8b122e0afbb8b1a90a9b8c8ab56"`);
    await queryRunner.query(`ALTER TABLE "game_questions" DROP CONSTRAINT "FK_4c5351759926b365b1572dbdd1e"`);
    await queryRunner.query(`ALTER TABLE "players" DROP CONSTRAINT "FK_cef52931b331b4ec107a220fb5d"`);
    await queryRunner.query(`ALTER TABLE "players" DROP CONSTRAINT "FK_ba3575d2fbe71fab7155366235e"`);
    await queryRunner.query(`ALTER TABLE "player_answers" DROP CONSTRAINT "FK_cb9cf1ec060bb35d46ee42d1fc0"`);
    await queryRunner.query(`ALTER TABLE "player_answers" DROP CONSTRAINT "FK_3827c31e4b3cddf22bf97b42739"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_97207844c19e5c27d33a07f67c0"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"`);
    await queryRunner.query(`ALTER TABLE "security_devices" DROP CONSTRAINT "FK_6143ad1ef6f122d933239d3b050"`);

    await queryRunner.query(
      `ALTER TABLE "password_recovery_codes_data" DROP CONSTRAINT "FK_a9b75fc088dd1872439f430f05d"`
    );

    await queryRunner.query(`ALTER TABLE "email_confirmations" DROP CONSTRAINT "FK_97c4781eabb13c92ea53f21d8f9"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_6754bf738cb68004be154e1d1d5"`);
    await queryRunner.query(`ALTER TABLE "comment_likes_data" DROP CONSTRAINT "FK_a9fc9c68d9d47a6003c79903a0b"`);
    await queryRunner.query(`ALTER TABLE "comment_likes_data" DROP CONSTRAINT "FK_8f123118146e1dbf705c1befe80"`);
    await queryRunner.query(`ALTER TABLE "comment_likes_data" DROP CONSTRAINT "FK_1c195d87ddb2dbc852fe2d866cf"`);
    await queryRunner.query(`ALTER TABLE "comment_likes_data" DROP CONSTRAINT "FK_6a991e7be7485d716d54dbd7eae"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_7689491fe4377a8090576a799a0"`);
    await queryRunner.query(`ALTER TABLE "post_likes_data" DROP CONSTRAINT "FK_f65af138ef339a254910a5a5cc7"`);
    await queryRunner.query(`ALTER TABLE "post_likes_data" DROP CONSTRAINT "FK_1f1c6cc6a17b850cf5fde288550"`);
    await queryRunner.query(`ALTER TABLE "post_likes_data" DROP CONSTRAINT "FK_16227d32751879d37911440f9e8"`);
    await queryRunner.query(`DROP TABLE "game_questions"`);
    await queryRunner.query(`DROP TABLE "questions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_games_pending_second_player"`);
    await queryRunner.query(`DROP TABLE "games"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_players_user_id_unfinished_game"`);
    await queryRunner.query(`DROP TABLE "players"`);
    await queryRunner.query(`DROP TABLE "player_answers"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_sessions_user_id_device_id_iat"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_security_devices_user_id"`);
    await queryRunner.query(`DROP TABLE "security_devices"`);
    await queryRunner.query(`DROP TABLE "password_recovery_codes_data"`);
    await queryRunner.query(`DROP TABLE "email_confirmations"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_blogs_name"`);
    await queryRunner.query(`DROP TABLE "blogs"`);
    await queryRunner.query(`DROP TABLE "comment_likes_data"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_post_likes_data_post_id_added_at_newest_likes"`);
    await queryRunner.query(`DROP TABLE "post_likes_data"`);
  }
}
