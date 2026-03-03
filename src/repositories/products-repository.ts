import { knex } from "../database/knex";

export interface ProductRecord {
  id: number;
  name: string;
  price: number;
  created_at: string | number;
  updated_at: string | number;
}

interface UpdateProductInput {
  name: string;
  price: number;
}

class ProductsRepository {
  async findAllByName(name: string) {
    return knex<ProductRecord>("products")
      .select()
      .whereLike("name", `%${name}%`)
      .orderBy("name");
  }

  async findById(id: number) {
    return knex<ProductRecord>("products").where({ id }).first();
  }

  async create(name: string, price: number) {
    await knex<ProductRecord>("products").insert({ name, price });
  }

  async updateById(id: number, input: UpdateProductInput) {
    await knex<ProductRecord>("products")
      .update({ ...input, updated_at: knex.fn.now() })
      .where({ id });
  }

  async removeById(id: number) {
    await knex<ProductRecord>("products").delete().where({ id });
  }
}

export { ProductsRepository };
