import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateViewPointEntity1655772848395 implements MigrationInterface {
  name = "UpdateViewPointEntity1655772848395";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_VIEW_POINTS" ("view_point_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "description" varchar NOT NULL, "index" integer)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_VIEW_POINTS"("view_point_id", "name", "created_at", "description") SELECT "view_point_id", "name", "created_at", "description" FROM "VIEW_POINTS"`
    );
    await queryRunner.query(`DROP TABLE "VIEW_POINTS"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_VIEW_POINTS" RENAME TO "VIEW_POINTS"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "VIEW_POINTS" RENAME TO "temporary_VIEW_POINTS"`
    );
    await queryRunner.query(
      `CREATE TABLE "VIEW_POINTS" ("view_point_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "description" varchar NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "VIEW_POINTS"("view_point_id", "name", "created_at", "description") SELECT "view_point_id", "name", "created_at", "description" FROM "temporary_VIEW_POINTS"`
    );
    await queryRunner.query(`DROP TABLE "temporary_VIEW_POINTS"`);
  }
}
