const express = require('express');
const cors = require('cors');
const { initDb, db } = require('./database');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Static files for Frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

const PORT = process.env.PORT || 5000;

// API Routes
app.get('/api/health', (req, res) => {
  res.send('API is healthy');
});

app.get('/api/seed', async (req, res) => {
  try {
    const producerNames = [
      'João da Silva', 'Maria Oliveira', 'José Santos', 'Ana Souza', 'Pedro Costa',
      'Francisca Ferreira', 'Antônio Rodrigues', 'Adriana Almeida', 'Carlos Gomes', 'Sônia Lima'
    ];

    await db('sales').del();
    await db('guides').del();
    await db('producers').del();

    const producers = [];
    for (const name of producerNames) {
      const [idObj] = await db('producers').insert({ name }).returning('id');
      const id = typeof idObj === 'object' ? idObj.id : idObj;
      producers.push({ id, name });
    }

    for (let i = 0; i < 10; i++) {
      const producer = producers[i % producers.length];
      const weight_mature = Math.floor(Math.random() * 1000) + 500;
      const weight_milled = Math.floor(weight_mature * (Math.random() * 0.2 + 0.15));
      
      await db('guides').insert({
        guide_number: `G2026-${String(i + 1).padStart(3, '0')}`,
        date: '2026-05-01',
        producer_id: producer.id,
        weight_mature,
        weight_milled,
        yield_pct: (weight_milled / weight_mature) * 100,
        status: 'FINALIZADO'
      });
    }

    for (let i = 0; i < 10; i++) {
      const producer = producers[i % producers.length];
      const guides = await db('guides').where({ producer_id: producer.id, status: 'FINALIZADO' });
      const totalMilled = guides.reduce((acc, g) => acc + Number(g.weight_milled), 0);
      const quantity = Math.floor(totalMilled * 0.5);
      
      if (quantity > 0) {
        const price_per_kg = Math.floor(Math.random() * 5) + 15;
        await db('sales').insert({
          date: '2026-05-04',
          producer_id: producer.id,
          quantity,
          price_per_kg,
          total_value: quantity * price_per_kg
        });
      }
    }
    res.send('Seed finalizado com sucesso! Pode voltar ao dashboard.');
  } catch (err) {
    res.status(500).send('Erro no seed: ' + err.message);
  }
});

