import { defaultContent } from './content.js';
import { escapeHtml as e, parseList, technologies, filterProjects, hasExamples, normalizeContent, validateContentLinks as validateLinks } from './model.js';
import { createPortfolioStore } from './sync.js';

const STORAGE_KEY = 'devfolio-content-v1';
const $ = id => document.getElementById(id);
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#${name}"/></svg>`;
const clone = value => JSON.parse(JSON.stringify(value));
let canEdit = false;
let content = normalizeContent(defaultContent);
let filter = 'Todos';
let draft;
let editorTab = 'profile';
let toastTimer;
const portfolioStore=createPortfolioStore();
let loaded=false;
let busy=false;
let refreshing=false;
let legacyContent=null;


function toast(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(()=>{$('toast').hidden=true;}, 5500); }
const badge = example => example ? '<span class="example-badge">EXEMPLO</span>' : '';
const tags = list => `<div class="technology-tags">${list.map(t=>`<span>${e(t)}</span>`).join('')}</div>`;
function projectArt(p, index = 0) {
  const visuals = {
    shop: `<div class="nexo-preview"><span>NEXO STORE</span><strong>Seu mundo.<br>Mais conectado.</strong><div>◉ &nbsp; ⌨ &nbsp; ◇</div><small>Catálogo · Carrinho · Checkout</small></div>`,
    stock: `<div class="stock-panel"><div class="mock-heading">Meu estoque <span class="mock-tiny">Visão geral</span></div><div class="mock-table-head"><span>Produto</span><span>Qtd.</span><span>Status</span></div><div class="mock-table-row"><span>Teclado USB</span><span>24</span><span class="mock-pill">Em dia</span></div><div class="mock-table-row"><span>Mouse sem fio</span><span>18</span><span class="mock-pill">Em dia</span></div><div class="mock-table-row"><span>Monitor 24”</span><span>12</span><span class="mock-pill">Em dia</span></div></div><div class="mock-stat"><strong>+54</strong><span>produtos organizados</span></div>`,
    books: `<div class="book-stack"><div class="book"><span>Histórias</span></div><div class="book"><span>Descobertas</span></div><div class="book"><span>Código</span></div><div class="book"><span>Ideias</span></div><div class="book-tag">Sua próxima<strong>descoberta.</strong></div></div>`,
    tasks: `<div class="tasks-panel"><div class="mock-heading"><span>MEU DIA</span><span class="mock-tiny">Um passo de cada vez</span></div><div class="task-title">Pequenos planos.<br>Grandes começos.</div><div class="task-row task-done"><span class="mock-checkbox checked">✓</span>Planejar o próximo projeto</div><div class="task-row"><span class="mock-checkbox"></span>Escrever a primeira função</div><div class="task-row"><span class="mock-checkbox"></span>Revisar e fazer um commit</div><div class="task-progress"></div></div><span class="task-note">foco no próximo passo ↗</span>`,
    grades: `<div class="grades-panel"><div class="grade-circle">8,5</div><div class="grade-details"><strong>Relatório de notas</strong><div>Notas: 8,0 · 9,0 · 8,5</div><div>Média final: 8,5</div><span>APROVADO</span></div></div>`
  };
  return `<div class="project-art ${p.visual}-art" aria-hidden="true"><span class="art-label">INTERFACE ILUSTRATIVA</span>${visuals[p.visual]}<span class="art-index">${String(index+1).padStart(2,'0')} / &lt;projeto&gt;</span></div>`;
}

