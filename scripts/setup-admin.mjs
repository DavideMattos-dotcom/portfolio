import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const password=randomBytes(24).toString('base64url');
const cli=fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js',import.meta.url));
console.log('Configurando uma nova senha administrativa na Cloudflare…');
const result=spawnSync(process.execPath,[cli,'secret','put','PORTFOLIO_ADMIN_PASSWORD'],{input:password+'\n',stdio:['pipe','inherit','inherit']});
if(result.status!==0){console.error('A senha não foi configurada. Publique a portfólio primeiro e tente novamente.');process.exit(result.status||1)}
console.log('\nSENHA DO PAINEL (guarde no seu gerenciador de senhas):\n'+password+'\n\nA senha não foi salva nos arquivos do projeto. Use Acesso do proprietário no rodapé da portfólio. Executar este comando novamente troca a senha e invalida as sessões anteriores.');
