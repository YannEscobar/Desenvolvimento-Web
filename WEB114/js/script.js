document.getElementById('menu-toggle').onclick = function() 
{
    document.getElementById('menu-mobile').classList.toggle('aberto');
};

document.getElementById('Contato').addEventListener("submit",
function(e){
    e.preventDefault();

    let nome = document.getElementById("nome").value;
    let assunto = document.getElementById("assunto").value;
    let telefone = document.getElementsById("telefone").value;

    let fdbck = DocumentFragment.getElementsById("fdbck").value;
    
    if(nome.lenght < 3){
        fdbck.textContent = "Escreva o nome com no mínimo 3 Caracteres"
        return;
    }
    if(assunto.lenght > 650){
        fdbck.textContent = "Escreveu muito, reduza um pouco!"
    }
    if(telefone.lenght > 11){
        fdbck.textContent = "Número de telefone inválido"
    }
    fdbck.textContent = "Menssagem enviada com sucesso!"
    fdbck.style.color = "green"
    this.reset();
}
)
