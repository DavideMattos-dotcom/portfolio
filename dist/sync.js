import {normalizeContent} from './model.js';

export function createPortfolioStore(fetcher = (...args)=>fetch(...args)) {
  let revision = null;
  const endpoint = '/api/content';
  async function parse(response) {
    let value;
    try { value = await response.json(); } catch { throw new Error('O servidor não respondeu como esperado. Tente novamente.'); }
    if (!response.ok) throw Object.assign(new Error(value.error || 'Não foi possível salvar o portfólio.'), {status: response.status});
    if (!Number.isSafeInteger(value.revision) || value.revision < 0) throw new Error('Não foi possível carregar a versão do portfólio.');
    const normalized=normalizeContent(value.content);
    revision=value.revision;
    return {content:normalized,revision,updatedAt:value.updatedAt};
  }
  return {
    async load() { return parse(await fetcher(endpoint,{cache:'no-store',credentials:'same-origin'})); },
    async save(content) {
      if(revision===null)throw new Error('Aguarde o carregamento do portfólio antes de salvar.');
      return parse(await fetcher(endpoint,{method:'PUT',cache:'no-store',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({content,revision})}));
    }
  };
}
