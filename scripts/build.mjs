import {rm,mkdir,cp} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});console.log('Interface do portfólio preparada em dist/.');
