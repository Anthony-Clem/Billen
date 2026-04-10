import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1775841817003 implements MigrationInterface {
    name = 'InitialMigration1775841817003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "google_id" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "address_line1" text, "address_line2" text, "address_city" text, "address_state" text, "address_zip" text, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "client_id" character varying NOT NULL, "invoice_number" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'draft', "amount" numeric NOT NULL, "currency" character varying NOT NULL, "issue_date" date NOT NULL, "due_date" date NOT NULL, "line_items" json NOT NULL, "pdf_url" text, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_26daf5e433d6fb88ee32ce9363" ON "invoices" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_5534ba11e10f1a9953cbdaabf1" ON "invoices" ("client_id") `);
        await queryRunner.query(`CREATE TABLE "clients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "address_line1" text, "address_line2" text, "address_city" text, "address_state" text, "address_zip" text, CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "FK_07a7a09b04e7b035c9d90cf4984" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "FK_07a7a09b04e7b035c9d90cf4984"`);
        await queryRunner.query(`DROP TABLE "clients"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5534ba11e10f1a9953cbdaabf1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_26daf5e433d6fb88ee32ce9363"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
