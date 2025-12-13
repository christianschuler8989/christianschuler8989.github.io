// home.js
import { fetchJson, el } from '../utils.js';

(async function(){
  const container = document.getElementById('body-home');
  try {
    const homs = await fetchJson('content/home.json');
    // group by type or year — example sorts descending by date
    homs.sort((a,b) => new Date(b.date) - new Date(a.date));

    const list = el('div', {class:'hom-list'});
    for(const p of homs){
      const item = el('div', {class:'hom-item'},
        el('div', {class:'hom-meta'},
           el('div', {class:'hom-title'}, el('a', {href:p.url, target:'_blank', rel:'noopener'}, p.title)),
           el('div', {class:'hom-authors'}, p.authors.join(', ')),
           el('div', {class:'hom-venue'}, `${p.venue}, ${p.year}`)
        )
      );
      list.append(item);
    }
    container.innerHTML = '';
    container.append(list);
  } catch(e) {
    container.textContent = `Failed to load home: ${e.message}`;
  }
})();