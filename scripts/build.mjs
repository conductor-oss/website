import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { renderDirectory, renderCompany, redirectPage, escape } from './render-directory.mjs';
const root=process.cwd();
const companies=JSON.parse(await fs.readFile(path.join(root,'data/companies.json'),'utf8'));
const config=JSON.parse(await fs.readFile(path.join(root,'site.config.json'),'utf8'));
const origin=(process.env.SITE_ORIGIN || config.origin).replace(/\/$/,'');
if(!/^https?:\/\//.test(origin))throw new Error('SITE_ORIGIN must be an absolute HTTP(S) origin');
const logos=JSON.parse(await fs.readFile(path.join(root,'data/logo-metadata.json'),'utf8'));
const slugs=new Set();
const names=new Set();
const normalizeName=value=>value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
for(const c of companies){
 if(!c.name||!c.industry||!c.summary||!c.cases.length||!/^[-a-z0-9]+$/.test(c.slug)||slugs.has(c.slug))throw new Error('Invalid company '+c.name);
 slugs.add(c.slug);
 for(const name of [c.name,...(c.aliases||[])]){
  const normalized=normalizeName(name);
  if(names.has(normalized))throw new Error('Duplicate company or alias: '+name);
  names.add(normalized);
 }
 if(c.logo)await fs.access(path.join(root,c.logo));
 if(c.logo && !logos[c.logo])throw new Error('Missing optimized logo '+c.name);
 for(const u of c.cases)if(!u.title||!u.description||!u.category)throw new Error('Incomplete use case '+c.name);
}
// Keep every published company URL working, including already consolidated names.
const redirects=[['/powered-by','/use-cases/'],['/powered-by/','/use-cases/'],['/powered-by/index.html','/use-cases/'],['/use-cases','/use-cases/']];
const companyRedirects=(from,to)=>redirects.push([from,to],[from+'/',to],[from+'/index.html',to]);
for(const c of companies)companyRedirects(`/powered-by/${c.slug}`,`/use-cases/${c.slug}/`);
for(const asset of ['directory.css','directory.js'])redirects.push([`/powered-by/${asset}`,`/use-cases/${asset}`]);
for(const c of companies)for(const previous of c.previousSlugs||[]){
 if(!/^[-a-z0-9]+$/.test(previous)||slugs.has(previous))throw new Error('Duplicate company route: '+previous);
 slugs.add(previous);
 for(const prefix of ['powered-by','use-cases'])companyRedirects(`/${prefix}/${previous}`,`/use-cases/${c.slug}/`);
}
const forbidden=['"person_ids"','linkedin.com/in/','"baseline_case_ids"','"source_archive"','"token"','"confidence_score"'];
const data=await fs.readFile(path.join(root,'data/companies.json'),'utf8');
for(const key of forbidden)if(data.includes(key))throw new Error('Private data field in public dataset: '+key);
// Rebuild generated output so retired company pages cannot survive a merge.
await fs.rm(path.join(root,'dist'),{recursive:true,force:true});
await fs.mkdir(path.join(root,'dist'),{recursive:true});
for(const name of ['index.html','assets'])await fs.cp(path.join(root,name),path.join(root,'dist',name),{recursive:true});
await fs.mkdir(path.join(root,'dist/use-cases'),{recursive:true});
for(const name of ['directory.css','directory.js'])await fs.copyFile(path.join(root,'use-cases',name),path.join(root,'dist/use-cases',name));
// Preserve the site's styles while removing non-rendering whitespace and comments.
for(const file of ['assets/site.css','use-cases/directory.css']){
 const css=await fs.readFile(path.join(root,file),'utf8');
 const compact=css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').replace(/\s*([{};:,])\s*/g,'$1').trim();
 await fs.writeFile(path.join(root,'dist',file),compact);
}
const template=await fs.readFile(path.join(root,'templates/use-cases.html'),'utf8');
const assetHash=createHash('sha256');
for(const file of ['assets/site.css','assets/site.js','use-cases/directory.css','use-cases/directory.js'])assetHash.update(await fs.readFile(path.join(root,file)));
const options={origin,logos,revision:assetHash.digest('hex').slice(0,12)};
await fs.writeFile(path.join(root,'dist/use-cases/index.html'),renderDirectory(template,companies,options));
for(const company of companies){
 const directory=path.join(root,'dist/use-cases',company.slug);
 await fs.mkdir(directory,{recursive:true});
 await fs.writeFile(path.join(directory,'index.html'),renderCompany(template,company,options));

}
// Canonical HTML fallbacks also work on static hosts without _redirects support.
const movedPages=[['powered-by','/use-cases/']];
for(const c of companies){
 for(const previous of [c.slug,...(c.previousSlugs||[])])movedPages.push([`powered-by/${previous}`,`/use-cases/${c.slug}/`]);
 for(const previous of c.previousSlugs||[])movedPages.push([`use-cases/${previous}`,`/use-cases/${c.slug}/`]);
}
for(const [previous,destination] of movedPages){
 const directory=path.join(root,'dist',previous);
 await fs.mkdir(directory,{recursive:true});
 await fs.writeFile(path.join(directory,'index.html'),redirectPage(destination,origin));
}
await fs.writeFile(path.join(root,'dist/_redirects'),redirects.map(([from,to])=>`${from} ${to} 301`).join('\n')+'\n');
const urls=['/','/use-cases/',...companies.map(c=>`/use-cases/${c.slug}/`)];
await fs.writeFile(path.join(root,'dist/sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(p=>`<url><loc>${escape(origin+p)}</loc></url>`).join('')+'</urlset>\n');
await fs.writeFile(path.join(root,'dist/robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
await fs.writeFile(path.join(root,'dist/_headers'),'/assets/*\n  Cache-Control: public, max-age=604800\n/use-cases/*.css\n  Cache-Control: public, max-age=86400\n/use-cases/*.js\n  Cache-Control: public, max-age=86400\n');
console.log(`Built ${companies.length} company pages and ${companies.reduce((n,c)=>n+c.cases.length,0)} use cases; readable HTML, structured metadata and sitemap.`);
