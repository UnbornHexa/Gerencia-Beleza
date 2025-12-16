const { exec } = require('child_process');
const chokidar = require('chokidar');
const path = require('path');

// Arquivos Docker que requerem rebuild completo
const dockerFilesToWatch = [
  'docker-compose.yml',
  'backend/Dockerfile',
  'frontend/Dockerfile',
  'backend/package.json',
  'frontend/package.json',
];

// Diretórios de código fonte que requerem restart do serviço
const sourceDirsToWatch = [
  'frontend/src',
  'backend/src',
];

console.log('🔍 Observando arquivos para rebuild automático...');
console.log('\n📦 Arquivos Docker monitorados (requerem rebuild):');
dockerFilesToWatch.forEach(file => console.log(`  - ${file}`));
console.log('\n💻 Diretórios de código monitorados (requerem restart):');
sourceDirsToWatch.forEach(dir => console.log(`  - ${dir}`));
console.log('\n💡 Mudanças em arquivos Docker: docker-compose up -d --build');
console.log('💡 Mudanças em código: docker-compose restart frontend/backend\n');

let isRebuilding = false;
let isRestarting = false;
let rebuildTimeout = null;
let restartTimeout = null;

const rebuildDocker = () => {
  if (isRebuilding) {
    console.log('⏳ Rebuild já em andamento, aguardando...');
    return;
  }

  if (rebuildTimeout) {
    clearTimeout(rebuildTimeout);
  }

  rebuildTimeout = setTimeout(() => {
    isRebuilding = true;
    console.log('\n🔄 Detectada mudança em arquivo Docker! Executando rebuild...\n');
    
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

const restartService = (service) => {
  if (isRestarting) {
    return;
  }

  if (restartTimeout) {
    clearTimeout(restartTimeout);
  }

  restartTimeout = setTimeout(() => {
    isRestarting = true;
    console.log(`\n🔄 Detectada mudança em código! Reiniciando serviço ${service}...\n`);
    
    exec(`docker-compose restart ${service}`, (error, stdout, stderr) => {
      isRestarting = false;
      
      if (error) {
        console.error(`❌ Erro ao reiniciar ${service}:`, error.message);
        return;
      }
      
      if (stdout) console.log(stdout);
      if (stderr && !stderr.includes('WARNING')) console.error(stderr);
      
      console.log(`✅ Serviço ${service} reiniciado!\n`);
    });
  }, 1000);
};

// Watch arquivos Docker
dockerFilesToWatch.forEach(file => {
  const watcher = chokidar.watch(file, {
    ignored: /(^|[\/\\])\../, // ignora arquivos ocultos
    persistent: true,
  });

  watcher.on('change', (filePath) => {
    console.log(`📝 Arquivo Docker alterado: ${filePath}`);
    rebuildDocker();
  });

  console.log(`✅ Monitorando: ${file}`);
});

// Watch diretórios de código
sourceDirsToWatch.forEach(dir => {
  const service = dir.startsWith('frontend') ? 'frontend' : 'backend';
  
  const watcher = chokidar.watch(dir, {
    ignored: [
      /(^|[\/\\])\../, // ignora arquivos ocultos
      /node_modules/,
      /dist/,
      /\.git/,
    ],
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on('change', (filePath) => {
    console.log(`📝 Código alterado: ${filePath}`);
    restartService(service);
  });

  console.log(`✅ Monitorando: ${dir} (serviço: ${service})`);
});

console.log('\n✨ Watch ativo! Pressione Ctrl+C para parar.\n');
