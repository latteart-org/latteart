import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMutationEntity1720152936071 implements MigrationInterface {
    name = 'AddMutationEntity1720152936071'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "MUTATIONS" ("mutation_id" varchar PRIMARY KEY NOT NULL, "element_mutations" varchar NOT NULL, "timestamp" integer NOT NULL DEFAULT (0), "window_handle" varchar NOT NULL, "scroll_position_x" integer NOT NULL, "scroll_position_y" integer NOT NULL, "client_size_width" integer NOT NULL, "client_size_height" integer NOT NULL, "url" varchar NOT NULL, "title" varchar NOT NULL, "test_result_id" varchar, "screenshot_id" varchar)`);
        await queryRunner.query(`CREATE TABLE "temporary_MUTATIONS" ("mutation_id" varchar PRIMARY KEY NOT NULL, "element_mutations" varchar NOT NULL, "timestamp" integer NOT NULL DEFAULT (0), "window_handle" varchar NOT NULL, "scroll_position_x" integer NOT NULL, "scroll_position_y" integer NOT NULL, "client_size_width" integer NOT NULL, "client_size_height" integer NOT NULL, "url" varchar NOT NULL, "title" varchar NOT NULL, "test_result_id" varchar, "screenshot_id" varchar, CONSTRAINT "FK_9270c8801bbc55f9f3ea92c9071" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_1cda4f88eafe53c638dac2c8d8e" FOREIGN KEY ("screenshot_id") REFERENCES "SCREENSHOTS" ("screenshot_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_MUTATIONS"("mutation_id", "element_mutations", "timestamp", "window_handle", "scroll_position_x", "scroll_position_y", "client_size_width", "client_size_height", "url", "title", "test_result_id", "screenshot_id") SELECT "mutation_id", "element_mutations", "timestamp", "window_handle", "scroll_position_x", "scroll_position_y", "client_size_width", "client_size_height", "url", "title", "test_result_id", "screenshot_id" FROM "MUTATIONS"`);
        await queryRunner.query(`DROP TABLE "MUTATIONS"`);
        await queryRunner.query(`ALTER TABLE "temporary_MUTATIONS" RENAME TO "MUTATIONS"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "MUTATIONS" RENAME TO "temporary_MUTATIONS"`);
        await queryRunner.query(`CREATE TABLE "MUTATIONS" ("mutation_id" varchar PRIMARY KEY NOT NULL, "element_mutations" varchar NOT NULL, "timestamp" integer NOT NULL DEFAULT (0), "window_handle" varchar NOT NULL, "scroll_position_x" integer NOT NULL, "scroll_position_y" integer NOT NULL, "client_size_width" integer NOT NULL, "client_size_height" integer NOT NULL, "url" varchar NOT NULL, "title" varchar NOT NULL, "test_result_id" varchar, "screenshot_id" varchar)`);
        await queryRunner.query(`INSERT INTO "MUTATIONS"("mutation_id", "element_mutations", "timestamp", "window_handle", "scroll_position_x", "scroll_position_y", "client_size_width", "client_size_height", "url", "title", "test_result_id", "screenshot_id") SELECT "mutation_id", "element_mutations", "timestamp", "window_handle", "scroll_position_x", "scroll_position_y", "client_size_width", "client_size_height", "url", "title", "test_result_id", "screenshot_id" FROM "temporary_MUTATIONS"`);
        await queryRunner.query(`DROP TABLE "temporary_MUTATIONS"`);
        await queryRunner.query(`DROP TABLE "MUTATIONS"`);
    }

}
