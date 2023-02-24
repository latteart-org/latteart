import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1638930268191 implements MigrationInterface {
  name = "Init1638930268191";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "PROGRESS_DATAS" ("date" varchar NOT NULL, "text" varchar NOT NULL, "test_matrix_id" varchar NOT NULL, PRIMARY KEY ("date", "test_matrix_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "SNAPSHOTS" ("timestamp" varchar NOT NULL, "project_id" varchar PRIMARY KEY NOT NULL)`
    );
    await queryRunner.query(
      `CREATE TABLE "VIEW_POINT_PRESETS" ("view_point_preset_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "project_id" varchar)`
    );
    await queryRunner.query(
      `CREATE TABLE "PROJECTS" ("project_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL)`
    );
    await queryRunner.query(
      `CREATE TABLE "TEST_TARGETS" ("test_target_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "index" integer NOT NULL, "plans" varchar NOT NULL, "test_target_group_id" varchar)`
    );
    await queryRunner.query(
      `CREATE TABLE "TEST_TARGET_GROUPS" ("test_target_group_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "index" integer NOT NULL, "test_matrix_id" varchar)`
    );
    await queryRunner.query(
      `CREATE TABLE "VIEW_POINTS" ("view_point_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `CREATE TABLE "TEST_MATRICES" ("test_matrix_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "index" integer NOT NULL, "project_id" varchar)`
    );
    await queryRunner.query(
      `CREATE TABLE "STORIES" ("story_id" varchar PRIMARY KEY NOT NULL, "index " integer NOT NULL, "status" varchar NOT NULL, "planed_session_number" integer NOT NULL, "test_matrix_id" varchar, "view_point_id" varchar, "test_target_id" varchar)`
    );
    await queryRunner.query(
      `CREATE TABLE "COVERAGE_SOURCES" ("coverage_source_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "url" varchar NOT NULL, "screen_elements" varchar NOT NULL, "test_result_id" varchar)`
    );
    await queryRunner.query(
      `CREATE TABLE "DEFAULT_INPUT_ELEMENTS" ("default_input_element_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "url" varchar NOT NULL, "input_elements" varchar NOT NULL, "test_result_id" varchar)`
    );
    await queryRunner.query(
      `CREATE TABLE "SCREENSHOTS" ("screenshot_id" varchar PRIMARY KEY NOT NULL, "file_url" varchar NOT NULL, "test_result_id" varchar)`
    );
    await queryRunner.query(
      `CREATE TABLE "TAGS" ("tag_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL)`
    );
    await queryRunner.query(
      `CREATE TABLE "NOTES" ("note_id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "details" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar, "screenshot_id" varchar, CONSTRAINT "REL_0ffc136baa8c5b3beebd750481" UNIQUE ("screenshot_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "TEST_PURPOSES" ("test_purpose_id" varchar PRIMARY KEY NOT NULL, "title" varchar NOT NULL, "details" varchar NOT NULL, "test_result_id" varchar)`
    );
    await queryRunner.query(
      `CREATE TABLE "TEST_STEPS" ("test_step_id" varchar PRIMARY KEY NOT NULL, "window_handle" varchar NOT NULL, "page_title" varchar NOT NULL, "page_url" varchar NOT NULL, "keyword_texts" varchar NOT NULL, "operation_type" varchar NOT NULL, "operation_input" varchar NOT NULL, "operation_element" varchar NOT NULL, "input_elements" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar, "test_purpose_id" varchar, "screenshot_id" varchar, CONSTRAINT "REL_acf57d8cfbc3f63ebe7f0025aa" UNIQUE ("screenshot_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "TEST_RESULTS" ("test_result_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "start_timestamp" integer NOT NULL, "end_timestamp" integer NOT NULL, "initial_url" varchar NOT NULL)`
    );
    await queryRunner.query(
      `CREATE TABLE "SESSIONS" ("session_id" varchar PRIMARY KEY NOT NULL, "testUser" varchar NOT NULL, "name" varchar NOT NULL, "index" integer NOT NULL, "memo" varchar NOT NULL, "test_item" varchar NOT NULL, "testing_time" integer NOT NULL, "done_date" varchar NOT NULL, "story_id" varchar, "test_result_id" varchar)`
    );
    await queryRunner.query(
      `CREATE TABLE "ATTACHED_FILES" ("name" varchar NOT NULL, "image_url" varchar NOT NULL, "createdDate" datetime NOT NULL DEFAULT (datetime('now')), "session_id" varchar NOT NULL, PRIMARY KEY ("name", "image_url", "session_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "CONFIGS" ("project_id" varchar NOT NULL, "repository_url" varchar NOT NULL, "data" varchar NOT NULL, "device_data" varchar NOT NULL, PRIMARY KEY ("project_id", "repository_url"))`
    );
    await queryRunner.query(
      `CREATE TABLE "VIEW_POINTS_TEST_MATRICES_RELATIONS" ("view_point_id" varchar NOT NULL, "test_matrix_id" varchar NOT NULL, PRIMARY KEY ("view_point_id", "test_matrix_id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5e1f003b5be4118c605b07a1e6" ON "VIEW_POINTS_TEST_MATRICES_RELATIONS" ("view_point_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6e9a1991d05287d8a036287a42" ON "VIEW_POINTS_TEST_MATRICES_RELATIONS" ("test_matrix_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "NOTE_TAG_RELATIONS" ("note_id" varchar NOT NULL, "tag_id" varchar NOT NULL, PRIMARY KEY ("note_id", "tag_id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a0dde96df4aa0000ffcafc0e70" ON "NOTE_TAG_RELATIONS" ("note_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ef639569bb80a04b4155e55f80" ON "NOTE_TAG_RELATIONS" ("tag_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "TEST_STEP_NOTE_RELATIONS" ("note_id" varchar NOT NULL, "test_step_id" varchar NOT NULL, PRIMARY KEY ("note_id", "test_step_id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_48080a4a703cc78f07a8109058" ON "TEST_STEP_NOTE_RELATIONS" ("note_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ef97b146055ba8b5ec6378c4c9" ON "TEST_STEP_NOTE_RELATIONS" ("test_step_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_PROGRESS_DATAS" ("date" varchar NOT NULL, "text" varchar NOT NULL, "test_matrix_id" varchar NOT NULL, CONSTRAINT "FK_8274192f78108c78489b2cfedd0" FOREIGN KEY ("test_matrix_id") REFERENCES "TEST_MATRICES" ("test_matrix_id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("date", "test_matrix_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_PROGRESS_DATAS"("date", "text", "test_matrix_id") SELECT "date", "text", "test_matrix_id" FROM "PROGRESS_DATAS"`
    );
    await queryRunner.query(`DROP TABLE "PROGRESS_DATAS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_PROGRESS_DATAS" RENAME TO "PROGRESS_DATAS"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_SNAPSHOTS" ("timestamp" varchar NOT NULL, "project_id" varchar PRIMARY KEY NOT NULL, CONSTRAINT "FK_677364c50356a6b6fbdd4e2bfe8" FOREIGN KEY ("project_id") REFERENCES "PROJECTS" ("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_SNAPSHOTS"("timestamp", "project_id") SELECT "timestamp", "project_id" FROM "SNAPSHOTS"`
    );
    await queryRunner.query(`DROP TABLE "SNAPSHOTS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_SNAPSHOTS" RENAME TO "SNAPSHOTS"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_VIEW_POINT_PRESETS" ("view_point_preset_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "project_id" varchar, CONSTRAINT "FK_58aa245c601118ed0640e72372f" FOREIGN KEY ("project_id") REFERENCES "PROJECTS" ("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_VIEW_POINT_PRESETS"("view_point_preset_id", "name", "project_id") SELECT "view_point_preset_id", "name", "project_id" FROM "VIEW_POINT_PRESETS"`
    );
    await queryRunner.query(`DROP TABLE "VIEW_POINT_PRESETS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_VIEW_POINT_PRESETS" RENAME TO "VIEW_POINT_PRESETS"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_TEST_TARGETS" ("test_target_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "index" integer NOT NULL, "plans" varchar NOT NULL, "test_target_group_id" varchar, CONSTRAINT "FK_a05fad20a7f8e0af9657569ea54" FOREIGN KEY ("test_target_group_id") REFERENCES "TEST_TARGET_GROUPS" ("test_target_group_id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_TEST_TARGETS"("test_target_id", "name", "index", "plans", "test_target_group_id") SELECT "test_target_id", "name", "index", "plans", "test_target_group_id" FROM "TEST_TARGETS"`
    );
    await queryRunner.query(`DROP TABLE "TEST_TARGETS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_TEST_TARGETS" RENAME TO "TEST_TARGETS"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_TEST_TARGET_GROUPS" ("test_target_group_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "index" integer NOT NULL, "test_matrix_id" varchar, CONSTRAINT "FK_991fc296a32a53a1c7a5d4fe21d" FOREIGN KEY ("test_matrix_id") REFERENCES "TEST_MATRICES" ("test_matrix_id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_TEST_TARGET_GROUPS"("test_target_group_id", "name", "index", "test_matrix_id") SELECT "test_target_group_id", "name", "index", "test_matrix_id" FROM "TEST_TARGET_GROUPS"`
    );
    await queryRunner.query(`DROP TABLE "TEST_TARGET_GROUPS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_TEST_TARGET_GROUPS" RENAME TO "TEST_TARGET_GROUPS"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_TEST_MATRICES" ("test_matrix_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "index" integer NOT NULL, "project_id" varchar, CONSTRAINT "FK_5a2af85f84707b6c8c938e32b11" FOREIGN KEY ("project_id") REFERENCES "PROJECTS" ("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_TEST_MATRICES"("test_matrix_id", "name", "index", "project_id") SELECT "test_matrix_id", "name", "index", "project_id" FROM "TEST_MATRICES"`
    );
    await queryRunner.query(`DROP TABLE "TEST_MATRICES"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_TEST_MATRICES" RENAME TO "TEST_MATRICES"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_STORIES" ("story_id" varchar PRIMARY KEY NOT NULL, "index " integer NOT NULL, "status" varchar NOT NULL, "planed_session_number" integer NOT NULL, "test_matrix_id" varchar, "view_point_id" varchar, "test_target_id" varchar, CONSTRAINT "FK_839f9b3a1cc27f3b4e8001d56bb" FOREIGN KEY ("test_matrix_id") REFERENCES "TEST_MATRICES" ("test_matrix_id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_e53bc3059856db4839a6abe9028" FOREIGN KEY ("view_point_id") REFERENCES "VIEW_POINTS" ("view_point_id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_14dafac816d6d483d61d500e6be" FOREIGN KEY ("test_target_id") REFERENCES "TEST_TARGETS" ("test_target_id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_STORIES"("story_id", "index ", "status", "planed_session_number", "test_matrix_id", "view_point_id", "test_target_id") SELECT "story_id", "index ", "status", "planed_session_number", "test_matrix_id", "view_point_id", "test_target_id" FROM "STORIES"`
    );
    await queryRunner.query(`DROP TABLE "STORIES"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_STORIES" RENAME TO "STORIES"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_COVERAGE_SOURCES" ("coverage_source_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "url" varchar NOT NULL, "screen_elements" varchar NOT NULL, "test_result_id" varchar, CONSTRAINT "FK_34028f540622a98ce4eb8afb592" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_COVERAGE_SOURCES"("coverage_source_id", "title", "url", "screen_elements", "test_result_id") SELECT "coverage_source_id", "title", "url", "screen_elements", "test_result_id" FROM "COVERAGE_SOURCES"`
    );
    await queryRunner.query(`DROP TABLE "COVERAGE_SOURCES"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_COVERAGE_SOURCES" RENAME TO "COVERAGE_SOURCES"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_DEFAULT_INPUT_ELEMENTS" ("default_input_element_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "url" varchar NOT NULL, "input_elements" varchar NOT NULL, "test_result_id" varchar, CONSTRAINT "FK_5d9e1ca56fbc8dd8c26a65d80c1" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_DEFAULT_INPUT_ELEMENTS"("default_input_element_id", "title", "url", "input_elements", "test_result_id") SELECT "default_input_element_id", "title", "url", "input_elements", "test_result_id" FROM "DEFAULT_INPUT_ELEMENTS"`
    );
    await queryRunner.query(`DROP TABLE "DEFAULT_INPUT_ELEMENTS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_DEFAULT_INPUT_ELEMENTS" RENAME TO "DEFAULT_INPUT_ELEMENTS"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_SCREENSHOTS" ("screenshot_id" varchar PRIMARY KEY NOT NULL, "file_url" varchar NOT NULL, "test_result_id" varchar, CONSTRAINT "FK_e058a21ddc4167fcfe24f2a2baf" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_SCREENSHOTS"("screenshot_id", "file_url", "test_result_id") SELECT "screenshot_id", "file_url", "test_result_id" FROM "SCREENSHOTS"`
    );
    await queryRunner.query(`DROP TABLE "SCREENSHOTS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_SCREENSHOTS" RENAME TO "SCREENSHOTS"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_NOTES" ("note_id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "details" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar, "screenshot_id" varchar, CONSTRAINT "REL_0ffc136baa8c5b3beebd750481" UNIQUE ("screenshot_id"), CONSTRAINT "FK_4868666b7bd48904f09ea21d4db" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_0ffc136baa8c5b3beebd7504818" FOREIGN KEY ("screenshot_id") REFERENCES "SCREENSHOTS" ("screenshot_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_NOTES"("note_id", "value", "details", "timestamp", "test_result_id", "screenshot_id") SELECT "note_id", "value", "details", "timestamp", "test_result_id", "screenshot_id" FROM "NOTES"`
    );
    await queryRunner.query(`DROP TABLE "NOTES"`);
    await queryRunner.query(`ALTER TABLE "temporary_NOTES" RENAME TO "NOTES"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_TEST_PURPOSES" ("test_purpose_id" varchar PRIMARY KEY NOT NULL, "title" varchar NOT NULL, "details" varchar NOT NULL, "test_result_id" varchar, CONSTRAINT "FK_4bfe8dbd9fd1b7064afd15d907d" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_TEST_PURPOSES"("test_purpose_id", "title", "details", "test_result_id") SELECT "test_purpose_id", "title", "details", "test_result_id" FROM "TEST_PURPOSES"`
    );
    await queryRunner.query(`DROP TABLE "TEST_PURPOSES"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_TEST_PURPOSES" RENAME TO "TEST_PURPOSES"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_TEST_STEPS" ("test_step_id" varchar PRIMARY KEY NOT NULL, "window_handle" varchar NOT NULL, "page_title" varchar NOT NULL, "page_url" varchar NOT NULL, "keyword_texts" varchar NOT NULL, "operation_type" varchar NOT NULL, "operation_input" varchar NOT NULL, "operation_element" varchar NOT NULL, "input_elements" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar, "test_purpose_id" varchar, "screenshot_id" varchar, CONSTRAINT "REL_acf57d8cfbc3f63ebe7f0025aa" UNIQUE ("screenshot_id"), CONSTRAINT "FK_0bda1e0c86ad076da5e175a4d95" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_bab22801448374f96a6828ccdb5" FOREIGN KEY ("test_purpose_id") REFERENCES "TEST_PURPOSES" ("test_purpose_id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_acf57d8cfbc3f63ebe7f0025aaa" FOREIGN KEY ("screenshot_id") REFERENCES "SCREENSHOTS" ("screenshot_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_TEST_STEPS"("test_step_id", "window_handle", "page_title", "page_url", "keyword_texts", "operation_type", "operation_input", "operation_element", "input_elements", "timestamp", "test_result_id", "test_purpose_id", "screenshot_id") SELECT "test_step_id", "window_handle", "page_title", "page_url", "keyword_texts", "operation_type", "operation_input", "operation_element", "input_elements", "timestamp", "test_result_id", "test_purpose_id", "screenshot_id" FROM "TEST_STEPS"`
    );
    await queryRunner.query(`DROP TABLE "TEST_STEPS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_TEST_STEPS" RENAME TO "TEST_STEPS"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_SESSIONS" ("session_id" varchar PRIMARY KEY NOT NULL, "testUser" varchar NOT NULL, "name" varchar NOT NULL, "index" integer NOT NULL, "memo" varchar NOT NULL, "test_item" varchar NOT NULL, "testing_time" integer NOT NULL, "done_date" varchar NOT NULL, "story_id" varchar, "test_result_id" varchar, CONSTRAINT "FK_5127b300c99c5030df3036fb12f" FOREIGN KEY ("story_id") REFERENCES "STORIES" ("story_id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_4761b86c592e4826f029d4f702e" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_SESSIONS"("session_id", "testUser", "name", "index", "memo", "test_item", "testing_time", "done_date", "story_id", "test_result_id") SELECT "session_id", "testUser", "name", "index", "memo", "test_item", "testing_time", "done_date", "story_id", "test_result_id" FROM "SESSIONS"`
    );
    await queryRunner.query(`DROP TABLE "SESSIONS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_SESSIONS" RENAME TO "SESSIONS"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_ATTACHED_FILES" ("name" varchar NOT NULL, "image_url" varchar NOT NULL, "createdDate" datetime NOT NULL DEFAULT (datetime('now')), "session_id" varchar NOT NULL, CONSTRAINT "FK_8dd3a1f2ec25553750070a8c198" FOREIGN KEY ("session_id") REFERENCES "SESSIONS" ("session_id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("name", "image_url", "session_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_ATTACHED_FILES"("name", "image_url", "createdDate", "session_id") SELECT "name", "image_url", "createdDate", "session_id" FROM "ATTACHED_FILES"`
    );
    await queryRunner.query(`DROP TABLE "ATTACHED_FILES"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_ATTACHED_FILES" RENAME TO "ATTACHED_FILES"`
    );
    await queryRunner.query(`DROP INDEX "IDX_5e1f003b5be4118c605b07a1e6"`);
    await queryRunner.query(`DROP INDEX "IDX_6e9a1991d05287d8a036287a42"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_VIEW_POINTS_TEST_MATRICES_RELATIONS" ("view_point_id" varchar NOT NULL, "test_matrix_id" varchar NOT NULL, CONSTRAINT "FK_5e1f003b5be4118c605b07a1e68" FOREIGN KEY ("view_point_id") REFERENCES "VIEW_POINTS" ("view_point_id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_6e9a1991d05287d8a036287a42c" FOREIGN KEY ("test_matrix_id") REFERENCES "TEST_MATRICES" ("test_matrix_id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("view_point_id", "test_matrix_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_VIEW_POINTS_TEST_MATRICES_RELATIONS"("view_point_id", "test_matrix_id") SELECT "view_point_id", "test_matrix_id" FROM "VIEW_POINTS_TEST_MATRICES_RELATIONS"`
    );
    await queryRunner.query(`DROP TABLE "VIEW_POINTS_TEST_MATRICES_RELATIONS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_VIEW_POINTS_TEST_MATRICES_RELATIONS" RENAME TO "VIEW_POINTS_TEST_MATRICES_RELATIONS"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5e1f003b5be4118c605b07a1e6" ON "VIEW_POINTS_TEST_MATRICES_RELATIONS" ("view_point_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6e9a1991d05287d8a036287a42" ON "VIEW_POINTS_TEST_MATRICES_RELATIONS" ("test_matrix_id") `
    );
    await queryRunner.query(`DROP INDEX "IDX_a0dde96df4aa0000ffcafc0e70"`);
    await queryRunner.query(`DROP INDEX "IDX_ef639569bb80a04b4155e55f80"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_NOTE_TAG_RELATIONS" ("note_id" varchar NOT NULL, "tag_id" varchar NOT NULL, CONSTRAINT "FK_a0dde96df4aa0000ffcafc0e708" FOREIGN KEY ("note_id") REFERENCES "NOTES" ("note_id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_ef639569bb80a04b4155e55f804" FOREIGN KEY ("tag_id") REFERENCES "TAGS" ("tag_id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("note_id", "tag_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_NOTE_TAG_RELATIONS"("note_id", "tag_id") SELECT "note_id", "tag_id" FROM "NOTE_TAG_RELATIONS"`
    );
    await queryRunner.query(`DROP TABLE "NOTE_TAG_RELATIONS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_NOTE_TAG_RELATIONS" RENAME TO "NOTE_TAG_RELATIONS"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a0dde96df4aa0000ffcafc0e70" ON "NOTE_TAG_RELATIONS" ("note_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ef639569bb80a04b4155e55f80" ON "NOTE_TAG_RELATIONS" ("tag_id") `
    );
    await queryRunner.query(`DROP INDEX "IDX_48080a4a703cc78f07a8109058"`);
    await queryRunner.query(`DROP INDEX "IDX_ef97b146055ba8b5ec6378c4c9"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_TEST_STEP_NOTE_RELATIONS" ("note_id" varchar NOT NULL, "test_step_id" varchar NOT NULL, CONSTRAINT "FK_48080a4a703cc78f07a81090585" FOREIGN KEY ("note_id") REFERENCES "NOTES" ("note_id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_ef97b146055ba8b5ec6378c4c98" FOREIGN KEY ("test_step_id") REFERENCES "TEST_STEPS" ("test_step_id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("note_id", "test_step_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_TEST_STEP_NOTE_RELATIONS"("note_id", "test_step_id") SELECT "note_id", "test_step_id" FROM "TEST_STEP_NOTE_RELATIONS"`
    );
    await queryRunner.query(`DROP TABLE "TEST_STEP_NOTE_RELATIONS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_TEST_STEP_NOTE_RELATIONS" RENAME TO "TEST_STEP_NOTE_RELATIONS"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_48080a4a703cc78f07a8109058" ON "TEST_STEP_NOTE_RELATIONS" ("note_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ef97b146055ba8b5ec6378c4c9" ON "TEST_STEP_NOTE_RELATIONS" ("test_step_id") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_ef97b146055ba8b5ec6378c4c9"`);
    await queryRunner.query(`DROP INDEX "IDX_48080a4a703cc78f07a8109058"`);
    await queryRunner.query(
      `ALTER TABLE "TEST_STEP_NOTE_RELATIONS" RENAME TO "temporary_TEST_STEP_NOTE_RELATIONS"`
    );
    await queryRunner.query(
      `CREATE TABLE "TEST_STEP_NOTE_RELATIONS" ("note_id" varchar NOT NULL, "test_step_id" varchar NOT NULL, PRIMARY KEY ("note_id", "test_step_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "TEST_STEP_NOTE_RELATIONS"("note_id", "test_step_id") SELECT "note_id", "test_step_id" FROM "temporary_TEST_STEP_NOTE_RELATIONS"`
    );
    await queryRunner.query(`DROP TABLE "temporary_TEST_STEP_NOTE_RELATIONS"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_ef97b146055ba8b5ec6378c4c9" ON "TEST_STEP_NOTE_RELATIONS" ("test_step_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_48080a4a703cc78f07a8109058" ON "TEST_STEP_NOTE_RELATIONS" ("note_id") `
    );
    await queryRunner.query(`DROP INDEX "IDX_ef639569bb80a04b4155e55f80"`);
    await queryRunner.query(`DROP INDEX "IDX_a0dde96df4aa0000ffcafc0e70"`);
    await queryRunner.query(
      `ALTER TABLE "NOTE_TAG_RELATIONS" RENAME TO "temporary_NOTE_TAG_RELATIONS"`
    );
    await queryRunner.query(
      `CREATE TABLE "NOTE_TAG_RELATIONS" ("note_id" varchar NOT NULL, "tag_id" varchar NOT NULL, PRIMARY KEY ("note_id", "tag_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "NOTE_TAG_RELATIONS"("note_id", "tag_id") SELECT "note_id", "tag_id" FROM "temporary_NOTE_TAG_RELATIONS"`
    );
    await queryRunner.query(`DROP TABLE "temporary_NOTE_TAG_RELATIONS"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_ef639569bb80a04b4155e55f80" ON "NOTE_TAG_RELATIONS" ("tag_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a0dde96df4aa0000ffcafc0e70" ON "NOTE_TAG_RELATIONS" ("note_id") `
    );
    await queryRunner.query(`DROP INDEX "IDX_6e9a1991d05287d8a036287a42"`);
    await queryRunner.query(`DROP INDEX "IDX_5e1f003b5be4118c605b07a1e6"`);
    await queryRunner.query(
      `ALTER TABLE "VIEW_POINTS_TEST_MATRICES_RELATIONS" RENAME TO "temporary_VIEW_POINTS_TEST_MATRICES_RELATIONS"`
    );
    await queryRunner.query(
      `CREATE TABLE "VIEW_POINTS_TEST_MATRICES_RELATIONS" ("view_point_id" varchar NOT NULL, "test_matrix_id" varchar NOT NULL, PRIMARY KEY ("view_point_id", "test_matrix_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "VIEW_POINTS_TEST_MATRICES_RELATIONS"("view_point_id", "test_matrix_id") SELECT "view_point_id", "test_matrix_id" FROM "temporary_VIEW_POINTS_TEST_MATRICES_RELATIONS"`
    );
    await queryRunner.query(
      `DROP TABLE "temporary_VIEW_POINTS_TEST_MATRICES_RELATIONS"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6e9a1991d05287d8a036287a42" ON "VIEW_POINTS_TEST_MATRICES_RELATIONS" ("test_matrix_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5e1f003b5be4118c605b07a1e6" ON "VIEW_POINTS_TEST_MATRICES_RELATIONS" ("view_point_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "ATTACHED_FILES" RENAME TO "temporary_ATTACHED_FILES"`
    );
    await queryRunner.query(
      `CREATE TABLE "ATTACHED_FILES" ("name" varchar NOT NULL, "image_url" varchar NOT NULL, "createdDate" datetime NOT NULL DEFAULT (datetime('now')), "session_id" varchar NOT NULL, PRIMARY KEY ("name", "image_url", "session_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "ATTACHED_FILES"("name", "image_url", "createdDate", "session_id") SELECT "name", "image_url", "createdDate", "session_id" FROM "temporary_ATTACHED_FILES"`
    );
    await queryRunner.query(`DROP TABLE "temporary_ATTACHED_FILES"`);
    await queryRunner.query(
      `ALTER TABLE "SESSIONS" RENAME TO "temporary_SESSIONS"`
    );
    await queryRunner.query(
      `CREATE TABLE "SESSIONS" ("session_id" varchar PRIMARY KEY NOT NULL, "testUser" varchar NOT NULL, "name" varchar NOT NULL, "index" integer NOT NULL, "memo" varchar NOT NULL, "test_item" varchar NOT NULL, "testing_time" integer NOT NULL, "done_date" varchar NOT NULL, "story_id" varchar, "test_result_id" varchar)`
    );
    await queryRunner.query(
      `INSERT INTO "SESSIONS"("session_id", "testUser", "name", "index", "memo", "test_item", "testing_time", "done_date", "story_id", "test_result_id") SELECT "session_id", "testUser", "name", "index", "memo", "test_item", "testing_time", "done_date", "story_id", "test_result_id" FROM "temporary_SESSIONS"`
    );
    await queryRunner.query(`DROP TABLE "temporary_SESSIONS"`);
    await queryRunner.query(
      `ALTER TABLE "TEST_STEPS" RENAME TO "temporary_TEST_STEPS"`
    );
    await queryRunner.query(
      `CREATE TABLE "TEST_STEPS" ("test_step_id" varchar PRIMARY KEY NOT NULL, "window_handle" varchar NOT NULL, "page_title" varchar NOT NULL, "page_url" varchar NOT NULL, "keyword_texts" varchar NOT NULL, "operation_type" varchar NOT NULL, "operation_input" varchar NOT NULL, "operation_element" varchar NOT NULL, "input_elements" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar, "test_purpose_id" varchar, "screenshot_id" varchar, CONSTRAINT "REL_acf57d8cfbc3f63ebe7f0025aa" UNIQUE ("screenshot_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "TEST_STEPS"("test_step_id", "window_handle", "page_title", "page_url", "keyword_texts", "operation_type", "operation_input", "operation_element", "input_elements", "timestamp", "test_result_id", "test_purpose_id", "screenshot_id") SELECT "test_step_id", "window_handle", "page_title", "page_url", "keyword_texts", "operation_type", "operation_input", "operation_element", "input_elements", "timestamp", "test_result_id", "test_purpose_id", "screenshot_id" FROM "temporary_TEST_STEPS"`
    );
    await queryRunner.query(`DROP TABLE "temporary_TEST_STEPS"`);
    await queryRunner.query(
      `ALTER TABLE "TEST_PURPOSES" RENAME TO "temporary_TEST_PURPOSES"`
    );
    await queryRunner.query(
      `CREATE TABLE "TEST_PURPOSES" ("test_purpose_id" varchar PRIMARY KEY NOT NULL, "title" varchar NOT NULL, "details" varchar NOT NULL, "test_result_id" varchar)`
    );
    await queryRunner.query(
      `INSERT INTO "TEST_PURPOSES"("test_purpose_id", "title", "details", "test_result_id") SELECT "test_purpose_id", "title", "details", "test_result_id" FROM "temporary_TEST_PURPOSES"`
    );
    await queryRunner.query(`DROP TABLE "temporary_TEST_PURPOSES"`);
    await queryRunner.query(`ALTER TABLE "NOTES" RENAME TO "temporary_NOTES"`);
    await queryRunner.query(
      `CREATE TABLE "NOTES" ("note_id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "details" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar, "screenshot_id" varchar, CONSTRAINT "REL_0ffc136baa8c5b3beebd750481" UNIQUE ("screenshot_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "NOTES"("note_id", "value", "details", "timestamp", "test_result_id", "screenshot_id") SELECT "note_id", "value", "details", "timestamp", "test_result_id", "screenshot_id" FROM "temporary_NOTES"`
    );
    await queryRunner.query(`DROP TABLE "temporary_NOTES"`);
    await queryRunner.query(
      `ALTER TABLE "SCREENSHOTS" RENAME TO "temporary_SCREENSHOTS"`
    );
    await queryRunner.query(
      `CREATE TABLE "SCREENSHOTS" ("screenshot_id" varchar PRIMARY KEY NOT NULL, "file_url" varchar NOT NULL, "test_result_id" varchar)`
    );
    await queryRunner.query(
      `INSERT INTO "SCREENSHOTS"("screenshot_id", "file_url", "test_result_id") SELECT "screenshot_id", "file_url", "test_result_id" FROM "temporary_SCREENSHOTS"`
    );
    await queryRunner.query(`DROP TABLE "temporary_SCREENSHOTS"`);
    await queryRunner.query(
      `ALTER TABLE "DEFAULT_INPUT_ELEMENTS" RENAME TO "temporary_DEFAULT_INPUT_ELEMENTS"`
    );
    await queryRunner.query(
      `CREATE TABLE "DEFAULT_INPUT_ELEMENTS" ("default_input_element_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "url" varchar NOT NULL, "input_elements" varchar NOT NULL, "test_result_id" varchar)`
    );
    await queryRunner.query(
      `INSERT INTO "DEFAULT_INPUT_ELEMENTS"("default_input_element_id", "title", "url", "input_elements", "test_result_id") SELECT "default_input_element_id", "title", "url", "input_elements", "test_result_id" FROM "temporary_DEFAULT_INPUT_ELEMENTS"`
    );
    await queryRunner.query(`DROP TABLE "temporary_DEFAULT_INPUT_ELEMENTS"`);
    await queryRunner.query(
      `ALTER TABLE "COVERAGE_SOURCES" RENAME TO "temporary_COVERAGE_SOURCES"`
    );
    await queryRunner.query(
      `CREATE TABLE "COVERAGE_SOURCES" ("coverage_source_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "url" varchar NOT NULL, "screen_elements" varchar NOT NULL, "test_result_id" varchar)`
    );
    await queryRunner.query(
      `INSERT INTO "COVERAGE_SOURCES"("coverage_source_id", "title", "url", "screen_elements", "test_result_id") SELECT "coverage_source_id", "title", "url", "screen_elements", "test_result_id" FROM "temporary_COVERAGE_SOURCES"`
    );
    await queryRunner.query(`DROP TABLE "temporary_COVERAGE_SOURCES"`);
    await queryRunner.query(
      `ALTER TABLE "STORIES" RENAME TO "temporary_STORIES"`
    );
    await queryRunner.query(
      `CREATE TABLE "STORIES" ("story_id" varchar PRIMARY KEY NOT NULL, "index " integer NOT NULL, "status" varchar NOT NULL, "planed_session_number" integer NOT NULL, "test_matrix_id" varchar, "view_point_id" varchar, "test_target_id" varchar)`
    );
    await queryRunner.query(
      `INSERT INTO "STORIES"("story_id", "index ", "status", "planed_session_number", "test_matrix_id", "view_point_id", "test_target_id") SELECT "story_id", "index ", "status", "planed_session_number", "test_matrix_id", "view_point_id", "test_target_id" FROM "temporary_STORIES"`
    );
    await queryRunner.query(`DROP TABLE "temporary_STORIES"`);
    await queryRunner.query(
      `ALTER TABLE "TEST_MATRICES" RENAME TO "temporary_TEST_MATRICES"`
    );
    await queryRunner.query(
      `CREATE TABLE "TEST_MATRICES" ("test_matrix_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "index" integer NOT NULL, "project_id" varchar)`
    );
    await queryRunner.query(
      `INSERT INTO "TEST_MATRICES"("test_matrix_id", "name", "index", "project_id") SELECT "test_matrix_id", "name", "index", "project_id" FROM "temporary_TEST_MATRICES"`
    );
    await queryRunner.query(`DROP TABLE "temporary_TEST_MATRICES"`);
    await queryRunner.query(
      `ALTER TABLE "TEST_TARGET_GROUPS" RENAME TO "temporary_TEST_TARGET_GROUPS"`
    );
    await queryRunner.query(
      `CREATE TABLE "TEST_TARGET_GROUPS" ("test_target_group_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "index" integer NOT NULL, "test_matrix_id" varchar)`
    );
    await queryRunner.query(
      `INSERT INTO "TEST_TARGET_GROUPS"("test_target_group_id", "name", "index", "test_matrix_id") SELECT "test_target_group_id", "name", "index", "test_matrix_id" FROM "temporary_TEST_TARGET_GROUPS"`
    );
    await queryRunner.query(`DROP TABLE "temporary_TEST_TARGET_GROUPS"`);
    await queryRunner.query(
      `ALTER TABLE "TEST_TARGETS" RENAME TO "temporary_TEST_TARGETS"`
    );
    await queryRunner.query(
      `CREATE TABLE "TEST_TARGETS" ("test_target_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "index" integer NOT NULL, "plans" varchar NOT NULL, "test_target_group_id" varchar)`
    );
    await queryRunner.query(
      `INSERT INTO "TEST_TARGETS"("test_target_id", "name", "index", "plans", "test_target_group_id") SELECT "test_target_id", "name", "index", "plans", "test_target_group_id" FROM "temporary_TEST_TARGETS"`
    );
    await queryRunner.query(`DROP TABLE "temporary_TEST_TARGETS"`);
    await queryRunner.query(
      `ALTER TABLE "VIEW_POINT_PRESETS" RENAME TO "temporary_VIEW_POINT_PRESETS"`
    );
    await queryRunner.query(
      `CREATE TABLE "VIEW_POINT_PRESETS" ("view_point_preset_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "project_id" varchar)`
    );
    await queryRunner.query(
      `INSERT INTO "VIEW_POINT_PRESETS"("view_point_preset_id", "name", "project_id") SELECT "view_point_preset_id", "name", "project_id" FROM "temporary_VIEW_POINT_PRESETS"`
    );
    await queryRunner.query(`DROP TABLE "temporary_VIEW_POINT_PRESETS"`);
    await queryRunner.query(
      `ALTER TABLE "SNAPSHOTS" RENAME TO "temporary_SNAPSHOTS"`
    );
    await queryRunner.query(
      `CREATE TABLE "SNAPSHOTS" ("timestamp" varchar NOT NULL, "project_id" varchar PRIMARY KEY NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "SNAPSHOTS"("timestamp", "project_id") SELECT "timestamp", "project_id" FROM "temporary_SNAPSHOTS"`
    );
    await queryRunner.query(`DROP TABLE "temporary_SNAPSHOTS"`);
    await queryRunner.query(
      `ALTER TABLE "PROGRESS_DATAS" RENAME TO "temporary_PROGRESS_DATAS"`
    );
    await queryRunner.query(
      `CREATE TABLE "PROGRESS_DATAS" ("date" varchar NOT NULL, "text" varchar NOT NULL, "test_matrix_id" varchar NOT NULL, PRIMARY KEY ("date", "test_matrix_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "PROGRESS_DATAS"("date", "text", "test_matrix_id") SELECT "date", "text", "test_matrix_id" FROM "temporary_PROGRESS_DATAS"`
    );
    await queryRunner.query(`DROP TABLE "temporary_PROGRESS_DATAS"`);
    await queryRunner.query(`DROP INDEX "IDX_ef97b146055ba8b5ec6378c4c9"`);
    await queryRunner.query(`DROP INDEX "IDX_48080a4a703cc78f07a8109058"`);
    await queryRunner.query(`DROP TABLE "TEST_STEP_NOTE_RELATIONS"`);
    await queryRunner.query(`DROP INDEX "IDX_ef639569bb80a04b4155e55f80"`);
    await queryRunner.query(`DROP INDEX "IDX_a0dde96df4aa0000ffcafc0e70"`);
    await queryRunner.query(`DROP TABLE "NOTE_TAG_RELATIONS"`);
    await queryRunner.query(`DROP INDEX "IDX_6e9a1991d05287d8a036287a42"`);
    await queryRunner.query(`DROP INDEX "IDX_5e1f003b5be4118c605b07a1e6"`);
    await queryRunner.query(`DROP TABLE "VIEW_POINTS_TEST_MATRICES_RELATIONS"`);
    await queryRunner.query(`DROP TABLE "CONFIGS"`);
    await queryRunner.query(`DROP TABLE "ATTACHED_FILES"`);
    await queryRunner.query(`DROP TABLE "SESSIONS"`);
    await queryRunner.query(`DROP TABLE "TEST_RESULTS"`);
    await queryRunner.query(`DROP TABLE "TEST_STEPS"`);
    await queryRunner.query(`DROP TABLE "TEST_PURPOSES"`);
    await queryRunner.query(`DROP TABLE "NOTES"`);
    await queryRunner.query(`DROP TABLE "TAGS"`);
    await queryRunner.query(`DROP TABLE "SCREENSHOTS"`);
    await queryRunner.query(`DROP TABLE "DEFAULT_INPUT_ELEMENTS"`);
    await queryRunner.query(`DROP TABLE "COVERAGE_SOURCES"`);
    await queryRunner.query(`DROP TABLE "STORIES"`);
    await queryRunner.query(`DROP TABLE "TEST_MATRICES"`);
    await queryRunner.query(`DROP TABLE "VIEW_POINTS"`);
    await queryRunner.query(`DROP TABLE "TEST_TARGET_GROUPS"`);
    await queryRunner.query(`DROP TABLE "TEST_TARGETS"`);
    await queryRunner.query(`DROP TABLE "PROJECTS"`);
    await queryRunner.query(`DROP TABLE "VIEW_POINT_PRESETS"`);
    await queryRunner.query(`DROP TABLE "SNAPSHOTS"`);
    await queryRunner.query(`DROP TABLE "PROGRESS_DATAS"`);
  }
}
