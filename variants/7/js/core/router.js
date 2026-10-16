/* 화면 전환. 각 화면은 registerView()로 "보여질 때 그릴 함수"를 등록한다.
 * (router가 화면 파일들을 직접 가져오지 않게 해서 서로 얽히지 않도록 함) */
import { $ } from './utils.js';

var VIEWS = ['home', 'calendar', 'ai', 'map', 'noti', 'community', 'settings', 'todo', 'bills', 'trash', 'rent'];
var MOBILE_PARENT = { noti: 'calendar', community: 'map' };
var PARENT = { todo: 'todo', bills: 'todo', trash: 'todo', rent: 'todo' };   // 생활 화면에서는 사이드바의 '생활'이 켜짐
var onShow = {};

export function registerView(name, render) { onShow[name] = render; }

export function showView(name) {
  VIEWS.forEach(function (v) { $('view-' + v).hidden = v !== name; });
  document.body.setAttribute('data-view', name);
  document.querySelectorAll('.nav-item').forEach(function (a) {
    a.classList.toggle('active', a.getAttribute('data-view') === (PARENT[name] || name));
    a.classList.toggle('sub-active', a.getAttribute('data-view') === MOBILE_PARENT[name]);
  });
  document.querySelectorAll('.mob-icon[data-view]').forEach(function (a) {   // 켜진 상단 아이콘 표시
    a.classList.toggle('active', a.getAttribute('data-view') === (PARENT[name] || name));
  });
  document.querySelectorAll('.sub-tabs button').forEach(function (b) {
    b.classList.toggle('on', b.getAttribute('data-go') === name);
  });
  if (window.matchMedia('(max-width: 700px)').matches) {   // 하단 탭이 옆으로 밀리므로 켜진 항목이 보이게 이동
    var act = document.querySelector('.nav-item.active');
    if (act && act.scrollIntoView) act.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }
  if (onShow[name]) onShow[name]();
  window.scrollTo(0, 0);
}

/* 메뉴, 아이콘, data-go 링크에 클릭 연결 (main.js에서 한 번 호출) */
export function initRouter() {
  document.querySelectorAll('.nav-item[data-view]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var v = a.getAttribute('data-view');
      // 모바일 하단 메뉴: 이미 켜진 항목을 한 번 더 누르면 꺼지고 홈으로 돌아감
      if (v !== 'home' && a.classList.contains('active') && window.matchMedia('(max-width: 700px)').matches) showView('home');
      else showView(v);
    });
  });
  document.querySelectorAll('.mob-icon[data-view]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      // 상단 아이콘: 이미 켜진 아이콘을 한 번 더 누르면 꺼지고 홈으로 돌아감
      if (a.classList.contains('active')) showView('home');
      else showView(a.getAttribute('data-view'));
    });
  });
  document.querySelectorAll('[data-go]').forEach(function (a) {
    // data-tip-id(꿀팁 글), data-topic(AI 분야)이 붙은 링크는 해당 화면 파일이 직접 처리한다.
    if (a.hasAttribute('data-tip-id') || a.hasAttribute('data-topic')) return;
    a.addEventListener('click', function (e) { e.preventDefault(); showView(a.getAttribute('data-go')); });
  });
  $('btnAsk').addEventListener('click', function () { showView('ai'); });
}
