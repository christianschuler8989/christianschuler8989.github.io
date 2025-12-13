// projects.js
import { fetchJson, el } from '../utils.js';

(async function(){
  const container = document.getElementById('body-projects');
  try {
    const pros = await fetchJson('content/projects.json');
    // group by type or year — example sorts descending by date
    pros.sort((a,b) => new Date(b.date) - new Date(a.date));

    const list = el('div', {class:'pro-list'});
    for(const p of pros){
      const item = el('div', {class:'pro-item'},
        el('div', {class:'pro-meta'},
           el('div', {class:'pro-title'}, el('a', {href:p.url, target:'_blank', rel:'noopener'}, p.title)),
           el('div', {class:'pro-authors'}, p.authors.join(', ')),
           el('div', {class:'pro-venue'}, `${p.venue}, ${p.year}`)
        )
      );
      list.append(item);
    }
    container.innerHTML = '';
    container.append(list);
  } catch(e) {
    container.textContent = `Failed to load projects: ${e.message}`;
  }
})();