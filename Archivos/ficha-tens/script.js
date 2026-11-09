api('me').then(() => location.replace('panel.html')).catch(() => {});

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passError = document.getElementById('passError');
const status = document.getElementById('status');
const remember = document.getElementById('remember');
const toggle = document.getElementById('togglePass');

function setError(input, el, message) {
    el.textContent = message;
    input.closest('.field').classList.toggle('invalid', Boolean(message));
}
emailInput.addEventListener('input', () => setError(emailInput, emailError, ''));
passInput.addEventListener('input', () => setError(passInput, passError, ''));

toggle.addEventListener('click', () => {
    const show = passInput.type === 'password';
    passInput.type = show ? 'text' : 'password';
    toggle.textContent = show ? 'Ocultar' : 'Mostrar';
    toggle.setAttribute('aria-pressed', String(show));
    toggle.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
});

try {
    const saved = localStorage.getItem('fichaTens:email');
    if (saved) { emailInput.value = saved; remember.checked = true; }
} catch (e) {}

document.getElementById('forgot').addEventListener('click', (e) => {
    e.preventDefault();
    status.className = 'form__status';
    status.textContent = 'Para recuperar tu contraseña, contacta a tu docente o al administrador.';
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.className = 'form__status';
    const email = emailInput.value.trim().toLowerCase();

    let ok = true;
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError(emailInput, emailError, 'Escribe un correo válido.'); ok = false; }
    if (!passInput.value) { setError(passInput, passError, 'Ingresa tu contraseña.'); ok = false; }
    if (!ok) { (emailError.textContent ? emailInput : passInput).focus(); return; }

    const btn = form.querySelector('.btn');
    btn.disabled = true;
    btn.textContent = 'Ingresando…';
    try {
        await api('login', 'POST', { email, pass: passInput.value });
        try { remember.checked ? localStorage.setItem('fichaTens:email', email) : localStorage.removeItem('fichaTens:email'); } catch (err) {}
        location.href = 'panel.html';
    } catch (err) {
        status.className = 'form__status error';
        status.textContent = err.message;
        btn.disabled = false;
        btn.textContent = 'Entrar a mi ficha';
    }
});
