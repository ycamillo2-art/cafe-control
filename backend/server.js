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

// ... (existing routes will be kept, but I'll add the catch-all for React)

// AFTER all API routes
// ...

// --- ROUTES ---

// Producers
app.get('/api/producers', async (req, res) => {
 try {
 const producers = await db('producers').select('*');

 // Calculate summaries for each producer
 const result = await Promise.all(producers.map(async (p) => {
 const guides = await db('guides').where({ producer_id: p.id, status: 'FINALIZADO' });
 const sales = await db('sales').where({ producer_id: p.id });

 const totalMilled = guides.reduce((acc, g) => acc + Number(g.weight_milled), 0);
 const totalSold = sales.reduce((acc, s) => acc + Number(s.quantity), 0);

 return {
 ...p,
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
 const [id] = await db('producers').insert({ name });
 res.status(201).json({ id, name });
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
app.post('/api/guides', async (req, res) => {
 try {
 const { guide_number, date, producer_id, weight_mature } = req.body;
 const [id] = await db('guides').insert({
 guide_number,
 date,
 producer_id,
 weight_mature,
 status: 'PENDENTE'
 });
 res.status(201).json({ id });
 } catch (err) {
 res.status(500).json({ error: err.message });
 }
});

app.patch('/api/guides/:id', async (req, res) => {
 try {
 const { id } = req.params;
 const { weight_milled } = req.body;

 const guide = await db('guides').where({ id }).first();
 if (!guide) return res.status(404).json({ error: 'Guide not found' });

 const yield_pct = (weight_milled / guide.weight_mature) * 100;

 await db('guides').where({ id }).update({
 weight_milled,
 yield_pct,
 status: 'FINALIZADO'
 });

 res.json({ message: 'Guide updated successfully' });
 } catch (err) {
 res.status(500).json({ error: err.message });
 }
});

// Sales
app.post('/api/sales', async (req, res) => {
 try {
 const { date, producer_id, quantity, price_per_kg } = req.body;

 // Validate stock
 const guides = await db('guides').where({ producer_id, status: 'FINALIZADO' });
 const sales = await db('sales').where({ producer_id });

 const totalMilled = guides.reduce((acc, g) => acc + Number(g.weight_milled), 0);
 const totalSold = sales.reduce((acc, s) => acc + Number(s.quantity), 0);
 const balance = totalMilled - totalSold;

 if (quantity > balance) {
 return res.status(400).json({ error: 'Insuficiente saldo em estoque' });
 }

 const total_value = quantity * price_per_kg;

 const [id] = await db('sales').insert({
 date,
 producer_id,
 quantity,
 price_per_kg,
 total_value
 });

 res.status(201).json({ id });
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

// Start Server
initDb().then(() => {
 app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
 });
});
