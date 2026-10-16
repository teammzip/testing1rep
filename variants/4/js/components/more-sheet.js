/* 시안 4: 모바일 하단 탭의 "더보기" → 아래에서 올라오는 전체 메뉴 시트 */
import { $ } from '../core/utils.js';

var sheet = $('moreSheet'), backdrop = $('moreBackdrop'), btn = $('moreBtn');
var IN_SHEET = ['todo', 'bills', 'trash', 'rent', 'map', 'noti', 'community', 'settings'];

function open() { sheet.hidden = false; backdrop.hidden = false; btn.setAttribute('aria-expanded', 'true'); }
function close() { sheet.hidden = true; backdrop.hidden = true; btn.setAttribute('aria-expanded', 'false'); }

btn.addEventListener('click', function (e) { e.preventDefault(); if (sheet.hidden) open(); else close(); });
backdrop.addEventListener('click', close);
sheet.addEventListener('click', function (e) { if (e.target.closest('[data-go]')) close(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

// 시트 안에 있는 화면을 보고 있으면 "더보기" 탭을 켜 둔다
function mark() { btn.classList.toggle('sub-active', IN_SHEET.indexOf(document.body.getAttribute('data-view')) !== -1); }
new MutationObserver(mark).observe(document.body, { attributes: true, attributeFilter: ['data-view'] });
mark();
