const LANGUAGE_COOKIE_NAME = 'somoveLanguage';
const LANGUAGE_CODES = new Set(['en', 'fr', 'zh']);

function setCookie(cookieName, value) {
    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    document.cookie = `${cookieName}=${encodeURIComponent(value)};expires=${expiry.toUTCString()};path=/`;
}

function getCookie(cookieName) {
    const item = document.cookie.split('; ').find(cookie => cookie.startsWith(`${cookieName}=`));
    return item ? decodeURIComponent(item.substring(cookieName.length + 1)) : null;
}

async function localize_data() {
    const language = getCookie(LANGUAGE_COOKIE_NAME);
    if (!LANGUAGE_CODES.has(language)) return;

    try {
        const basePath = window.location.pathname.includes('/PAGES/') && !document.querySelector('base') ? '../' : '';
        await CommonBusiness.localizeElements(language, basePath);
    } catch (error) {
        console.error('Unable to load localization data:', error);
    }
}

function chgLang() {
    const selector = document.getElementById('ddlSomoveLanguage');
    if (!selector) return;
    setCookie(LANGUAGE_COOKIE_NAME, selector.value);
    localize_data();
}

document.addEventListener('DOMContentLoaded', localize_data, { once: true });

window.getCookie = getCookie;
window.localize_data = localize_data;
window.chgLang = chgLang;
