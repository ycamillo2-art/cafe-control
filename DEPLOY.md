# Guia de Implantação (Deploy) no Render

Siga estes passos para colocar o **CaféControl** online rapidamente:

## 1. Criar um Repositório no GitHub
1. Crie um novo repositório vazio no seu GitHub.
2. No seu computador, abra a pasta do projeto e execute:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```

## 2. Configurar no Render.com
1. Crie uma conta no [Render](https://render.com/).
2. Clique em **New +** e escolha **Web Service**.
3. Conecte seu repositório do GitHub.
4. Use as seguintes configurações:
   - **Name**: `cafe-control` (ou outro de sua preferência)
   - **Runtime**: `Node`
   - **Build Command**: `npm run install-all && npm run build`
   - **Start Command**: `npm start`
5. **IMPORTANTE (Persistência)**:
   - Como estamos usando **SQLite**, os dados serão apagados toda vez que o Render reiniciar o servidor (pelo menos uma vez por dia no plano grátis).
   - Para um teste rápido, isso serve. Para uso real, no Render, vá em **Disk** e adicione um disco de 1GB (pago) montado em `/opt/render/project/src/backend/database.sqlite`.
   - *Alternativa Grátis*: Se quiser que os dados durem, me peça para trocar o SQLite pelo **PostgreSQL** do Render (eu posso fazer essa alteração se você quiser).

## 3. Acessar Online
- Assim que o build terminar, o Render te dará uma URL tipo `https://cafe-control.onrender.com`.
- O sistema estará pronto para uso!
