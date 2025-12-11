# Guia de Início Rápido - Gerência Beleza

## 🚀 Início Rápido com Docker

### 1. Pré-requisitos
- Docker e Docker Compose instalados
- Portas 3000, 3001 e 27017 disponíveis

### 2. Executar o Projeto

```bash
# Clone o repositório (se ainda não tiver)
# cd gerencia-beleza

# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar os serviços
docker-compose down
```

### 3. Acessar a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **MongoDB**: localhost:27017

### 4. Primeiro Acesso

1. Acesse http://localhost:3000
2. Clique em "Criar conta"
3. Preencha o formulário de registro
4. Após o registro, você será redirecionado para o Dashboard

## 📝 Desenvolvimento Local

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuração de Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais de APIs externas (opcional).

## 📚 Funcionalidades Principais

1. **Autenticação**: Login e registro com validação
2. **Clientes**: CRUD completo de clientes
3. **Serviços**: Gerenciamento de serviços oferecidos
4. **Agenda**: Visualização por dia, semana ou mês
5. **Finanças**: Controle de ganhos e despesas com gráficos
6. **Dashboard**: Visão geral com métricas e próximos agendamentos
7. **Perfil**: Edição de dados e configuração de mensagens WhatsApp
8. **Insights**: Análises inteligentes de padrões e tendências

## 🐛 Solução de Problemas

### MongoDB não inicia
```bash
docker-compose down -v
docker-compose up -d
```

### Porta já em uso
Edite o `docker-compose.yml` e altere as portas:
- Frontend: `3000:3000` → `3002:3000`
- Backend: `3001:3001` → `3003:3001`

### Erro de permissão
```bash
sudo docker-compose up -d
```

## 📖 Documentação Completa

Consulte o `README.md` para documentação detalhada.

