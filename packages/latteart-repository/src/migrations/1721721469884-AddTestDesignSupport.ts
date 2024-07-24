import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTestDesignSupport1721721469884 implements MigrationInterface {
    name = 'AddTestDesignSupport1721721469884'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "COMMENT" ("id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar)`);
        await queryRunner.query(`CREATE TABLE "TEST_HINT" ("id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "test_matrix_name" varchar NOT NULL DEFAULT (''), "group_name" varchar NOT NULL DEFAULT (''), "test_target_name" varchar NOT NULL DEFAULT (''), "view_point_name" varchar NOT NULL DEFAULT (''), "customs" varchar NOT NULL, "tags" varchar NOT NULL, "operation_elements" varchar NOT NULL DEFAULT (''), "created_at" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "TEST_HINT_PROP" ("id" varchar PRIMARY KEY NOT NULL, "title" varchar NOT NULL, "type" varchar NOT NULL, "list" varchar NOT NULL, "index" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_COMMENT" ("id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar, CONSTRAINT "FK_85b03b2d194689ee65c3dc41799" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_COMMENT"("id", "value", "timestamp", "test_result_id") SELECT "id", "value", "timestamp", "test_result_id" FROM "COMMENT"`);
        await queryRunner.query(`DROP TABLE "COMMENT"`);
        await queryRunner.query(`ALTER TABLE "temporary_COMMENT" RENAME TO "COMMENT"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "COMMENT" RENAME TO "temporary_COMMENT"`);
        await queryRunner.query(`CREATE TABLE "COMMENT" ("id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar)`);
        await queryRunner.query(`INSERT INTO "COMMENT"("id", "value", "timestamp", "test_result_id") SELECT "id", "value", "timestamp", "test_result_id" FROM "temporary_COMMENT"`);
        await queryRunner.query(`DROP TABLE "temporary_COMMENT"`);
        await queryRunner.query(`DROP TABLE "TEST_HINT_PROP"`);
        await queryRunner.query(`DROP TABLE "TEST_HINT"`);
        await queryRunner.query(`DROP TABLE "COMMENT"`);
    }

}
