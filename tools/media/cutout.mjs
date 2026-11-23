import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp'; import fs from 'fs'; import path from 'path';
const [src, out, ...names] = process.argv.slice(2); fs.mkdirSync(out,{recursive:true});
for (const f of names) {
  const t = Date.now();
  // upright, EXIF stripped, capped at 2400px before the model sees it
  const buf = await sharp(path.join(src,f)).rotate().resize({height:2400, withoutEnlargement:true}).png().toBuffer();
  const blob = await removeBackground(new Blob([buf],{type:'image/png'}), {model:'medium', output:{format:'image/png'}});
  const png = Buffer.from(await blob.arrayBuffer());
  const name = f.replace(/\.\w+$/,'') + '.cutout.png';
  await sharp(png).trim().png().toFile(path.join(out,name));
  console.log(name, ((Date.now()-t)/1000).toFixed(1)+'s');
}
