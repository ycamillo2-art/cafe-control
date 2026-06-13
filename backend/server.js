const express = require('express');
const cors = require('cors');
const { initDb, db } = require('./database');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');

const app = express();
app.use(cors());
app.use(express.json());

// Memória local para cotações
let currentQuotes = null;

// Função para buscar cotações da Cooabriel
const fetchQuotes = async () => {
  try {
    const url = "https://cooabriel.coop.br/cotacao-do-dia/";
    const { data } = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(data);
    const table = $('table');
    const quotes = {};
    
    if (table.length) {
      table.find('tr').each((i, row) => {
        if (i === 0) return; // pular header
        const cols = $(row).find('td');
        if (cols.length >= 4) {
          const tipo = $(cols[0]).text().trim();
          const preco = $(cols[3]).text().trim();
          if (tipo.includes("Conilon 7") || tipo.includes("Conilon 8")) {
            quotes[tipo] = preco;
          }
        }
      });
    }

    if (Object.keys(quotes).length > 0) {
      currentQuotes = {
        updated_at: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        quotes: quotes
      };
      console.log("Cotações atualizadas:", currentQuotes.updated_at);
    }
  } catch (err) {
    console.error("Erro ao buscar cotações:", err.message);
  }
};

// Rodar a cada 10 minutos
cron.schedule('*/10 * * * *', fetchQuotes);
// Rodar uma vez ao iniciar
fetchQuotes();

// Static files for Frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

const PORT = process.env.PORT || 5000;

// Middleware de Autenticação Atualizado
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const validTokens = [
    'Basic UkQgQ29uaWxvbjoyNTA2OTg=', // RD Conilon:250698
    'Basic WWFnbyBjYW1pbGxvOjE3MDY5Mg==', // Yago camillo:170692
    'Basic R3JlZ29yeTowNjA0Nzc=' // Gregory:060477
  ];
  
  if (validTokens.includes(authHeader)) {
    return next();
  }
  res.status(401).json({ error: 'Acesso negado' });
};

// API Routes
app.get('/api/health', (req, res) => {
  res.send('API is healthy');
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = [
    { u: 'RD Conilon', p: '250698', d: 'Chistiany Dardengo', t: 'UkQgQ29uaWxvbjoyNTA2OTg=' },
    { u: 'Yago camillo', p: '170692', d: 'Yago camillo', t: 'WWFnbyBjYW1pbGxvOjE3MDY5Mg==' },
    { u: 'Gregory', p: '060477', d: 'Gregory Fortunato', t: 'R3JlZ29yeTowNjA0Nzc=' }
  ];

  const user = users.find(user => user.u === username && user.p === password);

  if (user) {
    res.json({ 
      token: user.t,
      displayName: user.d
    });
  } else {
    res.status(401).json({ error: 'Usuário ou senha incorretos' });
  }
});

// Proteger rotas da API
app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const producers = await db('producers').select('id');
    let totalMature = 0;
    let totalMilled = 0;
    let totalSold = 0;

    for (const p of producers) {
      const guides = await db('guides').where({ producer_id: p.id });
      const sales = await db('sales').where({ producer_id: p.id });
      
      totalMature += guides.reduce((acc, g) => acc + Number(g.weight_mature), 0);
      totalMilled += guides.filter(g => g.status === 'FINALIZADO').reduce((acc, g) => acc + Number(g.weight_milled), 0);
      totalSold += sales.reduce((acc, s) => acc + Number(s.quantity), 0);
    }

    res.json({
      total_mature: totalMature,
      total_milled: totalMilled,
      total_sold: totalSold,
      balance: totalMilled - totalSold,
      quotes: currentQuotes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/producers', authMiddleware, async (req, res) => {
  try {
    const producers = await db('producers').select('*').orderBy('name', 'asc');
    const results = await Promise.all(producers.map(async p => {
      const guides = await db('guides').where({ producer_id: p.id });
      const sales = await db('sales').where({ producer_id: p.id });
      
      const totalMature = guides.reduce((acc, g) => acc + Number(g.weight_mature), 0);
      const totalMilled = guides.filter(g => g.status === 'FINALIZADO').reduce((acc, g) => acc + Number(g.weight_milled), 0);
      const totalSold = sales.reduce((acc, s) => acc + Number(s.quantity), 0);
      
      return { 
        ...p, 
        balance: totalMilled - totalSold,
        total_mature: totalMature,
        total_milled: totalMilled,
        total_sold: totalSold
      };
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/producers', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const [idObj] = await db('producers').insert({ name }).returning('id');
    const id = typeof idObj === 'object' ? idObj.id : idObj;
    res.status(201).json({ id, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/producers/:id', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    await db('producers').where({ id: req.params.id }).update({ name });
    res.json({ message: 'Produtor atualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/producers/:id', authMiddleware, async (req, res) => {
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

app.get('/api/producers/:id', authMiddleware, async (req, res) => {
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

app.get('/api/guides/:id', authMiddleware, async (req, res) => {
  try {
    const guide = await db('guides').where({ id: req.params.id }).first();
    if (!guide) return res.status(404).json({ error: 'Guide not found' });
    res.json(guide);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/guides', authMiddleware, async (req, res) => {
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

app.patch('/api/guides/:id', authMiddleware, async (req, res) => {
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

app.delete('/api/guides/:id', authMiddleware, async (req, res) => {
  try {
    await db('guides').where({ id: req.params.id }).del();
    res.json({ message: 'Guia excluída' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/producers/:id/finish-harvest', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db('producers').where({ id }).update({ harvest_finished_at: new Date() });
    res.json({ message: 'Safra finalizada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sales', authMiddleware, async (req, res) => {
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

    const total_value = quantity * (price_per_kg || 0);
    const is_post_harvest = producer.harvest_finished_at !== null;

    const [idObj] = await db('sales').insert({
      date,
      producer_id,
      quantity,
      price_per_kg: price_per_kg || 0,
      total_value,
      is_post_harvest
    }).returning('id');
    const id = typeof idObj === 'object' ? idObj.id : idObj;
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/sales/:id', authMiddleware, async (req, res) => {
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

app.delete('/api/sales/:id', authMiddleware, async (req, res) => {
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

// Start Server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
