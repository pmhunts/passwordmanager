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
const importBtn = document.getElementById('importBtn'); // Added import button
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
const importFileInput = document.createElement('input'); // Added file input for import

// State variables
let isLogin = true;
let currentUserId = null;
let passwordEntries = [];
let editingEntryId = null;

// Set up import file input
importFileInput.type = 'file';
importFileInput.accept = 'application/json';
importFileInput.style.display = 'none';
document.body.appendChild(importFileInput);

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

// Enhanced form submission handling
function initializeAuthForm() {
    console.log("Initializing auth form handler");
    
    if (!authForm || !(authForm instanceof HTMLElement)) {
        console.error("Auth form element not found or invalid");
        return;
    }

    // Double prevention of default behavior
    authForm.onsubmit = function() { 
        console.log("Default form submission prevented");
        return false; 
    };

    // Robust event binding with fallback
    try {
        authForm.addEventListener('submit', handleFormSubmit);
        console.log("Submit event listener attached successfully");
    } catch (error) {
        console.error("Error attaching submit listener:", error);
        authForm.onsubmit = handleFormSubmit; // Fallback
    }
}

function handleFormSubmit(e) {
    if (e) e.preventDefault();
    console.log("Form submit handler triggered");
    
    try {
        console.group('Form Submission Debug');
        console.log("1. Form submission intercepted");
        console.log("2. Form element:", authForm);
        console.log("3. Event target:", e.target);
        console.log("4. Default prevented?", e.defaultPrevented);
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        console.log("5. Form values captured");
        console.log("   Username:", username);
        console.log("   Password:", password ? "******" : "empty");
        
        if (isLogin) {
            console.log("6. Starting login process");
            const user = getUserFromStorage(username);
            console.log("7. User lookup result:", user ? "Found" : "Not found");
            if (user) console.log("   User details:", {username: user.username, id: user.id});
            
            if (user) {
                const hashedInput = hashPassword(password);
                console.log("8. Password comparison:");
                console.log("   Stored hash:", user.password);
                console.log("   Input hash:", hashedInput);
                
                if (user.password === hashedInput) {
                    console.log("9. Password match - logging in");
                    loginUser(user);
                } else {
                    console.log("9. Password mismatch");
                    alert('Invalid username or password');
                }
            } else {
                console.log("8. No user found");
                alert('User not found');
            }
        } else {
            // Register logic
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            console.log("6. Checking if username exists:", username);
            if (getUserFromStorage(username)) {
                console.log("7. Username already exists:", username);
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
        console.groupEnd();
    } catch (error) {
        console.error("Form submission error:", error);
        alert('An error occurred during form submission');
    }
}

// Initialize form handling
initializeAuthForm();

// Simple hash function for passwords
// Note: This is a simple hash for demo purposes. In a real app, use a proper crypto library
function hashPassword(password) {
    let hash = 0;
    if (password.length === 0) return hash.toString();
    
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash.toString();
}

// User storage functions
function getUserFromStorage(username) {
    const users = JSON.parse(localStorage.getItem('secureVaultUsers') || '[]');
    return users.find(user => user.username === username);
}

function getUserById(userId) {
    const users = JSON.parse(localStorage.getItem('secureVaultUsers') || '[]');
    return users.find(user => user.id === userId);
}

function saveUserToStorage(user) {
    let users = JSON.parse(localStorage.getItem('secureVaultUsers') || '[]');
    
    // Check if user already exists
    const existingUserIndex = users.findIndex(u => u.id === user.id);
    
    if (existingUserIndex >= 0) {
        // Update existing user
        users[existingUserIndex] = user;
    } else {
        // Add new user
        users.push(user);
    }
    
    localStorage.setItem('secureVaultUsers', JSON.stringify(users));
}

// Login/logout functions
function loginUser(user) {
    currentUserId = user.id;
    currentUser.textContent = user.username;
    
    // Store session
    sessionStorage.setItem('currentUserId', user.id);
    
    // Load user's password entries
    passwordEntries = user.passwordEntries || [];
    
    // Show password manager UI
    authContainer.style.display = 'none';
    passwordManager.style.display = 'block';
    
    // Render password list
    renderPasswordList();
}

function logoutUser() {
    currentUserId = null;
    passwordEntries = [];
    
    // Clear session
    sessionStorage.removeItem('currentUserId');
    
    // Show login UI
    passwordManager.style.display = 'none';
    authContainer.style.display = 'block';
    
    // Clear form fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('confirmPassword').value = '';
}

// Password entry management
function renderPasswordList() {
    // Clear table
    passwordTableBody.innerHTML = '';
    
    if (passwordEntries.length === 0) {
        // Show empty state
        emptyState.style.display = 'block';
        document.getElementById('passwordList').style.display = 'none';
        return;
    }
    
    // Hide empty state, show table
    emptyState.style.display = 'none';
    document.getElementById('passwordList').style.display = 'block';
    
    // Filter by search term
    const searchTerm = searchInput.value.toLowerCase();
    const filteredEntries = passwordEntries.filter(entry => 
        entry.website.toLowerCase().includes(searchTerm) || 
        entry.username.toLowerCase().includes(searchTerm)
    );
    
    // Render entries
    filteredEntries.forEach(entry => {
        const row = document.createElement('tr');
        
        // Website column
        const websiteCell = document.createElement('td');
        websiteCell.textContent = entry.website;
        row.appendChild(websiteCell);
        
        // Username column
        const usernameCell = document.createElement('td');
        usernameCell.textContent = entry.username;
        row.appendChild(usernameCell);
        
        // Password column (masked)
        const passwordCell = document.createElement('td');
        passwordCell.className = 'password-field';
        
        const maskedPassword = document.createElement('span');
        maskedPassword.textContent = '••••••••';
        maskedPassword.className = 'masked-password';
        
        const showPasswordBtn = document.createElement('span');
        showPasswordBtn.textContent = '👁️';
        showPasswordBtn.title = 'Show password';
        showPasswordBtn.onclick = () => togglePasswordVisibility(entry.id, showPasswordBtn);
        
        passwordCell.appendChild(maskedPassword);
        passwordCell.appendChild(showPasswordBtn);
        row.appendChild(passwordCell);
        
        // Last updated column
        const lastUpdatedCell = document.createElement('td');
        lastUpdatedCell.textContent = new Date(entry.lastUpdated).toLocaleDateString();
        row.appendChild(lastUpdatedCell);
        
        // Actions column
        const actionsCell = document.createElement('td');
        actionsCell.className = 'action-cell';
        
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = () => copyPassword(entry.password);
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => editPasswordEntry(entry.id);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.backgroundColor = '#f44336';
        deleteBtn.onclick = () => deletePasswordEntry(entry.id);
        
        actionsCell.appendChild(copyBtn);
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
        row.appendChild(actionsCell);
        
        passwordTableBody.appendChild(row);
    });
}

// Toggle password visibility
function togglePasswordVisibility(entryId, button) {
    const entry = passwordEntries.find(entry => entry.id === entryId);
    if (!entry) return;
    
    const row = button.closest('tr');
    const maskedPassword = row.querySelector('.masked-password');
    
    if (maskedPassword.textContent === '••••••••') {
        maskedPassword.textContent = entry.password;
        button.textContent = '🔒';
        button.title = 'Hide password';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            maskedPassword.textContent = '••••••••';
            button.textContent = '👁️';
            button.title = 'Show password';
        }, 5000);
    } else {
        maskedPassword.textContent = '••••••••';
        button.textContent = '👁️';
        button.title = 'Show password';
    }
}

