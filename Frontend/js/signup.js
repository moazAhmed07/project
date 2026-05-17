/* ==========================================================================
   SIGNUP PAGE — Password visibility toggles, strength meter, and form validation.
   ========================================================================== */

        /* Toggle show/hide for main password and confirm password fields. */
        document.getElementById('togglePassword').addEventListener('click', function() {
            const input = document.getElementById('password');
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            this.textContent = isPassword ? '🙈' : '👁';
        });

        document.getElementById('toggleConfirm').addEventListener('click', function() {
            const input = document.getElementById('confirmPassword');
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            this.textContent = isPassword ? '🙈' : '👁';
        });

        /* As the user types the password: update the 4 strength segments and label
           (Weak / Fair / Good / Strong) based on length and character types. */
        document.getElementById('password').addEventListener('input', function() {
            const val = this.value;
            const segs = [
                document.getElementById('seg1'),
                document.getElementById('seg2'),
                document.getElementById('seg3'),
                document.getElementById('seg4'),
            ];
            const label = document.getElementById('strengthLabel');

            // Reset
            segs.forEach(s => s.style.background = 'rgba(255,255,255,0.2)');

            let strength = 0;
            if (val.length >= 6) strength++;
            if (val.length >= 10) strength++;
            if (/[A-Z]/.test(val) && /[0-9]/.test(val)) strength++;
            if (/[^A-Za-z0-9]/.test(val)) strength++;

            const colors = ['#ff4444', '#ff9800', '#ffeb3b', '#4caf7d'];
            const labels = ['Weak', 'Fair', 'Good', 'Strong'];

            for (let i = 0; i < strength; i++) {
                segs[i].style.background = colors[strength - 1];
            }
            label.textContent = val.length > 0 ? labels[strength - 1] || '' : '';
            label.style.color = strength > 0 ? colors[strength - 1] : 'rgba(255,255,255,0.6)';
        });

        /* On submit: validate all fields (required, email format, password length,
           confirm match, terms checked). If any fail, show field errors and the
           main error message. If all pass, show welcome alert. */
        document.getElementById('signupForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const firstName = document.getElementById('firstName');
            const lastName = document.getElementById('lastName');
            const email = document.getElementById('email');
            const password = document.getElementById('password');
            const confirmPassword = document.getElementById('confirmPassword');
            const terms = document.getElementById('terms');
            const errorMsg = document.getElementById('errorMsg');

            let hasError = false;

            /* Show or hide one field’s error and mark input invalid/valid. */
            const setError = (input, errorEl, show) => {
                errorEl.classList.toggle('show', show);
                input.classList.toggle('invalid', show);
                input.classList.toggle('valid', !show && input.value.length > 0);
                if (show) hasError = true;
            };

            setError(firstName, document.getElementById('firstNameError'), !firstName.value.trim());
            setError(lastName, document.getElementById('lastNameError'), !lastName.value.trim());
            setError(email, document.getElementById('emailError'), !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value));
            setError(password, document.getElementById('passwordError'), password.value.length < 8);
            setError(confirmPassword, document.getElementById('confirmError'), confirmPassword.value !== password.value);

            if (!terms.checked) {
                hasError = true;
                errorMsg.textContent = '⚠ Please agree to the Terms of Service to continue.';
            } else {
                errorMsg.textContent = '⚠ Please fix the errors above before continuing.';
            }

            errorMsg.classList.toggle('show', hasError);

            if (!hasError) {
                alert(`✅ Welcome to Football Cave, ${firstName.value}!`);
            }
        });