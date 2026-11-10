
let listaDeProdutos = JSON.parse(localStorage.getItem("produtos")) || [];

let idEmEdicao = null;
let idPendenteExclusao = null;
let limparTudoPendente = false;


// ELEMENTOS HTML

const formulario = document.getElementById("produto-form");

const campoNome = document.getElementById("nome");
const campoPreco = document.getElementById("preco");
const campoQuantidade = document.getElementById("quantidade");
const campoBusca = document.getElementById("campo-busca");

const tabela = document.getElementById("tabela-produtos");
const totalEstoque = document.getElementById("total-estoque");

const mensagemErro = document.getElementById("mensagem-erro");

const botaoSalvar = document.getElementById("btn-salvar");
const botaoLimpar = document.getElementById("limpar-tabela");


// MENSAGENS DE SUCESSO E PRODUTOS VAZIOS

const mensagemSucesso = document.createElement("p");
mensagemSucesso.id = "mensagem-sucesso";
mensagemSucesso.style.display = "none";

mensagemErro.after(mensagemSucesso);

const mensagemVazia = document.createElement("p");
mensagemVazia.id = "mensagem-vazia";
mensagemVazia.style.display = "none";

tabela.after(mensagemVazia);


// DESATIVAR VALIDAÇÃO NATIVA DO FORMULÁRIO

formulario.setAttribute("novalidate", "");


// MODAIS

const modalConfirmacao = document.getElementById("modal-confirmacao");
const modalBootstrap = document.getElementById("modal-bootstrap");

const botaoConfirmar = document.getElementById("btn-confirmar");
const botaoCancelar = document.getElementById("btn-cancelar");

const botaoBootstrap = document.getElementById("btn-bootstrap");
const botaoFecharBootstrap = document.getElementById("btn-fechar-bootstrap");

const tituloConfirmacao = modalConfirmacao.querySelector("h2");
const textoConfirmacao = document.getElementById("texto-confirmacao");


// SALVAR NO LOCALSTORAGE

function salvarLocalStorage() {

    localStorage.setItem("produtos", JSON.stringify(listaDeProdutos));

}


// MENSAGENS INLINE

function mostrarErro(mensagem) {

    mensagemErro.textContent = mensagem;
    mensagemErro.style.display = "block";

    mensagemSucesso.style.display = "none";

}


function mostrarSucesso(mensagem) {

    mensagemSucesso.textContent = mensagem;
    mensagemSucesso.style.display = "block";

    mensagemErro.style.display = "none";

}


function limparMensagens() {

    mensagemErro.textContent = "";
    mensagemSucesso.textContent = "";

    mensagemErro.style.display = "none";
    mensagemSucesso.style.display = "none";

}


// FORMATAÇÃO DE MOEDA

function formatarMoeda(valor) {

    return valor.toLocaleString("pt-BR", {

        style: "currency",
        currency: "BRL"

    });

}


// CALCULAR TOTAL DO ESTOQUE

function calcularTotalEstoque() {

    return listaDeProdutos.reduce((total, produto) => {

        return total + (produto.preco * produto.quantidade);

    }, 0);

}


// FILTRAR PRODUTOS

function obterProdutosFiltrados() {

    const pesquisa = campoBusca.value.toLowerCase().trim();

    return listaDeProdutos.filter(produto =>

        produto.nome.toLowerCase().includes(pesquisa)

    );

}


// SUGESTÕES DE PRODUTOS

function atualizarSugestoes() {

    const listaSugestoes = document.getElementById("sugestoes-produtos");

    const pesquisa = campoNome.value.toLowerCase().trim();

    listaSugestoes.innerHTML = "";

    const nomes = [

        ...new Set(

            listaDeProdutos

                .map(produto => produto.nome)

                .filter(nome => nome.toLowerCase().startsWith(pesquisa))

        )

    ];

    nomes.forEach(nome => {

        const opcao = document.createElement("option");

        opcao.value = nome;

        listaSugestoes.appendChild(opcao);

    });

}


// RENDERIZAR TABELA

