/**
 * dom-utils.js — Native DOM Utility Library
 * ==========================================
 * Zero-dependency DOM utility layer for Wabtec MMS Web Tools.
 * Covers legacy DOM helper patterns used in this project:
 *   selector wrapping, events, append, css, class, prop, val, attr, find, and JSON requests.
 *
 * Design: DomQuery wraps Element[] and provides chainable methods.
 *   - domQuery(selector)      → DomQuery (document scope)
 *   - domQuery(el)            → DomQuery (wrap existing element)
 *   - domCreate('<div>')      → DomQuery (create from HTML)
 *   - domAll(selector)        → DomQuery (always array)
 *
 * @version 1.0.0
 */

// ====================================================================
//  SECTION 1 — DomQuery Class
// ====================================================================

class DomQuery {
  /**
   * @param {Element|Element[]|NodeList|string} input — selector, element, or array
   * @param {Element|Document} [parent=document] — scope for selector queries
   */
  constructor(input, parent = document) {
    /** @type {Element[]} */
    this.elements = [];

    if (!input) {
      return;
    }

    if (typeof input === 'string') {
      // HTML string: create element(s)
      if (input.trim().startsWith('<')) {
        const template = document.createElement('template');
        template.innerHTML = input.trim();
        this.elements = Array.from(template.content.children);
      } else {
        // CSS selector
        try {
          const result = parent.querySelectorAll(input);
          this.elements = Array.from(result);
        } catch (e) {
          console.error(`[DomQuery] Invalid selector: "${input}"`, e);
        }
      }
    } else if (input instanceof Element) {
      this.elements = [input];
    } else if (input instanceof NodeList || Array.isArray(input)) {
      this.elements = Array.from(input).filter(el => el instanceof Element);
    } else if (input instanceof DomQuery) {
      this.elements = [...input.elements];
    }
  }

  // ==================================================================
  //  Read-only properties
  // ==================================================================

  /** Number of matched elements */
  get length() {
    return this.elements.length;
  }

  /** First raw DOM element or null */
  get first() {
    return this.elements[0] || null;
  }

  /** Alias for .first — direct DOM access for native API calls */
  get el() {
    return this.elements[0] || null;
  }

  /** Last element or null */
  get last() {
    return this.elements[this.elements.length - 1] || null;
  }

  // ==================================================================
  //  SECTION 2 — Traversal
  // ==================================================================

  /**
   * .find(selector) — search descendants
   * @returns {DomQuery}
   */
  find(selector) {
    const results = [];
    for (const el of this.elements) {
      try {
        const found = el.querySelectorAll(selector);
        results.push(...Array.from(found));
      } catch (e) { /* skip invalid selectors */ }
    }
    // Deduplicate
    return new DomQuery([...new Set(results)]);
  }

  /**
   * .closest(selector) — nearest ancestor matching selector
   * @returns {DomQuery}
   */
  closest(selector) {
    const results = [];
    for (const el of this.elements) {
      const match = el.closest(selector);
      if (match) results.push(match);
    }
    return new DomQuery([...new Set(results)]);
  }

  /**
   * .children() — direct child elements
   * @param {string} [selector] — optional filter
   * @returns {DomQuery}
   */
  children(selector) {
    const results = [];
    for (const el of this.elements) {
      let kids = Array.from(el.children);
      if (selector) {
        kids = kids.filter(c => c.matches(selector));
      }
      results.push(...kids);
    }
    return new DomQuery(results);
  }

  /**
   * .parent() — immediate parent
   * @returns {DomQuery}
   */
  parent() {
    const results = [];
    for (const el of this.elements) {
      if (el.parentElement) results.push(el.parentElement);
    }
    return new DomQuery([...new Set(results)]);
  }

  /**
   * .not(selector) — exclude elements matching selector
   * @returns {DomQuery}
   */
  not(selector) {
    const exclude = new Set(
      this.elements.filter(el => el.matches(selector))
    );
    return new DomQuery(this.elements.filter(el => !exclude.has(el)));
  }

  /**
   * .first() — first element wrapped
   * @returns {DomQuery}
   */
  firstChild() {
    return new DomQuery(this.elements[0] || null);
  }

  /**
   * .last() — last element wrapped
   * @returns {DomQuery}
   */
  lastChild() {
    return new DomQuery(this.elements[this.elements.length - 1] || null);
  }

  /**
   * .eq(index) — element at index
   * @returns {DomQuery}
   */
  eq(index) {
    return new DomQuery(this.elements[index] || null);
  }

  // ==================================================================
  //  SECTION 3 — DOM Manipulation
  // ==================================================================

