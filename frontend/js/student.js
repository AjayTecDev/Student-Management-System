const API = 'http://localhost:5000/api';
const token = localStorage.getItem('sms_token');
const role = localStorage.getItem('sms_role');

if (!token || role !== 'student') {
  window.location.href = '../index.html';
}

const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
let studentData = null;

document.addEventListener('DOMContentLoaded', () => {
  const name = localStorage.getItem('sms_name') || 'Student';
  document.getElementById('sidebarName').textContent = name;
  document.getElementById('sidebarAvatar').textContent = name.charAt(0).toUpperCase();

  const now = new Date();
  document.getElementById('topbarDate').textContent = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  loadProfile();
  loadMessageCount();
});

async function loadProfile() {
  try {
    const res = await fetch(`${API}/students/self/profile`, { headers });
    studentData = await res.json();
    renderProfile(studentData);
  } catch (e) {
    console.error(e);
  }
}

function renderProfile(s) {
  if (!s) return;

  // Hero
  document.getElementById('heroAvatar').textContent = s.name.charAt(0).toUpperCase();
  document.getElementById('heroName').textContent = s.name;
  document.getElementById('heroMeta').textContent = `${s.course_name || 'Course not assigned'} • Semester ${s.semester} • Student ID: STU${String(s.id).padStart(4,'0')}`;

  // Personal info
  document.getElementById('personalInfo').innerHTML = `
    <div class="info-item"><div class="info-key">Full Name</div><div class="info-val">${s.name}</div></div>
    <div class="info-item"><div class="info-key">Email</div><div class="info-val">${s.email}</div></div>
    <div class="info-item"><div class="info-key">Phone</div><div class="info-val">${s.phone || 'Not provided'}</div></div>
    <div class="info-item"><div class="info-key">Age</div><div class="info-val">${s.age ? s.age + ' years' : 'Not provided'}</div></div>
    <div class="info-item"><div class="info-key">Username</div><div class="info-val" style="color:var(--indigo)">${s.username || 'Not set'}</div></div>
    <div class="info-item"><div class="info-key">Enrollment Date</div><div class="info-val">${new Date(s.enrolled_at).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}</div></div>
  `;

  // Academic info
  document.getElementById('academicInfo').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="info-item"><div class="info-key">Student ID</div><div class="info-val" style="font-family:'DM Serif Display',serif;font-size:1.2rem;color:var(--indigo)">STU${String(s.id).padStart(4,'0')}</div></div>
      <div class="info-item"><div class="info-key">Course</div><div class="info-val">${s.course_name || '—'}</div></div>
      <div class="info-item"><div class="info-key">Semester</div>
        <div class="info-val">
          <div style="display:flex;align-items:center;gap:8px">
            <span>Semester ${s.semester}</span>
            <div style="flex:1;height:6px;background:var(--border);border-radius:99px;max-width:120px;overflow:hidden">
              <div style="width:${(s.semester/8)*100}%;height:100%;background:linear-gradient(90deg,var(--indigo),var(--violet));border-radius:99px"></div>
            </div>
            <span style="font-size:0.75rem;color:var(--text3)">${s.semester}/8</span>
          </div>
        </div>
      </div>
      <div class="info-item"><div class="info-key">Status</div><div class="info-val"><span class="badge-pill ${s.status === 'active' ? 'badge-green' : 'badge-red'}">${s.status}</span></div></div>
    </div>
  `;

  // Enrollment
  document.getElementById('enrollmentStatus').innerHTML = `
    <div style="display:flex;gap:20px;flex-wrap:wrap">
      <div style="flex:1;min-width:180px;background:var(--surface2);border-radius:12px;padding:18px;text-align:center">
        <div style="font-size:2rem;font-family:'DM Serif Display',serif;color:var(--indigo)">${s.semester}</div>
        <div style="font-size:0.78rem;color:var(--text3);margin-top:4px">Current Semester</div>
      </div>
      <div style="flex:1;min-width:180px;background:var(--surface2);border-radius:12px;padding:18px;text-align:center">
        <div style="font-size:2rem;font-family:'DM Serif Display',serif;color:var(--green)">${8 - s.semester}</div>
        <div style="font-size:0.78rem;color:var(--text3);margin-top:4px">Semesters Remaining</div>
      </div>
      <div style="flex:1;min-width:180px;background:var(--surface2);border-radius:12px;padding:18px;text-align:center">
        <div style="font-size:2rem;font-family:'DM Serif Display',serif;color:var(--amber)">${Math.round((s.semester/8)*100)}%</div>
        <div style="font-size:0.78rem;color:var(--text3);margin-top:4px">Program Progress</div>
      </div>
      <div style="flex:1;min-width:180px;background:var(--surface2);border-radius:12px;padding:18px;text-align:center">
        <div style="font-size:2rem;font-family:'DM Serif Display',serif;color:var(--cyan)">${s.course_name?.split(' ')[0] || '—'}</div>
        <div style="font-size:0.78rem;color:var(--text3);margin-top:4px">Department</div>
      </div>
    </div>
  `;
}

function showPage(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  el?.classList.add('active');

  const titles = {
    profile: ['My Profile', 'Your academic information'],
    college: ['College Information', 'About your institution'],
    messages: ['Messages', 'Notices from your principal']
  };
  document.getElementById('topbarTitle').textContent = titles[page][0];
  document.getElementById('topbarSub').textContent = titles[page][1];

  if (page === 'messages') loadStudentMessages();
  if (page === 'college') loadCollegeCourses();
}

async function loadStudentMessages() {
  const el = document.getElementById('studentMessagesArea');
  el.innerHTML = '<div class="loading"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="30 70"/></svg> Loading messages...</div>';
  try {
    const res = await fetch(`${API}/messages/student`, { headers });
    const msgs = await res.json();
    if (!msgs.length) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon">📬</div><p>No messages from the principal yet.</p></div>';
      return;
    }
    el.innerHTML = msgs.map(m => `
      <div class="msg-card">
        <div class="msg-from">📌 From: ${m.sender_name || 'Principal'} ${m.recipient_id ? '(Direct)' : '(Broadcast)'}</div>
        <div class="msg-meta">
          <div class="msg-subject">${m.subject || 'Notice'}</div>
          <div class="msg-date">${new Date(m.sent_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
        </div>
        <div class="msg-body">${m.body}</div>
      </div>`).join('');
    
    // Clear badge
    const badge = document.getElementById('msgBadge');
    badge.style.display = 'none';
  } catch (e) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load messages</p></div>';
  }
}

async function loadMessageCount() {
  try {
    const res = await fetch(`${API}/messages/student`, { headers });
    const msgs = await res.json();
    if (msgs.length > 0) {
      const badge = document.getElementById('msgBadge');
      badge.textContent = msgs.length;
      badge.style.display = 'inline-block';
    }
  } catch (e) {}
}

async function loadCollegeCourses() {
  const el = document.getElementById('collegeCoursesArea');
  try {
    const res = await fetch(`${API}/courses`, { headers });
    const courses = await res.json();
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px">
        ${courses.map((c, i) => {
          const icons = ['💻','⚙️','🏗️','📡','💼','📊'];
          const colors = ['indigo','green','amber','cyan','indigo','green'];
          return `
          <div style="background:var(--surface2);border:1px solid var(--border2);border-radius:12px;padding:16px">
            <div style="font-size:1.5rem;margin-bottom:8px">${icons[i%icons.length]}</div>
            <div style="font-weight:600;font-size:0.9rem;color:var(--text)">${c.name}</div>
            <div style="font-size:0.78rem;color:var(--text3);margin-top:4px">${c.description || 'Bachelor Program'}</div>
            <div style="margin-top:10px"><span class="badge-pill badge-${colors[i%colors.length]}">8 Semesters</span></div>
          </div>`;
        }).join('')}
      </div>`;
  } catch (e) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div><p>Could not load courses</p></div>';
  }
}

function logout() {
  if (!confirm('Logout?')) return;
  localStorage.clear();
  window.location.href = '../index.html';
}
