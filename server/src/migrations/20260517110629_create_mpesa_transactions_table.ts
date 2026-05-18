import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
        await knex.schema.createTable("mpesa_transactions", (table) => {
            table.bigIncrements('id').primary();

    table.string('merchant_request_id', 100);
    table.string('checkout_request_id', 100);

    table.string('mpesa_receipt_number', 100);

    table.string('phone_number', 20);

    table.decimal('amount', 15, 2);

    table.enu('transaction_type', [
      'deposit',
      'withdrawal'
    ]);

    table.string('result_code', 10);
    table.text('result_description');

    table.json('raw_callback');

    table.enu('status', [
      'pending',
      'completed',
      'failed'
    ]).defaultTo('pending');

    table.timestamp('created_at')
      .defaultTo(knex.fn.now());
        });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("mpesa_transactions");
}

