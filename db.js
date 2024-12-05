
const { Pool } = require('pg')

console.log(process.env.DATABASE_URL);


const BD = new Pool ({
    connectionString: process.env.DATABASE_URL
    // user: 'postgres', //Nome usuario do Banco de Dados
    // host: 'localhost', //Endereço do servidor
    // database: 'bd_estoque', //Nome do Bnaco de Dados
    // password: 'admin', //Senha do Banco de dados
    // port: 5432, //porta de conexao servidor 
})

module.exports = BD