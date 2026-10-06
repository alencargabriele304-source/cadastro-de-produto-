//
// FASE 1: modelagem dos dados (Classe Base)
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
// FASE 2: Gerenciamento de Estado (memória)
//
const listaDeProdutos = [];
 
//
// FASE 2.1: Gerenciamento com localStorage
//
// constante para evitar erros de digitação ao usar o localStorage
const chave_Storage = "sistema_estoque_produtos";
 
// 1. Salvar dados no navegador
function salvarNoLocalStorage() {
    const listaEmTexto = JSON.stringify(listaDeProdutos);
    localStorage.setItem(chave_Storage, listaEmTexto);
}
 
// 2. Carregar dados do navegador
function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(chave_Storage);
 
    if (dadosSalvos) {
        // converte a string JSON de volta para um array de objetos genéricos
        const produtosObjetos = JSON.parse(dadosSalvos);
 
        // reinstancia cada item como um new Produto (para recuperar os métodos)
        produtosObjetos.forEach((prod) => {
            const produtoInstanciado = new Produto(prod.nome, prod.preco, prod.quantidade);
            listaDeProdutos.push(produtoInstanciado);
        });
    }
}
 
//
// FASE 3: Seleção de elementos e escuta de eventos
//
const formProduto = document.getElementById("produto-form");
const tabelaBody = document.querySelector("#tabela-produtos tbody");
const btnLimpar = document.getElementById("limpar-tabela");
const totalEstoque = document.getElementById("total-estoque");
 
// Formata números como moeda brasileira (R$ 1.234,56)
function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
 
// Cadastro de produto
formProduto.addEventListener("submit", function (event) {
    event.preventDefault();
 
    const nomeInput = document.getElementById("nome").value;
    const precoInput = document.getElementById("preco").value;
    const quantidadeInput = document.getElementById("quantidade").value;
 
    const novoProduto = new Produto(nomeInput, precoInput, quantidadeInput);
    listaDeProdutos.push(novoProduto);
 
    salvarNoLocalStorage();
    renderizarTabela();
    formProduto.reset();
});
 
// Remover UM produto (delegação de eventos no tbody)
tabelaBody.addEventListener("click", function (event) {
    if (event.target.classList.contains("btn-remover")) {
        const indice = parseInt(event.target.dataset.indice);
        listaDeProdutos.splice(indice, 1);
 
        salvarNoLocalStorage();
        renderizarTabela();
    }
});
 
// Limpar TODOS os produtos
btnLimpar.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) return;
 
    if (confirm("Tem certeza que deseja remover todos os produtos?")) {
        listaDeProdutos.length = 0;
 
        salvarNoLocalStorage();
        renderizarTabela();
    }
});
 
//
// FASE 4: Cálculo do total
//
function calcularTotais() {
    let valorTotal = 0;
    let quantidadeTotal = 0;
 
    listaDeProdutos.forEach((produto) => {
        valorTotal += produto.calcularSubtotal();
        quantidadeTotal += produto.quantidade;
    });
 
    return { valorTotal, quantidadeTotal };
}
 
//
// FASE 5: Renderização da Interface DOM
//
function renderizarTabela() {
    tabelaBody.innerHTML = "";
 
    listaDeProdutos.forEach((produto, indice) => {
        const linha = document.createElement("tr");
 
        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>${formatarMoeda(produto.preco)}</td>
            <td>${produto.quantidade}</td>
            <td>${formatarMoeda(produto.calcularSubtotal())}</td>
            <td>
                <button class="btn-remover" data-indice="${indice}">Remover</button>
            </td>
        `;
 
        tabelaBody.appendChild(linha);
    });
 
    const { valorTotal, quantidadeTotal } = calcularTotais();
    totalEstoque.textContent =
        `Total em Estoque: ${formatarMoeda(valorTotal)} (${quantidadeTotal} itens)`;
}
 
//
// INICIALIZAÇÃO: carrega os dados salvos e desenha a tabela ao abrir a página
//
carregarDoLocalStorage();
renderizarTabela();