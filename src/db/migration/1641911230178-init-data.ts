import {MigrationInterface, QueryRunner} from "typeorm";

export class initData1641911230178 implements MigrationInterface {
    name = 'initData1641911230178'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "facebook_post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "url" varchar NOT NULL, "identifier" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "facebookPageId" integer)`);
        await queryRunner.query(`CREATE TABLE "facebook_page" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "pageId" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_facebook_post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "url" varchar NOT NULL, "identifier" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "facebookPageId" integer, CONSTRAINT "FK_a337a88b281924f683f507d3c42" FOREIGN KEY ("facebookPageId") REFERENCES "facebook_page" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_facebook_post"("id", "url", "identifier", "createdAt", "facebookPageId") SELECT "id", "url", "identifier", "createdAt", "facebookPageId" FROM "facebook_post"`);
        await queryRunner.query(`DROP TABLE "facebook_post"`);
        await queryRunner.query(`ALTER TABLE "temporary_facebook_post" RENAME TO "facebook_post"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "facebook_post" RENAME TO "temporary_facebook_post"`);
        await queryRunner.query(`CREATE TABLE "facebook_post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "url" varchar NOT NULL, "identifier" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "facebookPageId" integer)`);
        await queryRunner.query(`INSERT INTO "facebook_post"("id", "url", "identifier", "createdAt", "facebookPageId") SELECT "id", "url", "identifier", "createdAt", "facebookPageId" FROM "temporary_facebook_post"`);
        await queryRunner.query(`DROP TABLE "temporary_facebook_post"`);
        await queryRunner.query(`DROP TABLE "facebook_page"`);
        await queryRunner.query(`DROP TABLE "facebook_post"`);
    }

}
