const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const filesToWatch = [
  'docker-compose.yml',
  'backend/Dockerfile',
  'frontend/Dockerfile',
  'backend/package.json',
  'frontend/package.json',
];

console.log('🔍 Observando arquivos para rebuild automático...');
console.log('Arquivos monitorados:');
filesToWatch.forEach(file => console.log(`  - ${file}`));
console.log('\n💡 Quando houver mudanças, executarei: docker-compose up -d --build\n');

let isRebuilding = false;
let rebuildTimeout = null;

const rebuild = () => {
  if (isRebuilding) {
    console.log('⏳ Rebuild já em andamento, aguardando...');
    return;
  }

  // Debounce: aguarda 500ms antes de executar para evitar múltiplos rebuilds
  if (rebuildTimeout) {
    clearTimeout(rebuildTimeout);
  }

  rebuildTimeout = setTimeout(() => {
    isRebuilding = true;
    console.log('\n🔄 Detectada mudança! Executando rebuild...\n');
    
    exec('docker-compose up -d --build', (error, stdout, stderr) => {
      isRebuilding = false;
      
      if (error) {
        console.error('❌ Erro ao fazer rebuild:', error.message);
        return;
      }
      
      if (stdout) console.log(stdout);
      if (stderr && !stderr.includes('WARNING')) console.error(stderr);
      
      console.log('✅ Rebuild concluído!\n');
    });
  }, 500);
};

// Função para verificar se o arquivo existe
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
};

// Função para assistir um arquivo
const watchFile = (filePath) => {
  if (!fileExists(filePath)) {
    console.warn(`⚠️  Arquivo não encontrado: ${filePath}`);
    return;
  }

  const fullPath = path.resolve(filePath);
  const dir = path.dirname(fullPath);
  const filename = path.basename(fullPath);

  // Watch no diretório para detectar mudanças no arquivo
  fs.watch(dir, { recursive: false }, (eventType, changedFile) => {
    if (changedFile === filename || changedFile === filePath) {
      console.log(`📝 Arquivo alterado: ${filePath}`);
      rebuild();
    }
  });

  console.log(`✅ Monitorando: ${filePath}`);
};

// Iniciar watch em todos os arquivos
filesToWatch.forEach(watchFile);

console.log('\n✨ Watch ativo! Pressione Ctrl+C para parar.\n');
