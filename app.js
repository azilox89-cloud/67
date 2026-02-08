const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    tabs.forEach((button) => button.classList.toggle('active', button === tab));
    panels.forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === target));
  });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // no-op fallback for local file / unsupported contexts
    });
  });
}
