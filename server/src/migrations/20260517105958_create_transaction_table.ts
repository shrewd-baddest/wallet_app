import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

      const hasTable = await knex.schema.hasTable("transactions");
  if (hasTable) {
    return;
  }
        await knex.schema.createTable("transactions", (table) => {
            table.increments("id").primary();
            table.string("transaction_code").notNullable().unique();
            table.integer("wallet_id").unsigned().notNullable().references("id").inTable("wallets").onDelete("CASCADE");
            table.enu("type", ["deposit", "withdrawal","transfer_sent", "transfer_received"]).notNullable();
            table.decimal("amount", 14, 2).notNullable();
            table.enu("status", ["pending", "completed", "failed"]).notNullable().defaultTo("pending");
            table.string("description").nullable();
            table.timestamps(true, true);
        });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("transactions");    
}

