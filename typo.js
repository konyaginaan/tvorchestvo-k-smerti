// Типографика: короткие предлоги, союзы и частицы не остаются висеть в конце строки,
// тире не переносится в начало следующей. Работает по текстовым узлам, разметку не трогает.
(function () {
  const SHORT = 'а|без|в|во|вне|где|да|для|до|же|за|и|из|изо|или|к|ко|как|ли|на|над|не|ни|но|о|об|обо|от|по|под|при|про|с|со|то|у|что|чем|это|я|мы|он|она|оно|их|его|её|ей|им|ты|вы|всё|все|так|уже|ещё|бы|ведь|лишь|кто';
  const afterShort = new RegExp('(^|[\\s\\u00a0«„"(—–])(' + SHORT + ')\\s+', 'giu');
  const beforeDash = /\s+([—–])/g;
  const SKIP = /^(SCRIPT|STYLE|TEXTAREA|CODE|PRE|SVG|svg)$/;
  function fix(s) {
    let prev;
    do { prev = s; s = s.replace(afterShort, (m, p, w) => p + w + ' '); } while (s !== prev);
    return s.replace(beforeDash, ' $1');
  }
  function typo(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.parentElement && SKIP.test(n.parentElement.tagName)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => { const v = fix(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; });
  }
  window.typo = typo;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => typo(document.body));
  else typo(document.body);
})();