  /**
   * .append(child) — append child to each matched element
   * @param {Element|DomQuery|string} child
   * @returns {DomQuery} this (chainable)
   */
  append(child) {
    const nodes = this._resolveNodes(child);
    for (const el of this.elements) {
      for (const node of nodes) {
        el.appendChild(node.cloneNode ? node.cloneNode(true) : node);
      }
    }
    return this;
  }

  /**
   * .prepend(child) — prepend child to each matched element
   * @returns {DomQuery}
   */
  prepend(child) {
    const nodes = this._resolveNodes(child);
    for (const el of this.elements) {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        el.insertBefore(node.cloneNode ? node.cloneNode(true) : node, el.firstChild);
      }
    }
    return this;
  }

  /**
   * .empty() — remove all children from each matched element
   * @returns {DomQuery}
   */
  empty() {
    for (const el of this.elements) {
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
    }
    return this;
  }

  /**
   * .remove() — remove matched elements from DOM
   * @returns {DomQuery}
   */
  remove() {
    for (const el of this.elements) {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }
    return this;
  }

  /**
   * .html(content) — get/set innerHTML
   * @returns {string|DomQuery}
   */
  html(content) {
    if (content === undefined) {
      return this.elements[0] ? this.elements[0].innerHTML : '';
    }
    for (const el of this.elements) {
      el.innerHTML = content;
    }
    return this;
  }

  /**
   * .text(content) — get/set textContent
   * @returns {string|DomQuery}
   */
  text(content) {
    if (content === undefined) {
      return this.elements.map(el => el.textContent).join('');
    }
    for (const el of this.elements) {
      el.textContent = content;
    }
    return this;
  }

  // ==================================================================
  //  SECTION 4 — Class
  // ==================================================================

  /**
   * .addClass(name) — add class to each matched element
   * @returns {DomQuery}
   */
  addClass(name) {
    const names = name.split(/\s+/).filter(Boolean);
    for (const el of this.elements) {
      el.classList.add(...names);
    }
    return this;
  }

  /**
   * .removeClass(name) — remove class from each matched element
   * @returns {DomQuery}
   */
  removeClass(name) {
    const names = name.split(/\s+/).filter(Boolean);
    for (const el of this.elements) {
      el.classList.remove(...names);
    }
    return this;
  }

  /**
   * .toggleClass(name, force) — toggle class
   * @returns {DomQuery}
   */
  toggleClass(name, force) {
    const names = name.split(/\s+/).filter(Boolean);
    for (const el of this.elements) {
      if (force === true) el.classList.add(...names);
      else if (force === false) el.classList.remove(...names);
      else names.forEach(n => el.classList.toggle(n));
    }
    return this;
  }

  /**
   * .hasClass(name) — check if first element has class
   * @returns {boolean}
   */
  hasClass(name) {
    return this.elements[0] ? this.elements[0].classList.contains(name) : false;
  }

  // ==================================================================
  //  SECTION 5 — Attributes
  // ==================================================================

  /**
   * .attr(name, value) — get/set attribute
   * @returns {string|DomQuery}
   */
  attr(name, value) {
    if (value === undefined) {
      return this.elements[0] ? this.elements[0].getAttribute(name) : null;
    }
    for (const el of this.elements) {
      el.setAttribute(name, value);
    }
    return this;
  }

  /**
   * .removeAttr(name) — remove attribute
   * @returns {DomQuery}
   */
  removeAttr(name) {
    for (const el of this.elements) {
      el.removeAttribute(name);
    }
    return this;
  }

  // ==================================================================
  //  SECTION 6 — Style
  // ==================================================================

  /**
   * .css(prop, value) — get/set inline style
   * OR .css({prop: value, ...}) — batch set
   * @returns {string|DomQuery}
   */
  css(prop, value) {
    // Getter: .css('propName')
    if (typeof prop === 'string' && value === undefined) {
      if (!this.elements[0]) return '';
      return getComputedStyle(this.elements[0])[prop] || '';
    }
    // Batch setter: .css({prop: val, ...})
    if (typeof prop === 'object' && prop !== null) {
      for (const el of this.elements) {
        for (const [key, val] of Object.entries(prop)) {
          const k = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          el.style[k] = val;
        }
      }
      return this;
    }
    // Single setter: .css('prop', 'val')
    if (typeof prop === 'string' && value !== undefined) {
      const k = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      for (const el of this.elements) {
        el.style[k] = value;
      }
    }
    return this;
  }

  /**
   * .hide() — set display:none
   * @returns {DomQuery}
   */
  hide() {
    for (const el of this.elements) {
      el.style.display = 'none';
    }
    return this;
  }

  /**
   * .show() — clear display:none
   * @returns {DomQuery}
   */
  show() {
    for (const el of this.elements) {
      el.style.display = '';
    }
    return this;
  }

  // ==================================================================
  //  SECTION 7 — Form
  // ==================================================================

  /**
   * .val(newVal) — get/set form value
   * @returns {string|DomQuery}
   */
  val(newVal) {
    if (newVal === undefined) {
      const el = this.elements[0];
      if (!el) return '';
      return el.value || '';
    }
    for (const el of this.elements) {
      el.value = newVal;
    }
    return this;
  }

  /**
   * .prop(name, value) — get/set DOM property
   * @returns {boolean|string|DomQuery}
   */
  prop(name, value) {
    if (value === undefined) {
      return this.elements[0] ? this.elements[0][name] : undefined;
    }
    for (const el of this.elements) {
      el[name] = value;
    }
    return this;
  }

  /**
   * .is(selector) — check if first element matches selector
   * @returns {boolean}
   */
  is(selector) {
    if (!this.elements[0]) return false;
    if (selector === ':checked') return this.elements[0].checked || false;
    return this.elements[0].matches(selector);
  }

  // ==================================================================
  //  SECTION 8 — Events
  // ==================================================================

  /**
   * .on(event, [selector], handler) — add event listener
   * With selector: delegated event
   * Without selector: direct binding
   * @returns {DomQuery}
   */
  on(event, selector, handler) {
    // Overload: .on('event', handler)
    if (typeof selector === 'function') {
      handler = selector;
      selector = null;
    }

    const events = event.split(/\s+/).filter(Boolean);

    for (const el of this.elements) {
      for (const evt of events) {
        if (selector) {
          // Delegated binding: fire handler only when target matches selector
          const wrapper = function (e) {
            const target = e.target.closest(selector);
            if (target && el.contains(target)) {
              handler.call(target, e);
            }
          };
          // Store wrapper reference for potential .off()
          if (!el._domDelegated) el._domDelegated = [];
          el._domDelegated.push({ event: evt, selector, handler, wrapper });
          el.addEventListener(evt.split('.')[0], wrapper);
        } else {
          const evtName = evt.split('.')[0]; // strip namespace
          el.addEventListener(evtName, handler);
          // Store for .off()
          if (!el._domHandlers) el._domHandlers = [];
          el._domHandlers.push({ event: evtName, handler });
        }
      }
    }
    return this;
  }

  /**
   * .off(event) — remove event listeners added via .on()
   * @returns {DomQuery}
   */
  off(event) {
    const evtName = event ? event.split('.')[0] : null;
    for (const el of this.elements) {
      // Remove direct handlers
      if (el._domHandlers) {
        el._domHandlers = el._domHandlers.filter(({ event: e, handler }) => {
          if (!evtName || e === evtName) {
            el.removeEventListener(e, handler);
            return false;
          }
          return true;
        });
      }
      // Remove delegated handlers
      if (el._domDelegated) {
        el._domDelegated = el._domDelegated.filter(({ event: e, selector: s, handler: h, wrapper }) => {
          if (!evtName || e === evtName) {
            el.removeEventListener(e.split('.')[0], wrapper);
            return false;
          }
          return true;
        });
      }
    }
    return this;
  }

  /**
   * .trigger(eventName) — dispatch a custom event
   * @returns {DomQuery}
   */
  trigger(eventName) {
    for (const el of this.elements) {
      el.dispatchEvent(new Event(eventName, { bubbles: true }));
    }
    return this;
  }

  /**
   * .click(handler) — shorthand for .on('click', handler)
   * @returns {DomQuery}
   */
  click(handler) {
    return this.on('click', handler);
  }

  /**
   * .change(handler) — shorthand for .on('change', handler)
   * @returns {DomQuery}
   */
  change(handler) {
    return this.on('change', handler);
  }

  // ==================================================================
  //  SECTION 9 — Data
  // ==================================================================

  /**
   * .data(key, value) — get/set data-* attribute
   * @returns {string|DomQuery}
   */
  data(key, value) {
    if (value === undefined) {
      return this.elements[0] ? (this.elements[0].dataset[key] || '') : '';
    }
    for (const el of this.elements) {
      el.dataset[key] = value;
    }
    return this;
  }

  // ==================================================================
  //  SECTION 10 — Iteration
  // ==================================================================

  /**
   * .each(fn) — iterate over matched elements
   * @param {Function} fn — fn(index, element)
   * @returns {DomQuery}
   */
  each(fn) {
    this.elements.forEach((el, i) => fn.call(el, i, el));
    return this;
  }

  /**
   * .forEach(fn) — alias for .each()
   * @returns {DomQuery}
   */
  forEach(fn) {
    return this.each(fn);
  }

  // ==================================================================
  //  SECTION 11 — Internal
  // ==================================================================

  /**
   * Get raw element at index (direct DOM access)
   * @param {number} [i=0]
   * @returns {Element|null}
   */
  get(i = 0) {
    return this.elements[i] || null;
  }

  /**
   * Return plain array of elements
   * @returns {Element[]}
   */
  toArray() {
    return [...this.elements];
  }

  /** @private Resolve child arg to array of Nodes */
  _resolveNodes(input) {
    if (!input) return [];
    if (input instanceof DomQuery) return input.elements;
    if (input instanceof Element) return [input];
    if (typeof input === 'string') {
      const tpl = document.createElement('template');
      tpl.innerHTML = input.trim();
      return Array.from(tpl.content.childNodes);
    }
    if (Array.isArray(input)) return input;
    return [];
  }
}

