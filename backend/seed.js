const { db, initDb } = require('./database');

async function seed() {
  await initDb();
  
  console.log('Limpando dados antigos...');
  await db('sales').del();
  await db('guides').del();
  await db('producers').del();

  const producerNames = [
    'João da Silva', 'Maria Oliveira', 'José Santos', 'Ana Souza', 'Pedro Costa',
    'Francisca Ferreira', 'Antônio Rodrigues', 'Adriana Almeida', 'Carlos Gomes', 'Sônia Lima'
  ];

  console.log('Inserindo 10 produtores...');
  const producers = [];
  for (const name of producerNames) {
    const [id] = await db('producers').insert({ name }).returning('id');
    // Handle both SQLite (array of IDs) and PG (array of objects)
    const producerId = typeof id === 'object' ? id.id : id;
    producers.push({ id: producerId, name });
  }

  console.log('Inserindo 10 entradas (guias)...');
  for (let i = 0; i < 10; i++) {
    const producer = producers[i % producers.length];
    const weight_mature = Math.floor(Math.random() * 1000) + 500; // 500 a 1500 kg
    const weight_milled = Math.floor(weight_mature * (Math.random() * 0.2 + 0.15)); // 15% a 35% de rendimento
    const yield_pct = (weight_milled / weight_mature) * 100;
    
    await db('guides').insert({
      guide_number: `G2026-${String(i + 1).padStart(3, '0')}`,
      date: '2026-05-01',
      producer_id: producer.id,
      weight_mature,
      weight_milled,
      yield_pct,
      status: 'FINALIZADO'
    });
  }

  console.log('Inserindo 10 vendas...');
  for (let i = 0; i < 10; i++) {
    const producer = producers[i % producers.length];
    // Pegar o saldo disponível (só pilado)
    const guides = await db('guides').where({ producer_id: producer.id, status: 'FINALIZADO' });
    const totalMilled = guides.reduce((acc, g) => acc + Number(g.weight_milled), 0);
    
    const quantity = Math.floor(totalMilled * 0.5); // Vende metade do que pilou
    const price_per_kg = Math.floor(Math.random() * 5) + 15; // R$ 15 a 20 por kg
    
    if (quantity > 0) {
      await db('sales').insert({
        date: '2026-05-04',
        producer_id: producer.id,
        quantity,
        price_per_kg,
        total_value: quantity * price_per_kg
      });
    }
  }

  console.log('Seed finalizado com sucesso!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
