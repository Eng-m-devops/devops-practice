// API Base URL (defaults to window location origin)
const API_BASE = window.location.origin;

// DOM Elements
const redisStatusEl = document.getElementById('redisStatus');
const redisStatusText = document.getElementById('redisStatusText');
const postgresStatusEl = document.getElementById('postgresStatus');
const postgresStatusText = document.getElementById('postgresStatusText');

const visitCountEl = document.getElementById('visitCount');
const btnRefreshVisits = document.getElementById('btnRefreshVisits');

const addUserForm = document.getElementById('addUserForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const btnSubmitUser = document.getElementById('btnSubmitUser');
const formNotification = document.getElementById('formNotification');

const usersTableBody = document.getElementById('usersTableBody');
const userCountBadge = document.getElementById('userCountBadge');
const btnRefreshUsers = document.getElementById('btnRefreshUsers');

// State
let isSubmittingUser = false;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  checkSystemStatus();
  recordAutomaticVisit();
  fetchUsers();

  // Setup Event Listeners
  btnRefreshVisits.addEventListener('click', fetchVisits);
  btnRefreshUsers.addEventListener('click', fetchUsers);
  addUserForm.addEventListener('submit', handleAddUser);

  // Auto-refresh status & visits every 15 seconds
  setInterval(checkSystemStatus, 15000);
});

// Automatic visit recorder on page load
async function recordAutomaticVisit() {
  try {
    const res = await fetch(`${API_BASE}/api/visits/increment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.success) {
      updateVisitUI(data.visits);
      visitCountEl.classList.add('pulse');
      setTimeout(() => visitCountEl.classList.remove('pulse'), 300);
    }
  } catch (error) {
    console.error('Error recording automatic visit:', error);
    fetchVisits();
  }
}

// 1. Check System Connection Status
async function checkSystemStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/status`);
    if (!res.ok) throw new Error('Status check failed');
    const data = await res.json();

    // Update Redis status
    if (data.services.redis === 'Connected') {
      redisStatusEl.classList.add('connected');
      redisStatusText.textContent = 'متصل (Connected)';
    } else {
      redisStatusEl.classList.remove('connected');
      redisStatusText.textContent = 'غير متصل (Memory Mode)';
    }

    // Update PostgreSQL status
    if (data.services.postgres === 'Connected') {
      postgresStatusEl.classList.add('connected');
      postgresStatusText.textContent = 'متصل (Connected)';
    } else {
      postgresStatusEl.classList.remove('connected');
      postgresStatusText.textContent = 'غير متصل (Memory Mode)';
    }
  } catch (error) {
    console.warn('Unable to reach backend status endpoint:', error);
    redisStatusText.textContent = 'غير متصل';
    postgresStatusText.textContent = 'غير متصل';
    redisStatusEl.classList.remove('connected');
    postgresStatusEl.classList.remove('connected');
  }
}

// 2. Fetch Visit Counter from Redis
async function fetchVisits() {
  try {
    const res = await fetch(`${API_BASE}/api/visits`);
    const data = await res.json();

    if (data.success) {
      updateVisitUI(data.visits);
    }
  } catch (error) {
    console.error('Error fetching visits:', error);
  }
}

// Increment Visit Counter
async function handleIncrementVisits() {
  btnIncrement.disabled = true;
  try {
    const res = await fetch(`${API_BASE}/api/visits/increment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();

    if (data.success) {
      updateVisitUI(data.visits);
      // Trigger animation
      visitCountEl.classList.add('pulse');
      setTimeout(() => visitCountEl.classList.remove('pulse'), 300);
    }
  } catch (error) {
    console.error('Error incrementing visit:', error);
  } finally {
    btnIncrement.disabled = false;
  }
}

function updateVisitUI(count) {
  visitCountEl.textContent = count;
}

// 3. Fetch Users List from PostgreSQL
async function fetchUsers() {
  usersTableBody.innerHTML = `
    <tr>
      <td colspan="4" class="empty-state">
        <i class="fa-solid fa-spinner fa-spin"></i> جاري جلب البيانات...
      </td>
    </tr>
  `;

  try {
    const res = await fetch(`${API_BASE}/api/users`);
    const data = await res.json();

    if (data.success) {
      renderUsersTable(data.users);
    } else {
      usersTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="empty-state">فشل تحميل المستخدمين</td>
        </tr>
      `;
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">تعذر الاتصال بالخادم</td>
      </tr>
    `;
  }
}

function renderUsersTable(users) {
  userCountBadge.textContent = `${users.length} مستخدمين`;

  if (!users || users.length === 0) {
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">لا يوجد مستخدمون مسجلون حالياً</td>
      </tr>
    `;
    return;
  }

  usersTableBody.innerHTML = users.map((u, index) => {
    const formattedDate = u.created_at
      ? new Date(u.created_at).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
      : '--';

    return `
      <tr>
        <td><strong>${u.id || index + 1}</strong></td>
        <td><i class="fa-regular fa-user" style="margin-left: 6px; color: #a5b4fc;"></i> ${escapeHtml(u.username)}</td>
        <td><i class="fa-regular fa-envelope" style="margin-left: 6px; color: #94a3b8;"></i> ${escapeHtml(u.email)}</td>
        <td>${formattedDate}</td>
      </tr>
    `;
  }).join('');
}

// 4. Handle Add User Form Submission
async function handleAddUser(e) {
  e.preventDefault();
  if (isSubmittingUser) return;

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();

  if (!username || !email) {
    showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
    return;
  }

  isSubmittingUser = true;
  btnSubmitUser.disabled = true;
  btnSubmitUser.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...`;
  hideNotification();

  try {
    const res = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showNotification(`تم تسجيل المستخدم "${data.user.username}" بنجاح`, 'success');
      addUserForm.reset();
      fetchUsers();
    } else {
      showNotification(data.error || 'حدث خطأ أثناء إضافة المستخدم', 'error');
    }
  } catch (error) {
    console.error('Error adding user:', error);
    showNotification('فشل الاتصال بالخادم، يرجى المحاولة لاحقاً', 'error');
  } finally {
    isSubmittingUser = false;
    btnSubmitUser.disabled = false;
    btnSubmitUser.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> حفظ البيانات`;
  }
}

// Helper Functions
function showNotification(msg, type = 'success') {
  formNotification.className = `notification ${type}`;
  formNotification.innerHTML = type === 'success'
    ? `<i class="fa-solid fa-circle-check"></i> ${escapeHtml(msg)}`
    : `<i class="fa-solid fa-triangle-exclamation"></i> ${escapeHtml(msg)}`;
}

function hideNotification() {
  formNotification.className = 'notification hidden';
  formNotification.innerHTML = '';
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}
