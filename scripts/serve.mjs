import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
const directory = path.resolve('dist');
const port = Number(process.env.PORT || 8787);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/markdown; charset=utf-8','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
http.createServer(async (request,response) => {
  try {
    const requestUrl = new URL(request.url,'http://localhost');
    const pathname = decodeURIComponent(requestUrl.pathname);
    const rules = (await fs.readFile(path.join(directory,'_redirects'),'utf8')).trim().split('\n').map(line=>line.split(/\s+/));
    const redirect = rules.find(([from])=>from===pathname);
    if(redirect){
      response.writeHead(Number(redirect[2]),{'Location':redirect[1]+requestUrl.search,'Cache-Control':'no-cache'});
      response.end();return;
    }
    const file = path.resolve(directory,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
    if (!file.startsWith(directory+path.sep)) throw new Error('Invalid path');
    const extension=path.extname(file);
    let body=await fs.readFile(file);
    const headers={'Content-Type':types[extension]||'application/octet-stream','Vary':'Accept-Encoding','Cache-Control':['.html','.json','.md','.xml','.txt'].includes(extension)?'no-cache':'public, max-age=604800'};
    if (/\bgzip\b/.test(request.headers['accept-encoding']||'') && ['.html','.css','.js','.json','.md','.txt','.xml','.svg'].includes(extension)) {
      body=gzipSync(body);headers['Content-Encoding']='gzip';
    }
    headers['Content-Length']=body.length;
    response.writeHead(200,headers);response.end(request.method==='HEAD'?undefined:body);
  } catch {response.writeHead(404,{'Content-Type':'text/plain'});response.end('Page not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}/use-cases/`));
