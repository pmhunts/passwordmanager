// DOM Elements
const authContainer = document.getElementById('authContainer');
const authTitle = document.getElementById('authTitle');
const authForm = document.getElementById('authForm');
const authButton = document.getElementById('authButton');
const authToggleText = document.getElementById('authToggleText');
const authToggleLink = document.getElementById('authToggleLink');
const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
const passwordManager = document.getElementById('passwordManager');
const currentUser = document.getElementById('currentUser');
const logoutBtn = document.getElementById('logoutBtn');
const addNewBtn = document.getElementById('addNewBtn');
const exportBtn = document.getElementById('exportBtn');
const searchInput = document.getElementById('searchInput');
const passwordTableBody = document.getElementById('passwordTableBody');
const emptyState = document.getElementById('emptyState');
const passwordModal = document.getElementById('passwordModal');
const closeModal = document.getElementById('closeModal');
const passwordForm = document.getElementById('passwordForm');
const modalTitle = document.getElementById('modalTitle');
const passwordId = document.getElementById('passwordId');
const generatePasswordBtn = document.getElementById('generatePassword');
const passwordField = document.getElementById('passwordField');
const strengthText = document.getElementById('strengthText');
const strengthIndicator = document.getElementById('strengthIndicator');

// State variables
let isLogin = true;
let currentUserId = null;
let passwordEntries = [];
let editingEntryId = null;

// Toggle between login and register forms
authToggleLink.addEventListener('click', () => {
    isLogin = !isLogin;
    
    if (isLogin) {
        authTitle.textContent = 'Log In';
        authButton.textContent = 'Log In';
        authToggleText.textContent = "Don't have an account?";
        authToggleLink.textContent = 'Sign up';
        confirmPasswordGroup.style.display = 'none';
    } else {
        authTitle.textContent = 'Register';
        authButton.textContent = 'Register';
        authToggleText.textContent = 'Already have an account?';
        authToggleLink.textContent = 'Log in';
        confirmPasswordGroup.style.display = 'block';
    }
});

// Handle auth form submission
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (isLogin) {
        // Login logic
        const user = getUserFromStorage(username);
        
        if (user && user.password === hashPassword(password)) {
            loginUser(user);
        } else {
            alert('Invalid username or password');
        }
    } else {
        // Register logic
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        if (getUserFromStorage(username)) {
            alert('Username already exists');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username,
            password: hashPassword(password),
            passwordEntries: []
        };
        
        saveUserToStorage(newUser);
        alert('Registration successful! You can now log in.');
        
        // Reset to login form
        authToggleLink.click();
    }
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
    currentUserId = null;
    passwordEntries = [];
    authForm.reset();
    passwordManager.style.display = 'none';
    authContainer.style.display = 'block';
});

// Add new password button
addNewBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Add New Password';
    passwordForm.reset();
    passwordId.value = '';
    editingEntryId = null;
    updatePasswordStrength('');
    passwordModal.style.display = 'flex';
});

// Close modal
closeModal.addEventListener('click', () => {
    passwordModal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === passwordModal) {
        passwordModal.style.display = 'none';
    }
});

// Handle password form submission
passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const website = document.getElementById('website').value;
    const websiteUrl = document.getElementById('websiteUrl').value;
    const username = document.getElementById('usernameField').value;
    const password = document.getElementById('passwordField').value;
    const notes = document.getElementById('notes').value;
    
    const newEntry = {
        id: editingEntryId || Date.now().toString(),
        website,
        websiteUrl,
        username,
        password: encryptPassword(password),
        notes,
        lastUpdated: new Date().toISOString()
    };
    
    if (editingEntryId) {
        // Update existing entry
        const index = passwordEntries.findIndex(entry => entry.id === editingEntryId);
        if (index !== -1) {
            passwordEntries[index] = newEntry;
        }
    } else {
        // Add new entry
        passwordEntries.push(newEntry);
    }
    
    // Save to storage
    savePasswordEntries();
    
    // Refresh UI
    renderPasswordEntries();
    passwordModal.style.display = 'none';
});

// Generate password
generatePasswordBtn.addEventListener('click', () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=";
    let password = "";
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset.charAt(randomIndex);
    }
    
    passwordField.value = password;
    passwordField.type = 'text';
    setTimeout(() => {
        passwordField.type = 'password';
    }, 3000);
    
    updatePasswordStrength(password);
});

// Check password strength
passwordField.addEventListener('input', () => {
    updatePasswordStrength(passwordField.value);
});

// Search functionality
searchInput.addEventListener('input', () => {
    renderPasswordEntries();
});

