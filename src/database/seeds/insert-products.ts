import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  const defaultProducts = [
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
  ];

  const existingProducts = await knex("products").select<{ name: string }[]>("name");
  const existingByName = new Set(existingProducts.map((product) => product.name));

  const missingProducts = defaultProducts.filter(
    (product) => !existingByName.has(product.name),
  );

  if (missingProducts.length > 0) {
    await knex("products").insert(missingProducts);
  }
}