function renderProjects() {
  const items = filterProjects(content, filter);
  $('project-count').textContent = `${items.length} ${items.length===1?'projeto':'projetos'}`;
  $('empty-projects').hidden = items.length > 0;
  $('projects-grid').innerHTML = items.map(p=>`<article class="project-card">${projectArt(p,content.projects.indexOf(p))}<div class="project-copy"><div class="project-kicker"><span>${e(p.category)}</span>${badge(p.isExample)}</div><h3>${e(p.title)}</h3><p>${e(p.description)}</p><div class="project-bottom">${tags(p.technologies)}${p.demo?`<a class="text-link" href="${e(p.demo)}" target="_blank" rel="noopener noreferrer">Ver demonstração ${icon('external')}</a>`:''}<button class="text-link" data-project="${e(p.id)}" aria-label="Explorar projeto: ${e(p.title)}">Explorar projeto ${icon('external')}</button></div></div></article>`).join('');
  $('project-filters').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
}
function render() {
  const p=content.profile;
  $('profile-name').textContent=p.name;
  $('profile-role').textContent=p.role;
  $('profile-bio').textContent=p.bio;
  $('profile-location').textContent=p.location;
  $('profile-location').parentElement.hidden=!p.location;
  $('profile-availability').textContent=p.availability;
  $('profile-availability').parentElement.hidden=!p.availability;
  $('profile-example').hidden=!p.isExample;
  $('bio-example').hidden=!p.isExample;
  $('footer-name').textContent=p.name;
  $('year').textContent=new Date().getFullYear();
  document.title=`${p.name} · ${p.role}`;
  $('example-notice').hidden=!hasExamples(content);
  $('skills-list').innerHTML=content.skills.map((s,i)=>`<article class="skill-group"><span class="skill-number">${String(i+1).padStart(2,'0')} /</span><h3>${e(s.title)}</h3><p>${e(s.description)}</p><div class="skill-tags">${s.items.map(item=>`<span>${e(item)}</span>`).join('')}</div>${s.isExample?'<span class="skill-example">HABILIDADES DE EXEMPLO</span>':''}</article>`).join('');
  const techs=technologies(content);
  if(filter!=='Todos'&&!techs.includes(filter)) filter='Todos';
  $('project-filters').innerHTML=['Todos',...techs].map(t=>`<button class="filter-button" data-filter="${e(t)}" aria-pressed="${t===filter}">${e(t)}</button>`).join('');
  renderProjects();
  $('contact-message').textContent=content.contact.message;
  const contacts=[{key:'email',label:'E-mail',value:content.contact.email,symbol:icon('mail'),url:content.contact.email?`mailto:${encodeURIComponent(content.contact.email)}`:'',hint:content.contact.email},{key:'github',label:'GitHub',value:content.contact.github,symbol:'GH',url:content.contact.github,hint:'Conheça meus repositórios'},{key:'linkedin',label:'LinkedIn',value:content.contact.linkedin,symbol:'in',url:content.contact.linkedin,hint:'Vamos nos conectar'}];
  $('contact-links').innerHTML=contacts.map(c=>{const inner=`<span class="contact-symbol">${c.symbol}</span><div>${c.label}<small>${c.value?e(c.hint):'EXEMPLO · ADICIONE SEU CONTATO'}</small></div>${icon(c.value?'external':'plus')}`;return c.value?`<a class="contact-link" href="${e(c.url)}" ${c.key!=='email'?'target="_blank" rel="noopener noreferrer"':''}>${inner}</a>`:!canEdit?`<div class="contact-link contact-link-placeholder">${inner}</div>`:`<button class="contact-link contact-link-placeholder" data-edit="contact" aria-label="Adicionar seu ${c.label}">${inner}</button>`;}).join('');
  document.querySelectorAll('[data-edit]').forEach(button=>button.hidden=!canEdit||!loaded);
  $('legacy-notice').hidden=!canEdit||!legacyContent;
}