// Copy password to clipboard
function copyPassword(password) {
    navigator.clipboard.writeText(password)
        .then(() => {
            alert('Password copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy password: ', err);
            alert('Failed to copy password');
        });
}

// Add new password entry
function addNewPasswordEntry() {
    editingEntryId = null;
    modalTitle.textContent = 'Add New Password';
    
    // Clear form
    passwordForm.reset();
    passwordId.value = '';
    
    // Reset strength indicator
    strengthIndicator.style.width = '0%';
    strengthIndicator.style.backgroundColor = '#ccc';
    strengthText.textContent = 'Strength: ';
    
    // Show modal
    passwordModal.style.display = 'flex';
}

// Edit password entry
function editPasswordEntry(entryId) {
    const entry = passwordEntries.find(entry => entry.id === entryId);
    if (!entry) return;
    
    editingEntryId = entryId;
    modalTitle.textContent = 'Edit Password';
    
    // Fill form with entry data
    document.getElementById('website').value = entry.website;
    document.getElementById('websiteUrl').value = entry.url || '';
    document.getElementById('usernameField').value = entry.username;
    document.getElementById('passwordField').value = entry.password;
    document.getElementById('notes').value = entry.notes || '';
    passwordId.value = entryId;
    
    // Update strength indicator
    checkPasswordStrength(entry.password);
    
    // Show modal
    passwordModal.style.display = 'flex';
}

