// lib/auth.js
const USERS_KEY = 'prompt_app_users';
const CURRENT_USER_KEY = 'prompt_app_current_user';

// User management functions
export const authService = {
  // Register a new user
  register: (email, password, name) => {
    const users = getUsers();
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
      throw new Error('User already exists with this email');
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      password, // In real apps, this would be hashed!
      plan: 'free', // free or pro
      createdAt: new Date().toISOString()
    };
    
    // Save user
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto-login the new user
    setCurrentUser(newUser);
    
    return { success: true, user: newUser };
  },
  
  // Login existing user
  login: (email, password) => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    setCurrentUser(user);
    return { success: true, user };
  },
  
  // Logout current user
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },
  
  // Get current logged-in user
  getCurrentUser: () => {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },
  
  // Check if user is logged in
  isLoggedIn: () => {
    return authService.getCurrentUser() !== null;
  }
};

// Helper functions
function getUsers() {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
}

function setCurrentUser(user) {
  // Don't store password in current user session
  const { password, ...userWithoutPassword } = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
}