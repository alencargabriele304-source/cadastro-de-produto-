// Elementos do HTML
const formulario = document.getElementById("produto-form");
const campoNome = document.getElementById("nome");
const campoPreco = document.getElementById("preco");
const campoQuantidade = document.getElementById("quantidade");
const campoBusca = document.getElementById("campo-busca");

const listaSugestoes = document.getElementById("sugestoes-produtos");

const tabela = document.querySelector("#tabela-produtos tbody");
const totalEstoque = document.getElementById("total-estoque");
const mensagemBusca = document.getElementById("mensagem-busca");

const botaoLimpar = document.getElementById("limpar-tabela");
const botaoSalvar = document.getElementById("btn-salvar");


// Lista de produtos salva no navegador
let listaDeProdutos = JSON.parse(
    localStorage.getItem("produtos")
) || [];

let idEmEdicao = null;


// Salvar produtos no localStorage
function salvarLocalStorage() {

    localStorage.setItem(
        "produtos",
        JSON.stringify(listaDeProdutos)
    );

}


// Sugestões automáticas de produtos
function atualizarSugestoes() {

    const termo = campoNome.value.toLowerCase().trim();

    listaSugestoes.innerHTML = "";

    // Encontrar produtos que começam com o texto digitado
    const produtosEncontrados = listaDeProdutos.filter(produto =>
        produto.nome.toLowerCase().startsWith(termo)
    );

    // Evitar sugestões repetidas
    const nomesUnicos = [...new Set(
        produtosEncontrados.map(produto => produto.nome)
    )];

    nomesUnicos.forEach(nome => {

        const opcao = document.createElement("option");

        opcao.value = nome;

        listaSugestoes.appendChild(opcao);

    });

}


// Atualizar sugestões enquanto digita o nome
campoNome.addEventListener("input", function() {

    atualizarSugestoes();

});


// Filtrar produtos da tabela - V4
function obterProdutosFiltrados() {

    const termo = campoBusca.value.toLowerCase().trim();

    return listaDeProdutos.filter(produto =>
        produto.nome.toLowerCase().includes(termo)
    );

}


// Calcular total com reduce() - V4
function calcularTotalEstoque(produtos) {

    return produtos.reduce((total, produto) => {

        return total + (produto.preco * produto.quantidade);

    }, 0);

}


// Formatar valores em reais
function formatarMoeda(valor) {

    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


// Atualizar tabela
function renderizarTabela() {

    tabela.innerHTML = "";

    const produtosFiltrados = obterProdutosFiltrados();

    // Verificar se existem produtos encontrados
    if (produtosFiltrados.length === 0) {

        if (listaDeProdutos.length === 0) {

            mensagemBusca.textContent = "Nenhum produto cadastrado.";

        } else {

            mensagemBusca.textContent = "Nenhum produto encontrado.";

        }

    } else {

        mensagemBusca.textContent = "";

    }


    // Mostrar produtos encontrados
    produtosFiltrados.forEach(produto => {

        const linha = document.createElement("tr");

        const subtotal = produto.preco * produto.quantidade;

        const colunaNome = document.createElement("td");
        const colunaPreco = document.createElement("td");
        const colunaQuantidade = document.createElement("td");
        const colunaSubtotal = document.createElement("td");
        const colunaAcoes = document.createElement("td");

        colunaNome.textContent = produto.nome;
        colunaPreco.textContent = formatarMoeda(produto.preco);
        colunaQuantidade.textContent = produto.quantidade;
        colunaSubtotal.textContent = formatarMoeda(subtotal);

        // Botão editar
        const botaoEditar = document.createElement("button");

        botaoEditar.textContent = "Editar";
        botaoEditar.classList.add("btn-editar");
        botaoEditar.dataset.id = produto.id;

        // Botão excluir
        const botaoExcluir = document.createElement("button");

        botaoExcluir.textContent = "Excluir";
        botaoExcluir.classList.add("btn-excluir");
        botaoExcluir.dataset.id = produto.id;

        colunaAcoes.appendChild(botaoEditar);
        colunaAcoes.appendChild(botaoExcluir);

        linha.appendChild(colunaNome);
        linha.appendChild(colunaPreco);
        linha.appendChild(colunaQuantidade);
        linha.appendChild(colunaSubtotal);
        linha.appendChild(colunaAcoes);

        tabela.appendChild(linha);

    });


    // Calcular total somente dos produtos visíveis
    const total = calcularTotalEstoque(produtosFiltrados);

    totalEstoque.textContent =
        "Total em Estoque: " + formatarMoeda(total);

    // Atualizar sugestões de produtos
    atualizarSugestoes();

}


// Cadastrar ou editar produto
formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    const nome = campoNome.value.trim();
    const preco = Number(campoPreco.value);
    const quantidade = Number(campoQuantidade.value);

    // Validar os campos
    if (
        nome === "" ||
        !Number.isFinite(preco) ||
        preco <= 0 ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
    ) {

        alert("Preencha todos os campos corretamente!");

        return;

    }


    // Criar objeto do produto
    const produto = {

        id: idEmEdicao !== null ? idEmEdicao : Date.now(),

        nome: nome,
        preco: preco,
        quantidade: quantidade

    };


    // Verificar se está editando ou cadastrando
    if (idEmEdicao !== null) {

        const indice = listaDeProdutos.findIndex(
            item => item.id === idEmEdicao
        );

        if (indice !== -1) {

            listaDeProdutos[indice] = produto;

        }

        idEmEdicao = null;

        botaoSalvar.textContent = "Adicionar Produto";

    } else {

        listaDeProdutos.push(produto);

    }


    salvarLocalStorage();

    formulario.reset();

    renderizarTabela();

});


// Pesquisar na tabela enquanto digita
campoBusca.addEventListener("input", function() {

    renderizarTabela();

});


// Editar e excluir produtos
tabela.addEventListener("click", function(event) {

    const id = Number(event.target.dataset.id);

    if (!id) return;

    const indice = listaDeProdutos.findIndex(
        produto => produto.id === id
    );

    if (indice === -1) return;


    // Editar produto
    if (event.target.classList.contains("btn-editar")) {

        const produto = listaDeProdutos[indice];

        campoNome.value = produto.nome;
        campoPreco.value = produto.preco;
        campoQuantidade.value = produto.quantidade;

        idEmEdicao = produto.id;

        botaoSalvar.textContent = "Salvar Alterações";

        atualizarSugestoes();

        campoNome.focus();

    }


    // Excluir produto
    if (event.target.classList.contains("btn-excluir")) {

        const confirmar = confirm(
            "Deseja realmente excluir este produto?"
        );

        if (confirmar) {

            listaDeProdutos.splice(indice, 1);

            if (idEmEdicao === id) {

                idEmEdicao = null;

                formulario.reset();

                botaoSalvar.textContent = "Adicionar Produto";

            }

            salvarLocalStorage();

            renderizarTabela();

        }

    }

});


// Limpar todos os produtos
botaoLimpar.addEventListener("click", function() {

    const confirmar = confirm(
        "Deseja realmente apagar todos os produtos?"
    );

    if (confirmar) {

        listaDeProdutos = [];

        idEmEdicao = null;

        formulario.reset();

        campoBusca.value = "";

        botaoSalvar.textContent = "Adicionar Produto";

        salvarLocalStorage();

        renderizarTabela();

    }

});


// Mostrar produtos ao abrir a aplicação
renderizarTabela();