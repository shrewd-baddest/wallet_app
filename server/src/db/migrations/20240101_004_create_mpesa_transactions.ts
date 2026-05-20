import type { Knex } from 'knex';

export const up = (knex: Knex) =>
  knex.schema.createTable('mpesa_transactions', (t) => {
    t.bigIncrements('id').primary();
    t.string('merchant_request_id', 100).nullable();
    t.string('checkout_request_id', 100).nullable();
    t.string('mpesa_receipt_number', 100).nullable();
    t.string('phone_number', 20).nullable();
    t.decimal('amount', 15, 2).nullable();
    t.enu('transaction_type', ['deposit', 'withdrawal']).nullable();
    t.string('result_code', 10).nullable();
    t.text('result_description').nullable();
    t.json('raw_callback').nullable();
    t.enu('status', ['pending', 'completed', 'failed']).defaultTo('pending');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

export const down = (knex: Knex) => knex.schema.dropTableIfExists('mpesa_transactions');
