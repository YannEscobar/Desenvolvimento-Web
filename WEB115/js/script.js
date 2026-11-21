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

/* ============================================================
   HABILIDADES — roda com scroll
   Cole no fim do script.js (ou carregue como arquivo à parte).
   Faz 3 coisas: desenha a engrenagem, calcula o progresso `--p`
   a partir do scroll e marca qual card está ativo.
   ============================================================ */
(() => {
    const secao = document.querySelector('.skills-secao');
    if (!secao) return;

    // Sem movimento reduzido e com suporte a cos() em translate: liga a roda.
    // Caso contrário, o CSS base (grid de cards) continua valendo.
    const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const suportaRoda = CSS.supports('translate', 'calc(cos(10deg) * 1px)');
    if (reduzido || !suportaRoda) return;

    const palco = secao.querySelector('.skills-palco');
    const cards = [...secao.querySelectorAll('.skill')];
    const nav = document.querySelector('.topo');
    const n = cards.length;
    if (n < 2) return;

    secao.classList.add('roda-on');

    /* ---------- Ajustes ---------- */
    // Fração de cada trecho em que a roda fica "travada" na habilidade, em cada ponta.
    // 0.2 → a roda fica parada em 40% do scroll de cada habilidade e gira nos outros 60%.
    const PAUSA = 0.2;

    /* ---------- 1. Engrenagem ---------- */
    // Quantidade de dentes = 360° / ângulo entre habilidades (--giro).
    const giroGraus = parseFloat(getComputedStyle(secao).getPropertyValue('--giro')) || 24;
    const dentes = Math.round(360 / giroGraus);

    function caminhoEngrenagem(qtd, rPonta = 97, rBase = 83, rFuro = 32) {
        const c = 100;
        const passo = (2 * Math.PI) / qtd;
        const pt = (r, a) => `${(c + r * Math.cos(a)).toFixed(2)} ${(c + r * Math.sin(a)).toFixed(2)}`;
        let d = '';
        let inicio = '';

        for (let k = 0; k < qtd; k++) {
            const a = k * passo - Math.PI / 2;
            const p0 = pt(rBase, a - 0.30 * passo);
            if (k === 0) { d += `M ${p0} `; inicio = p0; }
            else { d += `A ${rBase} ${rBase} 0 0 1 ${p0} `; }
            d += `L ${pt(rPonta, a - 0.15 * passo)} `;
            d += `L ${pt(rPonta, a + 0.15 * passo)} `;
            d += `L ${pt(rBase, a + 0.30 * passo)} `;
        }
        d += `A ${rBase} ${rBase} 0 0 1 ${inicio} Z `;

        // furo central (o fill-rule evenodd do mask faz o buraco)
        d += `M ${c + rFuro} ${c} A ${rFuro} ${rFuro} 0 1 0 ${c - rFuro} ${c} A ${rFuro} ${rFuro} 0 1 0 ${c + rFuro} ${c} Z`;
        return d;
    }

    const d = caminhoEngrenagem(dentes);
    const svgMascara =
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><path fill-rule='evenodd' d='${d}'/></svg>`;
    secao.style.setProperty('--mascara', `url("data:image/svg+xml,${encodeURIComponent(svgMascara)}")`);
    const contorno = secao.querySelector('#gear-path');
    if (contorno) contorno.setAttribute('d', d);

    /* ---------- 2. Progresso com pausa ---------- */
    // raw vai de 0 a n-1 em linha reta. Aqui ele ganha "degraus suaves":
    // perto de cada número inteiro o valor fica parado (a roda trava),
    // e entre eles passa por uma curva suave (smoothstep).
    function comPausa(raw) {
        const i = Math.floor(raw);
        const f = raw - i;
        let t = (f - PAUSA) / (1 - 2 * PAUSA);
        t = Math.min(1, Math.max(0, t));
        t = t * t * (3 - 2 * t);
        return i + t;
    }

    /* ---------- 3. Scroll → --p ---------- */
    let ativoAnterior = -1;
    let agendado = false;

    function atualizar() {
        agendado = false;

        const navAlt = nav ? nav.offsetHeight : 57;
        secao.style.setProperty('--altura-nav', navAlt + 'px');

        // Quanto da seção já "passou" desde que o palco grudou no topo
        const total = secao.offsetHeight - palco.offsetHeight;
        const rolado = navAlt - secao.getBoundingClientRect().top;
        const prog = total > 0 ? Math.min(1, Math.max(0, rolado / total)) : 0;

        const p = comPausa(prog * (n - 1));
        palco.style.setProperty('--p', p.toFixed(3));

        // Card ativo = o mais próximo do centro
        const ativo = Math.round(p);
        if (ativo !== ativoAnterior) {
            cards.forEach((card, i) => {
                const ligado = i === ativo;
                card.classList.toggle('ativa', ligado);
                if (ligado) card.setAttribute('aria-current', 'true');
                else card.removeAttribute('aria-current');
            });
            ativoAnterior = ativo;
        }
    }

    function pedir() {
        if (!agendado) {
            agendado = true;
            requestAnimationFrame(atualizar);
        }
    }

    addEventListener('scroll', pedir, { passive: true });
    addEventListener('resize', pedir);
    atualizar();
})();