/* scrollspy.js
   Observe sections and toggle .active on matching .hex-item
   Exposes initScrollSpy()
*/

(function(global){
  function initScrollSpy(){
    const options = { 
      root: null, 
      rootMargin: '-30% 0% -40% 0%', 
      threshold: 0 
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {

        const id = entry.target.id;
        const navItem = document.querySelector(`.hex-item[data-target="${id}"]`);
        if (!navItem) return;

        if (entry.isIntersecting) {

          // Highlight active item
          document.querySelectorAll('.hex-item')
            .forEach(h => h.classList.remove('active'));

          navItem.classList.add('active');

          // ❌ REMOVED: this caused forced scrolling jumps
          // navItem.scrollIntoView({behavior:'smooth', block:'nearest', inline:'nearest'});
        }
      });
    }, options);

    document.querySelectorAll('.page-section')
      .forEach(section => observer.observe(section));
  }

  global.scrollspy = { initScrollSpy };
})(window);
