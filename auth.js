// Toggle Between Registration/Login
window.toggleAuth = function(type) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');

    if (type === 'login') {
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
        
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
    } else if (type === 'signup') {
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
        
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
    }
};

// Handle Submission
const handleAuthSubmit = function (e) {
    e.preventDefault();
    
    // [TODO]
    localStorage.setItem('isLoggedIn', 'true');
    
    // [TODO] => Redirect Form To Dashboard UI
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
        loginCard.innerHTML = `
            <div style="text-align: center; padding: 2rem 0; animation: fadeIn 1s ease forwards;">
                <h3 style="color: #f4d068; font-family: 'Cinzel', serif; font-size: 2rem; margin-bottom: 1rem;">Access Granted</h3>
                <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">Welcome. Your adventure continues.</p>
            </div>
        `;
    }
};

const loginForm = document.getElementById('loginForm');
if (loginForm) loginForm.addEventListener('submit', handleAuthSubmit);

const signupForm = document.getElementById('signupForm');
if (signupForm) signupForm.addEventListener('submit', handleAuthSubmit);
