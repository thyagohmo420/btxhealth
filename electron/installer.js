import { MSICreator } from 'electron-wix-msi';
import { resolve } from 'path';

async function createInstaller() {
  const msiCreator = new MSICreator({
    appDirectory: resolve(__dirname, '../dist-electron/win-unpacked'),
    outputDirectory: resolve(__dirname, '../dist-electron/installer'),
    description: 'Sistema de Gestão para Unidades de Saúde',
    exe: 'Hospital de Juquitiba',
    name: 'Hospital de Juquitiba',
    manufacturer: 'Hospital de Juquitiba',
    version: '1.0.0',
    ui: {
      chooseDirectory: true
    }
  });

  await msiCreator.create();
  await msiCreator.compile();
}

createInstaller().catch(console.error);