// GitHub Pages SPA fallback の復元側
// 404.html が ?/<path> 形式で渡してきたパスを history.replaceState で元に戻す。
// この処理は React Router の初期化前 (=モジュールスクリプト実行前) に走る必要があるため、
// 通常スクリプトとして同期ロードする。
;(function (l) {
  if (l.search && l.search[1] === '/') {
    var decoded = l.search
      .slice(1)
      .split('&')
      .map(function (s) {
        return s.replace(/~and~/g, '&')
      })
      .join('?')
    window.history.replaceState(null, '', l.pathname.slice(0, -1) + decoded + l.hash)
  }
})(window.location)
