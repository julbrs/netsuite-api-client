import "dotenv/config";
import NetsuiteApiClient from "../src/client";
import { describe, expect, test, beforeAll, afterAll, it } from "vitest";

describe("Test request method", () => {
  let client: NetsuiteApiClient;
  let clientWithBaseUrl: NetsuiteApiClient;

  beforeAll(async () => {
    if (
      process.env.consumer_key == undefined ||
      process.env.consumer_secret_key == undefined ||
      process.env.token == undefined ||
      process.env.token_secret == undefined ||
      process.env.realm == undefined ||
      process.env.base_url == undefined
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

    // with base_url
    clientWithBaseUrl = new NetsuiteApiClient({
      consumer_key: process.env.consumer_key,
      consumer_secret_key: process.env.consumer_secret_key,
      token: process.env.token,
      token_secret: process.env.token_secret,
      realm: process.env.realm,
      base_url: process.env.base_url,
    });
  });

  it("should make test request", async () => {
    expect.assertions(1);
    const response = await client.request({
      method: "OPTIONS",
    });
    expect(response.statusCode).toEqual(204);
  });

  it("should make GET request - GET Customers", async () => {
    expect.assertions(4);
    const response = await client.request({
      path: "record/v1/customer/",
    });
    expect(response.statusCode).toEqual(200);
    expect(response.data).toBeDefined();
    expect(response.data.items).toBeDefined();
    expect(response.data.count).toBeDefined();
  });

  it("should make POST request - POST Customers", async () => {
    const response = await client.request({
      path: "record/v1/customer/",
      method: "POST",
      body: JSON.stringify({
        entityStatus: 6,
        firstName: "firstName",
        lastName: "lastName",
        subsidiary: "1",
        companyName: "netsuite-api-client-integration-test",
      }),
    });

    expect(response.statusCode).toEqual(204);
    expect(response.data).toBeDefined();
    expect(response.data).toBeNull();
    expect(response.headers.location).toBeDefined();

    const location = response.headers.location as string;

    // extract id from location string
    const id = location.split("/").pop();

    // delete the created company
    const responseDelete = await client.request({
      path: `record/v1/customer/${id}`,
      method: "DELETE",
    });

    expect(responseDelete.statusCode).toEqual(204);
  });

  it("should make POST request - SuiteQL Query", async () => {
    expect.assertions(4);
    const response = await client.request({
      path: "query/v1/suiteql?limit=5",
      method: "POST",
      body: `{
                   "q": "SELECT id, companyName, email, dateCreated FROM customer WHERE dateCreated >= '01/01/2019' AND dateCreated < '01/01/2020'"
                }`,
    });
    expect(response.statusCode).toEqual(200);
    expect(response.data).toBeDefined();
    expect(response.data.items).toBeDefined();
    expect(response.data.count).toBeDefined();
  });

  it("should work with base_url", async () => {
    expect.assertions(2);
    expect(process.env.base_url).toBeDefined();

    const response = await clientWithBaseUrl.request({
      method: "OPTIONS",
    });
    expect(response.statusCode).toEqual(204);
  });

  it("should work with additional headers", async () => {
    expect.assertions(1);
    const response = await client.request({
      method: "OPTIONS",
      heads: {
        foo: "foo",
      },
    });
    expect(response.statusCode).toEqual(204);
  });

  it("should reject with meaningful error if bad url", async () => {
    expect.assertions(1);
    await expect(() =>
      client.request({
        path: "record/v1/bad-path",
      })
    ).rejects.toThrowError("Record type 'bad-path' does not exist");
  });

  it("should reject with meaningful error if bad object", async () => {
    expect.assertions(1);
    await expect(() =>
      client.request({
        path: "record/v1/customer/-1",
      })
    ).rejects.toThrowError(
      "The record instance does not exist. Provide a valid record instance ID."
    );
  });

  it("should reject with meaningful error if bad request (wrong body)", async () => {
    expect.assertions(1);
    await expect(() =>
      client.request({
        method: "post",
        path: "record/v1/customer",
        body: "bad body",
      })
    ).rejects.toThrowError("Invalid content in the request body");
  });

  it("should reject with meaningful error if bad request (missing fields)", async () => {
    expect.assertions(1);
    await expect(() =>
      client.request({
        method: "post",
        path: "record/v1/customer",
        body: JSON.stringify({}),
      })
    ).rejects.toThrowError("Error while accessing a resource. Please enter value(s) for: ");
  });
});
