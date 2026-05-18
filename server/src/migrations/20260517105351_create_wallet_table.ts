import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
        await knex.schema.createTable("wallets", (table) => {
            table.increments("id").primary();
             table.decimal("balance", 14, 2).notNullable().defaultTo(0);
            table.integer("user_id").unsigned().notNullable();
            table.foreign("user_id").references("users.id").onDelete("CASCADE");
            table.string("currency", 10).notNullable().defaultTo("KES"); 
            table.enu("status", ["active", "suspended"]).notNullable().defaultTo("active");
            table.timestamps(true, true);
        });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("wallets");
}

