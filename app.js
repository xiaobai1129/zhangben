/* ============================================
   记账本 — 交互逻辑 v2
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ===== 下拉菜单 =====
    const menuBtn = document.getElementById('menu-btn');
    const dropdown = document.getElementById('dropdown-menu');
    const backdrop = document.getElementById('dropdown-backdrop');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const pages = document.querySelectorAll('.page');

    function openMenu() {
        dropdown.classList.add('open');
        backdrop.classList.add('open');
    }

    function closeMenu() {
        dropdown.classList.remove('open');
        backdrop.classList.remove('open');
    }

    menuBtn.addEventListener('click', () => {
        dropdown.classList.contains('open') ? closeMenu() : openMenu();
    });

    backdrop.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    // 高亮当前页
    function setActivePage(pageId) {
        dropdownItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageId);
        });
    }
    setActivePage('home');

    // 页面切换
    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.dataset.page;

            pages.forEach(p => p.classList.remove('active'));
            const page = document.getElementById(`page-${target}`);
            if (page) page.classList.add('active');

            setActivePage(target);
            closeMenu();
        });
    });

    // ===== 月份切换（演示） =====
    const monthLabel = document.getElementById('month-label');
    const monthPrev = document.getElementById('month-prev');
    const monthNext = document.getElementById('month-next');

    let year = 2026, month = 3;

    function updateMonth() {
        if (monthLabel) monthLabel.textContent = `${year}年${month}月`;
    }

    if (monthPrev) {
        monthPrev.addEventListener('click', () => {
            month--;
            if (month < 1) { month = 12; year--; }
            updateMonth();
        });
    }

    if (monthNext) {
        monthNext.addEventListener('click', () => {
            month++;
            if (month > 12) { month = 1; year++; }
            updateMonth();
        });
    }

    // ===== 统计页 Tab 切换 =====
    const statsTabs = document.querySelectorAll('.stats-tab');
    const statsPanels = document.querySelectorAll('.stats-panel');

    statsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            statsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            statsPanels.forEach(p => p.classList.remove('active'));
            const panel = document.getElementById(`stats-${target}`);
            if (panel) panel.classList.add('active');
        });
    });

    // ===== 提交按钮（暂无实际功能） =====
    const btnSubmit = document.getElementById('btn-submit');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', () => {
            // 后续接入 localStorage
        });
    }

    // ===== 自动填入当前日期 =====
    const timeInput = document.getElementById('input-time');
    if (timeInput) {
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        timeInput.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    }

    // ===== 类别切换 → 袜子自动填金额 0.01，其他类别清空 =====
    const categorySelect = document.getElementById('input-category');
    const amountInput = document.getElementById('input-amount');

    if (categorySelect && amountInput) {
        // 默认类别是袜子，页面加载时填 0.01
        amountInput.value = '0.01';

        categorySelect.addEventListener('change', () => {
            if (categorySelect.value === 'socks') {
                amountInput.value = '0.01';
            } else {
                amountInput.value = '';
            }
        });
    }
});
