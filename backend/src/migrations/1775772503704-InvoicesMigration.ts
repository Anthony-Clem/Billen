import { MigrationInterface, QueryRunner } from "typeorm";

export class InvoicesMigration1775772503704 implements MigrationInterface {
    name = 'InvoicesMigration1775772503704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "invoices" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "client_id" varchar NOT NULL, "invoice_number" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('draft'), "amount" decimal NOT NULL, "currency" varchar NOT NULL, "issue_date" date NOT NULL, "due_date" date NOT NULL, "line_items" json NOT NULL, "pdf_url" text, "notes" text, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE INDEX "IDX_26daf5e433d6fb88ee32ce9363" ON "invoices" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_5534ba11e10f1a9953cbdaabf1" ON "invoices" ("client_id") `);
        await queryRunner.query(`CREATE TABLE "temporary_users" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, "google_id" text, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "temporary_users"("id", "name", "email", "password", "google_id", "created_at", "updated_at") SELECT "id", "name", "email", "password", "google_id", "created_at", "updated_at" FROM "users"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`ALTER TABLE "temporary_users" RENAME TO "users"`);
        await queryRunner.query(`CREATE TABLE "temporary_clients" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "phone" text, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_07a7a09b04e7b035c9d90cf4984" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_clients"("id", "user_id", "name", "email", "phone", "created_at", "updated_at") SELECT "id", "user_id", "name", "email", "phone", "created_at", "updated_at" FROM "clients"`);
        await queryRunner.query(`DROP TABLE "clients"`);
        await queryRunner.query(`ALTER TABLE "temporary_clients" RENAME TO "clients"`);
        await queryRunner.query(`CREATE TABLE "temporary_users" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, "google_id" text, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "address_line1" text, "address_line2" text, "address_city" text, "address_state" text, "address_zip" text, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "temporary_users"("id", "name", "email", "password", "google_id", "created_at", "updated_at") SELECT "id", "name", "email", "password", "google_id", "created_at", "updated_at" FROM "users"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`ALTER TABLE "temporary_users" RENAME TO "users"`);
        await queryRunner.query(`CREATE TABLE "temporary_clients" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "phone" text, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "address_line1" text, "address_line2" text, "address_city" text, "address_state" text, "address_zip" text, CONSTRAINT "FK_07a7a09b04e7b035c9d90cf4984" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_clients"("id", "user_id", "name", "email", "phone", "created_at", "updated_at") SELECT "id", "user_id", "name", "email", "phone", "created_at", "updated_at" FROM "clients"`);
        await queryRunner.query(`DROP TABLE "clients"`);
        await queryRunner.query(`ALTER TABLE "temporary_clients" RENAME TO "clients"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" RENAME TO "temporary_clients"`);
        await queryRunner.query(`CREATE TABLE "clients" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "phone" text, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_07a7a09b04e7b035c9d90cf4984" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "clients"("id", "user_id", "name", "email", "phone", "created_at", "updated_at") SELECT "id", "user_id", "name", "email", "phone", "created_at", "updated_at" FROM "temporary_clients"`);
        await queryRunner.query(`DROP TABLE "temporary_clients"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME TO "temporary_users"`);
        await queryRunner.query(`CREATE TABLE "users" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, "google_id" text, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "users"("id", "name", "email", "password", "google_id", "created_at", "updated_at") SELECT "id", "name", "email", "password", "google_id", "created_at", "updated_at" FROM "temporary_users"`);
        await queryRunner.query(`DROP TABLE "temporary_users"`);
        await queryRunner.query(`ALTER TABLE "clients" RENAME TO "temporary_clients"`);
        await queryRunner.query(`CREATE TABLE "clients" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "phone" text, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "addressAddress_line1" text, "addressAddress_line2" text, "addressAddress_city" text, "addressAddress_state" text, "addressAddress_zip" text, CONSTRAINT "FK_07a7a09b04e7b035c9d90cf4984" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "clients"("id", "user_id", "name", "email", "phone", "created_at", "updated_at") SELECT "id", "user_id", "name", "email", "phone", "created_at", "updated_at" FROM "temporary_clients"`);
        await queryRunner.query(`DROP TABLE "temporary_clients"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME TO "temporary_users"`);
        await queryRunner.query(`CREATE TABLE "users" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, "google_id" text, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "addressLine1" text, "addressLine2" text, "addressCity" text, "addressState" text, "addressZip" text, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "users"("id", "name", "email", "password", "google_id", "created_at", "updated_at") SELECT "id", "name", "email", "password", "google_id", "created_at", "updated_at" FROM "temporary_users"`);
        await queryRunner.query(`DROP TABLE "temporary_users"`);
        await queryRunner.query(`DROP INDEX "IDX_5534ba11e10f1a9953cbdaabf1"`);
        await queryRunner.query(`DROP INDEX "IDX_26daf5e433d6fb88ee32ce9363"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
    }

}