// Export data
exportBtn.addEventListener('click', () => {
    const user = getUserFromStorage(currentUserId);
    
    if (!user) return;
    
    const exportData = {
        username: user.username,
        entries: passwordEntries.map(entry => ({
            website: entry.website,
            websiteUrl: entry.websiteUrl,
            username: entry.username,
            password: decryptPassword(entry.password),
            notes: entry.notes,
            lastUpdated: entry.lastUpdated
        }))
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "password-export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});

// Helper Functions
function getUserFromStorage(username) {
    const users = JSON.parse(localStorage.getItem('passwordManagerUsers') || '[]');
    return users.find(user => user.username === username || user.id === username);
}

function saveUserToStorage(user) {
    const users = JSON.parse(localStorage.getItem('passwordManagerUsers') || '[]');
    const index = users.findIndex(u => u.id === user.id);
    
    if (index !== -1) {
        users[index] = user;
    } else {
        users.push(user);
    }
    
    localStorage.setItem('passwordManagerUsers', JSON.stringify(users));
}

function loginUser(user) {
    currentUserId = user.id;
    currentUser.textContent = user.username;
    passwordEntries = user.passwordEntries || [];
    localStorage.setItem('lastUserId', user.id);
    
    // Show password manager, hide auth form
    authContainer.style.display = 'none';
    passwordManager.style.display = 'block';
    
    renderPasswordEntries();
}

function savePasswordEntries() {
    const user = getUserFromStorage(currentUserId);
    
    if (user) {
        user.passwordEntries = passwordEntries;
        saveUserToStorage(user);
    }
}

function renderPasswordEntries() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredEntries = passwordEntries.filter(entry => {
        return entry.website.toLowerCase().includes(searchTerm) || 
               entry.username.toLowerCase().includes(searchTerm);
    });
    
    passwordTableBody.innerHTML = '';
    
    if (filteredEntries.length === 0) {
        document.getElementById('passwordList').style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        document.getElementById('passwordList').style.display = 'block';
        emptyState.style.display = 'none';
        
        filteredEntries.forEach(entry => {
            const row = document.createElement('tr');
            
            // Website
            const websiteCell = document.createElement('td');
            websiteCell.textContent = entry.website;
            row.appendChild(websiteCell);
            
            // Username
            const usernameCell = document.createElement('td');
            usernameCell.textContent = entry.username;
            row.appendChild(usernameCell);
            
            // Password
            const passwordCell = document.createElement('td');
            passwordCell.className = 'password-field';
            passwordCell.textContent = '••••••••';
            
            const showPasswordBtn = document.createElement('span');
            showPasswordBtn.textContent = '👁️';
            showPasswordBtn.title = 'Show Password';
            showPasswordBtn.addEventListener('click', () => {
                if (passwordCell.textContent === '••••••••') {
                    passwordCell.textContent = decryptPassword(entry.password);
                    setTimeout(() => {
                        passwordCell.textContent = '••••••••';
                    }, 3000);
                }
            });
            
            passwordCell.appendChild(showPasswordBtn);
            row.appendChild(passwordCell);
            
            // Last Updated
            const lastUpdatedCell = document.createElement('td');
            lastUpdatedCell.textContent = new Date(entry.lastUpdated).toLocaleDateString();
            row.appendChild(lastUpdatedCell);
            
            // Actions
            const actionsCell = document.createElement('td');
            actionsCell.className = 'action-cell';
            
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.style.backgroundColor = '#4caf50';
            editBtn.addEventListener('click', () => {
                editPasswordEntry(entry.id);
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.style.backgroundColor = '#f44336';
            deleteBtn.addEventListener('click', () => {
                deletePasswordEntry(entry.id);
            });
            
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
            row.appendChild(actionsCell);
            
            passwordTableBody.appendChild(row);
        });
    }
}

function editPasswordEntry(id) {
    const entry = passwordEntries.find(entry => entry.id === id);
    
    if (entry) {
        modalTitle.textContent = 'Edit Password';
        editingEntryId = id;
        passwordId.value = id;
        
        document.getElementById('website').value = entry.website;
        document.getElementById('websiteUrl').value = entry.websiteUrl || '';
        document.getElementById('usernameField').value = entry.username;
        document.getElementById('passwordField').value = decryptPassword(entry.password);
        document.getElementById('notes').value = entry.notes || '';
        
        updatePasswordStrength(decryptPassword(entry.password));
        passwordModal.style.display = 'flex';
    }
}

function deletePasswordEntry(id) {
    if (confirm('Are you sure you want to delete this password?')) {
        passwordEntries = passwordEntries.filter(entry => entry.id !== id);
        savePasswordEntries();
        renderPasswordEntries();
    }
}

function hashPassword(password) {
    // In a real app, use a proper hashing algorithm
    // This is a simple implementation for demo purposes
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

function encryptPassword(password) {
    // In a real app, use proper encryption
    // This is a simple implementation for demo purposes
    return btoa(password);
}

function decryptPassword(encryptedPassword) {
    // In a real app, use proper decryption
    // This is a simple implementation for demo purposes
    try {
        return atob(encryptedPassword);
    } catch (e) {
        return encryptedPassword;
    }
}

function updatePasswordStrength(password) {
    // Simple password strength calculation
    let strength = 0;
    
    if (password.length > 0) {
        // Length contribution (up to 40%)
        strength += Math.min(password.length * 3, 40);
        
        // Character variety contribution (up to 60%)
        if (/[a-z]/.test(password)) strength += 10;
        if (/[A-Z]/.test(password)) strength += 10;
        if (/[0-9]/.test(password)) strength += 10;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 30;
    }
    
    // Update UI
    strengthIndicator.style.width = strength + '%';
    
    if (strength < 30) {
        strengthText.textContent = 'Strength: Weak';
        strengthIndicator.style.backgroundColor = '#f44336';
    } else if (strength < 60) {
        strengthText.textContent = 'Strength: Medium';
        strengthIndicator.style.backgroundColor = '#ff9800';
    } else {
        strengthText.textContent = 'Strength: Strong';
        strengthIndicator.style.backgroundColor = '#4caf50';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const lastUserId = localStorage.getItem('lastUserId');
    if (lastUserId) {
        const user = getUserFromStorage(lastUserId);
        if (user) {
            loginUser(user);
        }
    }
});
