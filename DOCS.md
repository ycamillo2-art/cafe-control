# Documentação do Sistema de Controle de Café

## 1. Modelo de Dados (Banco de Dados)

### Tabela: `producers` (Produtores)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID / INT | Chave primária |
| `name` | STRING | Nome do produtor |

### Tabela: `guides` (Guias de Entrada)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID / INT | Chave primária |
| `guide_number` | STRING | Número da guia (Único) |
| `date` | DATE | Data da entrada |
| `producer_id` | FK | Relacionamento com Produtor |
| `weight_mature` | DECIMAL | Peso maduro (inicial) |
| `weight_milled` | DECIMAL | Peso pilado (preenchido depois) |
| `yield_pct` | DECIMAL | Rendimento calculado: (pilado / maduro) * 100 |
| `status` | STRING | `PENDENTE` ou `FINALIZADO` |

### Tabela: `sales` (Vendas)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID / INT | Chave primária |
| `date` | DATE | Data da venda |
| `producer_id` | FK | Relacionamento com Produtor |
| `quantity` | DECIMAL | Quantidade vendida (kg) |
| `price_per_kg` | DECIMAL | Valor por kg |
| `total_value` | DECIMAL | Quantidade * Valor |

---

## 2. API Endpoints (REST)

### Produtores
- `GET /api/producers`: Lista produtores com resumo (saldo, totais).
- `POST /api/producers`: Cadastra novo produtor.
- `GET /api/producers/:id`: Detalhes completos de um produtor (Histórico de guias e vendas).

### Guias (Entradas)
- `POST /api/guides`: Registra entrada inicial (Cria guia PENDENTE).
- `PATCH /api/guides/:id`: Atualiza peso pilado (Muda para FINALIZADO).

### Vendas
- `POST /api/sales`: Registra uma venda (Valida estoque e usa lógica FIFO internamente).

---

## 3. Lógica de Estoque e FIFO
1. O **Saldo** de um produtor é a soma de `weight_milled` de todas as suas guias `FINALIZADO` menos a soma de `quantity` de suas `sales`.
2. Ao registrar uma venda de $X$ kg:
   - O sistema busca as guias `FINALIZADO` do produtor por ordem de data (`ASC`).
   - Abate a quantidade vendida do "saldo disponível" dessas guias internamente (apenas para fins de histórico se necessário, mas para o usuário o que importa é o saldo global).
   - Impede a venda se $X > Saldo Total$.
