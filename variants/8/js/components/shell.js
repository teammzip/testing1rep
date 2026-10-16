/* 모든 화면에 공통으로 보이는 부분: 상단 인사말, 오른쪽 프로필 */
import { $ } from '../core/utils.js';
import { settings } from '../core/state.js';
import { renderRentSummary } from '../views/rent.js';
import { updateDot } from '../views/noti.js';

/* (시안 비교용) 인사말 대신 1번(원본) 대비 바뀐 점을 보여준다. 원래 인사말로 되돌리려면 setNote() 호출을 아래 한 줄로 바꾸면 된다:
 * $('todayTitle').textContent = '오늘은 ' + (today.getMonth() + 1) + '월 ' + today.getDate() + '일입니다 ' + settings.name + '님'; (import에 today 필요) */
var NOTE_LINES = [["PC·모바일 동일","상단바 아래에 칩 메뉴 8개 추가 (PC는 한 줄, 모바일은 가로로 밀림) · 메뉴는 1번과 같음"]];
var NOTE_SUB = "공통: 켜진 하단 메뉴·상단 아이콘을 다시 누르면 홈 · 세로 스크롤바 항상 표시";
function setNote() {
  var h = $('todayTitle');
  h.textContent = '';
  NOTE_LINES.forEach(function (l) {
    var row = document.createElement('span');
    row.className = 'note-line';
    var tag = document.createElement('b');
    tag.textContent = l[0];
    row.appendChild(tag);
    row.appendChild(document.createTextNode(l[1]));
    h.appendChild(row);
  });
  var small = document.createElement('small');
  small.className = 'note-sub';
  small.textContent = NOTE_SUB;
  h.appendChild(small);
}

export function applySettings() {
  setNote();
  $('pName').textContent = settings.name;
  $('pAvatar').textContent = settings.name.charAt(0);
  $('pAvatar2').textContent = settings.name.charAt(0);
  $('pRegion').textContent = '📍 ' + (settings.region || '지역 미설정');
  $('pRent').textContent = settings.rent + '만';
  renderRentSummary();
  updateDot();
}