function openProject(id) {
  const p=content.projects.find(p=>p.id===id);if(!p)return;
  $('project-dialog-body').innerHTML=`${projectArt(p,content.projects.indexOf(p))}<div class="detail-content"><div class="project-kicker">${e(p.category)}${badge(p.isExample)}</div><h2 id="project-dialog-title">${e(p.title)}</h2>${tags(p.technologies)}<p>${e(p.details||p.description)}</p>${p.features.length?`<h3>O que o projeto contempla</h3><ul>${p.features.map(f=>`<li>${icon('check')}<span>${e(f)}</span></li>`).join('')}</ul>`:''}${p.learning?`<h3>Aprendizados</h3><p>${e(p.learning)}</p>`:''}<div class="detail-links">${p.repository?`<a class="button button-primary" href="${e(p.repository)}" target="_blank" rel="noopener noreferrer">Ver código ${icon('external')}</a>`:''}${p.demo?`<a class="button button-quiet" href="${e(p.demo)}" target="_blank" rel="noopener noreferrer">Abrir demonstração ${icon('external')}</a>`:''}</div>${!p.repository&&!p.demo?'<div class="detail-placeholder">Links ainda não adicionados.</div>':''}</div>`;
  $('project-dialog').showModal();
}
function field(label, name, value, options={}) {
  const control=options.textarea?`<textarea name="${name}" maxlength="${options.max||3000}">${e(value)}</textarea>`:`<input name="${name}" type="${options.type||'text'}" value="${e(value)}" maxlength="${options.max||500}" ${options.placeholder?`placeholder="${e(options.placeholder)}"`:''}>`;
  return `<label class="field">${label}${control}${options.hint?`<small>${options.hint}</small>`:''}</label>`;
}
const checkbox=(name,checked,label='Marcar este conteúdo como exemplo')=>`<label class="field-checkbox"><input type="checkbox" name="${name}" ${checked?'checked':''}>${label}</label>`;
function renderEditor() {
  $('editor-error').hidden=true;
  $('import-note').hidden=true;
  document.querySelectorAll('[data-tab]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.tab===editorTab));b.tabIndex=b.dataset.tab===editorTab?0:-1;});
  $('editor-body').setAttribute('aria-labelledby',`tab-${editorTab}`);
  if(editorTab==='profile') { const p=draft.profile; $('editor-body').innerHTML=field('Seu nome','name',p.name,{max:80})+field('Cargo ou área de interesse','role',p.role,{max:120})+field('Sua apresentação','bio',p.bio,{textarea:true,max:1200})+field('Cidade e região','location',p.location,{max:120})+field('Disponibilidade ou objetivo','availability',p.availability,{max:120,hint:'Deixe em branco se preferir não exibir.'})+checkbox('isExample',p.isExample,'Esta apresentação ainda é um exemplo'); }
  if(editorTab==='skills') $('editor-body').innerHTML=draft.skills.map((s,i)=>`<div class="editor-card"><h3>Grupo ${i+1}</h3>${field('Nome do grupo',`skill-${i}-title`,s.title,{max:80})}${field('Descrição curta',`skill-${i}-description`,s.description,{max:300})}${field('Habilidades',`skill-${i}-items`,s.items.join(', '),{max:2000,hint:'Separe cada habilidade por vírgula.'})}${checkbox(`skill-${i}-example`,s.isExample,'Este grupo contém habilidades de exemplo')}</div>`).join('');
  if(editorTab==='contact') {const c=draft.contact;$('editor-body').innerHTML=field('Convite para conversar','message',c.message,{textarea:true,max:500})+field('Seu e-mail','email',c.email,{type:'email',max:254,placeholder:'nome@dominio.com'})+field('Link do GitHub','github',c.github,{type:'url',max:2048,placeholder:'https://github.com/seu-usuario'})+field('Link do LinkedIn','linkedin',c.linkedin,{type:'url',max:2048,placeholder:'https://www.linkedin.com/in/seu-usuario',hint:'Campos vazios mostram um convite para adicionar contato.'});}
  if(editorTab==='projects') $('editor-body').innerHTML=draft.projects.map((p,i)=>`<details class="editor-card"><summary>${e(p.title)}${badge(p.isExample)}</summary><div class="card-fields">${field('Título',`project-${i}-title`,p.title,{max:120})}${field('Categoria',`project-${i}-category`,p.category,{max:120})}${field('Resumo para o cartão',`project-${i}-description`,p.description,{textarea:true,max:500})}${field('Tecnologias',`project-${i}-technologies`,p.technologies.join(', '),{max:1000,hint:'Separe por vírgulas. Os filtros são criados automaticamente.'})}${field('Detalhes do projeto',`project-${i}-details`,p.details,{textarea:true})}${field('O que você aprendeu',`project-${i}-learning`,p.learning,{textarea:true,max:1500})}${field('Funcionalidades',`project-${i}-features`,p.features.join(', '),{max:1500,hint:'Separe por vírgulas.'})}${field('Link do repositório',`project-${i}-repository`,p.repository,{type:'url',max:2048})}${field('Link da demonstração',`project-${i}-demo`,p.demo,{type:'url',max:2048})}<label class="field">Ilustração do cartão<select name="project-${i}-visual">${[['shop','Loja Nexo'],['stock','Estoque'],['books','Livros'],['tasks','Tarefas'],['grades','Notas']].map(([v,l])=>`<option value="${v}" ${p.visual===v?'selected':''}>${l}</option>`).join('')}</select><small>Ilustração conceitual; não é uma captura do projeto.</small></label>${checkbox(`project-${i}-example`,p.isExample,'Este projeto ainda é um exemplo')}<button type="button" class="remove-project" data-remove="${i}">Remover este projeto do rascunho</button></div></details>`).join('')+'<button type="button" class="add-project" id="add-project">+ Adicionar projeto</button>';
}
function captureTab() {
  const f=new FormData($('editor-form'));const get=name=>f.get(name)||'';
  if(editorTab==='profile'){for(const k of ['name','role','bio','location','availability'])draft.profile[k]=get(k);draft.profile.isExample=f.has('isExample');}
  if(editorTab==='contact')for(const k of ['message','email','github','linkedin'])draft.contact[k]=get(k);
  if(editorTab==='skills')draft.skills.forEach((s,i)=>{s.title=get(`skill-${i}-title`);s.description=get(`skill-${i}-description`);s.items=parseList(get(`skill-${i}-items`));s.isExample=f.has(`skill-${i}-example`);});
  if(editorTab==='projects')draft.projects.forEach((p,i)=>{for(const k of ['title','category','description','details','learning','repository','demo','visual'])p[k]=get(`project-${i}-${k}`);p.technologies=parseList(get(`project-${i}-technologies`),10);p.features=parseList(get(`project-${i}-features`),10);p.isExample=f.has(`project-${i}-example`);});
}
async function openEditor(tab='profile',useLegacy=false) {
  if(!canEdit||!loaded||busy||refreshing)return;
  refreshing=true;
  try {
    const latest=await portfolioStore.load();content=latest.content;render();
    draft=clone(useLegacy&&legacyContent?legacyContent:content);editorTab=tab;renderEditor();$('editor-dialog').showModal();
  } catch { toast('Não foi possível carregar o portfólio para edição. Tente novamente.'); }
  finally { refreshing=false; }
}
async function persist(next) {
  if(!canEdit)throw new Error('Somente o proprietário pode editar.');
  const saved=await portfolioStore.save(next);
  content=saved.content;
  if(legacyContent)try {localStorage.setItem('devfolio-legacy-backup-v1',JSON.stringify(legacyContent));localStorage.removeItem(STORAGE_KEY);}catch{}
  legacyContent=null;
  render();
}
function setBusy(value) {
  busy=value;
  $('editor-dialog').querySelectorAll('button,input,textarea,select').forEach(control=>control.disabled=value);
  $('save-content').textContent=value?'Salvando…':'Salvar alterações';
  $('save-status').textContent=value?'Aguarde a confirmação.':'As mudanças ficarão visíveis no site.';
}
function editorError(error){$('editor-error').textContent=error.message||'Não foi possível concluir a ação.';$('editor-error').hidden=false;$('editor-error').scrollIntoView({block:'nearest'});}

document.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;
  if(busy)return;
  if(b.id==='review-legacy')openEditor('profile',true);
  if(b.id==='retry-load')initializePortfolio();
  if(b.dataset.edit)openEditor(b.dataset.edit);
  if(b.dataset.project)openProject(b.dataset.project);
  if(b.dataset.filter){filter=b.dataset.filter;renderProjects();}
  if(b.dataset.close)$(b.dataset.close).close();
  if(b.dataset.tab){captureTab();editorTab=b.dataset.tab;renderEditor();b.focus();}
  if(b.dataset.remove!==undefined){captureTab();draft.projects.splice(Number(b.dataset.remove),1);renderEditor();}
  if(b.id==='add-project'){captureTab();if(draft.projects.length>=30){editorError(new Error('O limite é de 30 projetos.'));return;}draft.projects.push({id:`new-${Date.now()}`,title:'Novo projeto',category:'Sua categoria',description:'Descreva o projeto em poucas palavras.',technologies:[],details:'',learning:'',features:[],repository:'',demo:'',isExample:true,visual:'stock'});renderEditor();const last=$('editor-body').querySelectorAll('details');last[last.length-1].open=true;last[last.length-1].querySelector('input').focus();}
});
$('editor-form').addEventListener('submit',async event=>{event.preventDefault();if(!canEdit||busy)return;captureTab();try{validateLinks(draft);setBusy(true);await persist(normalizeContent(draft));$('editor-dialog').close();toast('Alterações salvas no site e disponíveis nos outros aparelhos.');}catch(error){editorError(error);}finally{setBusy(false);}});
$('export-content').addEventListener('click',()=>{if(!canEdit)return;captureTab();try{validateLinks(draft);const exported=normalizeContent(draft);const blob=new Blob([JSON.stringify({version:1,content:exported},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='meu-portfolio.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Cópia do conteúdo exportada.');}catch(error){editorError(error);}});
$('import-content').addEventListener('click',()=>{if(canEdit)$('import-file').click();});
$('import-file').addEventListener('change',async event=>{if(!canEdit||busy)return;const file=event.target.files[0];if(!file)return;try{if(file.size>256000)throw new Error('Use um arquivo JSON de até 256 KB.');const parsed=JSON.parse(await file.text());if(parsed.version!==1)throw new Error('Use um arquivo exportado por este portfólio (versão 1).');const next=normalizeContent(parsed.content);validateLinks(parsed.content);draft=next;renderEditor();$('import-note').hidden=false;}catch(error){editorError(error instanceof SyntaxError?new Error('O arquivo não contém um JSON válido.'):error);}finally{event.target.value='';}});
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',event=>{if(event.target===d){const r=d.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)d.close();}}));
document.querySelector('.editor-tabs').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=[...document.querySelectorAll('[data-tab]')];let i=tabs.findIndex(t=>t.dataset.tab===editorTab);i=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[i].click();tabs[i].focus();});
render();

