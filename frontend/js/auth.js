/**
 * Authentication Service for the Care Matching Platform
 */

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
    this.listeners = [];
  }
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.token;
  }
  
  /**
   * Get current user
   */
  getCurrentUser() {
    return this.user;
  }
  
  /**
   * Register a new user
   */
  async register(userData) {
    try {
      const data = await api.register(userData);
      this.setSession(data.token, data.user);
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Login user
   */
  async login(credentials) {
    try {
      const data = await api.login(credentials);
      this.setSession(data.token, data.user);
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Logout user
   */
  logout() {
    this.clearSession();
    this.notifyListeners();
  }
  
  /**
   * Set session data
   */
  setSession(token, user) {
    this.token = token;
    this.user = user;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    this.notifyListeners();
  }
  
  /**
   * Clear session data
   */
  clearSession() {
    this.token = null;
    this.user = null;
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  /**
   * Add auth change listener
   */
  addListener(callback) {
    this.listeners.push(callback);
  }
  
  /**
   * Remove auth change listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
  
  /**
   * Notify all listeners of auth change
   */
  notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.isAuthenticated(), this.user);
    }
  }
  
  /**
   * Update user profile data in local storage
   */
  updateUserData(userData) {
    this.user = { ...this.user, ...userData };
    localStorage.setItem('user', JSON.stringify(this.user));
    this.notifyListeners();
  }
}

// Create and export auth service instance
const auth = new AuthService();
