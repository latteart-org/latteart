import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTestStepEntity1666848612089 implements MigrationInterface {
  name = "UpdateTestStepEntity1666848612089";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_TEST_STEPS" ("test_step_id" varchar PRIMARY KEY NOT NULL, "window_handle" varchar NOT NULL, "page_title" varchar NOT NULL, "page_url" varchar NOT NULL, "keyword_texts" varchar NOT NULL, "operation_type" varchar NOT NULL, "operation_input" varchar NOT NULL, "operation_element" varchar NOT NULL, "input_elements" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar, "test_purpose_id" varchar, "screenshot_id" varchar, "is_automatic" boolean DEFAULT (0), CONSTRAINT "REL_acf57d8cfbc3f63ebe7f0025aa" UNIQUE ("screenshot_id"), CONSTRAINT "FK_acf57d8cfbc3f63ebe7f0025aaa" FOREIGN KEY ("screenshot_id") REFERENCES "SCREENSHOTS" ("screenshot_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_bab22801448374f96a6828ccdb5" FOREIGN KEY ("test_purpose_id") REFERENCES "TEST_PURPOSES" ("test_purpose_id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_0bda1e0c86ad076da5e175a4d95" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_TEST_STEPS"("test_step_id", "window_handle", "page_title", "page_url", "keyword_texts", "operation_type", "operation_input", "operation_element", "input_elements", "timestamp", "test_result_id", "test_purpose_id", "screenshot_id") SELECT "test_step_id", "window_handle", "page_title", "page_url", "keyword_texts", "operation_type", "operation_input", "operation_element", "input_elements", "timestamp", "test_result_id", "test_purpose_id", "screenshot_id" FROM "TEST_STEPS"`
    );
    await queryRunner.query(`DROP TABLE "TEST_STEPS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_TEST_STEPS" RENAME TO "TEST_STEPS"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "TEST_STEPS" RENAME TO "temporary_TEST_STEPS"`
    );
    await queryRunner.query(
      `CREATE TABLE "TEST_STEPS" ("test_step_id" varchar PRIMARY KEY NOT NULL, "window_handle" varchar NOT NULL, "page_title" varchar NOT NULL, "page_url" varchar NOT NULL, "keyword_texts" varchar NOT NULL, "operation_type" varchar NOT NULL, "operation_input" varchar NOT NULL, "operation_element" varchar NOT NULL, "input_elements" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar, "test_purpose_id" varchar, "screenshot_id" varchar, CONSTRAINT "REL_acf57d8cfbc3f63ebe7f0025aa" UNIQUE ("screenshot_id"), CONSTRAINT "FK_acf57d8cfbc3f63ebe7f0025aaa" FOREIGN KEY ("screenshot_id") REFERENCES "SCREENSHOTS" ("screenshot_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_bab22801448374f96a6828ccdb5" FOREIGN KEY ("test_purpose_id") REFERENCES "TEST_PURPOSES" ("test_purpose_id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_0bda1e0c86ad076da5e175a4d95" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "TEST_STEPS"("test_step_id", "window_handle", "page_title", "page_url", "keyword_texts", "operation_type", "operation_input", "operation_element", "input_elements", "timestamp", "test_result_id", "test_purpose_id", "screenshot_id") SELECT "test_step_id", "window_handle", "page_title", "page_url", "keyword_texts", "operation_type", "operation_input", "operation_element", "input_elements", "timestamp", "test_result_id", "test_purpose_id", "screenshot_id" FROM "temporary_TEST_STEPS"`
    );
    await queryRunner.query(`DROP TABLE "temporary_TEST_STEPS"`);
  }
}
