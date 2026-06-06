const API = 'http://localhost:5000/api';
const token = localStorage.getItem('sms_token');
const role = localStorage.getItem('sms_role');

// Auth guard
if (!token || role !== 'principal') {
  window.location.href = '../index.html';
}

const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

let allStudents = [];
let allCourses = [];
let currentPage = 'dashboard';

// Init
document.addEventListener('DOMContentLoaded', () => {
  const name = localStorage.getItem('sms_name') || 'Principal';
  document.getElementById('sidebarName').textContent = name;
  document.getElementById('topbarSubtitle').textContent = `Welcome back, ${name}`;
  document.getElementById('sidebarAvatar').textContent = name.charAt(0).toUpperCase();

  // Date
  const now = new Date();
  document.getElementById('topbarDate').textContent = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  loadDashboard();
  loadCourses();
});

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  event?.target?.closest('.nav-item')?.classList.add('active');
  currentPage = page;

  const titles = { dashboard: ['Dashboard', 'Real-time overview'], students: ['Students', 'Manage all enrolled students'], messages: ['Messages', 'Send and manage notices'] };
  document.getElementById('topbarTitle').textContent = titles[page][0];
  document.getElementById('topbarSubtitle').textContent = titles[page][1];

  if (page === 'students') loadStudents();
  if (page === 'messages') loadMessages();
}

function refreshCurrent() { showPage(currentPage); }

// ===== DASHBOARD =====
async function loadDashboard() {
  try {
    const res = await fetch(`${API}/dashboard/stats`, { headers });
    const data = await res.json();

    document.getElementById('statTotal').textContent = data.totalStudents;
    document.getElementById('statCourses').textContent = data.totalCourses;
    document.getElementById('statYear').textContent = data.addedThisYear;
    document.getElementById('statMsgs').textContent = '—';

    renderCourseChart(data.courseCounts);
    renderSemesterChart(data.courseCounts);
    renderRecentStudents(data.recentStudents);

    // Msg count
    const mRes = await fetch(`${API}/messages`, { headers });
    const msgs = await mRes.json();
    document.getElementById('statMsgs').textContent = msgs.length;
  } catch (e) {
    console.error(e);
  }
}