async function initializePortfolio() {
  const access=fetch('/api/editor-access',{cache:'no-store',credentials:'same-origin'}).then(r=>r.ok?r.json():{canEdit:false}).catch(()=>({canEdit:false}));
  try {
    const [snapshot,identity]=await Promise.all([portfolioStore.load(),access]);
    content=snapshot.content;canEdit=identity.canEdit===true;loaded=true;
    $('owner-login').hidden=canEdit;$('owner-logout').hidden=!canEdit;
    if(canEdit)try{const stored=localStorage.getItem(STORAGE_KEY);if(stored){const legacy=normalizeContent(JSON.parse(stored));if(JSON.stringify(legacy)!==JSON.stringify(content))legacyContent=legacy;}}catch{}
    $('sync-notice').hidden=true;
    render();
  } catch { $('sync-notice').hidden=false; }
}
async function refreshContent() {
  if(!loaded||busy||refreshing||document.hidden||document.querySelector('dialog[open]'))return;
  refreshing=true;
  try {const latest=await portfolioStore.load();const changed=JSON.stringify(content)!==JSON.stringify(latest.content);content=latest.content;$('sync-notice').hidden=true;if(changed)render();}
  catch { $('sync-notice').hidden=false; }
  finally {refreshing=false;}
}
window.addEventListener('focus',refreshContent);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshContent();});
setInterval(refreshContent,30000);
initializePortfolio();

$('owner-login').addEventListener('click',()=>{$('login-error').textContent='';$('login-dialog').showModal();$('login-password').focus();});
$('login-close').addEventListener('click',()=>{$('login-dialog').close();$('login-password').value='';});
$('login-form').addEventListener('submit',async event=>{event.preventDefault();$('login-submit').disabled=true;try{const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:$('login-password').value})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Não foi possível entrar.');$('login-password').value='';$('login-dialog').close();await initializePortfolio();toast('Acesso autorizado. Use Editar conteúdo para personalizar.');}catch(error){$('login-error').textContent=error.message;}finally{$('login-submit').disabled=false;}});
$('owner-logout').addEventListener('click',async()=>{try{const r=await fetch('/api/logout',{method:'POST'});if(!r.ok)throw new Error();location.reload();}catch{toast('Não foi possível sair. Tente novamente.');}});