// ====================================================================
//  SECTION 12 — Top-Level Factory Functions
// ====================================================================

/**
 * domQuery(selector|element|html)
 * Core DOM selector wrapper.
 * @param {string|Element|NodeList} input
 * @param {Element|Document} [parent=document]
 * @returns {DomQuery}
 */
function domQuery(input, parent = document) {
  return new DomQuery(input, parent);
}

/**
 * domCreate('<div class="x">') — explicit HTML creation
 * @param {string} html
 * @returns {DomQuery}
 */
function domCreate(html) {
  return new DomQuery(html);
}

/**
 * domAll(selector) — always returns a collection (even for single match)
 * @param {string} selector
 * @param {Element|Document} [parent=document]
 * @returns {DomQuery}
 */
function domAll(selector, parent = document) {
  return new DomQuery(selector, parent);
}

/**
 * domReady(fn) — run after DOMContentLoaded.
 * @param {Function} fn
 */
function domReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

// ====================================================================
//  SECTION 13 — AJAX (fetch wrapper)
// ====================================================================

/**
 * fetchGet(url) — JSON GET wrapper.
 * @param {string} url
 * @param {object} [options]
 * @param {number} [options.timeout=10000] — timeout in ms
 * @param {object} [options.headers] — extra headers
 * @returns {Promise<any>}
 */
