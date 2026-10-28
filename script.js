
//
// FASE 1: MODELAGEM DOS DADOS
//

class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}


//
// FASE 2: GERENCIAMENTO DE ESTADO
//

const listaDeProdutos = [];

// null significa que estamos cadastrando um produto novo.
// Um número indica o índice do produto que está sendo editado.

let indiceEdicao = null;


//
// FASE 2.1: LOCALSTORAGE
//

const chave_Storage = "sistema_estoque_produtos";


// Salvar os produtos no navegador

function salvarNoLocalStorage() {
    const listaEmTexto = JSON.stringify(listaDeProdutos);

    localStorage.setItem(chave_Storage, listaEmTexto);
}


// Carregar os produtos salvos

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(chave_Storage);

    if (dadosSalvos) {
        try {
            const produtosObjetos = JSON.parse(dadosSalvos);

            if (!Array.isArray(produtosObjetos)) {
                throw new Error("Formato de dados inválido.");
            }

            produtosObjetos.forEach((prod) => {
                const produtoInstanciado = new Produto(
                    prod.nome,
                    prod.preco,
                    prod.quantidade
                );

                listaDeProdutos.push(produtoInstanciado);
            });

        } catch (erro) {
            alert("Não foi possível carregar os produtos salvos.");
            localStorage.removeItem(chave_Storage);
        }
    }
}


//
// FASE 3: SELEÇÃO DOS ELEMENTOS
//

const formProduto = document.getElementById("produto-form");

const campoNome = document.getElementById("nome");
const campoPreco = document.getElementById("preco");
const campoQuantidade = document.getElementById("quantidade");

const botaoEnviar = formProduto.querySelector(".btn-primary");

const tabelaBody = document.querySelector("#tabela-produtos tbody");

const btnLimpar = document.getElementById("limpar-tabela");

const totalEstoque = document.getElementById("total-estoque");


// Formatar valores como moeda brasileira

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


//
// FASE 4: VALIDAÇÃO DOS DADOS
//

function validarDados(nome, precoTexto, quantidadeTexto) {

    // trim() remove os espaços das extremidades do texto.
    const nomeValidado = nome.trim();

    // Guard Clause: interrompe a execução se o nome estiver vazio.
    if (nomeValidado === "") {
        alert("Por favor, informe o nome do produto.");
        campoNome.focus();
        return false;
    }

    const preco = Number(precoTexto);

    // Guard Clause: interrompe a execução se o preço for inválido.
    if (
        precoTexto.trim() === "" ||
        !Number.isFinite(preco) ||
        preco <= 0
    ) {
        alert("O preço deve ser um número maior que zero.");
        campoPreco.focus();
        return false;
    }

    const quantidade = Number(quantidadeTexto);

    // Guard Clause: verifica se a quantidade é um inteiro positivo.
    if (
        quantidadeTexto.trim() === "" ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
    ) {
        alert("A quantidade deve ser um número inteiro maior que zero.");
        campoQuantidade.focus();
        return false;
    }

    return true;
}


//
// FASE 5: PREPARAR A EDIÇÃO
//

function prepararEdicao(index) {

    // Busca o produto selecionado.
    const produto = listaDeProdutos[index];

    if (!produto) {
        alert("Produto não encontrado.");
        return;
    }

    // Preenche o formulário com os dados atuais.
    campoNome.value = produto.nome;
    campoPreco.value = produto.preco;
    campoQuantidade.value = produto.quantidade;

    // Guarda o índice do produto que será atualizado.
    indiceEdicao = index;

    // Altera o texto do botão.
    botaoEnviar.textContent = "Salvar Alterações";

    // Leva a página até o formulário.
    formProduto.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    campoNome.focus();
}


//
// FASE 6: CADASTRO E ATUALIZAÇÃO
//

formProduto.addEventListener("submit", function (event) {

    event.preventDefault();

    const nome = campoNome.value;
    const precoTexto = campoPreco.value;
    const quantidadeTexto = campoQuantidade.value;

    // Verifica se todos os dados são válidos.
    if (!validarDados(nome, precoTexto, quantidadeTexto)) {
        return;
    }

    // Cria o produto com os dados validados.
    const novoProduto = new Produto(
        nome.trim(),
        Number(precoTexto),
        Number(quantidadeTexto)
    );

    // Verifica se é um cadastro ou uma atualização.
    if (indiceEdicao === null) {

        // CREATE: cadastra um novo produto.
        listaDeProdutos.push(novoProduto);

        alert("Produto cadastrado com sucesso!");

    } else {

        // UPDATE: atualiza o produto existente.
        listaDeProdutos[indiceEdicao] = novoProduto;

        alert("Produto atualizado com sucesso!");
    }

    // Salva os dados e atualiza a tabela.
    salvarNoLocalStorage();
    renderizarTabela();

    // Limpa o formulário.
    formProduto.reset();

    // Volta ao modo de cadastro.
    indiceEdicao = null;
    botaoEnviar.textContent = "Adicionar Produto";

});


