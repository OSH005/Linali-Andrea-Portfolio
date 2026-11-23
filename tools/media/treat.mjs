// Portrait treatments, all local: clean cutout, paper-sticker cutout, palette grade, duotone.
import sharp from 'sharp'; import fs from 'fs'; import path from 'path';
const [src, cutDir, out] = process.argv.slice(2); fs.mkdirSync(out,{recursive:true});
const BROWN=[0x3B,0x24,0x18], CREAM=[0xF2,0xE8,0xDA], PAPER=[0xFB,0xF8,0xF3];
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(s=>()=>((s=Math.imul(s^s>>>15,2246822507)^Math.imul(s^s>>>13,3266489909))>>>0)/4294967296)(7);

// 1. Harden alpha: drop ghosts under 90, stretch the rest. Keep only the largest blob's bbox via trim.
async function clean(file){
  const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  for(let i=3;i<data.length;i+=4){const a=data[i]; data[i]=a<90?0:Math.min(255,Math.round((a-90)*255/120));}
  keepLargest(data,info.width,info.height);
  return sharp(data,{raw:info}).trim({threshold:1}).png().toBuffer();
}
// Keep only the biggest connected shape (the person); drops leftover railing and wall fragments.
function keepLargest(d,w,h){
  const lab=new Int32Array(w*h), sizes=[0]; let best=0;
  for(let p=0;p<w*h;p++){ if(lab[p]||!d[p*4+3])continue; const id=sizes.length; let n=0; const st=[p]; lab[p]=id;
    while(st.length){const q=st.pop();n++;const x=q%w,y=(q/w)|0;
      for(const r of [x>0?q-1:-1,x<w-1?q+1:-1,y>0?q-w:-1,y<h-1?q+w:-1]) if(r>=0&&!lab[r]&&d[r*4+3]){lab[r]=id;st.push(r);}}
    sizes.push(n); if(n>sizes[best]||!best)best=id; }
  for(let p=0;p<w*h;p++) if(lab[p]!==best) d[p*4+3]=0;
}
// 2. Paper sticker: white border (dilated alpha) + warm soft shadow, like the cut-out figures on her boards.
async function sticker(png,border=16){
  const m=await sharp(png).metadata(), pad=border*4;
  const base=await sharp(png).extend({top:pad,bottom:pad,left:pad,right:pad,background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
  const {width:w,height:h}=await sharp(base).metadata();
  const alpha=await sharp(base).extractChannel(3).blur(border/2).threshold(8).toBuffer();
  const paper=await sharp({create:{width:w,height:h,channels:3,background:{r:PAPER[0],g:PAPER[1],b:PAPER[2]}}}).joinChannel(alpha).png().toBuffer();
  const shAlpha=await sharp(alpha).blur(border*1.2).linear(0.35,0).toBuffer();
  const shadow=await sharp({create:{width:w,height:h,channels:3,background:{r:BROWN[0],g:BROWN[1],b:BROWN[2]}}}).joinChannel(shAlpha).png().toBuffer();
  return sharp({create:{width:w,height:h,channels:4,background:{r:0,g:0,b:0,alpha:0}}})
    .composite([{input:shadow,left:Math.round(border*0.5),top:Math.round(border*0.9)},{input:paper},{input:base}]).png().toBuffer();
}
// 3. Palette grade: blacks lift to brown, highlights settle to cream, saturation down a touch, fine grain.
//    mode 'grade' keeps colour; mode 'duo' maps luminance onto brown→cream.
async function grade(input,mode,amount=1){
  const {data,info}=await sharp(input).rotate().removeAlpha().raw().toBuffer({resolveWithObject:true});
  for(let i=0;i<data.length;i+=3){
    let r=data[i],g=data[i+1],b=data[i+2]; const L=(0.2126*r+0.7152*g+0.0722*b)/255;
    const duo=[0,1,2].map(c=>lerp(BROWN[c],CREAM[c],Math.pow(L,0.9)));
    let px=[r,g,b];
    if(mode==='duo') px=duo;
    else { const grey=L*255; px=px.map((v,c)=>{ v=lerp(grey,v,0.82);                // desaturate 18%
             v=lerp(v,duo[c],0.22*amount);                                           // pull toward palette
             return BROWN[c]*0.55*(1-v/255)+v*(1-0.55*BROWN[c]/255*(1-v/255)); });}  // lift blacks into brown
    const n=(rnd()-0.5)*14;                                                          // grain
    data[i]=Math.max(0,Math.min(255,px[0]+n));data[i+1]=Math.max(0,Math.min(255,px[1]+n));data[i+2]=Math.max(0,Math.min(255,px[2]+n));
  }
  return sharp(data,{raw:info}).jpeg({quality:88,mozjpeg:true}).toBuffer();
}
const jobs={
  balcony:{f:'20261120_115442.jpg'}, mirror:{f:'IMG_20260220_075945_880.webp'},
  chair:{f:'IMG-20260319-WA0045.jpg'}, snow:{f:'IMG-20260115-WA0304~2.jpg'}, beach:{f:'PXL_20250113_123429448.NIGHT.jpg'},
};
for(const [k,{f}] of Object.entries(jobs)){
  const cut=await clean(path.join(cutDir,f.replace(/\.\w+$/,'')+'.cutout.png'));
  await sharp(cut).toFile(path.join(out,`${k}-cutout.png`));
  await sharp(await sticker(cut)).toFile(path.join(out,`${k}-sticker.png`));
  const full=await sharp(path.join(src,f)).rotate().resize({height:2400,withoutEnlargement:true}).toBuffer(); // EXIF/GPS dropped here
  await sharp(await grade(full,'grade')).toFile(path.join(out,`${k}-graded.jpg`));
  await sharp(await grade(full,'duo')).toFile(path.join(out,`${k}-duotone.jpg`));
  console.log('done',k);
}
