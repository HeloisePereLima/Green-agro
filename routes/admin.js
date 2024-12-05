const express = require('express')
const router = express.Router()
const BD = require('../db')

//Rota principal do painel administrativo
router.get('/', async (req, res) => {
    const qProdutos = await BD.query  ('select count (*) as total_produtos from produtos')
    const qCategorias = await BD.query  ('select count (*) as total_categorias from categorias')
    const qUsuarios = await BD.query ('select count (*) as total_usuarios from usuarios ')
    const qEstoque = await BD.query  ('select nome_produto, estoque from produtos')
    const EstoqueP = await BD.query (`select p.nome_produto, p.estoque from produtos as p group by p.nome_produto, p.estoque`);

    res.render('admin/dashboard', {
        totalProdutos : qProdutos.rows[0].total_produtos,
        totalCategorias : qCategorias.rows[0].total_categorias,
        totalUsuarios : qUsuarios.rows[0].total_usuarios,
        produtosEstoque : qEstoque.rows,
        produtoEstoque : EstoqueP.rows
    })
})

module.exports = router
