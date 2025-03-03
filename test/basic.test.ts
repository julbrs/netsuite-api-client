import "dotenv/config";
import NetsuiteApiClient from "../src/client.js";
import { beforeAll, describe, expect, it } from "vitest";

let client: NetsuiteApiClient;

describe("Test basic behavior", () => {
  beforeAll(() => {
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
  });

  it("it should throw error if config is missing", () => {
    const t = () => {
      new NetsuiteApiClient(null as any);
    };
    expect(t).toThrow(TypeError);
  });

  it("it should not connect to NetSuite because of invalid token", () => {
    expect.assertions(1);

    client = new NetsuiteApiClient({
      consumer_key: process.env.consumer_key!,
      consumer_secret_key: process.env.consumer_secret_key!,
      token: "INVALID TOKEN",
      token_secret: process.env.token_secret!,
      realm: process.env.realm!,
    });
    return expect(client.connect()).rejects.toThrowError(
      "Invalid login attempt. For more details, see the Login Audit Trail in the NetSuite UI at Setup > Users/Roles > User Management > View Login Audit Trail."
    );
  });

  it("it should not connect to NetSuite because of invalid realm", () => {
    expect.assertions(1);

    client = new NetsuiteApiClient({
      consumer_key: process.env.consumer_key!,
      consumer_secret_key: process.env.consumer_secret_key!,
      token: process.env.token!,
      token_secret: process.env.token_secret!,
      realm: "invalid",
    });
    return expect(client.connect()).rejects.toThrowError(
      "getaddrinfo ENOTFOUND invalid.suitetalk.api.netsuite.co"
    );
  });

  it("it should connect to NetSuite", async () => {
    expect.assertions(1);

    client = new NetsuiteApiClient({
      consumer_key: process.env.consumer_key!,
      consumer_secret_key: process.env.consumer_secret_key!,
      token: process.env.token!,
      token_secret: process.env.token_secret!,
      realm: process.env.realm!,
      base_url: process.env.base_url,
    });

    const response = await client.connect();
    expect(response.statusCode).toEqual(204);
  });
});