function renderizarTabela() {

    const corpoTabela = tabela.querySelector("tbody");

    corpoTabela.innerHTML = "";

    const produtosFiltrados = obterProdutosFiltrados();

    produtosFiltrados.forEach(produto => {

        const linha = document.createElement("tr");

        const valorTotal = produto.preco * produto.quantidade;

        linha.innerHTML = `

            <td></td>
            <td></td>
            <td></td>
            <td></td>

            <td>

                <button class="botao-editar" data-acao="editar">
                    Editar
                </button>

                <button class="botao-excluir-item" data-acao="excluir">
                    Excluir
                </button>

            </td>

        `;

        linha.cells[0].textContent = produto.nome;
        linha.cells[1].textContent = formatarMoeda(produto.preco);
        linha.cells[2].textContent = produto.quantidade;
        linha.cells[3].textContent = formatarMoeda(valorTotal);

        linha.querySelector('[data-acao="editar"]')

            .addEventListener("click", () => editarProduto(produto.id));

        linha.querySelector('[data-acao="excluir"]')

            .addEventListener("click", () => abrirModalExclusao(produto.id));

        corpoTabela.appendChild(linha);

    });


    // ATUALIZAR TOTAL DO ESTOQUE

    totalEstoque.textContent =
        "Total em Estoque: " + formatarMoeda(calcularTotalEstoque());


    // MENSAGEM DE TABELA VAZIA

    if (produtosFiltrados.length === 0) {

        mensagemVazia.textContent = listaDeProdutos.length === 0

            ? "Nenhum produto cadastrado."

            : "Nenhum produto encontrado.";

        mensagemVazia.style.display = "block";

    } else {

        mensagemVazia.textContent = "";
        mensagemVazia.style.display = "none";

    }

}


// CADASTRAR OU EDITAR PRODUTO

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    limparMensagens();

    const nome = campoNome.value.trim();
    const preco = Number(campoPreco.value);
    const quantidade = Number(campoQuantidade.value);


    // VALIDAÇÕES

    if (nome === "") {

        mostrarErro("Por favor, informe o nome do produto.");

        campoNome.focus();

        return;

    }


    if (!Number.isFinite(preco) || preco <= 0) {

        mostrarErro("Informe um preço válido e maior que zero.");

        campoPreco.focus();

        return;

    }


    if (!Number.isInteger(quantidade) || quantidade <= 0) {

        mostrarErro("Informe uma quantidade inteira maior que zero.");

        campoQuantidade.focus();

        return;

    }


    // MODO DE EDIÇÃO

    if (idEmEdicao !== null) {

        const produto = listaDeProdutos.find(

            item => item.id === idEmEdicao

        );

        if (!produto) {

            mostrarErro("Não foi possível localizar o produto.");

            return;

        }

        produto.nome = nome;
        produto.preco = preco;
        produto.quantidade = quantidade;

        idEmEdicao = null;

        botaoSalvar.textContent = "Adicionar Produto";

        mostrarSucesso("Produto atualizado com sucesso!");


    } else {

        // CADASTRO NOVO

        const novoProduto = {

            id: Date.now() + Math.random(),

            nome: nome,

            preco: preco,

            quantidade: quantidade

        };

        listaDeProdutos.push(novoProduto);

        mostrarSucesso("Produto cadastrado com sucesso!");

    }


    salvarLocalStorage();

    renderizarTabela();

    atualizarSugestoes();

    formulario.reset();

});


// EDITAR PRODUTO

