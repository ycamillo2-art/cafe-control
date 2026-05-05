const knex = require('knex');
const path = require('path');

const config = process.env.DATABASE_URL 
  ? {
      client: 'pg',
      connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    }
  : {
      client: 'sqlite3',
      connection: {
        filename: path.join(__dirname, 'database.sqlite')
      },
      useNullAsDefault: true
    };

const db = knex(config);

async function initDb() {
  const existsProducers = await db.schema.hasTable('producers');
  if (!existsProducers) {
    await db.schema.createTable('producers', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.dateTime('harvest_finished_at').nullable();
    });
  } else {
    const hasColumn = await db.schema.hasColumn('producers', 'harvest_finished_at');
    if (!hasColumn) {
      await db.schema.table('producers', table => {
        table.dateTime('harvest_finished_at').nullable();
      });
    }
  }

  const existsGuides = await db.schema.hasTable('guides');
  if (!existsGuides) {
    await db.schema.createTable('guides', table => {
      table.increments('id').primary();
      table.string('guide_number').unique().notNullable();
      table.date('date').notNullable();
      table.integer('producer_id').unsigned().references('id').inTable('producers');
      table.decimal('weight_mature').notNullable();
      table.decimal('weight_milled').nullable();
      table.decimal('yield_pct').nullable();
      table.string('status').defaultTo('PENDENTE');
      table.timestamps(true, true);
    });
  }

  const existsSales = await db.schema.hasTable('sales');
  if (!existsSales) {
    await db.schema.createTable('sales', table => {
      table.increments('id').primary();
      table.date('date').notNullable();
      table.integer('producer_id').unsigned().references('id').inTable('producers');
      table.decimal('quantity').notNullable();
      table.decimal('price_per_kg').notNullable();
      table.decimal('total_value').notNullable();
      table.boolean('is_post_harvest').defaultTo(false);
      table.timestamps(true, true);
    });
  } else {
    const hasColumn = await db.schema.hasColumn('sales', 'is_post_harvest');
    if (!hasColumn) {
      await db.schema.table('sales', table => {
        table.boolean('is_post_harvest').defaultTo(false);
      });
    }
  }
}

module.exports = { db, initDb };