// Delete password entry
function deletePasswordEntry(entryId) {
    if (!confirm('Are you sure you want to delete this password entry?')) return;
    
    passwordEntries = passwordEntries.filter(entry => entry.id !== entryId);
    
    // Update user data
    updateUserData();
    
    // Refresh list
    renderPasswordList();
}

// Generate strong password
function generateStrongPassword() {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}[]|:;<>,.?/';
    let password = '';
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    
    passwordField.value = password;
    checkPasswordStrength(password);
}

// Check password strength
function checkPasswordStrength(password) {
    // Basic password strength calculation
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 15; // lowercase
    if (/[A-Z]/.test(password)) strength += 15; // uppercase
    if (/[0-9]/.test(password)) strength += 15; // numbers
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15; // special chars
    
    // No sequential characters or repetitions
    if (!/(.)\1\1/.test(password)) strength += 10; // no triple characters
    
    // Update UI
    strengthIndicator.style.width = `${strength}%`;
    strengthText.textContent = `Strength: ${getStrengthLabel(strength)}`;
    
    // Update color
    if (strength < 40) {
        strengthIndicator.style.backgroundColor = '#ff5252'; // weak
    } else if (strength < 70) {
        strengthIndicator.style.backgroundColor = '#ffd740'; // medium
    } else {
        strengthIndicator.style.backgroundColor = '#4caf50'; // strong
    }
}

function getStrengthLabel(strength) {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
}

// Update user data in storage
function updateUserData() {
    const user = getUserById(currentUserId);
    if (!user) return;
    
    user.passwordEntries = passwordEntries;
    saveUserToStorage(user);
}

