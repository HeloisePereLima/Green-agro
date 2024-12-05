const express = require('express')
const router = express.Router()
const BD = require('../db')

router.get('/', async (req, res) =>{
    try{
        const busca = req.query.busca || ''
        const ordenar = req.query.ordenar || 'nome_categorias'

        const pg = req.query.pg || 1 //Obtendo a pg de dados

        const limite = 10 //Número de registros por pagina
        const offset = (pg - 1) * limite //Quantidade de registros que quero "pular" 
    

        const buscaDados = await BD.query(`SELECT categorias.nome_categorias, id_categorias FROM categorias where upper(categorias.nome_categorias) like $1 order by ${ordenar} limit $2 offset $3`, [`%${busca.toUpperCase()}%`, limite, offset])
        
        const totalItens = await BD.query(`         
            select count(*) as total from categorias where upper(categorias.nome_categorias) like $1`, [`%${busca.toUpperCase()}%`])
           

        const totalPgs = Math.ceil(totalItens.rows[0].total / limite);

        res.render('categoriasTelas/lista', {categorias: buscaDados.rows, busca: busca, ordenar: ordenar, pgAtual: parseInt(pg), totalPgs: totalPgs})
    } catch (erro) {
        console.log('Erro ao listar categorias', erro);
        res.render('categoriasTelas/lista', {mensagem: erro})    
    }

})

router.get('/novo', (req, res)=> {
    res.render('categoriasTelas/criar')
})

router.post('/novo', async (req, res)=> {
    const{ nome_categorias } = req.body
    await BD.query('insert into categorias (nome_categorias) values ($1)', [nome_categorias])
    res.redirect('/categorias')
})

router.post('/:id/deletar', async (req, res)=> {
    const { id } = req.params
    await BD.query('delete from categorias where id_categorias = $1', [id])
    res.redirect('/categorias')
})

router.get('/:id/editar', async (req, res) => {
    const {id} = req.params
    const resultado = await BD.query('select * from categorias where id_categorias = $1', [id])
    res.render('categoriasTelas/editar', { categorias: resultado.rows[0] })
})

router.post('/:id/editar', async (req, res) => {
    const { id } = req.params
    const {nome_categorias } = req.body
    await BD.query('update categorias set nome_categorias = $1 where id_categorias = $2', [nome_categorias, id])
    res.redirect('/categorias')
})



module.exports = router