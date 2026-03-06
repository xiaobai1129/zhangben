// Service Worker — 离线缓存（缓存优先策略）
const CACHE_NAME = 'zhangben-v2';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './icon-180.png',
];

// 安装 → 缓存所有核心资源
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// 激活 → 清理旧版本缓存，立即接管页面
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// 拦截请求 → 缓存优先，秒开
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;

    e.respondWith(
        caches.match(e.request).then(cached => {
            // 1. 有缓存 → 立即返回（同时后台更新缓存）
            if (cached) {
                // 后台静默更新：不阻塞页面加载
                e.waitUntil(
                    fetch(e.request).then(response => {
                        if (response && response.status === 200) {
                            caches.open(CACHE_NAME).then(cache => cache.put(e.request, response));
                        }
                    }).catch(() => {/* 离线就跳过更新 */ })
                );
                return cached;
            }

            // 2. 无缓存 → 网络请求（带 3 秒超时）
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            return fetch(e.request, { signal: controller.signal }).then(response => {
                clearTimeout(timeoutId);
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                }
                return response;
            }).catch(() => {
                clearTimeout(timeoutId);
                // 离线且无缓存 → 返回主页面
                if (e.request.destination === 'document') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
