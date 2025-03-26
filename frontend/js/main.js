/**
 * Main app functionality for the Care Matching Platform
 */

// DOM Elements
const mainNav = document.getElementById('main-nav');
const authSection = document.getElementById('auth-section');
const profileSection = document.getElementById('profile-section');
const providersSection = document.getElementById('providers-section');
const requestsSection = document.getElementById('requests-section');

const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const loginFormEl = document.getElementById('login');
const registerFormEl = document.getElementById('register');
const profileFormEl = document.getElementById('profile-form');

const providersList = document.getElementById('providers-list');
const requestsList = document.getElementById('requests-list');

// App State
let currentSection = 'auth';

// Initialize app
function initApp() {
  setupEventListeners();
  setupAuthListener();
  renderInitialState();
}

// Set up event listeners
function setupEventListeners() {
  // Auth section tabs
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  });
  
  registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });
  
  // Form submissions
  loginFormEl.addEventListener('submit', handleLogin);
  registerFormEl.addEventListener('submit', handleRegister);
  profileFormEl.addEventListener('submit', handleProfileUpdate);
}

// Set up auth state listener
function setupAuthListener() {
  auth.addListener((isAuthenticated, user) => {
    renderNavigation(isAuthenticated, user);
    
    if (isAuthenticated) {
      hideAuthSection();
      if (currentSection === 'auth') {
        showProfileSection();
      }
      
      loadUserData();
      loadProviders();
      loadRequests();
    } else {
      showAuthSection();
      hideLoggedInSections();
    }
  });
}

// Render initial app state
function renderInitialState() {
  if (auth.isAuthenticated()) {
    renderNavigation(true, auth.getCurrentUser());
    hideAuthSection();
    showProfileSection();
    loadUserData();
    loadProviders();
    loadRequests();
  } else {
    renderNavigation(false);
    showAuthSection();
  }
}

// Render navigation based on auth state
function renderNavigation(isAuthenticated, user) {
  let navHtml = '<ul>';
  
  if (isAuthenticated) {
    const userType = user?.userType || '';
    
    navHtml += `
      <li><a href="#" id="nav-profile" class="nav-link">プロフィール</a></li>
    `;
    
    if (userType === 'seeker') {
      navHtml += `
        <li><a href="#" id="nav-providers" class="nav-link">提供者一覧</a></li>
      `;
    }
    
    navHtml += `
      <li><a href="#" id="nav-requests" class="nav-link">リクエスト</a></li>
      <li><a href="#" id="nav-logout" class="nav-link">ログアウト</a></li>
    `;
  }
  
  navHtml += '</ul>';
  
  mainNav.innerHTML = navHtml;
  
  // Add event listeners to nav links
  if (isAuthenticated) {
    document.getElementById('nav-profile').addEventListener('click', (e) => {
      e.preventDefault();
      showSection('profile');
    });
    
    if (user?.userType === 'seeker') {
      document.getElementById('nav-providers').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('providers');
      });
    }
    
    document.getElementById('nav-requests').addEventListener('click', (e) => {
      e.preventDefault();
      showSection('requests');
    });
    
    document.getElementById('nav-logout').addEventListener('click', (e) => {
      e.preventDefault();
      auth.logout();
    });
  }
}