// Export password data
function exportPasswordData() {
    if (passwordEntries.length === 0) {
        alert('No password data to export');
        return;
    }
    
    const exportData = {
        exportDate: new Date().toISOString(),
        entries: passwordEntries.map(entry => ({
            website: entry.website,
            url: entry.url,
            username: entry.username,
            password: entry.password,
            notes: entry.notes,
            lastUpdated: entry.lastUpdated
        }))
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `password-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import password data
function importPasswordData() {
    importFileInput.click();
}

// Handle file selection for import
importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importData = JSON.parse(event.target.result);
            
            if (!importData.entries || !Array.isArray(importData.entries)) {
                throw new Error('Invalid import file format');
            }
            
            // Confirm import
            if (!confirm(`Import ${importData.entries.length} password entries?`)) {
                return;
            }
            
            // Process entries
            const importCount = importData.entries.length;
            const newEntries = importData.entries.map(entry => ({
                id: entry.id || Date.now().toString() + Math.random().toString(36).substring(2, 10),
                website: entry.website || 'Unknown',
                url: entry.url || '',
                username: entry.username || '',
                password: entry.password || '',
                notes: entry.notes || '',
                created: entry.created || new Date().toISOString(),
                lastUpdated: entry.lastUpdated || new Date().toISOString()
            }));
            
            // Add imported entries to current entries
            passwordEntries = [...passwordEntries, ...newEntries];
            
            // Update storage
            updateUserData();
            
            // Refresh list
            renderPasswordList();
            
            alert(`Successfully imported ${importCount} password entries.`);
        } catch (error) {
            console.error('Import error:', error);
            alert('Failed to import passwords. Please check the file format.');
        }
        
        // Reset file input
        importFileInput.value = '';
    };
    
    reader.readAsText(file);
});

// Backup all data
function backupAllData() {
    const allUsers = JSON.parse(localStorage.getItem('secureVaultUsers') || '[]');
    
    // Remove sensitive data from backup for security
    const safeBackup = allUsers.map(user => ({
        id: user.id,
        username: user.username,
        createdAt: user.createdAt || new Date().toISOString(),
        passwordCount: (user.passwordEntries || []).length
    }));
    
    const jsonString = JSON.stringify({
        backupDate: new Date().toISOString(),
        userCount: allUsers.length,
        users: safeBackup
    }, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Event Listeners
// Modal close button
closeModal.addEventListener('click', () => {
    passwordModal.style.display = 'none';
});

// Click outside modal to close
passwordModal.addEventListener('click', (e) => {
    if (e.target === passwordModal) {
        passwordModal.style.display = 'none';
    }
});

// Add new password button
addNewBtn.addEventListener('click', addNewPasswordEntry);

// Export button
exportBtn.addEventListener('click', exportPasswordData);

// Import button (if it exists in the DOM)
if (importBtn) {
    importBtn.addEventListener('click', importPasswordData);
} else {
    // Create import button if it doesn't exist
    const importBtn = document.createElement('button');
    importBtn.id = 'importBtn';
    importBtn.textContent = 'Import';
    importBtn.addEventListener('click', importPasswordData);
    
    // Add to the same container as export button if possible
    if (exportBtn && exportBtn.parentNode) {
        exportBtn.parentNode.insertBefore(importBtn, exportBtn.nextSibling);
    }
}

// Logout button
logoutBtn.addEventListener('click', logoutUser);

// Generate password button
generatePasswordBtn.addEventListener('click', generateStrongPassword);

// Password field input - check strength
passwordField.addEventListener('input', (e) => {
    checkPasswordStrength(e.target.value);
});

// Search input
searchInput.addEventListener('input', renderPasswordList);

// Password form submission
passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const websiteValue = document.getElementById('website').value;
    const urlValue = document.getElementById('websiteUrl').value;
    const usernameValue = document.getElementById('usernameField').value;
    const passwordValue = document.getElementById('passwordField').value;
    const notesValue = document.getElementById('notes').value;
    
    // Basic validation
    if (!websiteValue || !usernameValue || !passwordValue) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (editingEntryId) {
        // Update existing entry
        const entryIndex = passwordEntries.findIndex(entry => entry.id === editingEntryId);
        if (entryIndex >= 0) {
            passwordEntries[entryIndex] = {
                ...passwordEntries[entryIndex],
                website: websiteValue,
                url: urlValue,
                username: usernameValue,
                password: passwordValue,
                notes: notesValue,
                lastUpdated: new Date().toISOString()
            };
        }
    } else {
        // Add new entry
        passwordEntries.push({
            id: Date.now().toString(),
            website: websiteValue,
            url: urlValue,
            username: usernameValue,
            password: passwordValue,
            notes: notesValue,
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        });
    }
    
    // Update storage
    updateUserData();
    
    // Refresh list
    renderPasswordList();
    
    // Close modal
    passwordModal.style.display = 'none';
});

// Add keyboard shortcut (Ctrl+F or Cmd+F) to focus search
document.addEventListener('keydown', (e) => {
    // Check if Ctrl key (Windows) or Command key (Mac) is pressed along with F
    if ((e.ctrlKey || e.metaKey) && e.key === 'f' && currentUserId) {
        e.preventDefault(); // Prevent browser's default search behavior
        searchInput.focus();
    }
});

// Add double-click handler for password cells to quickly copy passwords
document.addEventListener('dblclick', (e) => {
    // Check if the clicked element is part of a password row
    const row = e.target.closest('tr');
    if (row && passwordTableBody.contains(row)) {
        const entryId = row.dataset.entryId || 
                        Array.from(passwordTableBody.children).indexOf(row);
        
        if (entryId >= 0) {
            const entry = passwordEntries[entryId] || 
                          passwordEntries.find(e => e.id == entryId);
            
            if (entry) {
                copyPassword(entry.password);
            }
        }
    }
});

// Check for existing session on page load
function checkSession() {
    const savedUserId = sessionStorage.getItem('currentUserId');
    if (savedUserId) {
        const user = getUserById(savedUserId);
        if (user) {
            loginUser(user);
        }
    }
}

// Initialize on page load
checkSession();

// Add auto-logout timer for security
let inactivityTimer;
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (currentUserId) {
        inactivityTimer = setTimeout(() => {
            alert('You have been logged out due to inactivity');
            logoutUser();
        }, INACTIVITY_TIMEOUT);
    }
}

// Reset timer on user activity
['click', 'keypress', 'mousemove', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
});

// Initialize inactivity timer
resetInactivityTimer();