"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const up = (knex) => knex.schema.createTable('transfers', (t) => {
    t.bigIncrements('id').primary();
    t.integer('sender_wallet_id').unsigned().notNullable();
    t.integer('receiver_wallet_id').unsigned().notNullable();
    t.decimal('amount', 15, 2).notNullable();
    t.enu('status', ['pending', 'completed', 'failed']).defaultTo('completed');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.foreign('sender_wallet_id').references('wallets.id');
    t.foreign('receiver_wallet_id').references('wallets.id');
});
exports.up = up;
const down = (knex) => knex.schema.dropTableIfExists('transfers');
exports.down = down;
