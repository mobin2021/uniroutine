// UniRoutine - Client Application Logic

// 1. Register Service Worker for Offline-First PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker Registered successfully.'))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}

// 2. PWA Install Prompt Handler
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    deferredPrompt = null;
    installBtn.style.display = 'none';
  }
});

// 3. Network Status Indicator
const statusBadge = document.getElementById('offlineBadge');
function updateOnlineStatus() {
  if (navigator.onLine) {
    statusBadge.textContent = '🟢 Online (PWA Cached)';
    statusBadge.style.background = '#dcfce7';
    statusBadge.style.color = '#15803d';
  } else {
    statusBadge.textContent = '⚡ Offline Mode (Cache Active)';
    statusBadge.style.background = '#fef3c7';
    statusBadge.style.color = '#b45309';
  }
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// 4. Tab Navigation
function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  
  document.getElementById(`${tabName}-view`).style.display = 'block';
  document.getElementById(`tab-${tabName}`).classList.add('active');
}

// 5. Fetch & Render Mock Routines
let routineData = null;

async function loadRoutines() {
  try {
    const res = await fetch('/api/routines');
    routineData = await res.json();
    renderRoutines();
    renderFaculty();
    renderNotices();
  } catch (err) {
    console.log('Failed to fetch from server, checking local fallback...');
  }
}

function renderRoutines() {
  const dept = document.getElementById('deptSelect').value;
  const semester = document.getElementById('semesterSelect').value;
  const container = document.getElementById('routineContainer');
  const key = `${dept}-${semester}`;

  const classes = routineData?.routines?.[key] || [];
  if (classes.length === 0) {
    container.innerHTML = `<div class="routine-card"><p style="color:var(--text-muted)">No scheduled classes found for ${dept.toUpperCase()} (${semester} Semester). Check another semester!</p></div>`;
    return;
  }

  container.innerHTML = classes.map(c => `
    <div class="routine-card">
      <div class="routine-time">${c.day} • ${c.time}</div>
      <div class="routine-course">${c.course}</div>
      <div class="routine-meta">📍 ${c.room} &nbsp;|&nbsp; 👨‍🏫 ${c.faculty}</div>
    </div>
  `).join('');
}

function renderFaculty() {
  const container = document.getElementById('facultyContainer');
  const faculties = routineData?.faculty_directory || [];
  container.innerHTML = faculties.map(f => `
    <div class="faculty-card">
      <div style="font-weight:700;font-size:1.05rem;">${f.name}</div>
      <div style="font-size:0.85rem;color:var(--primary);font-weight:600;">${f.designation} (${f.dept})</div>
      <div style="font-size:0.85rem;color:var(--text-muted);margin-top:4px;">✉️ ${f.email} &nbsp;|&nbsp; 🏢 ${f.office}</div>
    </div>
  `).join('');
}

function renderNotices() {
  const container = document.getElementById('noticeContainer');
  const notices = routineData?.notices || [];
  container.innerHTML = notices.map(n => `
    <div class="notice-card ${n.urgent ? 'urgent' : ''}">
      <div class="notice-header">
        <span class="notice-title">${n.urgent ? '🚨 ' : ''}${n.title}</span>
        <span class="notice-time">${n.timestamp}</span>
      </div>
      <p style="font-size:0.9rem;color:var(--text-main);">${n.message}</p>
      <div class="notice-author">Broadcasted by: ${n.author}</div>
    </div>
  `).join('');
}

// 6. Post Real-Time Notice (Simulated CR/Teacher Action)
function postNotice(e) {
  e.preventDefault();
  const title = document.getElementById('noticeTitle').value;
  const message = document.getElementById('noticeMsg').value;
  const author = document.getElementById('noticeAuthor').value;
  const urgent = document.getElementById('noticeUrgent').checked;

  const newNotice = {
    id: Date.now(),
    title,
    message,
    author: `${author} (Verified)`,
    timestamp: 'Just now',
    urgent
  };

  routineData.notices.unshift(newNotice);
  renderNotices();
  alert('Notice posted successfully and synchronized to all connected student clients!');
  document.getElementById('noticeForm').reset();
}

// Event Listeners
document.getElementById('deptSelect').addEventListener('change', renderRoutines);
document.getElementById('semesterSelect').addEventListener('change', renderRoutines);
document.getElementById('noticeForm').addEventListener('submit', postNotice);

// Initial Load
loadRoutines();
