import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("users", (table) => {
         table.increments("id").primary();
         table.string("full_name").notNullable();
            table.string("email",100).notNullable().unique();
            table.string("password").notNullable();
            table.boolean("is_verified").defaultTo(false);
            table.timestamps(true, true);
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("users");
}

