// ===== ローディング演出：終わったら本文を出す & main-ready 付与 =====
window.addEventListener("load", () => {
    const loadingScreen = document.getElementById("loading-screen");
    const mainContent = document.getElementById("main-content");
    const DURATION = 3600; // CSSアニメ 3.2s + 余裕

    setTimeout(() => {
        loadingScreen?.classList.add("hidden");
        if (mainContent) {
            mainContent.classList.remove("hidden");
            mainContent.classList.add("show");
        }
        document.body.classList.add("main-ready");
    }, DURATION);
});

// ===== スムーススクロール（縦メニュー） =====
document.querySelectorAll(".vnav__link").forEach(link => {
    link.addEventListener("click", e => {
        const id = link.getAttribute("href")?.slice(1);
        const el = id ? document.getElementById(id) : null;
        if (!el) return;
        e.preventDefault();
        const y = el.getBoundingClientRect().top + window.scrollY - 16;
        window.scrollTo({ top: y, behavior: "smooth" });
    });
});

// ===== DOMContentLoaded の取りこぼし対策ユーティリティ =====
const onReady = (fn) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
        fn();
    }
};

// ===== IntersectionObserver：画面下30%でフェードイン =====
const setupReveal = (selector) => {
    const nodes = document.querySelectorAll(selector);
    if (!nodes.length) return;

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
            }
        });
    }, {
        // 下から30%ラインで発火（= ビューポート下側を70%に切り上げ）
        root: null,
        rootMargin: "0px 0px -30% 0px",
        threshold: 0
    });

    nodes.forEach(n => io.observe(n));
};

onReady(() => {
    setupReveal(".section-title");
    setupReveal(".work-item");
});

// ===== テーマ画像の切替（data-light / data-dark を持つ <img> 対象） =====
const applyThemeImages = (mode) => {
    document.querySelectorAll('img[data-light][data-dark]').forEach(img => {
        img.src = (mode === "dark") ? img.dataset.dark : img.dataset.light;
    });
};

// ===== テーマトグル（ワイプ演出付き） =====
const themeToggle = document.getElementById("theme-toggle");

// 初期状態：保存済みテーマを反映
(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
        document.body.classList.add("dark-mode");
        applyThemeImages("dark");
        if (themeToggle) themeToggle.textContent = "White";
    }
})();

// クリック位置から円形ワイプで切替
themeToggle?.addEventListener("click", (e) => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const toDark = !document.body.classList.contains("dark-mode");
    const nextMode = toDark ? "dark" : "light";
    const nextBg   = toDark ? "#0A222F" : "#ffffff";

    if (prefersReduced) {
        document.body.classList.toggle("dark-mode");
        applyThemeImages(nextMode);
        localStorage.setItem("theme", nextMode);
        themeToggle.textContent = toDark ? "White" : "Black";
        return;
    }

    // ボタン中心（ビューポート座標）
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;

    // ワイプ生成（position: fixed 用にビューポート基準で配置）
    const wipe = document.createElement("div");
    wipe.className = "theme-wipe";
    wipe.style.background = nextBg;
    wipe.style.left = `calc(${cx}px - 100vmax)`;
    wipe.style.top  = `calc(${cy}px - 100vmax)`;

    document.body.appendChild(wipe);

    // リフロー → 拡大
    // eslint-disable-next-line no-unused-expressions
    wipe.offsetWidth;
    wipe.style.transform = "scale(1)";

    // アニメ完了でテーマ適用＆後処理
    const finish = () => {
        document.body.classList.toggle("dark-mode");
        applyThemeImages(nextMode);
        localStorage.setItem("theme", nextMode);
        themeToggle.textContent = toDark ? "White" : "Black";

        wipe.style.opacity = "0";
        setTimeout(() => wipe.remove(), 350);
        wipe.removeEventListener("transitionend", finish);
    };
    wipe.addEventListener("transitionend", finish, { once: true });
});



