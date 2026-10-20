const str = (v, max = 200) => typeof v === 'string' ? v.trim().slice(0, max) : '';
export function safeUrl(value) {
  try { const u = new URL(str(value, 2048)); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password ? u.href : ''; } catch { return ''; }
}
export function safeEmail(value) {
  const email = str(value, 254);
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) && !/[\r\n]/.test(value || '') ? email : '';
}
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const parseList = (value, limit = 12) => [...new Set(str(value, 2000).split(',').map(x=>x.trim()).filter(Boolean))].slice(0,limit).map(x=>x.slice(0,80));
export function technologies(content) { return [...new Set(content.projects.flatMap(p=>p.technologies))]; }
export function filterProjects(content, technology = 'Todos') { return technology === 'Todos' ? content.projects : content.projects.filter(p=>p.technologies.includes(technology)); }
export function hasExamples(content) { return content.profile.isExample || content.projects.some(p=>p.isExample) || content.skills.some(s=>s.isExample); }
export function validateContentLinks(value) {
  if(value.contact.email&&!safeEmail(value.contact.email))throw new Error('Verifique o e-mail na seção Contato.');
  for(const k of ['github','linkedin'])if(value.contact[k]&&!safeUrl(value.contact[k]))throw new Error('Os links de contato devem começar com https:// ou http://.');
  for(const p of value.projects)for(const k of ['repository','demo'])if(p[k]&&!safeUrl(p[k]))throw new Error(`Verifique os links do projeto “${p.title}”. Use https:// ou http://.`);
}
export function normalizeContent(input) {
  if (!input || typeof input !== 'object' || !input.profile || !Array.isArray(input.projects) || !Array.isArray(input.skills) || !input.contact) throw new Error('Formato inválido. Importe um arquivo exportado por este portfólio.');
  if (input.projects.length > 30 || input.skills.length > 6) throw new Error('Use até 30 projetos e 6 grupos de habilidades.');
  const profile = input.profile;
  const allowedVisuals = ['stock','books','tasks','grades','shop'];
  return {
    profile: { name: str(profile.name,80) || 'Seu nome', role: str(profile.role,120) || 'Dev júnior', bio: str(profile.bio,1200), location: str(profile.location,120), availability: str(profile.availability,120), isExample: profile.isExample !== false },
    skills: input.skills.map(s=>({title:str(s.title,80),description:str(s.description,300),items:parseList(Array.isArray(s.items)?s.items.join(','):s.items),isExample:s.isExample!==false})),
    projects: input.projects.map((p,i)=>({ id:`project-${i}`,title:str(p.title,120)||'Novo projeto',category:str(p.category,120),description:str(p.description,500),technologies:parseList(Array.isArray(p.technologies)?p.technologies.join(','):p.technologies,10),details:str(p.details,3000),learning:str(p.learning,1500),features:parseList(Array.isArray(p.features)?p.features.join(','):p.features,10),repository:safeUrl(p.repository),demo:safeUrl(p.demo),isExample:p.isExample!==false,visual:allowedVisuals.includes(p.visual)?p.visual:allowedVisuals[i%4] })),
    contact: { email:safeEmail(input.contact.email),github:safeUrl(input.contact.github),linkedin:safeUrl(input.contact.linkedin),message:str(input.contact.message,500) }
  };
}