function fetchGet(url, options = {}) {
  const { timeout = 10000, headers = {} } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json', ...headers },
    signal: controller.signal,
  })
    .then(res => {
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    })
    .catch(err => {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        console.error(`[fetchGet] Timeout: ${url}`);
        throw new Error(`Request timeout: ${url}`);
      }
      console.error(`[fetchGet] Error: ${url}`, err);
      throw err;
    });
}

/**
 * fetchPost(url, body) — JSON POST wrapper.
 * @param {string} url
 * @param {object} body — JSON body
 * @param {object} [options]
 * @param {number} [options.timeout=15000]
 * @returns {Promise<any>}
 */
function fetchPost(url, body, options = {}) {
  const { timeout = 15000, headers = {} } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
    body: JSON.stringify(body),
    signal: controller.signal,
  })
    .then(res => {
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    })
    .catch(err => {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        console.error(`[fetchPost] Timeout: ${url}`);
        throw new Error(`Request timeout: ${url}`);
      }
      console.error(`[fetchPost] Error: ${url}`, err);
      throw err;
    });
}

// ====================================================================
//  SECTION 14 — Modal Helpers (Bootstrap 5 native)
// ====================================================================

/**
 * modalHelper(selector) — get or create BS5 Modal instance
 * @param {string|Element} el
 * @returns {bootstrap.Modal|null}
 */
function modalHelper(el) {
  const element = typeof el === 'string' ? document.querySelector(el) : el;
  if (!element) return null;
  return bootstrap.Modal.getOrCreateInstance(element);
}

// ====================================================================
//  SECTION 15 — BS5 Tab Shim
// ====================================================================

/**
 * tabShow(el) — programmatically show a BS5 tab
 * Programmatic Bootstrap Tab show helper.
 * @param {Element} el — the tab trigger link
 */
function tabShow(el) {
  if (!el) return;
  const tabInstance = bootstrap.Tab.getOrCreateInstance(el);
  tabInstance.show();
}

// ====================================================================
//  EXPORT for ES Module environments (also works as globals)
// ====================================================================

if (typeof window !== 'undefined') {
  window.DomQuery = DomQuery;
  window.domQuery = domQuery;
  window.domCreate = domCreate;
  window.domAll = domAll;
  window.domReady = domReady;
  window.fetchGet = fetchGet;
  window.fetchPost = fetchPost;
  window.modalHelper = modalHelper;
  window.tabShow = tabShow;
  window.DomUtils = Object.freeze({
    domAll,
    domCreate,
    domQuery,
    domReady,
    fetchGet,
    fetchPost,
    modalHelper,
    tabShow
  });
}
