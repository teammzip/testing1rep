/* localStorage 읽기/쓰기. 나중에 서버 API로 바꿀 때 이 파일(과 state.js)만 고치면 된다. */
export function load(key, fallback) {
  try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
}
export function store(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { } }
