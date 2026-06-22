/**
 * Language & Cookie Module — ES6+ rewrite
 * Replaces: jquery.localize.min.js dependency
 * Uses: AppUtils from utils.js
 */
'use strict';

const LangCookie = (() => {
  const COOKIE_NAME = 'somoveLanguage';
  const ctx = window.location.href.substring(0, window.location.href.indexOf(window.location.pathname));

  /**
   * Change language from dropdown & persist to cookie.
   */
  function chgLang() {
    const select = document.getElementById('ddlSomoveLanguage');
    if (!select) return;
    const value = select.value;
    AppUtils.setCookie(COOKIE_NAME, value);
  }

  /**
   * Load & apply translations for saved language (DOMContentLoaded).
   */
  async function initLanguage() {
    const savedLang = AppUtils.getCookie(COOKIE_NAME);
    if (!savedLang) {
      console.log(`[LangCookie] No language cookie found`);
      return;
    }
    await AppUtils.localize(savedLang, `${ctx}/lang`);
  }

  /**
   * Apply translations from already-loaded cache (for dynamic content).
   */
  function localizeData() {
    const savedLang = AppUtils.getCookie(COOKIE_NAME);
    if (savedLang) {
      AppUtils.localizeSync(savedLang, `${ctx}/lang`);
    }
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage);
  } else {
    initLanguage();
  }

  // Log cookie on load (kept from original)
  console.log(AppUtils.getCookie(COOKIE_NAME));

  return { chgLang, initLanguage, localizeData };
})();
