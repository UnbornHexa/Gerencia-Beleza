# Gerência Beleza - Frontend

Frontend da aplicação Gerência Beleza construído com React + Vite + Tailwind CSS + shadcn/ui.

## Recursos Visuais

### Favicons e Ícones
- Todos os favicons foram copiados de `ssr-app/source/docs/img/favicon/`
- Inclui suporte para:
  - Apple Touch Icons (vários tamanhos)
  - Android Chrome Icons
  - Microsoft Tiles
  - Safari Pinned Tab
  - Favicon padrão

### Imagens e SVGs
- Imagens de autenticação em `src/assets/images/autenticacao/`
- Placeholder de avatar em `src/assets/images/all/`
- Backgrounds e outros recursos visuais

### Fontes
- Montserrat (Regular, Medium, Bold, ExtraBold)
- Fonte de ícones personalizada (gb-icons.woff)

## Estrutura de Assets

```
frontend/
├── public/
│   ├── favicon/          # Todos os favicons
│   ├── fonts/            # Fontes (Montserrat, gb-icons)
│   ├── favicon.ico       # Favicon principal
│   ├── apple-touch-icon.png
│   ├── site.webmanifest  # Web App Manifest
│   └── browserconfig.xml # Configuração Microsoft
└── src/
    └── assets/
        └── images/       # SVGs e imagens da aplicação
            ├── autenticacao/
            ├── bem-vindo/
            └── all/
```

## Uso

Os recursos visuais estão integrados automaticamente:
- Favicons aparecem automaticamente no navegador
- Logo aparece nas páginas de login/registro
- Avatar placeholder disponível via componente `<Avatar />`
- Imagens de autenticação nas telas de login/registro

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

