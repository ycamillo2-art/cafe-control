# CaféControl - Sistema de Gestão de Café

Sistema web simplificado para controle de estoque de café por produtor, com foco em facilidade de uso em dispositivos móveis.

## Como rodar o projeto

### Pré-requisitos
- Node.js instalado

### 1. Backend
1. Entre na pasta `backend`:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   node server.js
   ```
O servidor rodará em `http://localhost:5000`.

### 2. Frontend
1. Entre na pasta `frontend`:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie a aplicação:
   ```bash
   npm run dev
   ```
A aplicação abrirá em `http://localhost:5173`.

## Funcionalidades
- **Dashboard**: Lista de produtores com saldo atual.
- **Entrada de Café**: Registro de guias com peso maduro.
- **Finalização de Pilagem**: Atualização do peso pilado e cálculo de rendimento.
- **Vendas**: Registro de vendas com validação automática de estoque.
- **Relatórios**: Geração de relatório para o produtor via função de impressão do navegador.
