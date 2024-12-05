const express = require("express");
const router = express.Router();
const BD = require("../db");

router.get("/", async (req, res) => {
  const busca = req.query.busca || "";
  const ordenar = req.query.ordenar || "nome";

  const pg = req.query.pg || 1; //Obtendo a pg de dados

  const limite = 10; //Número de registros por pagina
  const offset = (pg - 1) * limite; //Quantidade de registros que quero "pular"

  const buscaDados = await BD.query(
    `
        SELECT  u.nome, u.usuario, u.id_usuario, u.foto
        from usuarios as u
        where upper(u.nome) like $1
        order by ${ordenar}
        limit $2 offset $3`,
    [`%${busca.toUpperCase()}%`, limite, offset]
  );

  const totalItens = await BD.query(
    `
                SELECT count(*) as total
                from usuarios as p  
                inner join usuarios as c on p.id_usuario = c.id_usuario
                where upper(p.nome) like $1 or upper(c.nome) like $1 
                `,
    [`%${busca.toUpperCase()}%`]
  );

  const totalPgs = Math.ceil(totalItens.rows[0].total / limite);

  res.render("usuariosTelas/lista", {
    usuarios: buscaDados.rows,
    busca: busca,
    ordenar: ordenar,
    pgAtual: parseInt(pg),
    totalPgs: totalPgs,
  });
});

router.get("/novo", (req, res) => {
  res.render("usuariosTelas/criar");
});

router.post("/novo", async (req, res) => {
  const { nome_usuario, usuario, senha } = req.body;
  await BD.query(
    "insert into usuarios(nome, usuario, senha) values ($1, $2, $3 )",
    [nome_usuario, usuario, senha]
  );
  res.redirect("/usuarios/");
});

router.post("/:id/deletar", async (req, res) => {
  const { id } = req.params;
  await BD.query("delete from usuarios where id_usuario = ($1)", [id]);
  res.redirect("/usuarios");
});

router.get("/:id/editar", async (req, res) => {
  const { id } = req.params;
  const resultado = await BD.query("select * from usuarios where id_usuario = $1",[id]
  );
  res.render("usuariosTelas/editar", { usuarios: resultado.rows[0] });
});

router.post("/:id/editar", async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  await BD.query("update usuarios set nome = $1 where id_usuario = $2", [nome, id,]
  );
  res.redirect("/usuarios");
});

module.exports = router;
