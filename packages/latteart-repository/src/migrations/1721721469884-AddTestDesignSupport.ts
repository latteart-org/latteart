import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTestDesignSupport1721721469884 implements MigrationInterface {
    name = 'AddTestDesignSupport1721721469884'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "COMMENTS" ("id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar)`);
        await queryRunner.query(`CREATE TABLE "TEST_HINTS" ("id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "test_matrix_name" varchar NOT NULL DEFAULT (''), "group_name" varchar NOT NULL DEFAULT (''), "test_target_name" varchar NOT NULL DEFAULT (''), "view_point_name" varchar NOT NULL DEFAULT (''), "customs" varchar NOT NULL, "tags" varchar NOT NULL, "operation_elements" varchar NOT NULL DEFAULT (''), "created_at" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "TEST_HINT_PROPS" ("id" varchar PRIMARY KEY NOT NULL, "title" varchar NOT NULL, "type" varchar NOT NULL, "list_items" varchar NOT NULL, "index" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_COMMENTS" ("id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar, CONSTRAINT "FK_85b03b2d194689ee65c3dc41799" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_COMMENTS"("id", "value", "timestamp", "test_result_id") SELECT "id", "value", "timestamp", "test_result_id" FROM "COMMENTS"`);
        await queryRunner.query(`DROP TABLE "COMMENTS"`);
        await queryRunner.query(`ALTER TABLE "temporary_COMMENTS" RENAME TO "COMMENTS"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "COMMENTS" RENAME TO "temporary_COMMENTS"`);
        await queryRunner.query(`CREATE TABLE "COMMENTS" ("id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar)`);
        await queryRunner.query(`INSERT INTO "COMMENTS"("id", "value", "timestamp", "test_result_id") SELECT "id", "value", "timestamp", "test_result_id" FROM "temporary_COMMENTS"`);
        await queryRunner.query(`DROP TABLE "temporary_COMMENTS"`);
        await queryRunner.query(`DROP TABLE "TEST_HINT_PROPS"`);
        await queryRunner.query(`DROP TABLE "TEST_HINTS"`);
        await queryRunner.query(`DROP TABLE "COMMENTS"`);
    }

}
