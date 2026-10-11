(function () {
  /* ===================== 공통 유틸 ===================== */
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var fmt = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function load(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function store(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { } }

  var today = new Date();
  var todayStr = fmt(today);
  function dayDiff(dateStr) { return Math.round((new Date(dateStr) - new Date(todayStr)) / 86400000); }

  /* ===================== 데이터 ===================== */
  var settings = Object.assign({ name: '지기', region: '서울 마포구', rentDay: 15, rent: 55, notiOn: true }, load('zip-settings', {}));
  var events = load('zip-events', []);
  if (!Array.isArray(events)) events = [];
  var readMap = load('zip-noti-read', {});
  var HOME = '서울 마포구';
  var NEARBY = {
    '서울 마포구': ['서울 서대문구', '서울 용산구', '서울 영등포구'],
    '서울 서대문구': ['서울 마포구', '서울 은평구', '서울 종로구'],
    '서울 용산구': ['서울 마포구', '서울 중구', '서울 성동구'],
    '서울 영등포구': ['서울 마포구', '서울 동작구', '서울 양천구']
  };
  var posts = load('zip-posts', null);
  if (!Array.isArray(posts)) posts = [];
  var seedNow = Date.now();
  var SEED_POSTS = [
    { id: 1001, region: '서울 마포구', cat: '꿀팁', title: '작은 방을 넓어 보이게 정리하는 법', body: '벽면에 붙이는 작은 거울을 비치하면 시야가 넓어 보여요. 수납장은 가장 자주 쓰는 물건만 남기고, 높은 선반에 보관을 올려 두면 공간이 훨씬 정돈돼 보입니다.', author: '자취8년차', mine: false, ts: seedNow - 3600000 * 5, likes: 12, liked: false, comments: [{ author: '새내기', text: '저도 다음 주에 따라 해볼게요!' }] },
    { id: 1002, region: '서울 마포구', cat: '꿀팁', title: '세제는 이렇게 놓으면 관리가 편해요', body: '설거지용, 청소용, 세탁용을 각각 분리해 칸을 나누고, 세면대 아래에 걸이형 수납을 두면 자주 사용하는 세제와 수건을 한 번에 정리할 수 있어요. 자주 쓰는 건 눈높이에 두면 찾기 편합니다.', author: '청소고수', mine: false, ts: seedNow - 3600000 * 3, likes: 9, liked: false, comments: [{ author: '좋아요', text: '배수구 주변 정리에도 좋겠네요.' }] },
    { id: 1003, region: '서울 마포구', cat: '꿀팁', title: '1인 가구 냉장고 관리 루틴', body: '채소는 물기를 제거한 뒤 채반에 잠깐 두고 보관해주면 숙성 속도가 줄고, 소분한 간식은 자석통이나 눈높이 선반에 두면 꺼내기 편해요. 냉장고 앞쪽에는 자주 먹는 음식만 두면 매번 정리할 필요가 줄어요.', author: '살림꿀팁', mine: false, ts: seedNow - 3600000 * 8, likes: 15, liked: false, comments: [{ author: '후배', text: '냉장고 정리 팁 진짜 좋네요.' }] },
    { id: 1, region: '서울 마포구', cat: '꿀팁', title: '배수구 냄새 잡는 방법', body: '베이킹소다 한 스푼 + 식초 반 컵 부으면 거품 나고, 10분 뒤 뜨거운 물로 헹구면 냄새가 줄어요.', author: '자취8년차', mine: false, ts: seedNow - 3600000 * 5, likes: 12, liked: false, comments: [{ author: '새내기', text: '오 바로 해볼게요!' }] },
    { id: 2, region: '서울 마포구', cat: '질문', title: '근처 세탁방 추천해주세요', body: '이불 빨래할 수 있는 큰 세탁기 있는 곳이면 좋겠어요.', author: '이사온사람', mine: false, ts: seedNow - 3600000 * 2, likes: 3, liked: false, comments: [] },
    { id: 3, region: '서울 마포구', cat: '동네', title: '쓰레기 배출 시간 바뀐 건가요?', body: '어제부터 수거 시간이 달라진 것 같은데 아시는 분 계신가요?', author: '야근러', mine: false, ts: seedNow - 60000 * 20, likes: 7, liked: false, comments: [{ author: '반장님', text: '구청 공지 확인해보니 저녁 6시부터래요.' }] },
    { id: 4, region: '서울 서대문구', cat: '동네', title: '연희동 새벽 시장 열렸어요', body: '주말 아침에 채소랑 과일 싸게 팔아요. 장바구니 꼭 챙기세요.', author: '연희주민', mine: false, ts: seedNow - 3600000 * 8, likes: 9, liked: false, comments: [] },
    { id: 5, region: '서울 용산구', cat: '질문', title: '이태원 쪽 24시 약국 있나요?', body: '밤에 갑자기 열이 나서요. 아시는 분 알려주세요.', author: '밤손님', mine: false, ts: seedNow - 3600000 * 3, likes: 2, liked: false, comments: [{ author: '약사친구', text: '큰길 쪽에 심야 약국 하나 있어요.' }] },
    { id: 6, region: '서울 영등포구', cat: '꿀팁', title: '당산 근처 이사 짐 센터 후기', body: '소형 이사는 용달이 훨씬 싸고, 평일 오전에 예약하면 더 깎아줘요.', author: '이사고수', mine: false, ts: seedNow - 3600000 * 20, likes: 5, liked: false, comments: [] },
    { id: 7, region: '서울 강남구', cat: '자유', title: '역삼 점심 맛집 공유해요', body: '혼밥하기 좋은 곳 위주로 모아봤어요.', author: '직장인', mine: false, ts: seedNow - 3600000 * 30, likes: 4, liked: false, comments: [] }
  ];
  posts.forEach(function (p) { if (!p.region) p.region = p.mine ? settings.region : HOME; });
  SEED_POSTS.forEach(function (sp) { if (!posts.some(function (p) { return p.id === sp.id; })) posts.push(sp); });
  store('zip-posts', posts);

  function sortEvents(list) {
    return list.slice().sort(function (a, b) { return (a.date + (a.time || '99:99')).localeCompare(b.date + (b.time || '99:99')); });
  }

  /* ===================== 설정 반영 ===================== */
  function nextRentDate() {
    var base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    function clamp(y, m) { var last = new Date(y, m + 1, 0).getDate(); return new Date(y, m, Math.min(settings.rentDay, last)); }
    var c = clamp(base.getFullYear(), base.getMonth());
    if (c < base) c = clamp(base.getFullYear(), base.getMonth() + 1);
    return c;
  }
  function applySettings() {
    $('todayTitle').textContent = '오늘은 ' + (today.getMonth() + 1) + '월 ' + today.getDate() + '일입니다 ' + settings.name + '님';
    $('pName').textContent = settings.name;
    $('pAvatar').textContent = settings.name.charAt(0);
    $('pAvatar2').textContent = settings.name.charAt(0);
    $('pRegion').textContent = '📍 ' + (settings.region || '지역 미설정');
    $('pRent').textContent = settings.rent + '만';
    var c = nextRentDate();
    var diff = dayDiff(fmt(c));
    $('rentDday').textContent = diff === 0 ? 'D-Day' : 'D-' + diff;
    $('rentSub').textContent = '매월 ' + settings.rentDay + '일 · ' + settings.rent + '만원 · 계좌이체' + (rentPaid[rentKey(c.getFullYear(), c.getMonth())] ? ' · 납부 완료' : '');
    $('pRentSub').textContent = settings.rent + '만원 · 이체';
    $('pRentTime').textContent = (c.getMonth() + 1) + '/' + c.getDate();
    updateDot();
  }

  /* ===================== 화면 전환 ===================== */
  var VIEWS = ['home', 'calendar', 'ai', 'map', 'noti', 'community', 'settings', 'todo', 'bills', 'trash', 'rent'];
  var MOBILE_PARENT = { noti: 'calendar', community: 'map' };
  var PARENT = { todo: 'home', bills: 'home', trash: 'home', rent: 'home' };
  function showView(name) {
    VIEWS.forEach(function (v) { $('view-' + v).hidden = v !== name; });
    document.body.setAttribute('data-view', name);
    document.querySelectorAll('.nav-item').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-view') === (PARENT[name] || name));
      a.classList.toggle('sub-active', a.getAttribute('data-view') === MOBILE_PARENT[name]);
    });
    document.querySelectorAll('.sub-tabs button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-go') === name);
    });
    if (name === 'calendar') renderCalendarAll();
    if (name === 'ai') initAI();
    if (name === 'map') initMap();
    if (name === 'noti') renderNotiCenter();
    if (name === 'community') renderPosts();
    if (name === 'settings') fillSettings();
    if (name === 'todo') renderTodos();
    if (name === 'bills') renderBills();
    if (name === 'trash') renderTrash();
    if (name === 'rent') renderRent();
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('.nav-item[data-view]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); showView(a.getAttribute('data-view')); });
  });
  document.querySelectorAll('.mob-icon[data-view]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); showView(a.getAttribute('data-view')); });
  });
  // 홈 버튼과 모바일 사진 탭에서 같은 사진 첨부 흐름을 사용한다.
  document.querySelectorAll('[data-action="photo"]').forEach(function (button) {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      $('photoInput').click();
    });
  });
  document.querySelectorAll('[data-go]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var target = a.getAttribute('data-go');
      var tipId = a.getAttribute('data-tip-id');
      if (tipId) {
        openTipDetail(tipId);
        return;
      }
      showView(target);
      var t = a.getAttribute('data-topic');
      if (t) openTopic(t, a.getAttribute('data-fill'));
    });
  });
  document.querySelectorAll('.stat[data-go]').forEach(function (a) {
    a.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.click(); } });
  });
  $('btnAsk').addEventListener('click', function () { showView('ai'); });
  $('btnAdd').addEventListener('click', function () { showView('calendar'); $('evTitle').focus(); });

  /* ===================== 캘린더 ===================== */
  var viewY = today.getFullYear(), viewM = today.getMonth(), selected = todayStr, mode = 'day', query = '';

  function renderGrid() {
    $('calTitle').textContent = viewY + '년 ' + (viewM + 1) + '월';
    var grid = $('calGrid');
    grid.textContent = '';
    ['일', '월', '화', '수', '목', '금', '토'].forEach(function (d) { grid.appendChild(el('div', 'cal-dow', d)); });
    var first = new Date(viewY, viewM, 1).getDay();
    var days = new Date(viewY, viewM + 1, 0).getDate();
    for (var i = 0; i < first; i++) grid.appendChild(el('div', 'cal-empty'));
    for (var d = 1; d <= days; d++) {
      var ds = viewY + '-' + pad(viewM + 1) + '-' + pad(d);
      var btn = el('button', 'cal-day');
      btn.type = 'button';
      btn.setAttribute('data-date', ds);
      if (ds === todayStr) btn.classList.add('today');
      if (ds === selected) btn.classList.add('sel');
      btn.appendChild(el('span', null, String(d)));
      var mark = el('span', 'mark');
      var count = events.filter(function (ev) { return ev.date === ds; }).length;
      for (var k = 0; k < Math.min(count, 3); k++) mark.appendChild(el('i'));
      btn.appendChild(mark);
      grid.appendChild(btn);
    }
  }
  $('calGrid').addEventListener('click', function (e) {
    var btn = e.target.closest('.cal-day');
    if (!btn) return;
    selected = btn.getAttribute('data-date');
    $('evDate').value = selected;
    mode = 'day'; query = ''; $('searchInput').value = '';
    renderCalendarAll();
  });
  $('calPrev').addEventListener('click', function () { viewM--; if (viewM < 0) { viewM = 11; viewY--; } renderGrid(); });
  $('calNext').addEventListener('click', function () { viewM++; if (viewM > 11) { viewM = 0; viewY++; } renderGrid(); });
  $('calToday').addEventListener('click', function () {
    viewY = today.getFullYear(); viewM = today.getMonth(); selected = todayStr; $('evDate').value = selected; renderCalendarAll();
  });

  function renderEvList() {
    var list = $('evList');
    list.textContent = '';
    var items = mode === 'day' ? events.filter(function (ev) { return ev.date === selected; }) : events;
    if (query) {
      var q = query.toLowerCase();
      items = items.filter(function (ev) { return ev.title.toLowerCase().indexOf(q) !== -1; });
    }
    items = sortEvents(items);
    var title = mode === 'day' ? selected.slice(5).replace('-', '월 ') + '일 일정' : '전체 일정';
    if (query) title += ' · 검색: ' + query;
    $('listTitle').textContent = title;
    $('modeDay').classList.toggle('on', mode === 'day');
    $('modeAll').classList.toggle('on', mode === 'all');
    if (!items.length) { list.appendChild(el('li', 'empty', query ? '검색 결과가 없어요.' : '등록된 일정이 없어요.')); return; }
    items.forEach(function (ev) {
      var li = el('li', 'ev');
      li.appendChild(el('span', 'when', (mode === 'all' ? ev.date.slice(5).replace('-', '/') + ' ' : '') + (ev.time || '종일')));
      li.appendChild(el('span', 'name', ev.title));
      var del = el('button', 'del', '×');
      del.type = 'button'; del.title = '삭제';
      del.addEventListener('click', function () {
        events = events.filter(function (x) { return x.id !== ev.id; });
        store('zip-events', events);
        renderCalendarAll(); updateDot();
      });
      li.appendChild(del);
      list.appendChild(li);
    });
  }
  $('modeDay').addEventListener('click', function () { mode = 'day'; renderEvList(); });
  $('modeAll').addEventListener('click', function () { mode = 'all'; renderEvList(); });

  function renderCalNoti() {
    var box = $('notiList');
    box.textContent = '';
    var rows = [{ ico: '🗑️', t: '일반쓰레기 배출', s: '오늘 저녁 6시 이후', b: '오늘', hot: true }];
    var rd = nextRentDate(), rdiff = dayDiff(fmt(rd));
    rows.push({ ico: '💸', t: '월세 납부', s: '매월 ' + settings.rentDay + '일 · ' + settings.rent + '만원', b: rdiff === 0 ? '오늘' : 'D-' + rdiff, hot: rdiff <= 3 });
    sortEvents(events).forEach(function (ev) {
      var diff = dayDiff(ev.date);
      if (diff < 0 || diff > 7) return;
      rows.push({ ico: '📌', t: ev.title, s: ev.date.slice(5).replace('-', '월 ') + '일 ' + (ev.time || '종일'), b: diff === 0 ? '오늘' : 'D-' + diff, hot: diff <= 1 });
    });
    rows.forEach(function (r) {
      var n = el('div', 'noti');
      n.appendChild(el('div', 'ico', r.ico));
      var t = el('div', 't');
      t.appendChild(el('b', null, r.t));
      t.appendChild(el('small', null, r.s));
      n.appendChild(t);
      n.appendChild(el('span', 'badge' + (r.hot ? ' hot' : ''), r.b));
      box.appendChild(n);
    });
  }
  function renderCalendarAll() { renderGrid(); renderEvList(); renderCalNoti(); }

  $('evDate').value = selected;
  $('evForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var title = $('evTitle').value.trim(), date = $('evDate').value;
    if (!title || !date) return;
    events.push({ id: Date.now(), date: date, time: $('evTime').value, title: title });
    store('zip-events', events);
    selected = date; viewY = Number(date.slice(0, 4)); viewM = Number(date.slice(5, 7)) - 1;
    mode = 'day'; query = ''; $('searchInput').value = '';
    $('evTitle').value = ''; $('evTime').value = '';
    renderCalendarAll(); updateDot();
  });

  $('searchForm').addEventListener('submit', function (e) {
    e.preventDefault();
    query = $('searchInput').value.trim();
    mode = query ? 'all' : 'day';
    showView('calendar');
  });
  $('searchInput').addEventListener('input', function () {
    if (!this.value.trim() && query) { query = ''; mode = 'day'; if (!$('view-calendar').hidden) renderEvList(); }
  });

  /* ===================== 알림 센터 ===================== */
  var notiMode = 'all';
  function buildNotis() {
    var list = [];
    sortEvents(events).forEach(function (ev) {
      var diff = dayDiff(ev.date);
      if (diff < 0 || diff > 3) return;
      list.push({ id: 'ev-' + ev.id, ico: '📌', t: ev.title, s: ev.date.slice(5).replace('-', '월 ') + '일 ' + (ev.time || '종일'), time: diff === 0 ? '오늘' : 'D-' + diff });
    });
    var rd = nextRentDate(), rdiff = dayDiff(fmt(rd));
    list.push(
      { id: 'n1', ico: '🗑️', t: '오늘은 일반쓰레기 배출일이에요', s: '저녁 6시 ~ 자정', time: '방금' },
      { id: 'n2', ico: '💸', t: '월세 납부일이 ' + (rdiff === 0 ? '오늘이에요' : rdiff + '일 남았어요'), s: '매월 ' + settings.rentDay + '일 · ' + settings.rent + '만원', time: '1시간 전' },
      { id: 'n3', ico: '🧊', t: '냉장고 재료 3개가 곧 만료돼요', s: '두부 · 방울토마토 · 우유', time: '오늘' },
      { id: 'n4', ico: '💬', t: '커뮤니티에 새 댓글이 달렸어요', s: '쓰레기 배출 시간 바뀐 건가요?', time: '어제' }
    );
    return list;
  }
  function unreadCount() { return buildNotis().filter(function (n) { return !readMap[n.id]; }).length; }
  function updateDot() { var off = !(settings.notiOn && unreadCount() > 0); $('navDot').hidden = off; $('bellDot').hidden = off; }

  function renderNotiCenter() {
    var box = $('notiCenter');
    box.textContent = '';
    $('notiOffNotice').hidden = settings.notiOn;
    var all = buildNotis();
    var items = notiMode === 'unread' ? all.filter(function (n) { return !readMap[n.id]; }) : all;
    var cnt = unreadCount();
    $('notiCount').hidden = cnt === 0;
    $('notiCount').textContent = cnt + '개 안 읽음';
    $('nAll').classList.toggle('on', notiMode === 'all');
    $('nUnread').classList.toggle('on', notiMode === 'unread');
    if (!items.length) { box.appendChild(el('div', 'empty', '알림이 없어요.')); return; }
    items.forEach(function (n) {
      var row = el('div', 'noti clickable' + (readMap[n.id] ? '' : ' unread'));
      row.appendChild(el('div', 'ico', n.ico));
      var t = el('div', 't');
      t.appendChild(el('b', null, n.t));
      t.appendChild(el('small', null, n.s + ' · ' + n.time));
      row.appendChild(t);
      if (!readMap[n.id]) row.appendChild(el('span', 'udot'));
      row.addEventListener('click', function () {
        readMap[n.id] = true; store('zip-noti-read', readMap);
        renderNotiCenter(); updateDot();
      });
      box.appendChild(row);
    });
  }
  $('nAll').addEventListener('click', function () { notiMode = 'all'; renderNotiCenter(); });
  $('nUnread').addEventListener('click', function () { notiMode = 'unread'; renderNotiCenter(); });
  $('nReadAll').addEventListener('click', function () {
    buildNotis().forEach(function (n) { readMap[n.id] = true; });
    store('zip-noti-read', readMap); renderNotiCenter(); updateDot();
  });

  /* ===================== AI 도우미 (데모: 분야별 질문 초안 + 정해진 답변) ===================== */
  var photoUrl = null, curTopic = null, draftDirty = false, answerSeq = 0;
  var R_TRASH = '분리배출 기본 원칙이에요.\n\n• 플라스틱·캔·유리병: 내용물 비우고 헹군 뒤 라벨 제거\n• 종이: 테이프·스테이플러 제거 후 펼쳐서 묶기\n• 음식물: 종량제(음식물) 봉투나 전용 용기 사용\n• 배달 용기: 기름기가 남으면 일반쓰레기\n\n배출 요일과 시간은 지역마다 달라서, 사는 동네 구청 안내를 꼭 확인하세요.';
  var R_COOK = '임박 재료를 기준으로 추천해요.\n\n1) 두부 샐러드: 두부 + 방울토마토 + 올리브유, 5분\n2) 계란 볶음밥: 남은 밥 + 계란 + 대파, 15분\n3) 우유 계란찜: 우유를 섞으면 더 부드러워요\n\n임박 재료부터 먼저 쓰는 걸 추천해요.';
  var R_MOLD = '곰팡이 대처 순서예요.\n\n1) 창문을 열어 환기하고 가구를 벽에서 5cm 이상 띄워요\n2) 곰팡이 제거제를 뿌리고 10분 뒤 닦아요\n3) 완전히 말린 뒤 제습제를 두세요\n\n⚠️ 락스와 산성 세제를 절대 섞지 마세요. 유해가스가 나와요. 벽 안쪽 누수가 원인이면 집주인에게 수리를 요청해야 해요.';
  var R_CONTRACT = '계약과 보증금 기본 체크리스트예요.\n\n• 입주 당일 전입신고 + 확정일자 받기\n• 계약 전 등기부등본으로 근저당·소유자 확인\n• 입주 때 집 상태를 사진·영상으로 기록해 두기\n• 퇴거 전 집주인에게 미리 통보하고 보증금 반환 일정 확인\n\n법률 자문이 아니라 일반 정보예요. 큰 금액이 걸리면 전문가나 공공기관 상담을 받으세요.';
  var R_BILL = '공과금은 납부일을 캘린더에 등록해 두면 편해요. 자동이체를 걸어 두면 연체를 막을 수 있고, 겨울철 가스비는 외출 모드와 단열 뽁뽁이로 줄일 수 있어요.';

  function regionText() { return settings.region || '자취방'; }
  function photoLine() { return photoUrl ? '\n(사진을 함께 첨부했어요.)' : ''; }
  function keywordReply(q) {
    var s = q.replace(/\s/g, '');
    if (/분리|배출|쓰레기|재활용/.test(s)) return R_TRASH;
    if (/요리|냉장고|레시피|뭐해먹|먹을/.test(s)) return R_COOK;
    if (/곰팡이|습기|제습/.test(s)) return R_MOLD;
    if (/보증금|계약|전입|확정일자|월세/.test(s)) return R_CONTRACT;
    if (/공과금|전기|가스|수도|관리비/.test(s)) return R_BILL;
    return '아직 데모 버전이라 몇 가지 주제만 답할 수 있어요.\n\n분리배출, 냉장고 요리, 곰팡이, 보증금·계약, 공과금, 집주인 문자, 근처 탐색 분야를 골라보세요.';
  }
  function placeKey(what) {
    var keys = Object.keys(PLACES);
    for (var i = 0; i < keys.length; i++) { if (what.indexOf(keys[i].slice(0, 2)) !== -1) return keys[i]; }
    return null;
  }

  var TOPICS = [
    {
      id: 'qna', ico: '💬', name: '자유 질문', desc: '자취 관련 궁금한 것', photo: false,
      fields: [{ k: 'q', label: '궁금한 점', ph: '예) 세탁기에서 냄새가 나요' }],
      draft: function (v) { return '저는 ' + regionText() + '에서 자취하는 세입자예요.\n\n질문: ' + (v.q || '(여기에 질문을 적어주세요)') + '\n\n초보도 따라 할 수 있게 단계별로 알려주고, 주의할 점도 함께 알려주세요.'; },
      reply: function (v, text) { return keywordReply(v.q || text); }
    },
    {
      id: 'nearby', ico: '📍', name: '근처 탐색', desc: '세탁방·편의점·약국·마트', photo: false,
      fields: [{ k: 'what', label: '찾는 곳', ph: '예) 세탁방, 편의점, 약국, 마트' }, { k: 'cond', label: '원하는 조건 (선택)', ph: '예) 24시간, 이불 빨래 가능' }],
      draft: function (v) { return regionText() + ' 근처에서 걸어서 갈 수 있는 ' + (v.what || '(찾는 곳)') + '을(를) 찾고 있어요.' + (v.cond ? '\n조건: ' + v.cond : '') + '\n\n후보를 가까운 순서로 알려주고, 고를 때 확인할 점도 알려주세요.'; },
      reply: function (v) {
        var key = placeKey(v.what || '');
        if (!key) return '어떤 곳을 찾는지 알려주세요. 지금은 ' + Object.keys(PLACES).join(', ') + ' 예시를 볼 수 있어요.';
        var lines = PLACES[key].map(function (p) { return '• ' + p.n + ' — ' + p.d; });
        return regionText() + ' 근처 ' + key + ' 후보예요 (예시 데이터).\n\n' + lines.join('\n') + '\n\n고를 때는 운영 시간, 가격, 후기를 지도에서 한 번 더 확인하세요.';
      },
      action: function (v) { var key = placeKey(v.what || ''); return key ? { label: '지도에서 보기', run: function () { mapCat = key; mapIdx = 0; mapReady = false; showView('map'); } } : null; }
    },
    {
      id: 'trash', ico: '♻️', name: '분리배출', desc: '이건 어떻게 버려요?', photo: true,
      fields: [{ k: 'item', label: '버릴 물건', ph: '예) 치킨 뼈, 깨진 컵, 택배 박스' }],
      draft: function (v) { return '다음 물건을 어떻게 분리배출해야 하는지 알려주세요.\n물건: ' + (v.item || '(버릴 물건)') + '\n지역: ' + regionText() + photoLine() + '\n\n종류(일반/재활용/음식물/대형)와 버리기 전 손질 방법, 배출 시 주의할 점을 알려주세요.'; },
      reply: function () { return R_TRASH; }
    },
    {
      id: 'cook', ico: '🍳', name: '냉장고 요리', desc: '남은 재료로 한 끼', photo: true,
      fields: [{ k: 'ing', label: '가진 재료', ph: '예) 두부, 방울토마토, 우유' }, { k: 'time', label: '시간·도구 (선택)', ph: '예) 15분, 프라이팬만' }],
      draft: function (v) { return '냉장고에 ' + (v.ing || '(가진 재료)') + '이(가) 있어요.' + (v.time ? '\n조건: ' + v.time : '') + photoLine() + '\n\n임박한 재료를 먼저 쓰는 요리 3가지를 재료·순서와 함께 알려주세요.'; },
      reply: function () { return R_COOK; }
    },
    {
      id: 'clean', ico: '🧹', name: '청소·곰팡이', desc: '얼룩, 냄새, 곰팡이', photo: true,
      fields: [{ k: 'where', label: '어디가 어떤가요?', ph: '예) 욕실 천장에 검은 곰팡이' }],
      draft: function (v) { return '집에서 이런 문제가 생겼어요.\n상황: ' + (v.where || '(장소와 증상)') + photoLine() + '\n\n원인, 직접 해결하는 순서, 쓰면 안 되는 세제, 집주인에게 알려야 하는 경우를 구분해서 알려주세요.'; },
      reply: function () { return R_MOLD; }
    },
    {
      id: 'contract', ico: '📄', name: '계약·보증금', desc: '입주·퇴거 체크리스트', photo: false,
      fields: [{ k: 'sit', label: '지금 상황', ph: '예) 다음 달 퇴거인데 보증금 반환이 걱정돼요' }],
      draft: function (v) { return '월세 계약 중인 세입자예요.\n상황: ' + (v.sit || '(지금 상황)') + '\n\n지금 해야 할 일을 순서대로 알려주고, 놓치기 쉬운 점과 상담받을 수 있는 공공기관도 알려주세요.'; },
      reply: function () { return R_CONTRACT; }
    },
    {
      id: 'landlord', ico: '📝', name: '집주인 문자', desc: '정중한 요청 문자 초안', photo: true,
      fields: [{ k: 'issue', label: '문제 상황', ph: '예) 보일러가 작동하지 않아요' }],
      draft: function (v) { return '집주인에게 보낼 문자를 써주세요.\n보내는 사람: 세입자 ' + settings.name + '\n문제: ' + (v.issue || '(문제 상황)') + photoLine() + '\n\n정중하고 짧게, 방문 가능한 일정을 묻는 내용으로 써주세요.'; },
      reply: function (v) {
        var issue = (v.issue || '').trim() || '확인이 필요한 사항이 있습니다';
        return '집주인에게 보낼 문자 초안이에요.\n\n안녕하세요, 사장님. 세입자 ' + settings.name + '입니다.\n다름이 아니라 아래 문제로 연락드립니다.\n- ' + issue + '\n' + (photoUrl ? '사진을 함께 보내드리니 확인 부탁드립니다.' : '상황을 말씀드리니 확인 부탁드립니다.') + '\n가능하신 방문 일정이나 조치 방법을 알려주시면 맞춰서 협조하겠습니다.\n바쁘신 중에 죄송하고, 회신 기다리겠습니다. 감사합니다.\n\n※ 상황에 맞게 내용을 고쳐서 보내세요.';
      },
      action: function () {
        return {
          label: '문자 복사', run: function (btn, answer) {
            var body = answer.split('\n\n').slice(1, -1).join('\n\n');
            try { navigator.clipboard.writeText(body).then(function () { btn.textContent = '복사됐어요'; }, function () { btn.textContent = '복사 실패'; }); } catch (e) { btn.textContent = '복사 실패'; }
          }
        };
      }
    },
    {
      id: 'bill', ico: '💡', name: '공과금·생활비', desc: '아끼는 법, 납부 관리', photo: false,
      fields: [{ k: 'q', label: '궁금한 점', ph: '예) 겨울 가스비를 줄이고 싶어요' }],
      draft: function (v) { return '자취방 생활비 관련 질문이에요.\n질문: ' + (v.q || '(궁금한 점)') + '\n\n바로 할 수 있는 절약 방법과 납부를 놓치지 않는 방법을 알려주세요.'; },
      reply: function () { return R_BILL; }
    }
  ];
  function topicById(id) { for (var i = 0; i < TOPICS.length; i++) { if (TOPICS[i].id === id) return TOPICS[i]; } return null; }
  function fieldValues() {
    var v = {};
    $('draftFields').querySelectorAll('input[data-k]').forEach(function (i) { v[i.getAttribute('data-k')] = i.value.trim(); });
    return v;
  }
  function refreshDraft() { if (curTopic && !draftDirty) $('draftText').value = curTopic.draft(fieldValues()); }

  function renderTopics() {
    var grid = $('topicGrid'); grid.textContent = '';
    TOPICS.forEach(function (t) {
      var b = el('button', 'topic' + (curTopic && curTopic.id === t.id ? ' on' : '') + (photoUrl && t.photo ? ' suggest' : ''));
      b.type = 'button';
      b.appendChild(el('span', 't-ico', t.ico));
      b.appendChild(el('b', null, t.name + (photoUrl && t.photo ? ' · 추천' : '')));
      b.appendChild(el('small', null, t.desc));
      b.addEventListener('click', function () { openTopic(t.id); });
      grid.appendChild(b);
    });
  }
  function renderPhoto() {
    $('photoBox').hidden = !photoUrl;
    if (photoUrl) $('photoImg').src = photoUrl;
  }
  function openTopic(id, fill) {
    var t = topicById(id);
    if (!t) return;
    curTopic = t; draftDirty = false; answerSeq++;
    $('draftTitle').textContent = t.ico + ' ' + t.name + ' 질문 초안';
    var box = $('draftFields'); box.textContent = '';
    t.fields.forEach(function (f, i) {
      var lb = el('label', null, f.label);
      var inp = el('input'); inp.type = 'text'; inp.maxLength = 80; inp.placeholder = f.ph; inp.setAttribute('data-k', f.k);
      if (i === 0 && fill) inp.value = fill;
      lb.appendChild(inp);
      box.appendChild(lb);
    });
    $('draftEmpty').hidden = true; $('draftForm').hidden = false; $('draftBack').hidden = false;
    $('aiAnswer').hidden = true; $('answerActions').hidden = true;
    refreshDraft(); renderTopics();
    var first = box.querySelector('input'); if (first) first.focus();
  }
  function closeTopic() {
    curTopic = null; answerSeq++;
    $('draftTitle').textContent = '질문 초안';
    $('draftEmpty').hidden = false; $('draftForm').hidden = true; $('draftBack').hidden = true;
    $('aiAnswer').hidden = true; $('answerActions').hidden = true;
    renderTopics();
  }
  function initAI() { renderPhoto(); renderTopics(); }

  $('draftFields').addEventListener('input', refreshDraft);
  $('draftText').addEventListener('input', function () { draftDirty = true; });
  $('draftBack').addEventListener('click', function () { closeTopic(); window.scrollTo(0, 0); });
  $('draftForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var text = $('draftText').value.trim();
    if (!curTopic || !text) return;
    var t = curTopic, v = fieldValues(), seq = ++answerSeq;
    var ans = $('aiAnswer'), acts = $('answerActions');
    ans.hidden = false; ans.textContent = '…'; acts.hidden = true; acts.textContent = '';
    setTimeout(function () {
      if (seq !== answerSeq) return;
      var out = t.reply(v, text);
      if (photoUrl && t.photo) out += '\n\n📷 지금은 데모 버전이라 사진 내용을 직접 분석하지는 못해요. 실제 AI를 연결하면 사진을 함께 보내 더 정확히 답해드려요.';
      ans.textContent = out;
      var act = t.action && t.action(v);
      if (act) {
        var b = el('button', 'btn-line', act.label); b.type = 'button';
        b.addEventListener('click', function () { act.run(b, out); });
        acts.appendChild(b); acts.hidden = false;
      }
      ans.scrollIntoView({ block: 'nearest' });
    }, 500);
  });

  /* 사진 찍기: 선택한 사진을 AI 화면으로 넘김 */
  $('photoInput').addEventListener('change', function () {
    var f = this.files && this.files[0];
    this.value = '';
    if (!f || f.type.indexOf('image/') !== 0) return;
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    photoUrl = URL.createObjectURL(f);
    curTopic = null;
    showView('ai');
    closeTopic();
  });
  $('photoRemove').addEventListener('click', function () {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    photoUrl = null; renderPhoto(); renderTopics(); refreshDraft();
  });

  /* ===================== 지도 ===================== */
  var PLACES = {
    '세탁방': [
      { n: '세탁방 A (예시)', d: '도보 약 3분 · 대형 세탁기', lat: 37.5589, lon: 126.9262 },
      { n: '세탁방 B (예시)', d: '도보 약 6분 · 24시간', lat: 37.5561, lon: 126.9231 },
      { n: '세탁방 C (예시)', d: '도보 약 9분 · 건조기', lat: 37.5578, lon: 126.9208 }
    ],
    '편의점': [
      { n: '편의점 A (예시)', d: '도보 약 1분 · 24시간', lat: 37.5565, lon: 126.9240 },
      { n: '편의점 B (예시)', d: '도보 약 4분', lat: 37.5580, lon: 126.9255 },
      { n: '편의점 C (예시)', d: '도보 약 7분 · 24시간', lat: 37.5570, lon: 126.9217 }
    ],
    '약국': [
      { n: '약국 A (예시)', d: '도보 약 5분 · 평일 9~21시', lat: 37.5574, lon: 126.9268 },
      { n: '약국 B (예시)', d: '도보 약 8분 · 심야 운영', lat: 37.5553, lon: 126.9250 }
    ],
    '마트': [
      { n: '마트 A (예시)', d: '도보 약 10분 · 식자재', lat: 37.5594, lon: 126.9225 },
      { n: '마트 B (예시)', d: '도보 약 12분 · 생활용품', lat: 37.5548, lon: 126.9214 }
    ]
  };
  var mapCat = '세탁방', mapIdx = 0, mapReady = false;
  function setMap(p) {
    var b = [p.lon - 0.004, p.lat - 0.0025, p.lon + 0.004, p.lat + 0.0025].join('%2C');
    $('mapFrame').src = 'https://www.openstreetmap.org/export/embed.html?bbox=' + b + '&layer=mapnik&marker=' + p.lat + '%2C' + p.lon;
    $('mapBig').href = 'https://www.openstreetmap.org/?mlat=' + p.lat + '&mlon=' + p.lon + '#map=17/' + p.lat + '/' + p.lon;
  }
  function renderPlaces() {
    var chips = $('mapChips'); chips.textContent = '';
    Object.keys(PLACES).forEach(function (c) {
      var b = el('button', 'chip' + (c === mapCat ? ' on' : ''), c);
      b.type = 'button';
      b.addEventListener('click', function () { mapCat = c; mapIdx = 0; renderPlaces(); setMap(PLACES[c][0]); });
      chips.appendChild(b);
    });
    var box = $('placeList'); box.textContent = '';
    PLACES[mapCat].forEach(function (p, i) {
      var row = el('div', 'place' + (i === mapIdx ? ' on' : ''));
      var t = el('div');
      t.appendChild(el('b', null, p.n));
      t.appendChild(el('small', null, p.d));
      row.appendChild(t);
      row.addEventListener('click', function () { mapIdx = i; renderPlaces(); setMap(p); });
      box.appendChild(row);
    });
  }
  function initMap() { renderPlaces(); if (!mapReady) { mapReady = true; setMap(PLACES[mapCat][0]); } }

  /* ===================== 커뮤니티 ===================== */
  var catFilter = '전체', scope = 'here';
  var openCmt = {};
  var selectedPostId = null;
  function rel(ts) {
    var m = Math.floor((Date.now() - ts) / 60000);
    if (m < 1) return '방금 전';
    if (m < 60) return m + '분 전';
    var h = Math.floor(m / 60);
    if (h < 24) return h + '시간 전';
    return Math.floor(h / 24) + '일 전';
  }
  function savePosts() { store('zip-posts', posts); }
  function openTipDetail(postId) {
    selectedPostId = Number(postId) || null;
    if (selectedPostId) openCmt[selectedPostId] = true;
    catFilter = '전체';
    scope = 'here';
    showView('community');
  }
  function renderPostDetail(post, box) {
    var art = el('article', 'post-detail-card');
    var meta = el('div', 'post-meta');
    meta.appendChild(el('span', 'tag', post.cat));
    if (post.region) meta.appendChild(el('span', 'loc', '📍 ' + post.region));
    meta.appendChild(el('span', null, post.author));
    meta.appendChild(el('span', null, '· ' + rel(post.ts)));
    art.appendChild(meta);
    art.appendChild(el('h3', null, post.title));
    art.appendChild(el('p', null, post.body));

    var act = el('div', 'post-actions');
    var like = el('button', 'pbtn' + (post.liked ? ' on' : ''), '♥ ' + post.likes);
    like.type = 'button';
    like.addEventListener('click', function () {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
      savePosts();
      renderPosts();
    });
    act.appendChild(like);
    var cm = el('button', 'pbtn', '💬 ' + post.comments.length);
    cm.type = 'button';
    cm.addEventListener('click', function () { openCmt[post.id] = !openCmt[post.id]; renderPosts(); });
    act.appendChild(cm);
    art.appendChild(act);

    if (openCmt[post.id]) {
      var box2 = el('div', 'cmt detail-cmt');
      post.comments.forEach(function (c) {
        var it = el('div', 'cmt-item');
        it.appendChild(el('b', null, c.author));
        it.appendChild(document.createTextNode(c.text));
        box2.appendChild(it);
      });
      var form = el('form', 'cmt-form');
      var inp = el('input'); inp.type = 'text'; inp.placeholder = '댓글을 입력하세요'; inp.maxLength = 100;
      var btn = el('button', 'btn-primary', '등록'); btn.type = 'submit';
      form.appendChild(inp); form.appendChild(btn);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = inp.value.trim();
        if (!v) return;
        post.comments.push({ author: settings.name, text: v });
        savePosts();
        renderPosts();
      });
      box2.appendChild(form);
      art.appendChild(box2);
    }

    box.appendChild(art);
  }
  function renderPosts() {
    var chips = $('catChips'); chips.textContent = '';
    ['전체', '자유', '꿀팁', '질문', '동네'].forEach(function (c) {
      var b = el('button', 'chip' + (c === catFilter ? ' on' : ''), c);
      b.type = 'button';
      b.addEventListener('click', function () { catFilter = c; renderPosts(); });
      chips.appendChild(b);
    });
    var box = $('postList'); box.textContent = '';
    var region = settings.region, near = NEARBY[region] || [];
    $('commTitle').textContent = scope === 'all' ? '전체 동네 이야기' : scope === 'near' ? '주변 동네 이야기' : (region ? region + ' 이야기' : '우리 동네 이야기');
    $('postWhere').textContent = region ? '📍 ' + region : '';
    $('scopeNote').textContent = !region ? '설정에서 우리 동네를 입력하면 동네별로 모아 볼 수 있어요.'
      : scope === 'near' ? (near.length ? '📍 ' + near.join(' · ') + ' 글을 보여줘요.' : '아직 이 지역의 주변 동네 정보가 없어요.')
        : scope === 'here' ? '📍 ' + region + ' 이웃들의 글이에요.' : '모든 동네의 글을 보여줘요.';
    document.querySelectorAll('#scopeSeg button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-scope') === scope); });
    var items = posts.filter(function (p) {
      if (catFilter !== '전체' && p.cat !== catFilter) return false;
      if (!region || scope === 'all') return true;
      return scope === 'near' ? near.indexOf(p.region) !== -1 : p.region === region;
    }).sort(function (a, b) { return b.ts - a.ts; });
    if (selectedPostId) {
      var selected = items.find(function (p) { return Number(p.id) === Number(selectedPostId); });
      if (selected) {
        var back = el('button', 'btn-line', '‹ 목록으로');
        back.type = 'button';
        back.style.marginBottom = '12px';
        back.addEventListener('click', function () { selectedPostId = null; renderPosts(); });
        box.appendChild(back);
        renderPostDetail(selected, box);
        return;
      }
    }
    if (!items.length) { box.appendChild(el('div', 'empty', '아직 글이 없어요. 첫 글을 써보세요!')); return; }
    items.forEach(function (p) {
      var art = el('article', 'post');
      art.tabIndex = 0;
      art.addEventListener('click', function (e) {
        if (e.target.closest('button')) return;
        selectedPostId = p.id;
        renderPosts();
      });
      art.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectedPostId = p.id;
          renderPosts();
        }
      });
      var meta = el('div', 'post-meta');
      meta.appendChild(el('span', 'tag', p.cat));
      if (p.region) meta.appendChild(el('span', 'loc', '📍 ' + p.region));
      meta.appendChild(el('span', null, p.author));
      meta.appendChild(el('span', null, '· ' + rel(p.ts)));
      art.appendChild(meta);
      art.appendChild(el('h3', null, p.title));
      art.appendChild(el('p', null, p.body));

      var act = el('div', 'post-actions');
      var like = el('button', 'pbtn' + (p.liked ? ' on' : ''), '♥ ' + p.likes);
      like.type = 'button';
      like.addEventListener('click', function () { p.liked = !p.liked; p.likes += p.liked ? 1 : -1; savePosts(); renderPosts(); });
      var cm = el('button', 'pbtn', '💬 ' + p.comments.length);
      cm.type = 'button';
      cm.addEventListener('click', function () { openCmt[p.id] = !openCmt[p.id]; renderPosts(); });
      act.appendChild(like); act.appendChild(cm);
      if (p.mine) {
        var del = el('button', 'pbtn del', '삭제');
        del.type = 'button';
        del.addEventListener('click', function () { posts = posts.filter(function (x) { return x.id !== p.id; }); savePosts(); renderPosts(); });
        act.appendChild(del);
      }
      art.appendChild(act);

      if (openCmt[p.id]) {
        var box2 = el('div', 'cmt');
        p.comments.forEach(function (c) {
          var it = el('div', 'cmt-item');
          it.appendChild(el('b', null, c.author));
          it.appendChild(document.createTextNode(c.text));
          box2.appendChild(it);
        });
        var form = el('form', 'cmt-form');
        var inp = el('input'); inp.type = 'text'; inp.placeholder = '댓글을 입력하세요'; inp.maxLength = 100;
        var btn = el('button', 'btn-primary', '등록'); btn.type = 'submit';
        form.appendChild(inp); form.appendChild(btn);
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var v = inp.value.trim();
          if (!v) return;
          p.comments.push({ author: settings.name, text: v });
          savePosts(); renderPosts();
        });
        box2.appendChild(form);
        art.appendChild(box2);
      }
      box.appendChild(art);
    });
  }
  $('postForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var title = $('postTitle').value.trim(), body = $('postBody').value.trim();
    if (!title || !body) return;
    posts.unshift({ id: Date.now(), region: settings.region || HOME, cat: $('postCat').value, title: title, body: body, author: settings.name, mine: true, ts: Date.now(), likes: 0, liked: false, comments: [] });
    savePosts();
    $('postTitle').value = ''; $('postBody').value = '';
    catFilter = '전체'; scope = 'here';
    renderPosts();
  });
  $('scopeSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    scope = b.getAttribute('data-scope'); renderPosts();
  });

  /* ===================== 설정 ===================== */
  function fillSettings() {
    $('setName').value = settings.name;
    $('setRegion').value = settings.region;
    $('setRentDay').value = settings.rentDay;
    $('setRent').value = settings.rent;
    $('setNoti').checked = settings.notiOn;
    $('setSaved').textContent = '';
  }
  $('setForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('setName').value.trim();
    if (!name) return;
    settings.name = name;
    settings.region = $('setRegion').value.trim();
    settings.rentDay = Math.min(31, Math.max(1, Number($('setRentDay').value) || 15));
    settings.rent = Math.max(0, Number($('setRent').value) || 0);
    settings.notiOn = $('setNoti').checked;
    store('zip-settings', settings);
    applySettings();
    $('setSaved').textContent = '저장됐어요.';
    setTimeout(function () { $('setSaved').textContent = ''; }, 2000);
  });
  $('btnReset').addEventListener('click', function () {
    if (!confirm('일정, 알림 상태, 커뮤니티 글, 설정이 모두 삭제됩니다. 계속할까요?')) return;
    ['zip-settings', 'zip-events', 'zip-noti-read', 'zip-posts', 'zip-todos', 'zip-bills', 'zip-rent-paid'].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) { } });
    location.reload();
  });

  /* ===================== 이번 주 할 일 ===================== */
  var todos = load('zip-todos', null);
  if (!Array.isArray(todos)) {
    todos = [
      { id: 1, text: '임박 재료 소진하기', done: false },
      { id: 2, text: '욕실 청소', done: true },
      { id: 3, text: '바닥 청소', done: true },
      { id: 4, text: '쓰레기통 비우기', done: true },
      { id: 5, text: '수도요금 납부', done: false },
      { id: 6, text: '재활용 분리배출', done: false }
    ];
    store('zip-todos', todos);
  }
  function renderTodoBox(box, done) {
    box.textContent = '';
    todos.forEach(function (t) {
      var row = el('div', 'todo' + (t.done ? ' done' : ''));
      var cb = el('input'); cb.type = 'checkbox'; cb.checked = t.done; cb.setAttribute('aria-label', t.text);
      cb.addEventListener('change', function () { t.done = cb.checked; store('zip-todos', todos); renderTodos(); });
      var del = el('button', 'del', '×'); del.type = 'button'; del.title = '삭제';
      del.addEventListener('click', function () { todos = todos.filter(function (x) { return x.id !== t.id; }); store('zip-todos', todos); renderTodos(); });
      row.appendChild(cb); row.appendChild(el('span', null, t.text)); row.appendChild(del);
      box.appendChild(row);
    });
    if (!todos.length) box.appendChild(el('div', 'empty', '할 일이 없어요. 아래에서 추가해 보세요.'));
  }
  function renderTodos() {
    var done = todos.filter(function (t) { return t.done; }).length;
    var total = todos.length;
    var pct = total ? Math.round(done / total * 100) : 0;
    var sub = total ? '전체 ' + total + '개 중 ' + done + '개 완료' : '할 일을 추가해 보세요';
    renderTodoBox($('todoList')); renderTodoBox($('todoList2'));
    $('todoCount').textContent = total ? done + '/' + total : '';
    $('todoCount2').textContent = total ? done + '/' + total : '';
    $('todoLeft').textContent = total - done;
    $('todoBar').style.width = pct + '%'; $('todoBar2').style.width = pct + '%';
    $('todoSub').textContent = sub; $('todoSub2').textContent = sub + (total ? ' · ' + pct + '%' : '');
  }
  function addTodo(input) {
    var v = input.value.trim();
    if (!v) return;
    todos.push({ id: Date.now(), text: v, done: false });
    store('zip-todos', todos);
    input.value = '';
    renderTodos();
  }
  $('todoForm2').addEventListener('submit', function (e) { e.preventDefault(); addTodo($('todoInput2')); });
  $('todoClear').addEventListener('click', function () {
    todos = todos.filter(function (t) { return !t.done; });
    store('zip-todos', todos); renderTodos();
  });
  $('todoForm').addEventListener('submit', function (e) { e.preventDefault(); addTodo($('todoInput')); });

  /* ===================== 공과금 ===================== */
  var bills = load('zip-bills', null);
  if (!Array.isArray(bills)) {
    bills = [
      { id: 1, name: '가스', amount: 28000, paid: true },
      { id: 2, name: '전기', amount: 40000, paid: true },
      { id: 3, name: '수도', amount: 32000, paid: false }
    ];
    store('zip-bills', bills);
  }
  function won(n) { return Number(n).toLocaleString('ko-KR') + '원'; }
  function saveBills() { store('zip-bills', bills); renderBills(); }
  function renderBills() {
    var total = 0, paid = 0;
    bills.forEach(function (b) { total += b.amount; if (b.paid) paid += b.amount; });
    var pct = total ? Math.round(paid / total * 100) : 0;
    var paidNames = bills.filter(function (b) { return b.paid; }).map(function (b) { return b.name; });
    var leftNames = bills.filter(function (b) { return !b.paid; }).map(function (b) { return b.name; });
    $('billPct').textContent = pct;
    $('billBar').style.width = pct + '%';
    var parts = [];
    if (paidNames.length) parts.push(paidNames.join(' · ') + ' 납부 완료');
    if (leftNames.length) parts.push(leftNames.join(' · ') + ' 남음');
    $('billSub').textContent = parts.length ? parts.join(', ') : '공과금 항목을 추가해 보세요';
    $('billTitle').textContent = (today.getMonth() + 1) + '월 공과금';
    $('billTotal').textContent = won(total); $('billPaid').textContent = won(paid); $('billLeft').textContent = won(total - paid);
    $('billBar2').style.width = pct + '%';
    var box = $('billList'); box.textContent = '';
    bills.forEach(function (b) {
      var row = el('div', 'bill' + (b.paid ? ' paid' : ''));
      var cb = el('input'); cb.type = 'checkbox'; cb.checked = b.paid; cb.setAttribute('aria-label', b.name + ' 납부');
      cb.addEventListener('change', function () { b.paid = cb.checked; saveBills(); });
      var nm = el('div', 'nm');
      nm.appendChild(el('b', null, b.name));
      nm.appendChild(el('small', null, won(b.amount) + (b.paid ? ' · 납부 완료' : ' · 미납')));
      var del = el('button', 'del', '×'); del.type = 'button'; del.title = '삭제';
      del.addEventListener('click', function () { bills = bills.filter(function (x) { return x.id !== b.id; }); saveBills(); });
      row.appendChild(cb); row.appendChild(nm); row.appendChild(del);
      box.appendChild(row);
    });
    if (!bills.length) box.appendChild(el('div', 'empty', '등록된 공과금이 없어요.'));
  }
  $('billForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('billName').value.trim(), amt = Math.max(0, Number($('billAmount').value) || 0);
    if (!name) return;
    bills.push({ id: Date.now(), name: name, amount: amt, paid: false });
    $('billName').value = ''; $('billAmount').value = '';
    saveBills();
  });
  $('billReset').addEventListener('click', function () {
    bills.forEach(function (b) { b.paid = false; });
    saveBills();
  });

  /* ===================== 쓰레기 배출 (예시 일정) ===================== */
  var DOW = ['일', '월', '화', '수', '목', '금', '토'];
  var TRASH = [
    { t: '일반쓰레기', d: '저녁 6시 ~ 자정, 종량제 봉투 사용' },
    { t: '재활용', d: '저녁 6시 ~ 자정, 플라스틱 · 캔 · 종이 분리' },
    { t: '일반쓰레기', d: '저녁 6시 ~ 자정, 종량제 봉투 사용' },
    { t: '재활용', d: '저녁 6시 ~ 자정, 유리병 · 비닐 분리' },
    { t: '일반쓰레기', d: '저녁 6시 ~ 자정, 종량제 봉투 사용' },
    { t: '재활용', d: '저녁 6시 ~ 자정, 플라스틱 · 캔 · 종이 분리' },
    null
  ];
  function renderTrash() {
    var td = TRASH[today.getDay()];
    $('trashToday').textContent = td ? '오늘은 ' + td.t : '오늘은 배출 없음';
    $('trashSub').textContent = td ? td.d : '내일 배출을 준비하세요';
    var box = $('trashBox'); box.textContent = '';
    box.appendChild(el('b', null, td ? td.t : '배출 없음'));
    box.appendChild(document.createTextNode(td ? td.d : '오늘은 배출하는 날이 아니에요. 쓰레기는 모아 두세요.'));
    var wk = $('trashWeek'); wk.textContent = '';
    TRASH.forEach(function (x, i) {
      var row = el('div', 'week-row' + (i === today.getDay() ? ' today' : ''));
      row.appendChild(el('span', 'dw', DOW[i]));
      var it = el('div', 'it');
      it.appendChild(document.createTextNode(x ? x.t : '배출 없음'));
      if (x) it.appendChild(el('small', null, x.d));
      row.appendChild(it);
      if (i === today.getDay()) row.appendChild(el('span', 'tag warn', '오늘'));
      wk.appendChild(row);
    });
  }

  /* ===================== 월세 ===================== */
  var rentPaid = load('zip-rent-paid', {});
  function rentKey(y, m) { return y + '-' + pad(m + 1); }
  function renderRent() {
    var c = nextRentDate(), diff = dayDiff(fmt(c));
    $('rentBig').textContent = diff === 0 ? 'D-Day' : 'D-' + diff;
    $('rentDate').textContent = c.getFullYear() + '년 ' + (c.getMonth() + 1) + '월 ' + c.getDate() + '일 (' + DOW[c.getDay()] + ')';
    $('rentAmt').textContent = settings.rent + '만원';
    $('rentDayTxt').textContent = '매월 ' + settings.rentDay + '일';
    var box = $('rentHistory'); box.textContent = '';
    for (var i = 0; i < 6; i++) {
      var d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      var key = rentKey(d.getFullYear(), d.getMonth());
      var row = el('label', 'rent-row');
      var cb = el('input'); cb.type = 'checkbox'; cb.checked = !!rentPaid[key];
      (function (k, box2) {
        box2.addEventListener('change', function () { rentPaid[k] = box2.checked; store('zip-rent-paid', rentPaid); applySettings(); renderRent(); });
      })(key, cb);
      row.appendChild(cb);
      row.appendChild(el('span', null, d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월'));
      row.appendChild(el('small', null, rentPaid[key] ? '납부 완료' : (i === 0 ? '이번 달 · 미납' : '미납')));
      box.appendChild(row);
    }
  }
  $('rentCal').addEventListener('click', function () {
    var c = nextRentDate(), ds = fmt(c);
    var msg = $('rentMsg');
    var exists = events.some(function (ev) { return ev.date === ds && ev.title === '월세 납부'; });
    if (!exists) {
      events.push({ id: Date.now(), date: ds, time: '', title: '월세 납부' });
      store('zip-events', events); updateDot();
    }
    msg.textContent = exists ? '이미 캘린더에 있어요.' : (c.getMonth() + 1) + '월 ' + c.getDate() + '일 일정으로 추가했어요.';
    setTimeout(function () { msg.textContent = ''; }, 2500);
  });

  /* ===================== 시작 ===================== */
  applySettings();
  renderCalendarAll();
  renderTodos();
  renderBills();
  renderTrash();
})();
