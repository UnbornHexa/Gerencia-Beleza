# Gerência Beleza - Plataforma de Gerenciamento para Profissionais Autônomos

Sistema full-stack moderno para gerenciamento de negócios de beleza (manicures à domicílio) com foco em integração rápida entre sistemas e deploy facilitado.

## 🚀 Stack Tecnológica

### Frontend
- **React 18** + **Vite** - Framework e build tool
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **React Router** - Roteamento
- **Recharts** - Gráficos
- **React Hook Form** - Formulários
- **Zod** - Validação
- **Axios** - Cliente HTTP
- **jspdf** - Geração de PDFs

### Backend
- **NestJS** - Framework Node.js
- **TypeScript** - Tipagem estática
- **MongoDB** + **Mongoose** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **class-validator** - Validação
- **Winston** - Logging

### Infraestrutura
- **Docker** + **Docker Compose** - Containerização
- **MongoDB** - Banco de dados

### APIs Externas
- **ViaCEP** - Busca de endereços por CEP (pública, sem autenticação)
- **IBGE API** - Busca de estados e municípios (pública, sem autenticação)
- **WhatsApp API** - Integração de mensagens (requer API key)
- **Google Calendar API** - Sincronização de agenda (opcional)

## 📋 Funcionalidades

### 1. Autenticação
- Login e registro de profissionais
- Integração com ViaCEP para busca de endereço por CEP
- Integração com IBGE API para busca de estados e municípios
- Validação de email único

### 2. CRUD de Clientes
- Cadastro completo de clientes
- Visualização de insights por cliente (serviços mais contratados, horários preferidos)
- Marcação de clientes VIP

### 3. CRUD de Serviços
- Cadastro de serviços com preço e observações
- Integração com agenda

### 4. Gestão Financeira
- Registro de ganhos e despesas
- Filtros por período (mês, 3 meses, 6 meses, ano)
- Gráficos de análise financeira
- Exportação de relatórios em PDF
- Categorização de despesas (Saúde, Educação, Alimentação, etc.)

### 5. Agenda
- Visualizações: dia, semana, mês
- Integração com serviços
- Cálculo automático de valores
- Confirmação de cancelamento com motivo

### 6. Dashboard
- Métricas de caixa (mês anterior, atual, próximo)
- Projeção de ganhos do dia
- Gráficos financeiros
- Próximos agendamentos (3 horas)
- Ações rápidas (adicionar ganho/despesa)

### 7. Perfil
- Edição de dados pessoais
- Troca de senha
- Configuração de mensagens padrão WhatsApp

### 8. Insights com IA
- Análise de padrões de clientes
- Top 3 serviços mais contratados
- Top 3 bairros com maior rendimento
- Lembretes automáticos baseados em padrões
- Detecção de clientes VIP

## 🛠️ Instalação e Execução

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 18+ (para desenvolvimento local)

### Execução com Docker Compose

1. Clone o repositório:
```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd gerencia-beleza
```

> **Nota**: Substitua `<URL_DO_SEU_REPOSITORIO>` pela URL real do seu repositório Git (ex: `https://github.com/seu-usuario/gerencia-beleza.git`)

2. Configure as variáveis de ambiente (opcional):
```bash
cp .env.example .env
# Edite o .env com suas credenciais de APIs externas
```

3. Execute o Docker Compose:
```bash
docker-compose up -d
```

4. Acesse a aplicação:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- MongoDB: localhost:27017

### Desenvolvimento Local

#### Backend
```bash
cd backend
npm install
npm run start:dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📁 Estrutura do Projeto

```
gerencia-beleza/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── auth/         # Módulo de autenticação
│   │   ├── users/        # Módulo de usuários
│   │   ├── clients/      # CRUD de clientes
│   │   ├── services/     # CRUD de serviços
│   │   ├── finances/     # Gestão financeira
│   │   ├── appointments/ # Agenda
│   │   ├── insights/     # Sistema de insights
│   │   └── common/       # Utilitários compartilhados
│   ├── Dockerfile
│   └── package.json
├── frontend/             # Aplicação React
│   ├── src/
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # Serviços API
│   │   ├── utils/        # Utilitários
│   │   └── lib/          # Configurações (shadcn/ui, etc)
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml    # Orquestração Docker
└── README.md
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# MongoDB
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/gerencia-beleza?authSource=admin

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# APIs Externas
# ViaCEP não requer configuração (API pública)
IBGE_API_URL=https://servicodados.ibge.gov.br/api/v1

# WhatsApp API (opcional - se não configurado, usa links do WhatsApp)
# IMPORTANTE: Esta é uma API key GLOBAL para todo o sistema
# Todos os usuários compartilham a mesma chave de API
WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_API_KEY=your-whatsapp-api-key

# Google Calendar (opcional)
GOOGLE_CALENDAR_CLIENT_ID=your-google-client-id
GOOGLE_CALENDAR_CLIENT_SECRET=your-google-client-secret

# Frontend
VITE_API_URL=http://localhost:3001
```

### 📌 Nota sobre API Keys

- **ViaCEP e IBGE API**: Não requerem autenticação, são APIs públicas e gratuitas
- **WhatsApp API Key**: É uma chave **global** para todo o sistema. Todos os profissionais autônomos que usam a plataforma compartilham a mesma API key. Se você precisar que cada cliente tenha sua própria chave, será necessário modificar a arquitetura para armazenar a chave por usuário no banco de dados
- **Google Calendar**: Opcional, usado apenas se você quiser sincronizar a agenda com o Google Calendar

## 📝 Scripts Disponíveis

### Backend
- `npm run start:dev` - Desenvolvimento com hot reload
- `npm run build` - Build de produção
- `npm run start:prod` - Execução em produção
- `npm run lint` - Linting
- `npm run test` - Testes

### Frontend
- `npm run dev` - Desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build
- `npm run lint` - Linting

## 🧪 Testes

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

## 📦 Deploy

### Hostinger

1. Configure as variáveis de ambiente no servidor
2. Execute `docker-compose up -d` no servidor
3. Configure proxy reverso (nginx) se necessário

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e de uso exclusivo.

## 👤 Autor

Gerência Beleza

---

**Nota**: Este sistema foi desenvolvido com foco em mobile-first, garantindo uma experiência otimizada tanto em desktop quanto em dispositivos móveis.

