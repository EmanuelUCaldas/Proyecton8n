
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

/**
 * @param {Object} options
 * @param {string} options.usuario - Correo de Zoom
 * @param {string} options.contrasena - Contraseña de Zoom
 * @param {string} options.reunionId - ID de reunión Zoom
 */
async function descargarAsistentes({ usuario, contrasena, reunionId }) {
  // 1. Obtener fecha actual en formato YYYY-MM-DD
  const hoy = new Date();
  //const yyyy = hoy.getFullYear();
  //const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  //const dd = String(hoy.getDate()).padStart(2, '0');
  const fecha = `${2025}-${05}-${23}`;

  // 2. Ruta de descarga
  const carpetaReportes = path.resolve(__dirname, 'reportes_zoom');
  if (!fs.existsSync(carpetaReportes)) {
    fs.mkdirSync(carpetaReportes);
  }

  const nombreArchivo = `asistentes_zoom_${fecha}.csv`;
  const rutaDescarga = path.join(carpetaReportes, nombreArchivo);

const { execSync } = require('child_process');
const perfilZoom = '/home/emanuel/chrome-profile-zoom';

// Verifica si hay procesos que usan ese perfil antes de matar
const cookiePath = path.join(perfilZoom, 'Default', 'Cookies');
const sessionPath = path.join(perfilZoom, 'Default', 'Sessions');

[ cookiePath, sessionPath ].forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.rmSync(file, { recursive: true, force: true });
      console.log(`🧹 Eliminado: ${file}`);
    }
  } catch (e) {
    console.log(`⚠️ No se pudo eliminar ${file}:`, e.message);
  }
});

  // 3. Navegador
  const contexto = await chromium.launchPersistentContext('/home/emanuel/chrome-profile-zoom', {
    headless: false,
    acceptDownloads: true,
    slowMo: 100,
args: [
  '--disable-blink-features=AutomationControlled',
  '--disable-infobars',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--disable-extensions',
],
userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const pagina = await contexto.newPage();

await pagina.addInitScript(() => {
  // Borrar la bandera de webdriver
  Object.defineProperty(navigator, 'webdriver', {
    get: () => false,
  });

  // Fake los plugins y languages
  Object.defineProperty(navigator, 'plugins', {
    get: () => [1, 2, 3],
  });

  Object.defineProperty(navigator, 'languages', {
    get: () => ['en-US', 'en'],
  });
});


  // 4. Limpiar sesión previa
  await contexto.clearCookies();
  await pagina.goto('https://zoom.us');
  await pagina.evaluate(() => localStorage.clear());
  await pagina.evaluate(() => sessionStorage.clear());

  // 5. Login

// 5. Login actualizado
await pagina.goto('https://zoom.us/signin');
await pagina.waitForTimeout(5000);

// Paso 1: Ingresar correo
await pagina.fill('#email', usuario,{ delay: 100 });

// Paso 2: Clic en "Next"
await pagina.click('button:has-text("Next")');
await pagina.waitForTimeout(4000);

// Paso 3: Ingresar contraseña
await pagina.fill('#password', contrasena,{ delay: 100 });

// Paso 4: Clic en "Sign In"
await pagina.click('#js_btn_login');
await pagina.waitForTimeout(5000);

  // 6. Ir a reporte
  await pagina.goto('https://zoom.us/account/report?isPersonal=true');
  await pagina.waitForTimeout(3000);

  const urlReportes = `https://zoom.us/account/report?isPersonal=true#/usageReports/historyMeeting?dateFrom=${fecha}&dateTo=${fecha}&page=1`;
  await pagina.goto(urlReportes);
  await pagina.waitForTimeout(6000);

  // 7. Buscar fila de reunión
  const filas = await pagina.locator('tr').all();
  for (const fila of filas) {
    const textoFila = await fila.textContent();
    if (textoFila && textoFila.replace(/\s/g, '').includes(reunionId.replace(/\s/g, ''))) {
      const link = fila.locator('a');
      if (await link.isVisible()) {
        await link.scrollIntoViewIfNeeded();
        await link.click();
        break;
      }
    }
  }

  await pagina.waitForTimeout(4000);

  // 8. Activar "Mostrar usuarios exclusivos"

const posiblesEtiquetas = [
  'label:has-text("Mostrar usuarios exclusivos")',
  'label:has-text("mostrar usuarios exclusivos")',
  'label:has-text("Show Unique Users")',
  'label:has-text("show unique users")',
];

let marcado = false;

for (const selector of posiblesEtiquetas) {
  const label = pagina.locator(selector);
  if (await label.isVisible()) {
    await label.click();
    await pagina.waitForTimeout(4000); // esperar a que se active
    console.log(`☑️ Checkbox marcado usando: ${selector}`);
    marcado = true;
    break;
  }
}

if (!marcado) {
  console.warn('⚠️ No se encontró ningún label de "usuarios exclusivos" para marcar');
}

  // 9. Exportar
  const exportarBtn = pagina.locator('button.participant-export--btn');
  await exportarBtn.click();

  // 10. Esperar descarga
  let download = null;
  for (let i = 0; i < 60; i++) {
    try {
      download = await pagina.waitForEvent('download', { timeout: 1000 });
      break;
    } catch {
      console.log(`⌛ Esperando archivo... ${i + 1}s`);
    }
  }

  if (!download) throw new Error('⛔ Tiempo agotado esperando la descarga');

  await download.saveAs(rutaDescarga);
  console.log(`✅ Archivo guardado en: ${rutaDescarga}`);

  await contexto.close();
  return rutaDescarga;
}

module.exports = { descargarAsistentes };
