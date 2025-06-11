const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

let intentosVerificacion = 0; // Límite global
const maxIntentos = 2;

async function descargarUsuarios({ usuario, contrasena, url }) {
  const perfilCampus = '/home/emanuel/chrome-profile-campus';
  const nombreArchivo = 'descarga_usuarios.xlsx';
  const rutaDescarga = path.resolve(__dirname, nombreArchivo);


  // 4. Lanzar navegador con el perfil
  const contexto = await chromium.launchPersistentContext(perfilCampus, {
    headless: false,
    acceptDownloads: true,
    slowMo: 50,
  });

  const pagina = await contexto.newPage();

  // 5. Lógica de navegación
  await pagina.goto(url);
  await pagina.fill('#username', usuario);
  await pagina.fill('#password', contrasena);
  await pagina.click('button[type="submit"]');
  await pagina.waitForTimeout(5000);

  await pagina.click('#checkall');
  await pagina.waitForTimeout(5000);

  const label = await pagina.locator('text=Con los usuarios seleccionados...').first();
  const box = await label.boundingBox();
  await pagina.mouse.click(box.x + 200, box.y + 5);
  await pagina.waitForTimeout(3000);

  for (let i = 0; i < 4; i++) await pagina.keyboard.press('ArrowDown');
  await pagina.keyboard.press('Enter');

  // 6. Descargar archivo
  const [download] = await Promise.all([
    pagina.waitForEvent('download', { timeout: 30000 }),
    pagina.waitForTimeout(1000),
  ]);

  await download.saveAs(rutaDescarga);
  await contexto.close();

  return rutaDescarga;
}

module.exports = { descargarUsuarios };

