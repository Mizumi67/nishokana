if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

document.getElementById('lost-label').textContent = window.NISHO_ERROR.label;
document.getElementById('lost-title').textContent = window.NISHO_ERROR.title;
document.getElementById('lost-desc').textContent = window.NISHO_ERROR.desc;
document.getElementById('lost-path').textContent = window.NISHO_PATH;
