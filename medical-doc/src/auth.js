// Authentication Service
class AuthService {
    constructor() {
        this.currentUser = null;
        this.authToken = null;
    }

    async init() {
        await medicalDB.init();
        // Check for existing session
        const savedToken = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('currentUser');
        
        if (savedToken && savedUser) {
            this.authToken = savedToken;
            this.currentUser = JSON.parse(savedUser);
        }

        // Create default admin user if no users exist
        await this.createDefaultAdmin();
    }

    async createDefaultAdmin() {
        try {
            const existingAdmin = await medicalDB.getUserByUsername('admin');
            if (!existingAdmin) {
                const adminUser = {
                    username: 'admin',
                    password: this.hashPassword('admin'), // Simple hash for demo
                    role: 'admin',
                    createdAt: new Date().toISOString()
                };
                await medicalDB.addUser(adminUser);
                console.log('Default admin user created');
            }
        } catch (error) {
            console.error('Error creating default admin:', error);
        }
    }

    // Simple password hashing (in production, use bcrypt or similar)
    hashPassword(password) {
        // Simple base64 encoding for demo purposes
        // In production, use proper hashing like bcrypt
        return btoa(password);
    }

    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    generateToken(username) {
        // Simple token generation - in production use JWT or similar
        const timestamp = new Date().getTime();
        const tokenData = `${username}:${timestamp}`;
        return btoa(tokenData);
    }

    async login(username, password) {
        try {
            const user = await medicalDB.getUserByUsername(username);
            
            if (!user) {
                throw new Error('Invalid username or password');
            }

            if (!this.verifyPassword(password, user.password)) {
                throw new Error('Invalid username or password');
            }

            // Generate auth token
            this.authToken = this.generateToken(username);
            this.currentUser = {
                id: user.id,
                username: user.username,
                role: user.role
            };

            // Store in localStorage for session persistence
            localStorage.setItem('authToken', this.authToken);
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            return {
                success: true,
                user: this.currentUser,
                token: this.authToken
            };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(username, password, role = 'user') {
        try {
            // Check if username already exists
            const existingUser = await medicalDB.getUserByUsername(username);
            if (existingUser) {
                throw new Error('Username already exists');
            }

            const userData = {
                username: username,
                password: this.hashPassword(password),
                role: role,
                createdAt: new Date().toISOString()
            };

            const userId = await medicalDB.addUser(userData);
            
            return {
                success: true,
                userId: userId
            };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    logout() {
        this.currentUser = null;
        this.authToken = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }

    isAuthenticated() {
        return this.authToken !== null && this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getAuthToken() {
        return this.authToken;
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
}

// Create a global instance
const authService = new AuthService();
window.authService = authService;
