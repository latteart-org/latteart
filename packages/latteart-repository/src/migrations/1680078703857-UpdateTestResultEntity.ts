import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateTestResultEntity1680078703857 implements MigrationInterface {
    name = 'UpdateTestResultEntity1680078703857'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_TEST_RESULTS" ("test_result_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "start_timestamp" integer NOT NULL, "initial_url" varchar NOT NULL, "last_update_timestamp" integer NOT NULL, "testing_time" integer NOT NULL, "parent_test_result_id" varchar)`);
        await queryRunner.query(`INSERT INTO "temporary_TEST_RESULTS"("test_result_id", "name", "start_timestamp", "initial_url", "last_update_timestamp", "testing_time") SELECT "test_result_id", "name", "start_timestamp", "initial_url", "last_update_timestamp", "testing_time" FROM "TEST_RESULTS"`);
        await queryRunner.query(`DROP TABLE "TEST_RESULTS"`);
        await queryRunner.query(`ALTER TABLE "temporary_TEST_RESULTS" RENAME TO "TEST_RESULTS"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "TEST_RESULTS" RENAME TO "temporary_TEST_RESULTS"`);
        await queryRunner.query(`CREATE TABLE "TEST_RESULTS" ("test_result_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "start_timestamp" integer NOT NULL, "initial_url" varchar NOT NULL, "last_update_timestamp" integer NOT NULL, "testing_time" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "TEST_RESULTS"("test_result_id", "name", "start_timestamp", "initial_url", "last_update_timestamp", "testing_time") SELECT "test_result_id", "name", "start_timestamp", "initial_url", "last_update_timestamp", "testing_time" FROM "temporary_TEST_RESULTS"`);
        await queryRunner.query(`DROP TABLE "temporary_TEST_RESULTS"`);
    }

}
