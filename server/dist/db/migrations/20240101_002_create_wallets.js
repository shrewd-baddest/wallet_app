"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const up = (knex) => knex.schema.createTable('wallets', (t) => {
    t.increments('id').primary();
    t.integer('user_id').unsigned().notNullable().unique();
    t.decimal('balance', 15, 2).defaultTo(0.0);
    t.string('currency', 10).defaultTo('KES');
    t.enu('status', ['active', 'suspended']).defaultTo('active');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.foreign('user_id').references('users.id').onDelete('CASCADE');
});
exports.up = up;
const down = (knex) => knex.schema.dropTableIfExists('wallets');
exports.down = down;