// Producers
app.get('/api/producers', async (req, res) => {
  try {
    const producers = await db('producers').select('*');
    const result = await Promise.all(producers.map(async (p) => {
      const guides = await db('guides').where({ producer_id: p.id });
      const sales = await db('sales').where({ producer_id: p.id });
      
      const totalMature = guides.reduce((acc, g) => acc + Number(g.weight_mature), 0);
      const totalMilled = guides.filter(g => g.status === 'FINALIZADO').reduce((acc, g) => acc + Number(g.weight_milled), 0);
      const totalSold = sales.reduce((acc, s) => acc + Number(s.quantity), 0);

      return {
        ...p,
        total_mature: totalMature,
        total_milled: totalMilled,
        total_sold: totalSold,
        balance: totalMilled - totalSold
      };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/producers', async (req, res) => {
  try {
    const { name } = req.body;
    const [idObj] = await db('producers').insert({ name }).returning('id');
    const id = typeof idObj === 'object' ? idObj.id : idObj;
    res.status(201).json({ id, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/producers/:id', async (req, res) => {
  try {
    const { name } = req.body;
    await db('producers').where({ id: req.params.id }).update({ name });
    res.json({ message: 'Produtor atualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/producers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db('sales').where({ producer_id: id }).del();
    await db('guides').where({ producer_id: id }).del();
    await db('producers').where({ id }).del();
    res.json({ message: 'Produtor e todos os dados relacionados foram excluídos' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/producers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const producer = await db('producers').where({ id }).first();
    if (!producer) return res.status(404).json({ error: 'Producer not found' });

    const guides = await db('guides').where({ producer_id: id }).orderBy('date', 'desc');
    const sales = await db('sales').where({ producer_id: id }).orderBy('date', 'desc');

    const totalMilled = guides.filter(g => g.status === 'FINALIZADO').reduce((acc, g) => acc + Number(g.weight_milled), 0);
    const totalMature = guides.reduce((acc, g) => acc + Number(g.weight_mature), 0);
    const totalSold = sales.reduce((acc, s) => acc + Number(s.quantity), 0);

    res.json({
      ...producer,
      summary: {
        total_mature: totalMature,
        total_milled: totalMilled,
        total_sold: totalSold,
        balance: totalMilled - totalSold
      },
      guides,
      sales
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Guides
app.get('/api/guides/:id', async (req, res) => {
  try {
    const guide = await db('guides').where({ id: req.params.id }).first();
    if (!guide) return res.status(404).json({ error: 'Guide not found' });
    res.json(guide);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/guides', async (req, res) => {
  try {
    const { guide_number, date, producer_id, weight_mature } = req.body;
    const [idObj] = await db('guides').insert({
      guide_number,
      date,
      producer_id,
      weight_mature,
      status: 'PENDENTE'
    }).returning('id');
    const id = typeof idObj === 'object' ? idObj.id : idObj;
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/guides/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { weight_milled, weight_mature, guide_number, date } = req.body;
    const guide = await db('guides').where({ id }).first();
    if (!guide) return res.status(404).json({ error: 'Guide not found' });
    
    const updateData = {};
    if (weight_mature !== undefined) updateData.weight_mature = weight_mature;
    if (weight_milled !== undefined) updateData.weight_milled = weight_milled;
    if (guide_number !== undefined) updateData.guide_number = guide_number;
    if (date !== undefined) updateData.date = date;

    if (updateData.weight_mature !== undefined || updateData.weight_milled !== undefined) {
      const finalMature = updateData.weight_mature !== undefined ? updateData.weight_mature : guide.weight_mature;
      const finalMilled = updateData.weight_milled !== undefined ? updateData.weight_milled : guide.weight_milled;
      updateData.yield_pct = finalMature > 0 ? (finalMilled / finalMature) * 100 : 0;
      updateData.status = 'FINALIZADO';
    }

    await db('guides').where({ id }).update(updateData);
    res.json({ message: 'Guia atualizada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/guides/:id', async (req, res) => {
  try {
    await db('guides').where({ id: req.params.id }).del();
    res.json({ message: 'Guia excluída' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/producers/:id/finish-harvest', async (req, res) => {
  try {
    const { id } = req.params;
    await db('producers').where({ id }).update({ harvest_finished_at: new Date() });
    res.json({ message: 'Safra finalizada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sales
app.post('/api/sales', async (req, res) => {
  try {
    const { date, producer_id, quantity, price_per_kg } = req.body;
    const producer = await db('producers').where({ id: producer_id }).first();
    const guides = await db('guides').where({ producer_id, status: 'FINALIZADO' });
    const sales = await db('sales').where({ producer_id });
    const totalMilled = guides.reduce((acc, g) => acc + Number(g.weight_milled), 0);
    const totalSold = sales.reduce((acc, s) => acc + Number(s.quantity), 0);
    const balance = totalMilled - totalSold;

    if (quantity > balance) {
      return res.status(400).json({ error: 'Insuficiente saldo em estoque' });
    }

    const total_value = quantity * price_per_kg;
    const is_post_harvest = producer.harvest_finished_at !== null;

    const [idObj] = await db('sales').insert({
      date,
      producer_id,
      quantity,
      price_per_kg,
      total_value,
      is_post_harvest
    }).returning('id');
    const id = typeof idObj === 'object' ? idObj.id : idObj;
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/sales/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, price_per_kg, date } = req.body;
    const sale = await db('sales').where({ id }).first();
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    const updateData = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (price_per_kg !== undefined) updateData.price_per_kg = price_per_kg;
    if (date !== undefined) updateData.date = date;

    if (updateData.quantity !== undefined || updateData.price_per_kg !== undefined) {
      const finalQty = updateData.quantity !== undefined ? updateData.quantity : sale.quantity;
      const finalPrice = updateData.price_per_kg !== undefined ? updateData.price_per_kg : sale.price_per_kg;
      updateData.total_value = finalQty * finalPrice;
    }

    await db('sales').where({ id }).update(updateData);
    res.json({ message: 'Venda atualizada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sales/:id', async (req, res) => {
  try {
    await db('sales').where({ id: req.params.id }).del();
    res.json({ message: 'Venda excluída' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all to serve index.html for React Router
app.use((req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  }
});

// Start Server - Final attempt trigger: 1777999999
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
