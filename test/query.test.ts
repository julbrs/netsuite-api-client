import "dotenv/config";
import NetsuiteApiClient from "../src/client.js";
import { beforeAll, describe, expect, it } from "vitest";

let client: NetsuiteApiClient;

describe("Test query and queryAll method", () => {
  beforeAll(() => {
    if (
      process.env.consumer_key == undefined ||
      process.env.consumer_secret_key == undefined ||
      process.env.token == undefined ||
      process.env.token_secret == undefined ||
      process.env.realm == undefined
    ) {
      throw new Error("Please create a `.env` file based on `.env.sample`");
    }

    client = new NetsuiteApiClient({
      consumer_key: process.env.consumer_key,
      consumer_secret_key: process.env.consumer_secret_key,
      token: process.env.token,
      token_secret: process.env.token_secret,
      realm: process.env.realm,
    });
  });
  it("it should get 2 records from transaction table ", async () => {
    expect.assertions(1);
    let transactions = await client.query("select id from transaction", 2);
    expect(transactions.items.length).toEqual(2);
  });

  it("it should get 0 records from transaction table ", async () => {
    expect.assertions(1);
    let transactions = await client.query(
      `select id from transaction where id = 1 `
    );
    expect(transactions.items.length).toEqual(0);
  });

  it("it should throw error if query is not string", async () => {
    expect.assertions(1);
    await expect(client.query(123 as any)).rejects.toThrow(Error);
  });

  it("it should throw meaningful error if not existing table", async () => {
    expect.assertions(1);
    await expect(
      client.query("select id from transactiontablethatdoesnotexist", 2)
    ).rejects.toThrowError(
      "Invalid search query. Detailed unprocessed description follows. Invalid search type: transactiontablethatdoesnotexist."
    );
  });

  it("it should throw meaningful error if not existing field", async () => {
    expect.assertions(1);
    await expect(
      client.query("select not_existing_field from customer", 2)
    ).rejects.toThrowError(
      "Invalid search query. Detailed unprocessed description follows. Search error occurred: Unknown identifier 'not_existing_field'. Available identifiers are: {customer=customer}"
    );
  });

  it("it should throw error if limit exceeds 1000", async () => {
    expect.assertions(1);
    await expect(
      client.query("select id from transaction", 1001)
    ).rejects.toThrow("Max limit is 1000");
  });

  it("it should get all 30 records from transaction table using queryAll", () =>
    new Promise<void>((done) => {
      expect.assertions(1);
      let items: any[] = [];
      let st = client.queryAll(
        "select  tranid, id from transaction  where rownum <= 30"
      );
      st.on("data", (data) => {
        items.push(data);
      });
      st.on("end", () => {
        expect(items.length).toEqual(30);
        done();
      });
    }));

  it("it should throw error if queryAll result in error", () =>
    new Promise<void>((done) => {
      expect.assertions(1);
      let items: any[] = [];
      let st = client.queryAll(
        "select tranid, id from transactiontablethatdoesnotexist"
      );
      st.on("error", (error) => {
        expect(error).toBeDefined();
        done();
      });
    }));
});
