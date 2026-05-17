/* ==========================================================================
   LOGIN PAGE — Password show/hide toggle and form submit (mock login).
   ========================================================================== */

        /* Click the eye button to switch password field between hidden and visible. */
        const toggleBtn = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');

        toggleBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            toggleBtn.textContent = isPassword ? '🙈' : '👁';
        });

        /* On submit: if email/password match mock credentials, show welcome alert;
           otherwise show the error message element. */
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('errorMsg');

            if (email === 'player@footballcave.com' && password === '1234') {
                errorMsg.classList.remove('show');
                alert('✅ Welcome back to Football Cave!');
            } else {
                errorMsg.classList.add('show');
            }
        });