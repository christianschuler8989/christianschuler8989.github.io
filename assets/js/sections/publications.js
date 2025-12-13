// publications.js
import { fetchJson, el } from '../utils.js';

(async function(){
  const container = document.getElementById('body-publications');
  try {
    const pubs = await fetchJson('content/publications.json');
    // group by type or year — example sorts descending by date
    pubs.sort((a,b) => new Date(b.date) - new Date(a.date));

    const list = el('div', {class:'pub-list'});
    for(const p of pubs){
      const item = el('div', {class:'pub-item'},
        el('div', {class:'pub-meta'},
           el('div', {class:'pub-title'}, el('a', {href:p.url, target:'_blank', rel:'noopener'}, p.title)),
           el('div', {class:'pub-authors'}, p.authors.join(', ')),
           el('div', {class:'pub-venue'}, `${p.venue}, ${p.year}`)
        )
      );
      list.append(item);
    }
    container.innerHTML = '';
    container.append(list);
  } catch(e) {
    container.textContent = `Failed to load publications: ${e.message}`;
  }
})();