// Show section and hide others
function showSection(section) {
  currentSection = section;
  
  hideAllSections();
  
  switch (section) {
    case 'auth':
      showAuthSection();
      break;
    case 'profile':
      showProfileSection();
      break;
    case 'providers':
      showProvidersSection();
      break;
    case 'requests':
      showRequestsSection();
      break;
  }
  
  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  const activeLink = document.getElementById(`nav-${section}`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// Section visibility helpers
function hideAllSections() {
  authSection.classList.add('hidden');
  profileSection.classList.add('hidden');
  providersSection.classList.add('hidden');
  requestsSection.classList.add('hidden');
}

function showAuthSection() {
  authSection.classList.remove('hidden');
}

function hideAuthSection() {
  authSection.classList.add('hidden');
}

function showProfileSection() {
  profileSection.classList.remove('hidden');
}

function showProvidersSection() {
  providersSection.classList.remove('hidden');
}

function showRequestsSection() {
  requestsSection.classList.remove('hidden');
}

function hideLoggedInSections() {
  profileSection.classList.add('hidden');
  providersSection.classList.add('hidden');
  requestsSection.classList.add('hidden');
}

// Handle form submissions
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    await auth.login({ email, password });
    showMessage('ログインしました', 'success');
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const userType = document.getElementById('register-user-type').value;
  
  try {
    await auth.register({ name, email, password, userType });
    showMessage('登録が完了しました', 'success');
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  
  const area = document.getElementById('profile-area').value;
  const service = document.getElementById('profile-service').value;
  
  try {
    const response = await api.updateProfile({ area, service });
    auth.updateUserData(response.user);
    showMessage('プロフィールを更新しました', 'success');
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

// Load data from API
async function loadUserData() {
  try {
    const user = auth.getCurrentUser();
    
    if (user) {
      document.getElementById('profile-name').value = user.name || '';
      document.getElementById('profile-email').value = user.email || '';
      document.getElementById('profile-user-type').value = user.userType === 'provider' ? '介護提供者' : '介護依頼者';
      document.getElementById('profile-area').value = user.area || '';
      document.getElementById('profile-service').value = user.service || '';
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    showMessage('ユーザーデータの読み込みに失敗しました', 'error');
  }
}

async function loadProviders() {
  try {
    const providers = await api.getProviders();
    renderProviders(providers);
  } catch (error) {
    console.error('Error loading providers:', error);
    showMessage('提供者の読み込みに失敗しました', 'error');
  }
}

async function loadRequests() {
  try {
    const requests = await api.getRequests();
    renderRequests(requests);
  } catch (error) {
    console.error('Error loading requests:', error);
    showMessage('リクエストの読み込みに失敗しました', 'error');
  }
}

// Render data to DOM
function renderProviders(providers) {
  if (!providers || providers.length === 0) {
    providersList.innerHTML = '<p>提供者が見つかりませんでした</p>';
    return;
  }
  
  let html = '';
  
  providers.forEach(provider => {
    html += `
      <div class="list-item">
        <div class="list-item-header">
          <h3>${provider.name}</h3>
        </div>
        <div class="list-item-body">
          <p><strong>エリア:</strong> ${provider.area || '未設定'}</p>
          <p><strong>サービス:</strong> ${provider.service || '未設定'}</p>
        </div>
        <div class="list-item-actions">
          <button class="btn btn-primary request-contact" data-id="${provider._id}">連絡先リクエスト</button>
        </div>
      </div>
    `;
  });
  
  providersList.innerHTML = html;
  
  // Add event listeners to request buttons
  document.querySelectorAll('.request-contact').forEach(button => {
    button.addEventListener('click', async () => {
      const providerId = button.getAttribute('data-id');
      
      try {
        await api.createRequest(providerId);
        showMessage('リクエストを送信しました', 'success');
        loadRequests();  // Reload requests
      } catch (error) {
        showMessage(error.message, 'error');
      }
    });
  });
}

function renderRequests(requests) {
  if (!requests || requests.length === 0) {
    requestsList.innerHTML = '<p>リクエストがありません</p>';
    return;
  }
  
  const currentUser = auth.getCurrentUser();
  let html = '';
  
  requests.forEach(request => {
    const isFromMe = request.fromUser._id === currentUser.id;
    const otherUser = isFromMe ? request.toUser : request.fromUser;
    const statusText = getStatusText(request.status);
    const statusClass = getStatusClass(request.status);
    
    html += `
      <div class="list-item">
        <div class="list-item-header">
          <h3>${isFromMe ? '送信リクエスト' : '受信リクエスト'}</h3>
          <span class="${statusClass}">${statusText}</span>
        </div>
        <div class="list-item-body">
          <p><strong>${isFromMe ? '送信先' : '送信者'}:</strong> ${otherUser.name}</p>
    `;
    
    // Show email if request is accepted
    if (request.status === 'accepted') {
      html += `<p><strong>メールアドレス:</strong> ${otherUser.email}</p>`;
    }
    
    html += `
        </div>
    `;
    
    // Show action buttons for received pending requests
    if (!isFromMe && request.status === 'pending') {
      html += `
        <div class="list-item-actions">
          <button class="btn btn-success accept-request" data-id="${request._id}">承認</button>
          <button class="btn btn-danger reject-request" data-id="${request._id}">拒否</button>
        </div>
      `;
    }
    
    html += `</div>`;
  });
  
  requestsList.innerHTML = html;
  
  // Add event listeners to action buttons
  document.querySelectorAll('.accept-request').forEach(button => {
    button.addEventListener('click', async () => {
      const requestId = button.getAttribute('data-id');
      
      try {
        await api.updateRequest(requestId, 'accepted');
        showMessage('リクエストを承認しました', 'success');
        loadRequests();  // Reload requests
      } catch (error) {
        showMessage(error.message, 'error');
      }
    });
  });
  
  document.querySelectorAll('.reject-request').forEach(button => {
    button.addEventListener('click', async () => {
      const requestId = button.getAttribute('data-id');
      
      try {
        await api.updateRequest(requestId, 'rejected');
        showMessage('リクエストを拒否しました', 'success');
        loadRequests();  // Reload requests
      } catch (error) {
        showMessage(error.message, 'error');
      }
    });
  });
}

// Helper functions
function getStatusText(status) {
  switch (status) {
    case 'pending':
      return '保留中';
    case 'accepted':
      return '承認済み';
    case 'rejected':
      return '拒否済み';
    default:
      return status;
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'pending':
      return 'status-pending';
    case 'accepted':
      return 'status-accepted';
    case 'rejected':
      return 'status-rejected';
    default:
      return '';
  }
}

// Show message to user
function showMessage(message, type = 'info') {
  // Remove any existing messages
  const existingMessages = document.querySelectorAll('.message');
  existingMessages.forEach(el => el.remove());
  
  // Create new message element
  const messageEl = document.createElement('div');
  messageEl.className = `message message-${type}`;
  messageEl.textContent = message;
  
  // Insert message at the top of the current section
  const currentSectionEl = document.querySelector(`.section:not(.hidden)`);
  if (currentSectionEl) {
    currentSectionEl.insertBefore(messageEl, currentSectionEl.firstChild);
    
    // Auto-remove message after 5 seconds
    setTimeout(() => {
      messageEl.remove();
    }, 5000);
  }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
