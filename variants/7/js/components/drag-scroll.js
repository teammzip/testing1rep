/* 시안 7: 하단 메뉴(모바일·태블릿)를 마우스로 끌어서도 옆으로 밀 수 있게 한다.
 * - 터치는 브라우저 기본 스크롤을 그대로 쓴다.
 * - 마우스 휠의 세로 움직임을 가로 이동으로 바꾼다.
 * - 끌고 난 뒤에는 클릭이 실수로 눌리지 않게 막는다.
 * - 오른쪽 끝에 닿으면 화살표 힌트를 숨긴다. */
var bar = document.querySelector('.sidebar');
var mq = window.matchMedia('(max-width: 700px)');
var down = false, moved = false, startX = 0, startLeft = 0;

bar.addEventListener('pointerdown', function (e) {
  if (!mq.matches || e.pointerType !== 'mouse' || e.button !== 0) return;
  down = true; moved = false; startX = e.clientX; startLeft = bar.scrollLeft;
});
window.addEventListener('pointermove', function (e) {
  if (!down) return;
  var dx = e.clientX - startX;
  if (!moved && Math.abs(dx) > 5) { moved = true; bar.classList.add('dragging'); }
  if (moved) bar.scrollLeft = startLeft - dx;
});
window.addEventListener('pointerup', function () {
  if (!down) return;
  down = false; bar.classList.remove('dragging');
});
bar.addEventListener('click', function (e) {
  if (moved) { e.preventDefault(); e.stopPropagation(); }
  moved = false;
}, true);
bar.addEventListener('dragstart', function (e) { e.preventDefault(); });

bar.addEventListener('wheel', function (e) {
  if (!mq.matches || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
  bar.scrollLeft += e.deltaY;
  e.preventDefault();
}, { passive: false });

function hint() { bar.classList.toggle('at-end', bar.scrollLeft + bar.clientWidth >= bar.scrollWidth - 2); }
bar.addEventListener('scroll', hint);
window.addEventListener('resize', hint);
hint();
