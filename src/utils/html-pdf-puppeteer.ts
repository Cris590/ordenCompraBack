const puppeteer = require('puppeteer');
import * as Bluebird from 'bluebird';
const BluebirdPromise: typeof Bluebird = Bluebird;
const hb = require('handlebars')
const inlineCss = require('inline-css')
module.exports
async function generatePdf(file:any, options:any, callback:any) {
  // we are using headless mode
  let args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-software-rasterizer', // Desactiva el uso de rasterización por software
    '--disable-dev-shm-usage' // Utiliza un directorio de intercambio distinto para evitar problemas con espacio compartido
  ];
  if(options.args) {
    args = options.args;
    delete options.args;
  }

  const browser = await puppeteer.launch({
    args: args
  });
  const page = await browser.newPage();

  if(file.content) {
    let data = await inlineCss(file.content, {url:"/"});
    console.log("Compiling the template with handlebars")
    // we have compile our code with handlebars
    const template = hb.compile(data, { strict: true });
    const result = template(data);
    const html = result;

    // We set the page content as the generated html by handlebars
    await page.setContent(html, {
      waitUntil: 'networkidle0', // wait for page to load completely
    });
  } else {
    await page.goto(file.url, {
      waitUntil:[ 'load', 'networkidle0'], // wait for page to load completely
    });
  }

  // @ts-ignore
  return BluebirdPromise.props(page.pdf(options))
    .then(async function(data:any) {
       await browser.close();
      const values = Object.values(data) as (string | number)[];
      return Buffer.from(values.join(''));
    }).asCallback(callback);
}

module.exports = {
    generatePdf
};
