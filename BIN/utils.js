/**
 * AppUtils — ES6+ Utility Module for Wabtec MMS Web Tools
 * Replaces jQuery, jquery.localize, and jquery.form dependencies.
 * All functions use native DOM APIs and Bootstrap 5 native components.
 * @version 2.0.0 — jQuery-free migration
 */
const AppUtils = (() => {
  'use strict';

  // ====================================================================
  //  SECTION 1 — Safe DOM Query Helpers (null-checked)
  // ====================================================================

  /**
   * querySelector with null guard — returns null instead of throwing.
   * @param {string} selector
   * @param {Element|Document} [parent=document]
   * @returns {Element|null}
   */
  function qs(selector, parent = document) {
    try {
      return parent.querySelector(selector);
    } catch (e) {
      console.error(`[AppUtils] Invalid selector: "${selector}"`, e);
      return null;
    }
  }

  /**
   * querySelectorAll — returns Array (not NodeList) for forEach/map.
   * @param {string} selector
   * @param {Element|Document} [parent=document]
   * @returns {Element[]}
   */
  function qsa(selector, parent = document) {
    try {
      return Array.from(parent.querySelectorAll(selector));
    } catch (e) {
      console.error(`[AppUtils] Invalid selector: "${selector}"`, e);
      return [];
    }
  }

  // ====================================================================
  //  SECTION 2 — Network (fetch wrapper with timeout)
  // ====================================================================

  /**
   * Fetch with configurable timeout, suitable for embedded device APIs.
   * @param {string} url
   * @param {object} [options={}]
   * @param {number} [options.timeout=15000] — timeout in ms
   * @param {string} [options.method='GET']
   * @param {object} [options.headers]
   * @param {any} [options.body]
   * @returns {Promise<any>} parsed JSON (or raw Response if parse=false)
   */
  async function fetchWithTimeout(url, options = {}) {
    const {
      timeout = 15000,
      method = 'GET',
      headers = {},
      body = null,
      parse = true,
    } = options;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const fetchOptions = { method, headers, signal: controller.signal };
    if (body) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      if (!headers['Content-Type']) {
        fetchOptions.headers['Content-Type'] = 'application/json; charset=utf-8';
      }
    }

    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timer);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return parse ? response.json() : response;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        console.error(`[AppUtils] Request timeout after ${timeout}ms: ${url}`);
        throw new Error(`Request timeout: ${url}`);
      }
      console.error(`[AppUtils] Fetch error: ${url}`, err);
      throw err;
    }
  }

  /**
   * Fetch local JSON file (e.g., language files, data.json).
   * @param {string} path
   * @returns {Promise<any>}
   */
  async function fetchJSON(path) {
    return fetchWithTimeout(path, { timeout: 10000 });
  }

  // ====================================================================
  //  SECTION 3 — Multi-language Localization (replaces jquery.localize)
  // ====================================================================

  /** Cached language packs: { "zh": { "key": "value" }, ... } */
  const langCache = new Map();

  /**
   * Load a language file and apply translations to [data-localize] elements.
   * @param {string} lang — "en" | "zh" | "fr"
   * @param {string} pathPrefix — e.g., "/lang"
   */
  async function localize(lang, pathPrefix = '') {
    // Load language pack from cache or network
    let pack;
    if (langCache.has(lang)) {
      pack = langCache.get(lang);
    } else {
      try {
        pack = await fetchJSON(`${pathPrefix}/text-${lang}.json`);
        langCache.set(lang, pack);
      } catch (err) {
        console.error(`[AppUtils] Failed to load language: ${lang}`, err);
        return;
      }
    }

    // Apply translations to all [data-localize] elements
    const elements = qsa('[data-localize]');
    elements.forEach(el => {
      const key = el.getAttribute('data-localize');
      if (pack && pack[key] !== undefined) {
        el.textContent = pack[key];
      }
    });
  }

  /**
   * Synchronous localization using pre-loaded cache.
   * Falls back to async load if cache miss.
   * @param {string} lang
   * @param {string} pathPrefix
   */
  function localizeSync(lang, pathPrefix = '') {
    if (langCache.has(lang)) {
      const pack = langCache.get(lang);
      qsa('[data-localize]').forEach(el => {
        const key = el.getAttribute('data-localize');
        if (pack[key] !== undefined) {
          el.textContent = pack[key];
        }
      });
    } else {
      // Preload and retry (async, but best-effort for sync callers)
      localize(lang, pathPrefix);
    }
  }

  // ====================================================================
  //  SECTION 4 — Cookie Utilities
  // ====================================================================

  function getCookie(name) {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]*)(;|$)`));
    if (match) {
      return decodeURIComponent(match[2]);
    }
    return null;
  }

  function setCookie(name, value, days = 30) {
    const exp = new Date();
    exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${exp.toUTCString()};path=/`;
  }

  // ====================================================================
  //  SECTION 5 — DOM Element Creation Helper
  // ====================================================================

  /**
   * Create an HTML element with attributes and children.
   * @param {string} tag — element tag name
   * @param {object} [attrs={}] — attributes and inline styles
   * @param {Array|string} [children=[]] — child elements or text
   * @returns {Element}
   */
  function createEl(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);

    for (const [key, val] of Object.entries(attrs)) {
      if (key === 'style' && typeof val === 'object') {
        Object.assign(el.style, val);
      } else if (key === 'dataset' && typeof val === 'object') {
        Object.assign(el.dataset, val);
      } else if (key.startsWith('on') && typeof val === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), val);
      } else if (key === 'className') {
        el.className = val;
      } else if (key === 'html') {
        el.innerHTML = val;
      } else {
        el.setAttribute(key, val);
      }
    }

    if (typeof children === 'string') {
      el.textContent = children;
    } else if (Array.isArray(children)) {
      children.forEach(child => {
        if (child instanceof Node) {
          el.appendChild(child);
        } else if (child != null) {
          el.appendChild(document.createTextNode(String(child)));
        }
      });
    }

    return el;
  }

  // ====================================================================
  //  SECTION 6 — Bootstrap 5 Native Component Helpers
  // ====================================================================

  /**
   * Create or get a BS5 Modal instance.
   * @param {Element|string} el — element or selector
   * @returns {bootstrap.Modal|null}
   */
  function getModal(el) {
    const element = typeof el === 'string' ? qs(el) : el;
    if (!element) {
      console.error('[AppUtils] Modal element not found:', el);
      return null;
    }
    return bootstrap.Modal.getOrCreateInstance(element);
  }

  // ====================================================================
  //  SECTION 7 — Event Helpers
  // ====================================================================

  /**
   * Add event listener with null guard.
   * @param {Element|string} el
   * @param {string} event
   * @param {Function} handler
   * @param {object} [options]
   */
  function on(el, event, handler, options) {
    const element = typeof el === 'string' ? qs(el) : el;
    if (element) {
      element.addEventListener(event, handler, options);
    }
  }

  /**
   * Event delegation on a parent element.
   * @param {Element|string} parent
   * @param {string} event
   * @param {string} childSelector
   * @param {Function} handler
   */
  function delegate(parent, event, childSelector, handler) {
    const p = typeof parent === 'string' ? qs(parent) : parent;
    if (!p) return;
    p.addEventListener(event, (e) => {
      const target = e.target.closest(childSelector);
      if (target && p.contains(target)) {
        handler.call(target, e);
      }
    });
  }

  // ====================================================================
  //  SECTION 8 — Polyfills & Misc
  // ====================================================================

  /** Debounce utility for resize/scroll handlers */
  function debounce(fn, delay = 150) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ====================================================================
  //  EXPORT
  // ====================================================================

  return {
    qs,
    qsa,
    fetchJSON,
    fetchWithTimeout,
    localize,
    localizeSync,
    getCookie,
    setCookie,
    createEl,
    getModal,
    on,
    delegate,
    debounce,
    // Expose langCache for pre-loading
    langCache,
  };
})();

// Prevent var leakage into global scope
'use strict';
