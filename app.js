const express = require('express')
const path = require('path')
const session = require('express-session')
require('dotenv').config();

const app = express()

//configurações do servidor 
app.set('views', path.join(__dirname, 'views')); // Configura o diretório das views
app.set('view engine', 'ejs')  //Configura o motor de templates para EJS
app.use(express.static(path.join(__dirname, 'public'))); //Define pasta para arquivos css / img
app.use(express.urlencoded({ extended: true })) //Para processar os dados do formulário
app.use(express.json());  // utilizar dados em formato JSON
app.use(session({
    secret:'Sesisenai', //um segredo ára assinar a sessão
    resave:false, 
    saveUninitialized: true //se não houver dados na sessão, nao salva
}))

//Middleware para verificar se o usuario esta logado
const verificarAutenticacao = (req, res, next) => {
    if (req.session.usuarioLogado){
        //disponibilizando o nomeUsuario da sessão para a tela .ejs
        res.locals.nomeUsuario = req.session.nomeUsuario
        next()
    } else {
        res.redirect('/auth/login')
    }

}

//Rota da pagina principal "Landing Page"
app.get('/', (req, res) => {
    //   views/ landing/index.ejs
    res.render('landing/index')
})



//utilizando rotas admin
const adminRotas = require('./routes/admin')
app.use('/admin',verificarAutenticacao, adminRotas)

//utilizando rotas categorias
const categoriasRotas = require('./routes/categoriasRotas')
app.use('/categorias',verificarAutenticacao, categoriasRotas)

//utilizando rotas login
const loginRotas = require('./routes/loginrotas')
app.use('/auth', loginRotas)

//utilizando rotas produtos
const produtosRotas = require('./routes/produtosRotas')
app.use('/produtos',verificarAutenticacao, produtosRotas)


const usuariosRotas = require('./routes/usuariosRotas')
app.use('/usuarios/',verificarAutenticacao, usuariosRotas)


const porta = 3000
app.listen(porta, () =>{
    console.log(`Servidor rodando na porta http://192.168.0.109:${porta}`)
})