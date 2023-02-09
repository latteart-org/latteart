import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSessionEntity1656305325919 implements MigrationInterface {
  name = "UpdateSessionEntity1656305325919";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_SESSIONS" ("session_id" varchar PRIMARY KEY NOT NULL, "testUser" varchar NOT NULL, "name" varchar NOT NULL, "index" integer NOT NULL, "memo" varchar NOT NULL, "test_item" varchar NOT NULL, "testing_time" integer NOT NULL, "done_date" varchar NOT NULL, "story_id" varchar, "test_result_id" varchar, CONSTRAINT "FK_5127b300c99c5030df3036fb12f" FOREIGN KEY ("story_id") REFERENCES "STORIES" ("story_id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_SESSIONS"("session_id", "testUser", "name", "index", "memo", "test_item", "testing_time", "done_date", "story_id", "test_result_id") SELECT "session_id", "testUser", "name", "index", "memo", "test_item", "testing_time", "done_date", "story_id", "test_result_id" FROM "SESSIONS"`
    );
    await queryRunner.query(`DROP TABLE "SESSIONS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_SESSIONS" RENAME TO "SESSIONS"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_SESSIONS" ("session_id" varchar PRIMARY KEY NOT NULL, "testUser" varchar NOT NULL, "name" varchar NOT NULL, "index" integer NOT NULL, "memo" varchar NOT NULL, "test_item" varchar NOT NULL, "testing_time" integer NOT NULL, "done_date" varchar NOT NULL, "story_id" varchar, "test_result_id" varchar, CONSTRAINT "FK_5127b300c99c5030df3036fb12f" FOREIGN KEY ("story_id") REFERENCES "STORIES" ("story_id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_4761b86c592e4826f029d4f702e" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE SET NULL ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_SESSIONS"("session_id", "testUser", "name", "index", "memo", "test_item", "testing_time", "done_date", "story_id", "test_result_id") SELECT "session_id", "testUser", "name", "index", "memo", "test_item", "testing_time", "done_date", "story_id", "test_result_id" FROM "SESSIONS"`
    );
    await queryRunner.query(`DROP TABLE "SESSIONS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_SESSIONS" RENAME TO "SESSIONS"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "SESSIONS" RENAME TO "temporary_SESSIONS"`
    );
    await queryRunner.query(
      `CREATE TABLE "SESSIONS" ("session_id" varchar PRIMARY KEY NOT NULL, "testUser" varchar NOT NULL, "name" varchar NOT NULL, "index" integer NOT NULL, "memo" varchar NOT NULL, "test_item" varchar NOT NULL, "testing_time" integer NOT NULL, "done_date" varchar NOT NULL, "story_id" varchar, "test_result_id" varchar, CONSTRAINT "FK_5127b300c99c5030df3036fb12f" FOREIGN KEY ("story_id") REFERENCES "STORIES" ("story_id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "SESSIONS"("session_id", "testUser", "name", "index", "memo", "test_item", "testing_time", "done_date", "story_id", "test_result_id") SELECT "session_id", "testUser", "name", "index", "memo", "test_item", "testing_time", "done_date", "story_id", "test_result_id" FROM "temporary_SESSIONS"`
    );
    await queryRunner.query(`DROP TABLE "temporary_SESSIONS"`);
    await queryRunner.query(
      `ALTER TABLE "SESSIONS" RENAME TO "temporary_SESSIONS"`
    );
    await queryRunner.query(
      `CREATE TABLE "SESSIONS" ("session_id" varchar PRIMARY KEY NOT NULL, "testUser" varchar NOT NULL, "name" varchar NOT NULL, "index" integer NOT NULL, "memo" varchar NOT NULL, "test_item" varchar NOT NULL, "testing_time" integer NOT NULL, "done_date" varchar NOT NULL, "story_id" varchar, "test_result_id" varchar, CONSTRAINT "FK_4761b86c592e4826f029d4f702e" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_5127b300c99c5030df3036fb12f" FOREIGN KEY ("story_id") REFERENCES "STORIES" ("story_id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "SESSIONS"("session_id", "testUser", "name", "index", "memo", "test_item", "testing_time", "done_date", "story_id", "test_result_id") SELECT "session_id", "testUser", "name", "index", "memo", "test_item", "testing_time", "done_date", "story_id", "test_result_id" FROM "temporary_SESSIONS"`
    );
    await queryRunner.query(`DROP TABLE "temporary_SESSIONS"`);
  }
}
