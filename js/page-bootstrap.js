document.addEventListener('DOMContentLoaded', () => {
    const instances = [];
    document.querySelectorAll('.dropdown-toggle').forEach(trigger => {
        const instance = new bootstrap.Dropdown(trigger);
        instances.push(instance);
        trigger.addEventListener('click', event => {
            event.preventDefault();
            instance.toggle();
        });
    });
    window.addEventListener('beforeunload', () => instances.forEach(instance => instance.dispose()), { once: true });
}, { once: true });
