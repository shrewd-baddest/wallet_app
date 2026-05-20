"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const up = (knex) => knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('full_name', 100).notNullable();
    t.string('email', 100).unique().nullable();
    t.string('phone_number', 20).unique().notNullable();
    t.string('password', 255).notNullable();
    t.boolean('is_verified').defaultTo(false);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
});
exports.up = up;
const down = (knex) => knex.schema.dropTableIfExists('users');
exports.down = down;
