// 共享 Android 状态栏/底栏渲染
window.renderStatusBar = function() {
  return `<div class="android-statusbar">
    <span>10:42</span>
    <span class="right">
      <span style="font-size:10px;font-weight:600;letter-spacing:0.5px">LAN</span>
      <span class="bars"><i></i><i></i><i></i><i></i></span>
      <svg viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
      <span class="mono">86%</span>
    </span>
  </div>`;
};

window.renderNavBar = function(active) {
  const items = [
    { k:'board', l:'打板', href:'01-board.html', i:'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z'},
    { k:'roster', l:'花名册', href:'02-roster.html', i:'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'},
    { k:'history', l:'历史', href:'06-history.html', i:'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z'},
    { k:'weather', l:'天气', href:'08-weather.html', i:'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z'},
    { k:'me', l:'我', href:'10-settings.html', i:'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'},
  ];
  return `<div class="android-navbar">${items.map(it => `
    <button class="nav-btn ${it.k===active?'active':''}" aria-label="打开${it.l}" aria-current="${it.k===active?'page':'false'}" onclick="location.href='${it.href}'">
      <svg viewBox="0 0 24 24"><path d="${it.i}"/></svg>
      <span>${it.l}</span>
    </button>`).join('')}</div>`;
};

window.injectChrome = function(opt) {
  opt = opt || {};
  const body = document.body;
  const sb = document.createElement('div');
  sb.innerHTML = renderStatusBar();
  body.insertBefore(sb.firstElementChild, body.firstChild);
  if (opt.nav !== false) {
    const nb = document.createElement('div');
    nb.innerHTML = renderNavBar(opt.nav || '');
    body.appendChild(nb.firstElementChild);
  }
};

window.showToast = function(message) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.appendChild(toast);
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.remove(), 2600);
};

window.showBusinessConfirm = function(opts) {
  opts = opts || {};
  const previousFocus = document.activeElement;
  const mask = document.createElement('div');
  mask.className = 'modal-mask';
  mask.setAttribute('role', 'dialog');
  mask.setAttribute('aria-modal', 'true');
  mask.setAttribute('aria-labelledby', 'businessConfirmTitle');
  const details = (opts.details || []).map(item => `<div><b>${item.k}</b>：${item.v}</div>`).join('');
  mask.innerHTML = `<div class="business-modal">
    <div class="modal-head"><h3 id="businessConfirmTitle">${opts.title || '确认操作'}</h3></div>
    <div class="modal-body">
      <div>${opts.message || ''}</div>
      ${opts.irreversible ? `<div class="modal-warning">${opts.irreversible}</div>` : ''}
      ${details ? `<div class="risk-list">${details}</div>` : ''}
    </div>
    <div class="modal-actions">
      <button type="button" data-cancel>${opts.cancelText || '取消'}</button>
      <button type="button" class="${opts.danger ? 'danger' : ''}" data-confirm>${opts.confirmText || '确认'}</button>
    </div>
  </div>`;
  document.body.appendChild(mask);
  const cancelBtn = mask.querySelector('[data-cancel]');
  const confirmBtn = mask.querySelector('[data-confirm]');
  const close = () => {
    document.removeEventListener('keydown', onKeyDown);
    mask.remove();
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  };
  function onKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusables = [cancelBtn, confirmBtn];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  document.addEventListener('keydown', onKeyDown);
  mask.querySelector('[data-cancel]').onclick = close;
  mask.querySelector('[data-confirm]').onclick = () => {
    close();
    if (typeof opts.onConfirm === 'function') opts.onConfirm();
  };
  mask.querySelector('[data-cancel]').focus();
  return mask;
};
