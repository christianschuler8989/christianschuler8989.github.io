/* i18n.js
   Simple i18n loader & runtime. No reloads - updates DOM in-place.
   Usage:
     await i18n.init(defaultLang);
     i18n.t('nav.home');
     i18n.setLanguage('deu_Latn'); // returns a Promise and updates DOM
   Convention:
     Elements with attribute data-i18n="key" will be updated (textContent).
*/

(function(global){
    let currentLang = null;
    let locales = {}; // cache per language locale.json
  
    // try to fetch locale; fallback order: requested -> eng_Latn -> final minimal fallback
    async function loadLocale(lang){
      async function tryLoad(l){
        try {
          const obj = await global.utils.fetchJsonNoCache(`content/${l}/locale.json`);
          return obj;
        } catch(e){
          return null;
        }
      }
  
      let data = await tryLoad(lang);
      if(data) return data;
  
      data = await tryLoad('eng_Latn');
      if(data) return data;
  
      // ultimate fallback: minimal object so t() returns keys instead of throwing
      return {};
    }
  
    function t(key){
      if(!currentLang) return key;
      const tree = locales[currentLang] || {};
      const parts = key.split('.');
      let cur = tree;
      for(const p of parts){
        if(cur == null || typeof cur !== 'object' || cur[p] === undefined){
          return key; // fallback to key
        }
        cur = cur[p];
      }
      return (typeof cur === 'string') ? cur : key;
    }
  
    function applyTranslations(){
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const txt = t(key);
        el.textContent = txt;
      });
    }
  
    async function init(lang = 'eng_Latn'){
      currentLang = lang;
      locales[currentLang] = await loadLocale(currentLang);
      applyTranslations();
      return currentLang;
    }
  
    async function setLanguage(lang){
      currentLang = lang;
      if(!locales[lang]){
        locales[lang] = await loadLocale(lang);
      }
      applyTranslations();
      return currentLang;
    }
  
    global.i18n = {
      init,
      setLanguage,
      getLanguage: () => currentLang,
      t,
      applyTranslations
    };
  })(window);
  