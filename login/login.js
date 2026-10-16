/* 로그인 예시용 동작 (실제 인증이 아니라 화면 흐름만 보여주는 데모) */
(function () {
  var params = new URLSearchParams(location.search);
  var next = params.get('next') || window.LOGIN_NEXT || '../variants/1/asdf.html';   // 다른 폴더에서 쓸 때는 LOGIN_NEXT로 이동할 주소를 미리 지정
  var form = document.getElementById('loginForm');
  var mode = 'login';

  function setMode(m) {
    mode = m;
    document.getElementById('title').textContent = m === 'login' ? '다시 만나서 반가워요' : '처음이세요? 가입해요';
    document.getElementById('lead').textContent = m === 'login' ? '로그인하고 내 일정과 할 일을 이어서 확인하세요.' : '이메일과 비밀번호만 있으면 바로 시작할 수 있어요.';
    document.getElementById('nickField').hidden = m === 'login';
    document.getElementById('loginOnly').hidden = m !== 'login';
    document.getElementById('submitBtn').textContent = m === 'login' ? '로그인' : '가입하고 시작하기';
    document.getElementById('switchText').innerHTML = m === 'login'
      ? '아직 계정이 없나요? <a id="swLink">회원가입</a>'
      : '이미 계정이 있나요? <a id="swLink">로그인</a>';
    document.getElementById('swLink').addEventListener('click', function () { setMode(m === 'login' ? 'signup' : 'login'); });
    document.getElementById('error').textContent = '';
  }

  function enter() {
    if (typeof window.onLoginSuccess === 'function') window.onLoginSuccess(next);   // B안: 같은 페이지에서 덮개 제거
    else location.href = next;                                                    // A·C안: 시안 화면으로 이동
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = form.email.value.trim(), pw = form.pw.value;
    var err = document.getElementById('error');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err.textContent = '이메일 형식을 확인해 주세요.'; return; }
    if (pw.length < 4) { err.textContent = '비밀번호는 4자 이상 입력해 주세요.'; return; }
    if (mode === 'signup' && !form.nick.value.trim()) { err.textContent = '닉네임을 입력해 주세요.'; return; }
    enter();
  });

  document.getElementById('kakaoBtn').addEventListener('click', enter);
  document.getElementById('pwToggle').addEventListener('click', function () {
    var t = form.pw.type === 'password';
    form.pw.type = t ? 'text' : 'password';
    this.textContent = t ? '숨기기' : '보기';
  });
  setMode('login');
})();
