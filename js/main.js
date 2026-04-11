function formatDate(date, timezone = 'utc') {
    if (timezone === 'utc') {
        return `${date.toUTCString()}\n${date.toISOString()}`;
    } else {
        return `${date.toLocaleString()}\n${date.toISOString()}`;
    }
}

function timestampToDate(timestamp) {
    try {
        const cleanTs = timestamp.replace(/[^0-9.]/g, '');
        if (!cleanTs) return { success: false, text: "Please enter a valid timestamp" };

        let tsNum = parseFloat(cleanTs);
        if (isNaN(tsNum)) return { success: false, text: "Invalid number format" };

        let date;
        if (cleanTs.length === 10 || (cleanTs.includes('.') && cleanTs.split('.')[0].length === 10)) {
            date = new Date(Math.floor(tsNum * 1000));
        } else if (cleanTs.length === 13 || (cleanTs.includes('.') && cleanTs.split('.')[0].length === 13)) {
            date = new Date(Math.floor(tsNum));
        } else {
            return { success: false, text: `Invalid timestamp (expected 10/13 digits)` };
        }

        if (isNaN(date.getTime())) return { success: false, text: "Timestamp out of valid range" };
        const timezone = document.querySelector('input[name="timezone"]:checked').value;
        return { success: true, text: formatDate(date, timezone) };
    } catch (e) {
        return { success: false, text: "Error parsing timestamp" };
    }
}

function dateToTimestamp(dateStr) {
    try {
        if (!dateStr) return { success: false, text: "Please select a date" };
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return { success: false, text: "Invalid date format" };
        const ms = date.getTime();
        const s = Math.floor(ms / 1000);
        return { success: true, text: `13-digit (ms): ${ms}\n10-digit (s): ${s}` };
    } catch (e) {
        return { success: false, text: "Error converting date" };
    }
}

function getCurrentTimestamp() {
    const now = new Date();
    return { success: true, text: `13-digit (ms): ${now.getTime()}\n10-digit (s): ${Math.floor(now.getTime() / 1000)}\nISO 8601: ${now.toISOString()}\nRFC 2822: ${now.toUTCString()}` };
}

function renderResult(id, result) {
    const el = document.getElementById(id);
    const lines = result.text.split('\n').filter(l => l.trim() !== '');
    const stateClass = result.neutral ? 'result-neutral' : result.success ? 'result-success' : 'result-error';

    el.innerHTML = '';
    el.className = `mt-4 p-2 rounded-lg min-h-[40px] ${stateClass}`;

    lines.forEach(line => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between px-2 py-0.5 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 group';
        const span = document.createElement('span');
        span.textContent = line;
        const icon = document.createElement('span');
        icon.textContent = '📋';
        icon.className = 'opacity-0 group-hover:opacity-50 text-xs ml-2 flex-shrink-0';
        div.appendChild(span);
        div.appendChild(icon);
        div.addEventListener('click', () => copy(line, icon));
        el.appendChild(div);
    });
}

async function copy(text, btn) {
    try {
        await navigator.clipboard.writeText(text);
        const old = btn.textContent;
        btn.textContent = "✅";
        setTimeout(() => btn.textContent = old, 1000);
    } catch (e) {
        alert("Copy failed");
    }
}

function fillNowDate() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth()+1).padStart(2,0);
    const d = String(now.getDate()).padStart(2,0);
    const hh = String(now.getHours()).padStart(2,0);
    const mm = String(now.getMinutes()).padStart(2,0);
    document.getElementById('dateInput').value = `${y}-${m}-${d}T${hh}:${mm}`;
}

document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    // Check for saved theme preference or default to dark
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
    themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeIcon.textContent = isDark ? '☀️' : '🌙';
    });

    document.getElementById('convertToDateBtn').onclick = () => renderResult('dateResult', timestampToDate(document.getElementById('timestampInput').value));
    document.getElementById('convertToTimestampBtn').onclick = () => renderResult('timestampResult', dateToTimestamp(document.getElementById('dateInput').value));
    document.getElementById('getCurrentTimestampBtn').onclick = () => renderResult('currentTimestampResult', getCurrentTimestamp());

    document.getElementById('clearTimestampInput').onclick = () => { document.getElementById('timestampInput').value = ''; renderResult('dateResult', {neutral:true, text:'Enter a timestamp and click convert'}); };
    document.getElementById('clearDateInput').onclick = () => { document.getElementById('dateInput').value = ''; renderResult('timestampResult', {neutral:true, text:'Select a date and click convert'}); };

    document.getElementById('fillCurrentTimestampBtn').onclick = () => { const t = String(Math.floor(Date.now()/1000)); document.getElementById('timestampInput').value = t; renderResult('dateResult', timestampToDate(t)); };
    document.getElementById('fillCurrentDateBtn').onclick = () => { fillNowDate(); renderResult('timestampResult', dateToTimestamp(document.getElementById('dateInput').value)); };

    document.getElementById('copyTimestampInput').onclick = () => copy(document.getElementById('timestampInput').value, document.getElementById('copyTimestampInput'));
    document.getElementById('copyDateInput').onclick = () => copy(document.getElementById('dateInput').value, document.getElementById('copyDateInput'));
    fillNowDate();

    const modal = document.getElementById('privacyModal');
    document.getElementById('openPrivacyBtn').onclick = () => modal.classList.replace('hidden', 'flex');
    document.getElementById('closePrivacyBtn').onclick = () => modal.classList.replace('flex', 'hidden');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.replace('flex', 'hidden'); });
});
