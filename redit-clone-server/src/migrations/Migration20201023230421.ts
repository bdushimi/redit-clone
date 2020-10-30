import { Migration } from '@mikro-orm/migrations';

export class Migration20201023230421 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" text not null);');

    this.addSql('drop table if exists "migrations" cascade;');

    this.addSql('drop table if exists "role" cascade;');
  }

}
