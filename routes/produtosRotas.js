const express = require("express");
const router = express.Router();
const BD = require("../db");

router.get("/", async (req, res) => {
  const busca = req.query.busca || "";
  const ordenar = req.query.ordenar || "nome_produto";

  const pg = req.query.pg || 1; //Obtendo a pg de dados

  const limite = 10; //Número de registros por pagina
  const offset = (pg - 1) * limite; //Quantidade de registros que quero "pular"

  const buscaDados = await BD.query(
    `
            SELECT p.id_produto, p.nome_produto, p.estoque, p.estoque_minimo, p.valor, p.foto
            from produtos as p inner join categorias as c on p.id_categorias = c.id_categorias
            where upper(p.nome_produto) like $1
            order by ${ordenar}
            limit $2 offset $3`,
    [`%${busca.toUpperCase()}%`, limite, offset]
  );

  const totalProdutos = await BD.query(
    `
        SELECT count(*) as total
        from produtos as p  
        inner join categorias as c on p.id_categorias = c.id_categorias
        where upper(p.nome_produto) like $1 or upper(c.nome_categorias) like $1 
        `,
    [`%${busca.toUpperCase()}%`]
  );

  const totalPgs = Math.ceil(totalProdutos.rows[0].total / limite);

  res.render("produtosTelas/lista", {
    produtos: buscaDados.rows,
    busca: busca,
    ordenar: ordenar,
    pgAtual: parseInt(pg),
    totalPgs: totalPgs,
  });
});

router.get("/novo", async (req, res) => {
  try {
    const resultado = await BD.query(
      "select * from categorias order by nome_categorias"
    );
    res.render("produtosTelas/criar", {
      categoriasCadastradas: resultado.rows,
    });
  } catch (erro) {
    console.log("Erro ao abrir a tela de cadastro de produtos", erro);
    res.render("produtosTelas/criar", { mensagem: erro });
  }
});

router.post("/novo", async (req, res) => {
  try {
    const nome_produto = req.body.nome_produto;
    const id_categorias = req.body.id_categorias;
    const estoque = req.body.estoque;
    const estoque_minimo = req.body.estoque_minimo;
    const valor = req.body.valor;
    const foto = req.body.foto;

    await BD.query(
      "insert into produtos (nome_produto, id_categorias, estoque, estoque_minimo, valor, foto) values ($1, $2, $3, $4, $5, $6)",
      [nome_produto, id_categorias, estoque, estoque_minimo, valor, foto]
    );

    //Redirecionando para tela de consulta de disciplinas
    res.redirect("/produtos/");
  } catch (erro) {
    console.log("Erro ao cadastrar produtos", erro);
    res.render("produtosTelas/criar", { mensagem: erro });
  }
});

router.post("/:id/deletar", async (req, res) => {
  const { id } = req.params;
  await BD.query("delete from produtos where id_produto = $1", [id]);
  res.redirect("/produtos");
});

router.get("/:id/editar", async (req, res) => {
  const { id } = req.params;
  const resultado = await BD.query(
    "select * from produtos where id_produto = $1",
    [id]
  );
  const movimentacoes = await BD.query(`select *,TO_CHAR(data_movimentacao, 'DD/MM/YYYY') as data from movimentacoes where id_produto = $1`, [id])

  console.log('mov', movimentacoes);
  
  
  res.render("produtosTelas/editar", { produtos: resultado.rows[0], movimentacoes : movimentacoes.rows });
});

router.post("/:id/editar", async (req, res) => {
  const { id } = req.params;
  const { nome_produto } = req.body;
  const { estoque } = req.body;
  const { estoque_minimo } = req.body;
  const { valor } = req.body;
  await BD.query(
    "update produtos set nome_produto= $1 where id_produto = $2 estoque = $3 estoque_minimo = $4 valor = $5 ",
    [nome_produto, id, estoque, estoque_minimo, valor]
  );
  res.redirect("/produtos");
});

router.post('/:id/movimentacao', async(req, res) => {
  try {
      const { id } = req.params
      const { id_produto, id_movimentacao, tipo_movimentacao, data_movimentacao, quantidade, descricao } = req.body
      await BD.query(`insert into movimentacao
                      (id_movimentacao, id_produto, id_usuario, tipo_movimentacao, data_movimentacao, quantidade, descricao) values 
                      ($1, $2, $3, $4, $5, $6, $7)
          `, [ id_produto, id_movimentacao, tipo_movimentacao, data_movimentacao, quantidade, descricao ])
      res.redirect(`/produtos/${id}/editar`)
  } catch (erro) {
      console.log('Erro ao gravar aluno', erro);        
  }
})

router.post("/:id/lancar-movimentacao", async (req, res) => {
  try {
    const { id } = req.params

    const quantidade = req.body.quantidade;
    const descricao = req.body.descricao;
    const movimentacao = req.body.movimentacao;

    await BD.query(
      `insert into movimentacoes (quantidade, descricao, tipo_movimentacao, id_produto, data_movimentacao) values ($1, $2, $3, $4, current_date)`,
      [quantidade, descricao, movimentacao, id]
    );

    //Redirecionando para tela de consulta de disciplinas
    res.redirect("/produtos/");
  } catch (erro) {
    console.log("Erro ao cadastrar produtos", erro);
    res.render("produtosTelas/criar", { mensagem: erro });
  }
});

module.exports = router;
