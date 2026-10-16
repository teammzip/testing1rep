/* 시안 5: 모바일 상단 햄버거 → 옆으로 열리는 전체 메뉴. 열려 있는 동안 햄버거가 ✕로 바뀌어 위에 보이고, 다시 누르면 닫힌다. */
import { $ } from '../core/utils.js';

var drawer = $('drawer'), backdrop = $('drawerBackdrop'), btn = $('hamburgerBtn');

function open() {
  drawer.hidden = false; backdrop.hidden = false;
  btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', '전체 메뉴 닫기');
  document.body.classList.add('drawer-open');
}
function close() {
  drawer.hidden = true; backdrop.hidden = true;
  btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', '전체 메뉴 열기');
  document.body.classList.remove('drawer-open');
}

btn.addEventListener('click', function () { if (drawer.hidden) open(); else close(); });
backdrop.addEventListener('click', close);
$('drawerClose').addEventListener('click', close);
drawer.addEventListener('click', function (e) { if (e.target.closest('[data-go]')) close(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
// 창이 넓어져 햄버거가 사라지면 열려 있던 메뉴도 닫는다
window.matchMedia('(min-width: 701px)').addEventListener('change', function (e) { if (e.matches) close(); });
