(function () {
  'use strict';
  var clientId = 'a2260e922ebd2702cb5338950314e7e1'; // Public Shopify client ID, not a secret.
  var query = new URLSearchParams(window.location.search);
  function normalizeShop(value) {
    var candidate = String(value || '').trim().toLowerCase();
    candidate = candidate.replace(/^https:\/\//, '').replace(/\/$/, '');
    return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.myshopify\.com$/.test(candidate) ? candidate : '';
  }
  var initialShop = normalizeShop(query.get('shop'));
  document.querySelectorAll('[data-setup-start]').forEach(function (link) {
    var target = new URL('setup.html', window.location.href);
    var language = link.dataset.language || query.get('lang');
    if (language === 'de' || language === 'en') target.searchParams.set('lang', language);
    if (initialShop) target.searchParams.set('shop', initialShop);
    // Never forward Shopify authentication parameters or arbitrary destinations.
    link.href = target.href;
  });
  var input = document.getElementById('shop-domain');
  if (!input) return;
  var prepare = document.getElementById('prepare-links');
  var error = document.getElementById('domain-error');
  var ready = document.getElementById('links-ready');
  var links = document.querySelectorAll('[data-editor-link]');
  function setLanguage(language) {
    language = language === 'de' ? 'de' : 'en';
    document.documentElement.lang = language;
    document.title = (language === 'de' ? 'Einrichtung' : 'Setup') + ' — EU Garantie Labels';
    document.querySelectorAll('[data-lang]').forEach(function (node) { node.hidden = node.dataset.lang !== language; });
    document.querySelectorAll('[data-set-language]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.setLanguage === language));
    });
    input.placeholder = language === 'de' ? 'dein-shop.myshopify.com' : 'your-shop.myshopify.com';
  }
  document.querySelectorAll('[data-set-language]').forEach(function (button) {
    button.addEventListener('click', function () { setLanguage(button.dataset.setLanguage); });
  });
  function disableLinks() {
    links.forEach(function (link) { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); });
    ready.hidden = true;
  }
  function createLinks() {
    var shop = normalizeShop(input.value);
    disableLinks();
    error.hidden = !!shop;
    input.setAttribute('aria-invalid', String(!shop));
    if (!shop) { input.focus(); return; }
    links.forEach(function (link) {
      var kind = link.dataset.editorLink;
      var target = new URL('/admin/themes' + (kind === 'themes' ? '' : '/current/editor'), 'https://' + shop);
      if (kind !== 'themes') target.searchParams.set('template', 'product');
      if (kind === 'block') {
        target.searchParams.set('addAppBlockId', clientId + '/gewaehrleistungslabel');
        target.searchParams.set('target', 'mainSection');
      } else if (kind === 'vintage') {
        target.searchParams.set('context', 'apps');
        target.searchParams.set('activateAppId', clientId + '/gewaehrleistungslabel-vintage');
      }
      link.href = target.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.removeAttribute('aria-disabled');
    });
    document.getElementById('selected-shop').textContent = shop;
    ready.hidden = false;
  }
  input.addEventListener('input', function () { disableLinks(); error.hidden = true; input.removeAttribute('aria-invalid'); });
  input.addEventListener('keydown', function (event) { if (event.key === 'Enter') { event.preventDefault(); createLinks(); } });
  prepare.addEventListener('click', createLinks);
  prepare.disabled = false;
  var language = query.get('lang');
  setLanguage(language === 'de' || language === 'en' ? language : (/^de\b/i.test(navigator.language) ? 'de' : 'en'));
  if (initialShop) { input.value = initialShop; createLinks(); }
}());
