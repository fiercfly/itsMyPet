/**
 * Cozy Browser Pets - Content Script Injector
 * Mounts the pet into an isolated Shadow DOM on all visited web pages.
 */
(function() {
  if (window.__COZY_PET_MOUNTED__) return;
  window.__COZY_PET_MOUNTED__ = true;

  function mountPet() {
    // Avoid running in small iframes
    if (window.self !== window.top && (window.innerWidth < 300 || window.innerHeight < 300)) {
      return;
    }

    const host = document.createElement('div');
    host.id = 'cozy-browser-pet-host';
    host.style.position = 'fixed';
    host.style.top = '0';
    host.style.left = '0';
    host.style.width = '100vw';
    host.style.height = '100vh';
    host.style.pointerEvents = 'none';
    host.style.zIndex = '2147483647';

    const shadow = host.attachShadow({ mode: 'open' });

    // Inject Stylesheet link
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = chrome.runtime.getURL('content/styles.css');
    shadow.appendChild(styleLink);

    // Mount to document
    const target = document.body || document.documentElement;
    target.appendChild(host);

    // Initialize Engine with robust resolution
    const PetEngineClass = window.CozyPetEngine || globalThis.CozyPetEngine || (typeof CozyPetEngine !== 'undefined' ? CozyPetEngine : null);
    if (!PetEngineClass) {
      console.warn('[Cozy Browser Pets] CozyPetEngine class not yet initialized.');
      return;
    }

    const engine = new PetEngineClass(shadow);
    window.__COZY_PET_ENGINE__ = engine;

    // Check storage for site exclusion
    function checkVisibility() {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['enabled', 'disabledDomains'], (data) => {
          const enabled = data.enabled !== false;
          const disabledDomains = Array.isArray(data.disabledDomains) ? data.disabledDomains : [];
          const currentHostname = window.location.hostname;
          const isSiteDisabled = disabledDomains.includes(currentHostname);

          if (!enabled || isSiteDisabled) {
            host.style.display = 'none';
          } else {
            host.style.display = 'block';
          }
        });
      }
    }

    checkVisibility();

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
          if (changes.enabled || changes.disabledDomains) {
            checkVisibility();
          }
        }
      });
    }

    // Listen for direct messages from popup actions
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (!engine) return;

        if (msg.action === 'stealth_hide') {
          if (engine.triggerStealthHide) engine.triggerStealthHide();
          sendResponse({ status: 'ok' });
        } else if (msg.action === 'loaf_nap') {
          if (engine.toggleDeskNap) engine.toggleDeskNap();
          sendResponse({ status: 'ok' });
        } else if (msg.action === 'sleep_toy') {
          const active = engine.toggleSleepToy();
          sendResponse({ status: 'ok', active });
        } else if (msg.action === 'butterfly') {
          const active = engine.toggleButterfly();
          sendResponse({ status: 'ok', active });
        } else if (msg.action === 'feed') {
          engine.feedTreat(msg.treatType || 'fish');
          sendResponse({ status: 'ok' });
        } else if (msg.action === 'pet') {
          engine.handleSingleClick({ clientX: engine.x + 70, clientY: engine.y + 40 });
          sendResponse({ status: 'ok' });
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountPet);
  } else {
    mountPet();
  }
})();
