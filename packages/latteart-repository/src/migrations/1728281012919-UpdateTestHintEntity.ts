import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTestHintEntity1728281012919 implements MigrationInterface {
    name = 'UpdateTestHintEntity1728281012919'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_COMMENTS" ("id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar)`);
        await queryRunner.query(`INSERT INTO "temporary_COMMENTS"("id", "value", "timestamp", "test_result_id") SELECT "id", "value", "timestamp", "test_result_id" FROM "COMMENTS"`);
        await queryRunner.query(`DROP TABLE "COMMENTS"`);
        await queryRunner.query(`ALTER TABLE "temporary_COMMENTS" RENAME TO "COMMENTS"`);
        await queryRunner.query(`CREATE TABLE "temporary_TEST_HINTS" ("id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "test_matrix_name" varchar NOT NULL DEFAULT (''), "group_name" varchar NOT NULL DEFAULT (''), "test_target_name" varchar NOT NULL DEFAULT (''), "view_point_name" varchar NOT NULL DEFAULT (''), "customs" varchar NOT NULL, "comment_words" varchar NOT NULL, "operation_elements" varchar NOT NULL DEFAULT (''), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "issues" varchar NOT NULL DEFAULT ('[]'))`);
        await queryRunner.query(`INSERT INTO "temporary_TEST_HINTS"("id", "value", "test_matrix_name", "group_name", "test_target_name", "view_point_name", "customs", "comment_words", "operation_elements", "created_at") SELECT "id", "value", "test_matrix_name", "group_name", "test_target_name", "view_point_name", "customs", "comment_words", "operation_elements", "created_at" FROM "TEST_HINTS"`);
        await queryRunner.query(`DROP TABLE "TEST_HINTS"`);
        await queryRunner.query(`ALTER TABLE "temporary_TEST_HINTS" RENAME TO "TEST_HINTS"`);
        await queryRunner.query(`CREATE TABLE "temporary_COMMENTS" ("id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar, CONSTRAINT "FK_6453fb9abd68a4d221ba4204d42" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_COMMENTS"("id", "value", "timestamp", "test_result_id") SELECT "id", "value", "timestamp", "test_result_id" FROM "COMMENTS"`);
        await queryRunner.query(`DROP TABLE "COMMENTS"`);
        await queryRunner.query(`ALTER TABLE "temporary_COMMENTS" RENAME TO "COMMENTS"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "COMMENTS" RENAME TO "temporary_COMMENTS"`);
        await queryRunner.query(`CREATE TABLE "COMMENTS" ("id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar)`);
        await queryRunner.query(`INSERT INTO "COMMENTS"("id", "value", "timestamp", "test_result_id") SELECT "id", "value", "timestamp", "test_result_id" FROM "temporary_COMMENTS"`);
        await queryRunner.query(`DROP TABLE "temporary_COMMENTS"`);
        await queryRunner.query(`ALTER TABLE "TEST_HINTS" RENAME TO "temporary_TEST_HINTS"`);
        await queryRunner.query(`CREATE TABLE "TEST_HINTS" ("id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "test_matrix_name" varchar NOT NULL DEFAULT (''), "group_name" varchar NOT NULL DEFAULT (''), "test_target_name" varchar NOT NULL DEFAULT (''), "view_point_name" varchar NOT NULL DEFAULT (''), "customs" varchar NOT NULL, "comment_words" varchar NOT NULL, "operation_elements" varchar NOT NULL DEFAULT (''), "created_at" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "TEST_HINTS"("id", "value", "test_matrix_name", "group_name", "test_target_name", "view_point_name", "customs", "comment_words", "operation_elements", "created_at") SELECT "id", "value", "test_matrix_name", "group_name", "test_target_name", "view_point_name", "customs", "comment_words", "operation_elements", "created_at" FROM "temporary_TEST_HINTS"`);
        await queryRunner.query(`DROP TABLE "temporary_TEST_HINTS"`);
        await queryRunner.query(`ALTER TABLE "COMMENTS" RENAME TO "temporary_COMMENTS"`);
        await queryRunner.query(`CREATE TABLE "COMMENTS" ("id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar, CONSTRAINT "FK_85b03b2d194689ee65c3dc41799" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "COMMENTS"("id", "value", "timestamp", "test_result_id") SELECT "id", "value", "timestamp", "test_result_id" FROM "temporary_COMMENTS"`);
        await queryRunner.query(`DROP TABLE "temporary_COMMENTS"`);
    }

}