function renderCourseChart(counts) {
  const el = document.getElementById('courseChartArea');
  if (!counts?.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p>No data</p></div>'; return; }
  const max = Math.max(...counts.map(c => c.count));
  el.innerHTML = counts.map(c => `
    <div class="bar-row">
      <div class="bar-label" title="${c.course}">${c.course}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${max ? (c.count/max*100) : 0}%"></div></div>
      <div class="bar-count">${c.count}</div>
    </div>`).join('');
  // animate
  setTimeout(() => {}, 50);
}

function renderSemesterChart(counts) {
  const el = document.getElementById('semesterChartArea');
  el.innerHTML = counts.slice(0, 4).map((c, i) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;${i < 3 ? 'border-bottom:1px solid var(--border)' : ''}">
      <span style="font-size:.83rem;color:var(--text2)">${c.course.split(' ')[0]}</span>
      <span class="badge-pill badge-indigo">${c.count} students</span>
    </div>`).join('');
}

function renderRecentStudents(students) {
  const el = document.getElementById('recentStudentsTable');
  if (!students?.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">👤</div><p>No students yet</p></div>'; return; }
  el.innerHTML = `
    <table class="data-table">
      <thead><tr><th>Student</th><th>Course</th><th>Semester</th><th>Enrolled</th><th>Status</th></tr></thead>
      <tbody>${students.map(s => `
        <tr>
          <td><div class="avatar-cell">
            <div class="student-avatar">${s.name.charAt(0)}</div>
            <div><div style="font-weight:500">${s.name}</div><div style="font-size:0.75rem;color:var(--text3)">${s.email}</div></div>
          </div></td>
          <td><span class="badge-pill badge-indigo">${s.course_name || '—'}</span></td>
          <td>Sem ${s.semester}</td>
          <td style="font-size:0.82rem;color:var(--text3)">${new Date(s.enrolled_at).toLocaleDateString('en-IN')}</td>
          <td><span class="badge-pill ${s.status === 'active' ? 'badge-green' : 'badge-red'}">${s.status}</span></td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

// ===== STUDENTS =====
async function loadStudents() {
  const wrap = document.getElementById('studentsTableWrap');
  wrap.innerHTML = '<div class="loading"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="30 70"/></svg> Loading students...</div>';
  try {
    const res = await fetch(`${API}/students`, { headers });
    allStudents = await res.json();
    renderStudentsTable(allStudents);
  } catch (e) {
    wrap.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load students</p></div>';
  }
}

function renderStudentsTable(students) {
  const wrap = document.getElementById('studentsTableWrap');
  if (!students.length) {
    wrap.innerHTML = '<div class="empty-state"><div class="empty-icon">👤</div><p>No students found. Add your first student!</p></div>';
    return;
  }
  wrap.innerHTML = `
    <table class="data-table">
      <thead><tr><th>Student</th><th>Course</th><th>Sem</th><th>Phone</th><th>Login</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${students.map(s => `
        <tr>
          <td><div class="avatar-cell">
            <div class="student-avatar">${s.name.charAt(0)}</div>
            <div><div style="font-weight:500">${s.name}</div><div style="font-size:0.75rem;color:var(--text3)">${s.email}</div></div>
          </div></td>
          <td><span class="badge-pill badge-indigo" style="font-size:0.72rem">${s.course_name || '—'}</span></td>
          <td style="color:var(--text3)">Sem ${s.semester}</td>
          <td style="font-size:0.83rem">${s.phone || '—'}</td>
          <td>${s.username ? `<span class="badge-pill badge-green">✓ Set</span>` : `<span class="badge-pill badge-amber">Not set</span>`}</td>
          <td><span class="badge-pill ${s.status === 'active' ? 'badge-green' : 'badge-red'}">${s.status}</span></td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn btn-sm btn-outline" onclick="editStudent(${s.id})" title="Edit">✏️</button>
              <button class="btn btn-sm" style="background:#EEF2FF;color:var(--indigo)" onclick="openCredModal(${s.id},'${s.name.replace(/'/g,"\\'")}')">🔑</button>
              <button class="btn btn-sm btn-danger" onclick="deleteStudent(${s.id},'${s.name.replace(/'/g,"\\'")}')">🗑️</button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

function filterStudents() {
  const q = document.getElementById('studentSearch').value.toLowerCase();
  const filtered = allStudents.filter(s =>
    s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) ||
    (s.course_name || '').toLowerCase().includes(q)
  );
  renderStudentsTable(filtered);
}

async function loadCourses() {
  try {
    const res = await fetch(`${API}/courses`, { headers });
    allCourses = await res.json();
    const sel = document.getElementById('sCourse');
    const msgSel = document.getElementById('msgRecipient');
    allCourses.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id; opt.textContent = c.name;
      sel.appendChild(opt);
    });
  } catch (e) {}
}

// ===== ADD/EDIT STUDENT =====
function openAddStudentModal() {
  document.getElementById('studentModalTitle').textContent = 'Add New Student';
  document.getElementById('editStudentId').value = '';
  document.getElementById('studentForm').reset();
  document.getElementById('saveStudentBtn').textContent = 'Add Student';
  document.getElementById('addStudentModal').style.display = 'flex';
}

function editStudent(id) {
  const s = allStudents.find(x => x.id === id);
  if (!s) return;
  document.getElementById('studentModalTitle').textContent = 'Edit Student';
  document.getElementById('editStudentId').value = s.id;
  document.getElementById('sName').value = s.name;
  document.getElementById('sEmail').value = s.email;
  document.getElementById('sPhone').value = s.phone || '';
  document.getElementById('sAge').value = s.age || '';
  document.getElementById('sCourse').value = s.course_id || '';
  document.getElementById('sSemester').value = s.semester || 1;
  document.getElementById('sUsername').value = s.username || '';
  document.getElementById('sPassword').value = '';
  document.getElementById('saveStudentBtn').textContent = 'Save Changes';
  document.getElementById('addStudentModal').style.display = 'flex';
}

async function saveStudent() {
  const editId = document.getElementById('editStudentId').value;
  const body = {
    name: document.getElementById('sName').value.trim(),
    email: document.getElementById('sEmail').value.trim(),
    phone: document.getElementById('sPhone').value.trim(),
    age: parseInt(document.getElementById('sAge').value) || null,
    course_id: parseInt(document.getElementById('sCourse').value) || null,
    semester: parseInt(document.getElementById('sSemester').value),
    username: document.getElementById('sUsername').value.trim() || null,
    password: document.getElementById('sPassword').value || null,
  };
  if (!body.name || !body.email) return showToast('Name and email are required', 'error');

  const url = editId ? `${API}/students/${editId}` : `${API}/students`;
  const method = editId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) return showToast(data.error || 'Error saving student', 'error');
    showToast(editId ? 'Student updated!' : 'Student added!', 'success');
    closeModal('addStudentModal');
    loadStudents();
  } catch (e) { showToast('Server error', 'error'); }
}

async function deleteStudent(id, name) {
  if (!confirm(`Delete student "${name}"? This cannot be undone.`)) return;
  try {
    const res = await fetch(`${API}/students/${id}`, { method: 'DELETE', headers });
    const data = await res.json();
    if (!res.ok) return showToast(data.error, 'error');
    showToast('Student deleted', 'success');
    loadStudents();
  } catch (e) { showToast('Server error', 'error'); }
}

// ===== CREDENTIALS =====
function openCredModal(id, name) {
  document.getElementById('credStudentId').value = id;
  document.getElementById('credStudentName').textContent = name;
  document.getElementById('credUsername').value = '';
  document.getElementById('credPassword').value = '';
  document.getElementById('credentialsModal').style.display = 'flex';
}

async function saveCredentials() {
  const id = document.getElementById('credStudentId').value;
  const username = document.getElementById('credUsername').value.trim();
  const password = document.getElementById('credPassword').value;
  if (!username || !password) return showToast('Both username and password required', 'error');

  try {
    const res = await fetch(`${API}/students/${id}/credentials`, { method: 'POST', headers, body: JSON.stringify({ username, password }) });
    const data = await res.json();
    if (!res.ok) return showToast(data.error, 'error');
    showToast('Credentials saved!', 'success');
    closeModal('credentialsModal');
    loadStudents();
  } catch (e) { showToast('Server error', 'error'); }
}

// ===== MESSAGES =====
async function loadMessages() {
  const el = document.getElementById('messagesArea');
  el.innerHTML = '<div class="loading"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="30 70"/></svg> Loading messages...</div>';
  try {
    const res = await fetch(`${API}/messages`, { headers });
    const msgs = await res.json();
    if (!msgs.length) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon">💬</div><p>No messages sent yet. Send your first announcement!</p></div>';
      return;
    }
    el.innerHTML = msgs.map(m => `
      <div class="msg-card">
        <div class="msg-meta">
          <div>
            <div class="msg-subject">${m.subject || 'No subject'}</div>
            <div class="msg-from">To: ${m.recipient_name || 'All Students'}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="msg-date">${new Date(m.sent_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</div>
            <button class="btn btn-sm btn-danger" onclick="deleteMsg(${m.id})">🗑️</button>
          </div>
        </div>
        <div class="msg-body">${m.body}</div>
      </div>`).join('');
  } catch (e) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load messages</p></div>'; }
}

async function openSendMsgModal() {
  const sel = document.getElementById('msgRecipient');
  sel.innerHTML = '<option value="">📢 Broadcast to All Students</option>';
  // Load students into dropdown
  try {
    const res = await fetch(`${API}/students`, { headers });
    const students = await res.json();
    students.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id; opt.textContent = `👤 ${s.name}`;
      sel.appendChild(opt);
    });
  } catch(e) {}
  document.getElementById('msgSubject').value = '';
  document.getElementById('msgBody').value = '';
  document.getElementById('sendMsgModal').style.display = 'flex';
}

async function sendMessage() {
  const subject = document.getElementById('msgSubject').value.trim();
  const body = document.getElementById('msgBody').value.trim();
  const recipient_id = document.getElementById('msgRecipient').value || null;
  if (!body) return showToast('Message body is required', 'error');

  try {
    const res = await fetch(`${API}/messages`, { method: 'POST', headers, body: JSON.stringify({ subject, body, recipient_id }) });
    const data = await res.json();
    if (!res.ok) return showToast(data.error, 'error');
    showToast('Message sent!', 'success');
    closeModal('sendMsgModal');
    loadMessages();
  } catch (e) { showToast('Server error', 'error'); }
}

async function deleteMsg(id) {
  if (!confirm('Delete this message?')) return;
  await fetch(`${API}/messages/${id}`, { method: 'DELETE', headers });
  showToast('Message deleted', 'success');
  loadMessages();
}

// ===== UTILS =====
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function showToast(msg, type = '') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${msg}`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function logout() {
  if (!confirm('Logout?')) return;
  localStorage.clear();
  window.location.href = '../index.html';
}

// Nav click events
document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', function() {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    this.classList.add('active');
  });
});
