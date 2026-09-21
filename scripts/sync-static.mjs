// Keep pre-rendered HTML checked in for the repository's root-based static host.
import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const check=process.argv.includes('--check');
const generated=['sitemap.xml','robots.txt','_headers','_redirects'];
async function htmlFiles(directory){
 const entries=await fs.readdir(directory,{withFileTypes:true,recursive:true}).catch(error=>{if(error.code==='ENOENT')return [];throw error;});
 return entries.filter(entry=>entry.isFile()&&entry.name.endsWith('.html')).map(entry=>path.relative(root,path.join(entry.parentPath,entry.name)));
}
for(const directory of ['use-cases']){
 const built=await htmlFiles(path.join(root,'dist',directory));
 generated.push(...built.map(file=>file.slice('dist/'.length)));
 for(const existing of await htmlFiles(path.join(root,directory))){
  if(generated.includes(existing))continue;
  if(check)throw new Error(`Retired generated page remains: ${existing}`);
  await fs.rm(path.join(root,existing));
 }
}
for(const file of generated){
 const expected=await fs.readFile(path.join(root,'dist',file));
 if(check){
  const actual=await fs.readFile(path.join(root,file)).catch(()=>null);
  if(!actual?.equals(expected))throw new Error(`Generated output is stale: ${file}. Run npm run prepare:static.`);
 }else{
  await fs.mkdir(path.dirname(path.join(root,file)),{recursive:true});
  await fs.writeFile(path.join(root,file),expected);
 }
}
console.log(`${check?'Verified':'Updated'} ${generated.length} generated static files.`);
