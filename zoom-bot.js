const { chromium } = require('playwright');

async function registrarEnZoom(nombreCompleto, url_zoom, contexto) {
  console.log(`🚀 Iniciando registro para: ${nombreCompleto}`);
  const pagina = await contexto.newPage();

  // 1. Ir a la URL de Zoom
  await pagina.goto(url_zoom, { waitUntil: 'load', timeout: 60000 });
  await pagina.waitForTimeout(6000); // Espera de carga

  // 2. Forzar clic dentro del frame para dar foco
  await pagina.mouse.click(300, 300); // Punto neutro
  await pagina.waitForTimeout(500); // Garantizar foco

  // 3. Esperar y hacer clic en el botón para continuar sin mic/cámara
try {
  // Click tradicional (primer intento)
  const boton = pagina.locator('text=Continue without microphone and camera');
  await boton.focus();
  await boton.click();
  console.log('✅ Click directo en botón "Continue without microphone and camera".');

  // Redundancia segura: click nativo en el DOM
  await pagina.evaluate(() => {
    const botonAlterno = document.querySelector('div.continue-without-mic-camera');
    if (botonAlterno) botonAlterno.click();
  });

  await pagina.waitForTimeout(1500); // Esperar a que desaparezca modal
} catch (e) {
  console.warn('⚠️ Falló la interacción con el botón:', e.message);
}



  // 🔁 Interacción redundante que garantiza cierre del modal
  //try {
    //const botonSinCamara = await pagina.getByText('Continue without microphone and camera', { exact: false });
    //await botonSinCamara.scrollIntoViewIfNeeded();
    //await botonSinCamara.hover();
    //await pagina.mouse.down();
    //await pagina.mouse.up();
    //await botonSinCamara.click(); // Clic redundante
    //await pagina.waitForTimeout(1500); // Esperar cierre de modal
 // } catch (err) {
    //console.warn('⚠️ Falló interacción alternativa con el botón:', err.message);
  //}

  // 4. Esperar input y rellenar nombre
try {
  const inputLocator = pagina.locator('input#input-for-name');
  await inputLocator.waitFor({ state: 'visible', timeout: 10000 });

  await inputLocator.click(); // Da foco real
  await pagina.waitForTimeout(300);

  await inputLocator.press('Control+A');
  await inputLocator.press('Backspace');

  await inputLocator.type(nombreCompleto, { delay: 100 });

  await pagina.waitForTimeout(1000);
  await pagina.click('button:has-text("Join")');

  console.log(`✅ ${nombreCompleto} enviado correctamente al botón Join`);
} catch (e) {
  console.error(`❌ Error al escribir nombre "${nombreCompleto}":`, e.message);
}

  // 5. Hacer clic en botón "Join"
  await pagina.click('button:has-text("Join")');
  console.log(`✅ ${nombreCompleto} enviado al botón "Join"`);
}

module.exports = { registrarEnZoom };
