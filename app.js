/* ============================================
   记账本 — 完整功能实现（localStorage 持久化）
   ============================================ */

// ===== 类别配置 =====
const CATEGORIES = {
    breakfast: { name: '早餐', icon: '🌅', color: '#ff6b6b' },
    lunch: { name: '午餐', icon: '☀️', color: '#ffa502' },
    dinner: { name: '晚餐', icon: '🌙', color: '#a29bfe' },
    snack: { name: '夜宵', icon: '🌃', color: '#e17055' },
    laundry: { name: '洗衣', icon: '👕', color: '#00d2d3' },
    drink: { name: '小饮料', icon: '🧃', color: '#55efc4' },
    transport: { name: '交通', icon: '🚌', color: '#54a0ff' },
    shopping: { name: '购物', icon: '🛒', color: '#ffeaa7' },
    social: { name: '人情', icon: '🤝', color: '#fd79a8' },
    socks: { name: '袜子', icon: '🧦', color: '#636e72' },
    other: { name: '其他', icon: '📦', color: '#b2bec3' },
};

// ===== 数据操作 =====
const STORAGE_KEY = 'zhangben_records';

function loadRecords() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

function saveRecords(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function addRecord(record) {
    const records = loadRecords();
    record.id = Date.now().toString();
    records.push(record);
    saveRecords(records);
    return record;
}

function deleteRecord(id) {
    const records = loadRecords().filter(r => r.id !== id);
    saveRecords(records);
}

function getRecordsByMonth(year, month) {
    const records = loadRecords();
    return records.filter(r => {
        const d = new Date(r.date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ===== 工具函数 =====
function formatMoney(n) {
    return '¥ ' + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getDayOfWeek(dateStr) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[new Date(dateStr).getDay()];
}

function pad(n) {
    return String(n).padStart(2, '0');
}

// ===== DOM 就绪 =====
document.addEventListener('DOMContentLoaded', () => {

    // ---------- 导航 ----------
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
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    function setActivePage(pageId) {
        dropdownItems.forEach(item => item.classList.toggle('active', item.dataset.page === pageId));
    }
    setActivePage('home');

    dropdownItems.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const target = item.dataset.page;
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(`page-${target}`).classList.add('active');
            setActivePage(target);
            closeMenu();
            // 切到历史或统计页时刷新数据
            if (target === 'history') renderHistory();
            if (target === 'stats') renderStats();
            if (target === 'settings') updateRecordCount();
        });
    });

    // ---------- 记账表单 ----------
    const inputTime = document.getElementById('input-time');
    const inputCategory = document.getElementById('input-category');
    const inputAmount = document.getElementById('input-amount');
    const inputNote = document.getElementById('input-note');
    const btnSubmit = document.getElementById('btn-submit');
    const toast = document.getElementById('toast');

    // 自动填当前日期
    const now = new Date();
    inputTime.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    // 默认袜子 → 金额 0.01
    inputAmount.value = '0.01';

    // 类别切换
    inputCategory.addEventListener('change', () => {
        if (inputCategory.value === 'socks') {
            inputAmount.value = '0.01';
        } else {
            inputAmount.value = '';
        }
        inputAmount.focus();
    });

    // 提交
    btnSubmit.addEventListener('click', () => {
        const amount = parseFloat(inputAmount.value);
        if (!inputTime.value) { inputTime.focus(); return; }
        if (isNaN(amount) || amount <= 0) { inputAmount.focus(); return; }

        addRecord({
            date: inputTime.value,
            category: inputCategory.value,
            amount: amount,
            note: inputNote.value.trim(),
        });

        // 显示成功提示
        showToast();

        // 重置表单
        const today = new Date();
        inputTime.value = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
        inputCategory.value = 'socks';
        inputAmount.value = '0.01';
        inputNote.value = '';
    });

    function showToast() {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1500);
    }

    // ---------- 历史账目页 ----------
    let histYear = now.getFullYear();
    let histMonth = now.getMonth() + 1;

    const monthLabel = document.getElementById('month-label');
    const monthPrev = document.getElementById('month-prev');
    const monthNext = document.getElementById('month-next');
    const monthTotalAmount = document.getElementById('month-total-amount');
    const recordListEl = document.getElementById('record-list');

    function updateHistoryMonth() {
        monthLabel.textContent = `${histYear}年${histMonth}月`;
    }

    monthPrev.addEventListener('click', () => {
        histMonth--;
        if (histMonth < 1) { histMonth = 12; histYear--; }
        updateHistoryMonth();
        renderHistory();
    });

    monthNext.addEventListener('click', () => {
        histMonth++;
        if (histMonth > 12) { histMonth = 1; histYear++; }
        updateHistoryMonth();
        renderHistory();
    });

    function renderHistory() {
        updateHistoryMonth();
        const records = getRecordsByMonth(histYear, histMonth);
        const total = records.reduce((s, r) => s + r.amount, 0);
        monthTotalAmount.textContent = formatMoney(total);

        if (records.length === 0) {
            recordListEl.innerHTML = '<div class="empty-state">📭 这个月还没有账目，去记一笔吧</div>';
            return;
        }

        // 按日期分组
        const groups = {};
        records.forEach(r => {
            const key = r.date;
            if (!groups[key]) groups[key] = [];
            groups[key].push(r);
        });

        let html = '';
        const sortedDates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));

        sortedDates.forEach(dateStr => {
            const items = groups[dateStr];
            const dayTotal = items.reduce((s, r) => s + r.amount, 0);
            const d = new Date(dateStr);
            const label = `${d.getMonth() + 1}月${d.getDate()}日 ${getDayOfWeek(dateStr)}`;

            html += `<div class="date-group">`;
            html += `<div class="date-header">`;
            html += `<span class="date-label">${label}</span>`;
            html += `<span class="date-total">-${formatMoney(dayTotal)}</span>`;
            html += `</div>`;

            items.forEach(r => {
                const cat = CATEGORIES[r.category] || CATEGORIES.other;
                html += `
          <div class="record-item" data-id="${r.id}">
            <div class="record-icon" style="background: ${cat.color};">${cat.icon}</div>
            <div class="record-info">
              <div class="record-category">${cat.name}</div>
              <div class="record-note">${r.note || '—'}</div>
            </div>
            <div class="record-right">
              <div class="record-amount">-${formatMoney(r.amount)}</div>
              <div class="delete-area" data-id="${r.id}">
                <button class="btn-delete" data-id="${r.id}">🗑️ 删除</button>
                <div class="delete-confirm" style="display:none;">
                  <button class="btn-confirm-yes" data-id="${r.id}">确认</button>
                  <button class="btn-confirm-no">取消</button>
                </div>
              </div>
            </div>
          </div>`;
            });

            html += `</div>`;
        });

        recordListEl.innerHTML = html;

        // 绑定删除按钮 —— 内联确认，不使用 confirm()
        recordListEl.querySelectorAll('.delete-area').forEach(area => {
            const btnDel = area.querySelector('.btn-delete');
            const confirmBox = area.querySelector('.delete-confirm');
            const btnYes = area.querySelector('.btn-confirm-yes');
            const btnNo = area.querySelector('.btn-confirm-no');

            btnDel.addEventListener('click', e => {
                e.stopPropagation();
                e.preventDefault();
                btnDel.style.display = 'none';
                confirmBox.style.display = 'flex';
            });

            btnYes.addEventListener('click', e => {
                e.stopPropagation();
                e.preventDefault();
                deleteRecord(btnYes.dataset.id);
                renderHistory();
            });

            btnNo.addEventListener('click', e => {
                e.stopPropagation();
                e.preventDefault();
                confirmBox.style.display = 'none';
                btnDel.style.display = 'inline-flex';
            });
        });
    }

    // ---------- 统计页 ----------
    let statsYear = now.getFullYear();
    let statsMonth = now.getMonth() + 1;

    const statsMonthLabel = document.getElementById('stats-month-label');
    const statsMonthPrev = document.getElementById('stats-month-prev');
    const statsMonthNext = document.getElementById('stats-month-next');
    const statsTotalCategory = document.getElementById('stats-total-category');
    const statsTotalDaily = document.getElementById('stats-total-daily');
    const categoryStatsList = document.getElementById('category-stats-list');
    const dailyStatsList = document.getElementById('daily-stats-list');

    function updateStatsMonth() {
        statsMonthLabel.textContent = `${statsYear}年${statsMonth}月`;
    }

    statsMonthPrev.addEventListener('click', () => {
        statsMonth--;
        if (statsMonth < 1) { statsMonth = 12; statsYear--; }
        renderStats();
    });

    statsMonthNext.addEventListener('click', () => {
        statsMonth++;
        if (statsMonth > 12) { statsMonth = 1; statsYear++; }
        renderStats();
    });

    // Tab 切换
    const statsTabs = document.querySelectorAll('.stats-tab');
    const statsPanels = document.querySelectorAll('.stats-panel');
    statsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            statsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            statsPanels.forEach(p => p.classList.remove('active'));
            document.getElementById(`stats-${tab.dataset.tab}`).classList.add('active');
        });
    });

    function renderStats() {
        updateStatsMonth();
        const records = getRecordsByMonth(statsYear, statsMonth);
        const total = records.reduce((s, r) => s + r.amount, 0);

        statsTotalCategory.textContent = formatMoney(total);
        statsTotalDaily.textContent = formatMoney(total);

        // --- 类别统计 ---
        if (records.length === 0) {
            categoryStatsList.innerHTML = '<div class="empty-state">📭 暂无数据</div>';
            dailyStatsList.innerHTML = '<div class="empty-state">📭 暂无数据</div>';
            // 清空饼图
            const pieEl = document.getElementById('pie-chart');
            if (pieEl) { pieEl.style.background = 'var(--bg-card)'; pieEl.querySelector('.pie-center').textContent = '无数据'; }
            return;
        }

        const catTotals = {};
        records.forEach(r => {
            catTotals[r.category] = (catTotals[r.category] || 0) + r.amount;
        });

        const catSorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
        const maxCat = catSorted[0][1];

        // 生成饼图 (conic-gradient)
        let gradientParts = [];
        let currentDeg = 0;
        catSorted.forEach(([key, amount]) => {
            const cat = CATEGORIES[key] || CATEGORIES.other;
            const deg = (amount / total) * 360;
            gradientParts.push(`${cat.color} ${currentDeg}deg ${currentDeg + deg}deg`);
            currentDeg += deg;
        });

        const pieEl = document.getElementById('pie-chart');
        if (pieEl) {
            pieEl.style.background = `conic-gradient(${gradientParts.join(', ')})`;
            pieEl.querySelector('.pie-center').textContent = `${catSorted.length} 类`;
        }

        let catHtml = '';
        catSorted.forEach(([key, amount]) => {
            const cat = CATEGORIES[key] || CATEGORIES.other;
            const pct = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
            const barW = total > 0 ? ((amount / maxCat) * 100).toFixed(0) : 0;
            catHtml += `
        <div class="cat-row">
          <span class="cat-icon">${cat.icon}</span>
          <span class="cat-name">${cat.name}</span>
          <div class="cat-bar"><div class="cat-bar-fill" style="width:${barW}%; background:${cat.color};"></div></div>
          <span class="cat-amount">${formatMoney(amount)}</span>
          <span class="cat-pct">${pct}%</span>
        </div>`;
        });
        categoryStatsList.innerHTML = catHtml;

        // --- 每日统计 ---
        const dayTotals = {};
        records.forEach(r => {
            dayTotals[r.date] = (dayTotals[r.date] || 0) + r.amount;
        });

        const daySorted = Object.entries(dayTotals).sort((a, b) => new Date(b[0]) - new Date(a[0]));

        let dayHtml = '';
        daySorted.forEach(([dateStr, amount]) => {
            const d = new Date(dateStr);
            const count = records.filter(r => r.date === dateStr).length;
            dayHtml += `
        <div class="daily-row">
          <span class="daily-date">${d.getMonth() + 1}月${d.getDate()}日</span>
          <span class="daily-count">${count} 笔</span>
          <span class="daily-amount">-${formatMoney(amount)}</span>
        </div>`;
        });
        dailyStatsList.innerHTML = dayHtml;
    }

    // ---------- 设置页 ----------
    function updateRecordCount() {
        const count = loadRecords().length;
        document.getElementById('record-count').textContent = `${count} 条`;
    }

    // 清空数据
    const btnClear = document.getElementById('btn-clear-data');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('确定要清空所有记账数据？此操作不可恢复。')) {
                localStorage.removeItem(STORAGE_KEY);
                renderHistory();
                renderStats();
                updateRecordCount();
                showToast();
            }
        });
    }

    // 导出 Excel (.xls) — 使用 data URI 确保本地可下载
    const btnExport = document.getElementById('btn-export');
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            const records = loadRecords();
            if (records.length === 0) { alert('没有数据可导出'); return; }

            // 生成 CSV 内容（用 Excel 能打开的 UTF-8 BOM CSV）
            let csv = '\uFEFF日期,类别,金额,备注\n';
            records.forEach(r => {
                const catName = (CATEGORIES[r.category] || CATEGORIES.other).name;
                const note = (r.note || '').replace(/"/g, '""');
                csv += `${r.date},${catName},${r.amount},"${note}"\n`;
            });

            // 转为 base64 data URI
            const base64 = btoa(unescape(encodeURIComponent(csv)));
            const dataUri = 'data:text/csv;base64,' + base64;

            const a = document.createElement('a');
            a.href = dataUri;
            a.download = `记账本_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }

    // ---------- 初始化 ----------
    updateHistoryMonth();
    updateStatsMonth();
});