function editarProduto(id) {

    const produto = listaDeProdutos.find(item => item.id === id);

    if (!produto) {

        mostrarErro("Produto não encontrado.");

        return;

    }

    limparMensagens();

    campoNome.value = produto.nome;
    campoPreco.value = produto.preco;
    campoQuantidade.value = produto.quantidade;

    idEmEdicao = id;

    botaoSalvar.textContent = "Salvar Alterações";

    campoNome.focus();

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ABRIR MODAL DE EXCLUSÃO

function abrirModalExclusao(id) {

    idPendenteExclusao = id;

    limparTudoPendente = false;

    const produto = listaDeProdutos.find(item => item.id === id);

    if (!produto) {

        return;

    }

    tituloConfirmacao.textContent = "Confirmar exclusão";

    textoConfirmacao.textContent =

        `Deseja realmente excluir o produto "${produto.nome}"?`;

    botaoConfirmar.textContent = "Confirmar";

    modalConfirmacao.classList.add("aberto");

    modalConfirmacao.setAttribute("aria-hidden", "false");

    botaoCancelar.focus();

}


// BOTÃO LIMPAR TUDO

botaoLimpar.addEventListener("click", function() {

    limparMensagens();

    if (listaDeProdutos.length === 0) {

        mostrarErro("Não existem produtos para excluir.");

        return;

    }

    idPendenteExclusao = null;

    limparTudoPendente = true;

    tituloConfirmacao.textContent = "Limpar todos os produtos";

    textoConfirmacao.textContent =

        "Tem certeza de que deseja excluir TODOS os produtos cadastrados? Essa ação não poderá ser desfeita.";

    botaoConfirmar.textContent = "Sim, limpar tudo";

    modalConfirmacao.classList.add("aberto");

    modalConfirmacao.setAttribute("aria-hidden", "false");

    botaoCancelar.focus();

});


// CONFIRMAR EXCLUSÃO

botaoConfirmar.addEventListener("click", function() {

    if (limparTudoPendente) {

        listaDeProdutos = [];

        if (idEmEdicao !== null) {

            idEmEdicao = null;

            formulario.reset();

            botaoSalvar.textContent = "Adicionar Produto";

        }

        salvarLocalStorage();

        renderizarTabela();

        atualizarSugestoes();

        fecharModalConfirmacao();

        mostrarSucesso("Todos os produtos foram excluídos!");


    } else if (idPendenteExclusao !== null) {

        const produto = listaDeProdutos.find(

            item => item.id === idPendenteExclusao

        );

        if (!produto) {

            fecharModalConfirmacao();

            mostrarErro("O produto não foi encontrado.");

            return;

        }

        listaDeProdutos = listaDeProdutos.filter(

            item => item.id !== idPendenteExclusao

        );

        if (idEmEdicao === idPendenteExclusao) {

            idEmEdicao = null;

            formulario.reset();

            botaoSalvar.textContent = "Adicionar Produto";

        }

        salvarLocalStorage();

        renderizarTabela();

        atualizarSugestoes();

        fecharModalConfirmacao();

        mostrarSucesso("Produto excluído com sucesso!");

    }

});


// CANCELAR EXCLUSÃO

botaoCancelar.addEventListener("click", fecharModalConfirmacao);


// FECHAR MODAL DE CONFIRMAÇÃO

function fecharModalConfirmacao() {

    modalConfirmacao.classList.remove("aberto");

    modalConfirmacao.setAttribute("aria-hidden", "true");

    idPendenteExclusao = null;

    limparTudoPendente = false;

}


// FILTRO DINÂMICO

campoBusca.addEventListener("input", function() {

    renderizarTabela();

});


// ATUALIZAR SUGESTÕES

campoNome.addEventListener("input", atualizarSugestoes);


// MODAL BOOTSTRAP

botaoBootstrap.addEventListener("click", function() {

    modalBootstrap.classList.add("aberto");

    modalBootstrap.setAttribute("aria-hidden", "false");

    botaoFecharBootstrap.focus();

});


// FECHAR MODAL BOOTSTRAP

function fecharModalBootstrap() {

    modalBootstrap.classList.remove("aberto");

    modalBootstrap.setAttribute("aria-hidden", "true");

}


botaoFecharBootstrap.addEventListener(

    "click",

    fecharModalBootstrap

);


modalConfirmacao.addEventListener("click", function(event) {

    if (event.target === modalConfirmacao) {

        fecharModalConfirmacao();

    }

});


modalBootstrap.addEventListener("click", function(event) {

    if (event.target === modalBootstrap) {

        fecharModalBootstrap();

    }

});


// FECHAR MODAIS COM ESC

document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {

        fecharModalConfirmacao();

        fecharModalBootstrap();

    }

});


// CARREGAR OS PRODUTOS AO ABRIR A PÁGINA

renderizarTabela();

atualizarSugestoes();
