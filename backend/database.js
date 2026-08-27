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
      table.decimal('commission_pct').notNullable().defaultTo(0);
    });
  } else {
    const hasColumn = await db.schema.hasColumn('producers', 'harvest_finished_at');
    if (!hasColumn) {
      await db.schema.table('producers', table => {
        table.dateTime('harvest_finished_at').nullable();
      });
    }
    const hasCommission = await db.schema.hasColumn('producers', 'commission_pct');
    if (!hasCommission) {
      await db.schema.table('producers', table => {
        table.decimal('commission_pct').notNullable().defaultTo(0);
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
      table.decimal('commission_kg').nullable().defaultTo(0);
      table.string('status').defaultTo('PENDENTE');
      table.timestamps(true, true);
    });
  } else {
    const hasCommissionKg = await db.schema.hasColumn('guides', 'commission_kg');
    if (!hasCommissionKg) {
      await db.schema.table('guides', table => {
        table.decimal('commission_kg').nullable().defaultTo(0);
      });
      // Backfill único: guias já finalizadas recebem a comissão com a taxa vigente do produtor
      const producers = await db('producers').select('id', 'commission_pct');
      const finalized = await db('guides').where({ status: 'FINALIZADO' }).whereNull('commission_kg');
      for (const g of finalized) {
        const prod = producers.find(p => p.id === g.producer_id);
        const pct = Number(prod ? prod.commission_pct || 0 : 0);
        const kg = Number(g.weight_milled || 0) * (pct / 100);
        await db('guides').where({ id: g.id }).update({ commission_kg: kg });
      }
    }
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
