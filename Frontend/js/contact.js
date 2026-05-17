/* ==========================================================================
   CONTACT PAGE — Form submit: validate, then show success message and reset.
   ========================================================================== */

        /* When the user submits: prevent reload, read name / email / message,
           check they are filled and email format is valid, then show the
           success message and clear the form. Success message hides after 6s. */
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const firstName  = document.getElementById('firstName').value.trim();
            const email      = document.getElementById('email').value.trim();
            const message    = document.getElementById('message').value.trim();
            const successMsg = document.getElementById('successMsg');

            if (!firstName || !email || !message) {
                alert('⚠ Please fill in your name, email, and message.');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert('⚠ Please enter a valid email address.');
                return;
            }

            successMsg.classList.add('show');
            this.reset();
            setTimeout(() => successMsg.classList.remove('show'), 6000);
        });