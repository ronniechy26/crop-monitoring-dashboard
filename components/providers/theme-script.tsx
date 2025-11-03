const themeBootstrapScript = `
(() => {
  try {
    const storedMode = localStorage.getItem('cmd-theme-mode') || 'system';
    const storedPalette = localStorage.getItem('cmd-theme-palette') || 'classic';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const navPlacement = localStorage.getItem('cmd-sidebar-position') || 'navbar';
    const finalMode = storedMode === 'system' ? (prefersDark ? 'dark' : 'light') : storedMode;
    const root = document.documentElement;
    root.classList.toggle('dark', finalMode === 'dark');
    root.dataset.theme = storedPalette;
    root.dataset.themeMode = storedMode;
    root.dataset.themeResolved = finalMode;
    root.dataset.navigation = navPlacement;
    root.style.colorScheme = finalMode === 'dark' ? 'dark' : 'light';
  } catch (error) {
    console.warn('Theme bootstrap failed', error);
  }
})();
`;

const themeMediaSyncScript = `
(() => {
  try {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', (event) => {
      const storedMode = localStorage.getItem('cmd-theme-mode') || 'system';
      if (storedMode === 'system') {
        document.documentElement.classList.toggle('dark', event.matches);
        document.documentElement.style.colorScheme = event.matches ? 'dark' : 'light';
        document.documentElement.dataset.themeResolved = event.matches ? 'dark' : 'light';
      }
    });
  } catch (error) {
    console.warn('Theme media sync failed', error);
  }
})();
`;

export function ThemeScript() {
  return (
    <>
      <script
        id="theme-preload"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
      />
      <script
        id="theme-media-sync"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: themeMediaSyncScript }}
      />
    </>
  );
}
