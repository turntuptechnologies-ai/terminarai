// GitHub Pages SPA fallback (rafrex/spa-github-pages 方式)
// /terminarai/<path> に直接アクセスされると Pages は 404 を返すので、
// パスを query string に詰めて /terminarai/ にリダイレクトする。
// index.html 側の spa-restore.js が復元する。
;(function () {
  var pathSegmentsToKeep = 1 // /terminarai/ の深さ
  var l = window.location
  l.replace(
    l.protocol +
      '//' +
      l.hostname +
      (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') +
      '/?/' +
      l.pathname
        .slice(1)
        .split('/')
        .slice(pathSegmentsToKeep)
        .join('/')
        .replace(/&/g, '~and~') +
      (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
      l.hash,
  )
})()
