/**
 * canvas-gauge-utils.js — zero-dependency canvas-gauges adapter.
 *
 * Keeps gauge lifecycle management outside page modules:
 *   - create one or many gauges
 *   - update values through a stable element id / selector / element
 *   - destroy instances before replacing DOM
 */
const CanvasGaugeUtils = (() => {
    const instances = new Map();

    function resolveElement(target) {
        if (target instanceof HTMLCanvasElement) return target;
        if (target instanceof Element) return target.querySelector('canvas');
        if (typeof target !== 'string') return null;

        const byId = document.getElementById(target);
        if (byId instanceof HTMLCanvasElement) return byId;
        if (byId instanceof Element) return byId.querySelector('canvas');
        return document.querySelector(target);
    }

    function getKey(target) {
        if (typeof target === 'string' && instances.has(target)) return target;
        const element = resolveElement(target);
        if (!element) return null;
        if (!element.id) {
            element.id = `canvasGauge_${Math.random().toString(36).slice(2)}`;
        }
        return element.id;
    }

    function assertLibrary() {
        if (typeof window.RadialGauge !== 'function' || typeof window.LinearGauge !== 'function') {
            throw new Error('canvas-gauges is not loaded. Include canvas-gauges.min.js before canvas-gauge-utils.js.');
        }
    }

    function createGauge(target, options = {}) {
        assertLibrary();
        const canvas = resolveElement(target);
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error('Gauge target must resolve to a canvas element.');
        }

        const key = getKey(canvas);
        destroyGauge(canvas);

        const { type = 'radial', ...gaugeOptions } = options;
        const GaugeConstructor = type === 'linear' ? window.LinearGauge : window.RadialGauge;
        const instance = new GaugeConstructor({
            renderTo: canvas,
            ...gaugeOptions
        }).draw();

        instances.set(key, instance);
        return instance;
    }

    function createRadialGauge(target, options = {}) {
        return createGauge(target, { ...options, type: 'radial' });
    }

    function createLinearGauge(target, options = {}) {
        return createGauge(target, { ...options, type: 'linear' });
    }

    function createGauges(configs = []) {
        return configs.map(config => createGauge(config.target || config.id || config.selector, config.options || config));
    }

    function getGauge(target) {
        const key = getKey(target);
        return key ? instances.get(key) || null : null;
    }

    function updateGauge(target, value) {
        const instance = getGauge(target);
        if (!instance) return false;
        instance.value = value;
        return true;
    }

    function updateGauges(values) {
        if (Array.isArray(values)) {
            values.forEach(item => updateGauge(item.target || item.id || item.selector, item.value));
            return;
        }
        Object.entries(values || {}).forEach(([target, value]) => updateGauge(target, value));
    }

    function destroyGauge(target) {
        const key = getKey(target);
        const instance = key ? instances.get(key) : null;
        if (!instance) return false;
        instance.destroy();
        instances.delete(key);
        return true;
    }

    function destroyGauges(targets = []) {
        targets.forEach(destroyGauge);
    }

    function destroyAll() {
        Array.from(instances.values()).forEach(instance => instance.destroy());
        instances.clear();
    }

    return Object.freeze({
        createGauge,
        createGauges,
        createLinearGauge,
        createRadialGauge,
        destroyAll,
        destroyGauge,
        destroyGauges,
        getGauge,
        updateGauge,
        updateGauges
    });
})();

window.CanvasGaugeUtils = CanvasGaugeUtils;
