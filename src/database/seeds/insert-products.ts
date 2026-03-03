import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("products").del();

  await knex("products").insert([
    { name: "Baião de Dois Arretado", price: 32.90 },
    { name: "Cuscuz Cabra da Peste", price: 54.50 },
    { name: "Carne de Sol do Lampião", price: 55.90 },
    { name: "Macaxeira Nervosa", price: 78.00 },
    { name: "Escondidinho de Mainha", price: 35.90 },
    { name: "Sarapatel sem Choro", price: 51.50 },
    { name: "Siri Fujão", price: 200.50 },
    { name: "Galinha Forrozeira", price: 96.00 },
    { name: "Tapioca da Moléstia", price: 20.90 },
    { name: "Bobó do Oxente", price: 37.50 },
    { name: "Arrumadinho Desmantelado", price: 103.00 },
    { name: "Panelada do Cabra Macho", price: 308.90 },
  ]);
}
