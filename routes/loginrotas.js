const express = require('express')
const router = express.Router()
const BD = require('../db')

router.get('/login', (req, res) => {
    res.render('admin/login') 
})

router.post('/login', async (req, res ) => {
    const usuario = req.body.usuario
    const senha = req.body.senha

    const buscaDados = await BD.query(`
        select * from usuarios 
        where usuario = $1 and senha = $2`,
    [usuario, senha])

    if (buscaDados.rows.length > 0) {
        req.session.usuarioLogado = buscaDados.rows[0].usuario
        req.session.nomeUsuario = buscaDados.rows[0].nome
        req.session.idUsuario = buscaDados.rows[0].id_usuario
        res.redirect('/admin')
    } else {
        res.render('admin/login', {mensagem: 'Usuário não autenticado'})
    }
})

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})

module.exports = router