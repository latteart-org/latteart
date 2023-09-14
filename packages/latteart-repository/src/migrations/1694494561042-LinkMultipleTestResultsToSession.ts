import { MigrationInterface, QueryRunner } from "typeorm";

export class LinkMultipleTestResultsToSession1694494561042
  implements MigrationInterface
{
  name = "LinkMultipleTestResultsToSession1694494561042";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const testResultIdWithSessionId: {
      test_result_id: string;
      session_id: string;
    }[] = await queryRunner.query(
      `SELECT "TEST_RESULTS"."test_result_id", "SESSIONS"."session_id" FROM "TEST_RESULTS" LEFT OUTER JOIN "SESSIONS" ON "TEST_RESULTS"."test_result_id" = "SESSIONS"."test_result_id"`
    );

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
      `CREATE TABLE "TESTRESULT_SESSION_RELATIONS" ("test_result_id" varchar NOT NULL, "session_id" varchar NOT NULL, PRIMARY KEY ("test_result_id", "session_id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_efbdded2c32167debc35d62219" ON "TESTRESULT_SESSION_RELATIONS" ("test_result_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5587ef5339b22cb7f5227a1348" ON "TESTRESULT_SESSION_RELATIONS" ("session_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_SESSIONS" ("session_id" varchar PRIMARY KEY NOT NULL, "testUser" varchar NOT NULL, "name" varchar NOT NULL, "index" integer NOT NULL, "memo" varchar NOT NULL, "test_item" varchar NOT NULL, "done_date" varchar NOT NULL, "story_id" varchar, CONSTRAINT "FK_5127b300c99c5030df3036fb12f" FOREIGN KEY ("story_id") REFERENCES "STORIES" ("story_id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_SESSIONS"("session_id", "testUser", "name", "index", "memo", "test_item", "done_date", "story_id") SELECT "session_id", "testUser", "name", "index", "memo", "test_item", "done_date", "story_id" FROM "SESSIONS"`
    );
    await queryRunner.query(`DROP TABLE "SESSIONS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_SESSIONS" RENAME TO "SESSIONS"`
    );
    await queryRunner.query(`DROP INDEX "IDX_efbdded2c32167debc35d62219"`);
    await queryRunner.query(`DROP INDEX "IDX_5587ef5339b22cb7f5227a1348"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_TESTRESULT_SESSION_RELATIONS" ("test_result_id" varchar NOT NULL, "session_id" varchar NOT NULL, CONSTRAINT "FK_efbdded2c32167debc35d62219a" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_5587ef5339b22cb7f5227a1348a" FOREIGN KEY ("session_id") REFERENCES "SESSIONS" ("session_id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("test_result_id", "session_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_TESTRESULT_SESSION_RELATIONS"("test_result_id", "session_id") SELECT "test_result_id", "session_id" FROM "TESTRESULT_SESSION_RELATIONS"`
    );
    await queryRunner.query(`DROP TABLE "TESTRESULT_SESSION_RELATIONS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_TESTRESULT_SESSION_RELATIONS" RENAME TO "TESTRESULT_SESSION_RELATIONS"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_efbdded2c32167debc35d62219" ON "TESTRESULT_SESSION_RELATIONS" ("test_result_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5587ef5339b22cb7f5227a1348" ON "TESTRESULT_SESSION_RELATIONS" ("session_id") `
    );

    if (testResultIdWithSessionId.length > 0) {
      const insertValues = testResultIdWithSessionId
        ?.map((v) => {
          return `('${v?.session_id}', '${v?.test_result_id}')`;
        })
        .join(",");

      await queryRunner.query(
        `INSERT INTO "TESTRESULT_SESSION_RELATIONS" ("session_id", "test_result_id") VALUES ${insertValues}`
      );
    }
  }

  public async down(): Promise<void> {
    throw new Error("Irreversible migration.");
  }
}
