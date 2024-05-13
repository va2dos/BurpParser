import { createRequire } from 'module';
import { Base64 } from 'js-base64';
import { parseArgs } from 'node:util';
import { XMLParser } from 'fast-xml-parser';
import { promises as fs } from 'fs';

// For eslint
/* global process */

const args = process.argv.splice(2);

console.log('▄▄▄▄· ▄• ▄▌▄▄▄   ▄▄▄· ▄▄▄· ▄▄▄· ▄▄▄  .▄▄ · ▄▄▄ .▄▄▄  ');
console.log('▐█ ▀█▪█▪██▌▀▄ █·▐█ ▄█▐█ ▄█▐█ ▀█ ▀▄ █·▐█ ▀. ▀▄.▀·▀▄ █·');
console.log('▐█▀▀█▄█▌▐█▌▐▀▀▄  ██▀· ██▀·▄█▀▀█ ▐▀▀▄ ▄▀▀▀█▄▐▀▀▪▄▐▀▀▄ ');
console.log('██▄▪▐█▐█▄█▌▐█•█▌▐█▪·•▐█▪·•▐█ ▪▐▌▐█•█▌▐█▄▪▐█▐█▄▄▌▐█•█▌');
console.log('·▀▀▀▀  ▀▀▀ .▀  ▀.▀   .▀    ▀  ▀ .▀  ▀ ▀▀▀▀  ▀▀▀ .▀  ▀');
console.log();

const options = {
  file: { type: 'string' },
  version: { type: 'boolean', short: 'v' },
  help: { type: 'boolean', short: 'h' }
};

// TODO Error Handling
const { values } = parseArgs({ args, options });

if (values.version !== undefined) {
  const require = createRequire(import.meta.url);
  const data = require('./package.json');
  console.log(`VERSION : ${data.version}`);
  process.exit(0);
} else if (values.file === undefined || values.help) {
  console.log('Usage: node main.js [-h] [-v] [--file SomeFile.XML]');
  process.exit(1);
}
// else, values.file

console.log(`Reading: ${values.file}`);

const XMLdata = await fs.readFile(values.file, 'utf8');
const parser = new XMLParser();
// TODO Handle by file format
const jObj = parser.parse(XMLdata);

// TODO grap JS from HTML Body, and json object response
// const jsMineTypes = ["HTML","text","script","JSON"];

// TODO make a verbose mode
// const verbose = true;

// TODO set output folder in option
const outputFolder = './output';

const items = jObj.items.item;
const matchReponses = {};
// TODO Filter by contentType
// const contentTypeRegex = /Content-Type: (.*)\r/
const pathOnlyRegex = /(.*\/).*/;
const filenameOnlyRegex = /([^/]+)$/;

console.log(`Analyzing ${items.length} requests`);

for (let item of items) {
  // Only success for now, maybe 300ish could be good ?
  // TODO Filtre by reponse status code
  if (item.status < 200 || item.status > 299) {
    continue;
  }

  // Remove query string
  const normUrl = item.path.indexOf('?') > -1 ? item.path.split('?')[0] : item.path;

  // Analyse the Reponse
  const r = Base64.decode(item.response);
  const hb = r.split('\r\n\r\n');
  const reponseBody = hb.join('\r\n\r\n');

  // TODO reposneHeader for filters
  // const responseHeaders = hb.shift();

  // Tryed minetype from item, response, nothing accurate.
  if (item.extension == 'js') {
    //TODO, version asset per MD5 Signature
    //Might be usefull if same file is returne multipletimes, but with changes in body

    if (matchReponses[normUrl] == undefined) {
      if (reponseBody.length > 0) {
        const folder = outputFolder + pathOnlyRegex.exec(normUrl)[1];
        const newFile = filenameOnlyRegex.exec(normUrl)[1];
        const jsContent = reponseBody;
        await fs.mkdir(folder, { recursive: true });
        await fs.writeFile(folder + newFile, jsContent);
        matchReponses[normUrl] = 1;
        console.log(`${item.method} ${normUrl}, writing to ${folder + newFile}`);
      } else {
        console.log(`${item.method} ${normUrl}, writing skip, reponse empty!`);
      }
    } else {
      matchReponses[normUrl]++;
    }
  }
}

console.log('Exported completed');