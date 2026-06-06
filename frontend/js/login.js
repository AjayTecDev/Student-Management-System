const API = 'http://localhost:5000/api';
let currentRole = 'principal';

function switchRole(role) {
  currentRole = role;
  const slider = document.getElementById('roleSlider');
  const btnP = document.getElementById('btnPrincipal');
  const btnS = document.getElementById('btnStudent');
  const title = document.getElementById('formTitle');
  const subtitle = document.getElementById('formSubtitle');
  const hint = document.getElementById('hintText');

  if (role === 'principal') {
    slider.classList.remove('right');
    btnP.classList.add('active'); btnS.classList.remove('active');
    title.textContent = 'Principal Login';
    subtitle.textContent = 'Access your administrative dashboard';
    hint.textContent = 'admin / admin123';
  } else {
    slider.classList.add('right');
    btnS.classList.add('active'); btnP.classList.remove('active');
    title.textContent = 'Student Login';
    subtitle.textContent = 'View your profile and college info';
    hint.textContent = 'arjun / pass123';
  }
  hideError();
}

function togglePassword() {
  const pw = document.getElementById('password');
  pw.type = pw.type === 'password' ? 'text' : 'password';
}

function showError(msg) {
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.style.display = 'block';
  el.style.animation = 'none';
  requestAnimationFrame(() => el.style.animation = 'shake 0.4s');
}

function hideError() {
  document.getElementById('errorMsg').style.display = 'none';
}

async function handleLogin(e) {
  e.preventDefault();
  hideError();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const btn = document.getElementById('submitBtn');
  const btnText = btn.querySelector('.btn-text');
  const btnLoader = btn.querySelector('.btn-loader');
  const btnArrow = btn.querySelector('.btn-arrow');

  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'flex';
  btnArrow.style.display = 'none';

  try {
    const endpoint = currentRole === 'principal' ? '/auth/principal/login' : '/auth/student/login';
    const res = await fetch(API + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Login failed. Please check your credentials.');
      return;
    }

    // Store auth data
    localStorage.setItem('sms_token', data.token);
    localStorage.setItem('sms_role', data.role);
    localStorage.setItem('sms_name', data.name);
    if (data.student) localStorage.setItem('sms_student', JSON.stringify(data.student));

    // Redirect
    if (data.role === 'principal') {
      window.location.href = 'pages/principal-dashboard.html';
    } else {
      window.location.href = 'pages/student-dashboard.html';
    }
  } catch (err) {
    showError('Cannot connect to server. Make sure the backend is running.');
  } finally {
    btn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
    btnArrow.style.display = 'inline';
  }
}

// Check if already logged in
const existingToken = localStorage.getItem('sms_token');
const existingRole = localStorage.getItem('sms_role');
if (existingToken && existingRole) {
  if (existingRole === 'principal') window.location.href = 'pages/principal-dashboard.html';
  else window.location.href = 'pages/student-dashboard.html';
}
