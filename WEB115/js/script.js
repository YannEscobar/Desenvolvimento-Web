/* ============================================================
   PORTFÓLIO — comportamento
   1. Revelação ao rolar + barras de skill
   2. Tilt nos cards (só com mouse e sem "reduzir movimento")
   3. Scroll-spy da navegação
   4. Vídeos do YouTube sob demanda (facade)
   5. Formulário em <dialog> com validação
   ============================================================ */
 
// Troque pelo seu e-mail real
const EMAIL_DESTINO = 'seuemail@exemplo.com';
 
document.documentElement.classList.add('js');
 
const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const temMouse = matchMedia('(hover: hover) and (pointer: fine)').matches;
 
/* ---------- 1. Revelação ao rolar ---------- */
const revelaveis = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduzMovimento) {
    const obsReveal = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                obsReveal.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });
    revelaveis.forEach((el) => obsReveal.observe(el));
} else {
    revelaveis.forEach((el) => el.classList.add('visible'));
}
 
/* ---------- 2. Tilt ---------- */
if (temMouse && !reduzMovimento) {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
        el.addEventListener('pointermove', (e) => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            el.style.setProperty('--rx', (-y * 12).toFixed(2) + 'deg');
            el.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg');
            el.style.setProperty('--rz', '0deg');
        });
        el.addEventListener('pointerleave', () => {
            el.style.removeProperty('--rx');
            el.style.removeProperty('--ry');
            el.style.removeProperty('--rz');
        });
    });
}
 
/* ---------- 3. Scroll-spy ---------- */
const linksNav = document.querySelectorAll('.nav a:not(.logo)');
const idsSecoes = ['quem-sou', 'habilidades', 'trabalhos', 'contato'];
 
function marcarAtivo(id) {
    linksNav.forEach((a) => {
        if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
    });
}
 
if ('IntersectionObserver' in window) {
    const obsNav = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => { if (e.isIntersecting) marcarAtivo(e.target.id); });
    }, { rootMargin: '-35% 0px -55% 0px' });
 
    idsSecoes.forEach((id) => {
        const el = document.getElementById(id);
        if (el) obsNav.observe(el);
    });
}
 
/* ---------- 4. YouTube sob demanda ---------- */
document.querySelectorAll('.video-facade').forEach((btn) => {
    const id = btn.dataset.videoId;
    btn.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`;
 
    btn.addEventListener('click', () => {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
        iframe.title = btn.dataset.title || 'Vídeo do YouTube';
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
        iframe.allowFullscreen = true;
        btn.replaceWith(iframe);
        iframe.focus();
    });
});
 
/* ---------- 5. Formulário ---------- */
const dialogo = document.getElementById('dialogo-contato');
const btnAbrir = document.getElementById('abrir-form');
const form = document.getElementById('form-contato');
const statusForm = document.getElementById('status-form');
 
btnAbrir.addEventListener('click', () => {
    statusForm.textContent = '';
    dialogo.showModal();
});
dialogo.querySelector('[data-fechar]').addEventListener('click', () => dialogo.close());
// Clique no fundo escuro fecha (o padding fica no .dialogo-corpo, então o alvo é o próprio dialog)
dialogo.addEventListener('click', (e) => { if (e.target === dialogo) dialogo.close(); });
 
const regras = {
    assunto: (v) => v.trim().length >= 3 || 'Escreva um assunto com pelo menos 3 caracteres.',
    nome: (v) => v.trim().length >= 2 || 'Informe seu nome.',
    contato: (v) => {
        const t = v.trim();
        const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t);
        const digitos = t.replace(/\D/g, '');
        const telefone = /^[\d\s()+\-]+$/.test(t) && digitos.length >= 10 && digitos.length <= 13;
        return email || telefone || 'Use um e-mail válido ou um telefone com DDD.';
    },
};
 
function validarCampo(input) {
    const resultado = regras[input.name](input.value);
    const erro = document.getElementById('erro-' + input.id.replace('-info', ''));
    if (resultado === true) {
        input.removeAttribute('aria-invalid');
        erro.textContent = '';
        return true;
    }
    input.setAttribute('aria-invalid', 'true');
    erro.textContent = resultado;
    return false;
}
 
const campos = [...form.querySelectorAll('input')];
 
campos.forEach((input) => {
    // Valida ao sair do campo; depois que deu erro, revalida enquanto digita
    input.addEventListener('blur', () => { if (input.value !== '') validarCampo(input); });
    input.addEventListener('input', () => { if (input.getAttribute('aria-invalid')) validarCampo(input); });
});
 
form.addEventListener('submit', (e) => {
    e.preventDefault();
 
    const invalidos = campos.filter((input) => !validarCampo(input));
    if (invalidos.length) {
        invalidos[0].focus();
        statusForm.textContent = '';
        return;
    }
 
    const dados = new FormData(form);
    const corpo =
        `Olá, Yann! Meu nome é ${dados.get('nome')}.\n\n` +
        `Assunto: ${dados.get('assunto')}\n` +
        `Contato para retorno: ${dados.get('contato')}`;
 
    const url = `mailto:${EMAIL_DESTINO}?subject=${encodeURIComponent(dados.get('assunto'))}&body=${encodeURIComponent(corpo)}`;
 
    statusForm.textContent = `Pronto! Seu app de e-mail deve abrir com a mensagem. Se não abrir, escreva para ${EMAIL_DESTINO}.`;
    form.reset();
    window.location.href = url;
});