//
// FASE 7: AÇÕES DA TABELA
//

tabelaBody.addEventListener("click", function (event) {

    const botao = event.target.closest("button");

    if (!botao) {
        return;
    }

    const indice = Number(botao.dataset.indice);

    // EDITAR UM PRODUTO
    if (botao.classList.contains("btn-editar")) {

        prepararEdicao(indice);

        return;
    }

    // REMOVER UM PRODUTO
    if (botao.classList.contains("btn-remover")) {

        if (indiceEdicao === indice) {

            // Cancela a edição se o produto editado for removido.
            formProduto.reset();
            indiceEdicao = null;
            botaoEnviar.textContent = "Adicionar Produto";

        } else if (
            indiceEdicao !== null &&
            indice < indiceEdicao
        ) {

            // Ajusta o índice se um produto anterior for removido.
            indiceEdicao--;
        }

        listaDeProdutos.splice(indice, 1);

        salvarNoLocalStorage();
        renderizarTabela();

    }

});


//
// FASE 8: LIMPAR TODOS OS PRODUTOS
//

btnLimpar.addEventListener("click", function () {

    if (listaDeProdutos.length === 0) {
        alert("Não existem produtos para remover.");
        return;
    }

    const confirmar = confirm(
        "Tem certeza que deseja remover todos os produtos?"
    );

    if (confirmar) {

        listaDeProdutos.length = 0;

        // Cancela qualquer edição em andamento.
        indiceEdicao = null;

        formProduto.reset();

        botaoEnviar.textContent = "Adicionar Produto";

        salvarNoLocalStorage();
        renderizarTabela();

        alert("Todos os produtos foram removidos.");
    }

});

//
// FASE 9: CÁLCULO DOS TOTAIS
//

function calcularTotais() {

    let valorTotal = 0;
    let quantidadeTotal = 0;

    listaDeProdutos.forEach((produto) => {

        valorTotal += produto.calcularSubtotal();

        quantidadeTotal += produto.quantidade;

    });

    return {
        valorTotal,
        quantidadeTotal
    };
}


//
// FASE 10: RENDERIZAÇÃO DA TABELA
//

function renderizarTabela() {

    tabelaBody.innerHTML = "";

    listaDeProdutos.forEach((produto, indice) => {

        const linha = document.createElement("tr");

        // Nome do produto
        const celulaNome = document.createElement("td");
        celulaNome.textContent = produto.nome;

        // Preço unitário
        const celulaPreco = document.createElement("td");
        celulaPreco.textContent = formatarMoeda(produto.preco);

        // Quantidade
        const celulaQuantidade = document.createElement("td");
        celulaQuantidade.textContent = produto.quantidade;

        // Subtotal
        const celulaSubtotal = document.createElement("td");
        celulaSubtotal.textContent = formatarMoeda(
            produto.calcularSubtotal()
        );

        // Coluna de ações
        const celulaAcoes = document.createElement("td");

        // Botão Editar
        const botaoEditar = document.createElement("button");

        botaoEditar.type = "button";
        botaoEditar.textContent = "Editar";
        botaoEditar.classList.add("btn-editar");
        botaoEditar.dataset.indice = indice;

        // Botão Remover
        const botaoRemover = document.createElement("button");

        botaoRemover.type = "button";
        botaoRemover.textContent = "Remover";
        botaoRemover.classList.add("btn-remover");
        botaoRemover.dataset.indice = indice;

        // Adiciona os botões à coluna de ações.
        celulaAcoes.appendChild(botaoEditar);
        celulaAcoes.appendChild(botaoRemover);

        // Adiciona as células à linha.
        linha.appendChild(celulaNome);
        linha.appendChild(celulaPreco);
        linha.appendChild(celulaQuantidade);
        linha.appendChild(celulaSubtotal);
        linha.appendChild(celulaAcoes);

        // Adiciona a linha à tabela.
        tabelaBody.appendChild(linha);

    });

    // Atualiza o resumo do estoque.
    const { valorTotal, quantidadeTotal } = calcularTotais();

    totalEstoque.textContent =
        `Total em Estoque: ${formatarMoeda(valorTotal)} (${quantidadeTotal} itens)`;
}


//
// INICIALIZAÇÃO DO SISTEMA
//

carregarDoLocalStorage();

renderizarTabela();