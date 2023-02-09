import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProjectEntity1641956149882 implements MigrationInterface {
  name = "UpdateProjectEntity1641956149882";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_PROJECTS" ("project_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_PROJECTS"("project_id", "name") SELECT "project_id", "name" FROM "PROJECTS"`
    );
    await queryRunner.query(`DROP TABLE "PROJECTS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_PROJECTS" RENAME TO "PROJECTS"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PROJECTS" RENAME TO "temporary_PROJECTS"`
    );
    await queryRunner.query(
      `CREATE TABLE "PROJECTS" ("project_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "PROJECTS"("project_id", "name") SELECT "project_id", "name" FROM "temporary_PROJECTS"`
    );
    await queryRunner.query(`DROP TABLE "temporary_PROJECTS"`);
  }
}
