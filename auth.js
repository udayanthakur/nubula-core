// Auth Pages JavaScript

// Check if user is already logged in
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  if (token) {
    // Verify token is still valid
    fetch(`/api/auth/verify?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          // User is logged in, redirect to home
          window.location.href = 'index.html';
        } else {
          // Token invalid, remove it
          localStorage.removeItem('token');
        }
      })
      .catch(() => {
        // Server might not be running, that's okay
        console.log('Could not verify token');
      });
  }
}

// Password visibility toggle
document.addEventListener('DOMContentLoaded', () => {
  // Check auth status on page load
  checkAuthStatus();

  const passwordToggles = document.querySelectorAll('.password-toggle');

  passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const wrapper = toggle.closest('.password-input-wrapper');
      const input = wrapper.querySelector('input[type="password"], input[type="text"]');
      const eyeIcon = toggle.querySelector('.eye-icon');

      if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.textContent = '🙈';
      } else {
        input.type = 'password';
        eyeIcon.textContent = '👁';
      }
    });
  });

  // Password strength indicator (for signup page)
  const passwordInput = document.getElementById('password');
  const passwordStrength = document.getElementById('passwordStrength');

  if (passwordInput && passwordStrength) {
    passwordInput.addEventListener('input', (e) => {
      const password = e.target.value;
      const strength = calculatePasswordStrength(password);

      passwordStrength.className = 'password-strength';
      if (password.length > 0) {
        passwordStrength.classList.add(strength);
      }
    });
  }

  // Password confirmation match check
  const confirmPasswordInput = document.getElementById('confirmPassword');
  if (confirmPasswordInput && passwordInput) {
    confirmPasswordInput.addEventListener('input', () => {
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      if (confirmPassword && password !== confirmPassword) {
        confirmPasswordInput.setCustomValidity('Passwords do not match');
        confirmPasswordInput.style.borderColor = 'rgba(239, 68, 68, 0.6)';
      } else {
        confirmPasswordInput.setCustomValidity('');
        confirmPasswordInput.style.borderColor = '';
      }
    });
  }

  // Form submission handlers
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
});

function calculatePasswordStrength(password) {
  if (password.length < 6) return 'weak';

  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;

  if (strength <= 1) return 'weak';
  if (strength <= 3) return 'medium';
  return 'strong';
}

async function handleLogin(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  const submitButton = form.querySelector('.auth-submit');
  const originalText = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML = '<span>Signing in...</span>';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      showMessage('Login successful! Redirecting...', 'success');
      localStorage.setItem('token', result.token);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } else {
      showMessage(result.message || 'Login failed. Please check your credentials.', 'error');
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
    }
  } catch (error) {
    console.error('Login error:', error);
    showMessage('Connection error. Please make sure the server is running.', 'error');
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Validate password match
  if (data.password !== data.confirmPassword) {
    showMessage('Passwords do not match', 'error');
    return;
  }

  const submitButton = form.querySelector('.auth-submit');
  const originalText = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML = '<span>Creating account...</span>';

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      showMessage('Account created successfully! Redirecting...', 'success');
      localStorage.setItem('token', result.token);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } else {
      showMessage(result.message || 'Signup failed. Please try again.', 'error');
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
    }
  } catch (error) {
    console.error('Signup error:', error);
    showMessage('Connection error. Please make sure the server is running.', 'error');
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  }
}

function showMessage(message, type) {
  const messageEl = document.getElementById('authMessage');
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.className = `auth-message ${type} show`;

    setTimeout(() => {
      messageEl.classList.remove('show');
    }, 5000);
  }
}

