import { test, expect, Locator } from '@playwright/test';
const fs = require('fs/promises');

// Functions
const timeout = async time => {
    await new Promise(resolve => {
    setTimeout(() => {
      resolve("Ok");
    }, time);
  });
}

test('Promedio por periodo', async ({ page, context }) => {
  //Login
  await page.goto('https://landing.unapec.edu.do/banner/');
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByText('Acceso para estudiantes y egresados').click()
  ]);

  const { email, password } = JSON.parse(await fs.readFile(`${__dirname}/../credentials.json`, 'utf8'));
  await newPage.fill('input[name="loginfmt"]', email); // Inserte su email
  await newPage.locator('input[type="submit"]').click();
  await newPage.fill('input[name="passwd"]', password); // Inserte su password
  await newPage.locator('input[type="submit"]').click();
  await newPage.locator('input[id="idBtn_Back"]').click();
  const [newPage2] = await Promise.all([
    context.waitForEvent('page'),
    newPage.getByText('Ver calificaciones').click()
  ]);
  await newPage2.locator('div[xe-field="term"]').click();
  await timeout(2000)
  let peridos = [] as Object[];
  let options = await newPage2.locator('#select2-results-1 li').all();
  for(let i = 2; i < options.length; i++){
    const periodoTitle = await options[i].textContent();
    await options[i].click();
    await newPage2.locator('div[xe-field="level"]').click();
    await timeout(1000);
    await newPage2.locator('#GR').click();
    await timeout(1000);
    let rows = await newPage2.locator('#table1 tbody tr').all();
    let credits = 0;
    let value = 0;
    let materias = [] as Object[];
    await timeout(1000);
    for(let x = 0; x < rows.length; x++){
      const tds = await rows[x].locator('td').all();
      const creditsString = await tds[7].textContent();
      const valueString = await tds[8].textContent();
      const creditNumber = parseInt(creditsString!);
      const valueNumber = parseInt(valueString!)
      credits += creditNumber;
      value += valueNumber;
      materias.push({
        materia: await tds[1].textContent(),
        credito: creditNumber,
        value: valueNumber
      })
    }
    const promedio = parseFloat((value / credits).toFixed(2));
    let periodo = {
      periodo: periodoTitle,
      materias,
      promedio
    };
    peridos.push(periodo);
    await newPage2.locator('div[xe-field="term"]').click();
    await timeout(1000);
  }

  await fs.writeFile('Calificaciones.json', JSON.stringify(peridos));

  console.log(peridos)
});