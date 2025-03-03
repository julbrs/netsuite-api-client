import OAuth from "oauth-1.0a";
import crypto from "crypto";
import got, { HTTPError, OptionsOfTextResponseBody } from "got";
import { Readable } from "stream";
import {
  NetsuiteOptions,
  NetsuiteQueryResult,
  NetsuiteRequestOptions,
  NetsuiteResponse,
} from "./types.js";
import { NetsuiteError } from "./errors.js";
import {removeLeadingSlash, removeTrailingSlash} from "./utils.js";

export default class NetsuiteApiClient {
  consumer_key: string;
  consumer_secret_key: string;
  token: string;
  token_secret: string;
  version: string;
  algorithm: string;
  realm: string;
  base_url?: string;

  constructor(options: NetsuiteOptions) {
    this.consumer_key = options.consumer_key;
    this.consumer_secret_key = options.consumer_secret_key;
    this.token = options.token;
    this.token_secret = options.token_secret;
    this.version = "1.0";
    this.algorithm = "HMAC-SHA256";
    this.realm = options.realm;
    this.base_url = options.base_url ? removeTrailingSlash(options.base_url) : undefined;
  }

  /**
   * Retrieve the Authorization Header
   * @returns
   * @param url
   * @param method
   */
  getAuthorizationHeader(url: string, method: string): { [key: string]: string } {
    const oauth = new OAuth({
      consumer: {
        key: this.consumer_key,
        secret: this.consumer_secret_key,
      },
      realm: this.realm,
      signature_method: this.algorithm,
      hash_function(base_string, key) {
        return crypto.createHmac("sha256", key).update(base_string).digest("base64");
      },
    });
    return oauth.toHeader(
      oauth.authorize(
        {
          url,
          method,
        },
        {
          key: this.token,
          secret: this.token_secret,
        }
      )
    ) as unknown as { [key: string]: string };
  }

  /**
   * Run a raw REST API request
   * @param opts
   * @returns
   */
  public async request(opts: NetsuiteRequestOptions) {
    const { path = "*", method = "GET", body = "", heads = {}, restletUrl } = opts;
    const cleanPath = removeLeadingSlash(path);
    // Set up the Request URI

    // as suggested by dylbarne in #15: sanitize url to enhance overall usability
    let uri = `https://${this.realm
        .toLowerCase()
        .replace("_", "-")}.suitetalk.api.netsuite.com/services/rest/${cleanPath}`;
    if (this.base_url) {
        uri = `${this.base_url}/services/rest/${cleanPath}`
    }
    // if restletUrl is provided, use it instead of the default uri
    if (restletUrl) {
      uri = restletUrl;
    }

    const options = {
      method,
      headers: this.getAuthorizationHeader(uri, method),
      throwHttpErrors: true,
      decompress: true,
    } as OptionsOfTextResponseBody;

    if (Object.keys(heads).length > 0) {
      options.headers = { ...options.headers, ...heads };
    }
    if (body) {
      options.body = body;
      options.headers!.prefer = "transient";
    }
    try {
      const response = await got(uri, options);
      return {
        ...response,
        headers: response.headers,
        data: response.body ? JSON.parse(response.body) : null,
      } as NetsuiteResponse;
    } catch (e) {
      if (e instanceof HTTPError) {
        throw new NetsuiteError(e);
      }
      throw e;
    }
  }

  /**
   * Connect !
   * @returns
   */
  public async connect() {
    return await this.request({
      path: "*",
      method: "OPTIONS",
    });
  }

  /**
   * Run SuiteQL query
   * @param query
   * @param limit
   * @param offset
   * @returns
   */
  public async query(query: string, limit = 1000, offset = 0) {
    let queryResult: NetsuiteQueryResult = { items: [], hasMore: false };
    if (limit > 1000) throw new Error("Max limit is 1000");
    // replace all \t with spaces as suggested in #5
    query = query.replace(/\t/g, " ");
    query = query.replace(/\r?\n|\r/gm, "");
    let bodyContent = `{"q": "${query}" }`;
    const response = await this.request({
      path: `query/v1/suiteql?limit=${limit}&offset=${offset}`,
      method: "POST",
      body: bodyContent,
    });
    queryResult.items = response.data.items;
    queryResult.hasMore = response.data.hasMore;
    return queryResult;
  }

  /**
   * Run and then combine all pages of a query
   * @param query
   * @param limit
   * @returns
   */
  public queryAll(query: string, limit = 1000) {
    const stream = new Readable({
      objectMode: true,
      read() {},
    });
    let offset = 0;
    const getNextPage = async () => {
      try {
        let hasMore = true;
        while (hasMore === true) {
          let sqlResult = await this.query(query, limit, offset);
          sqlResult.items.forEach((item) => stream.push(item));
          hasMore = sqlResult.hasMore;
          offset = offset + limit;
        }
        stream.push(null);
      } catch (error) {
        stream.emit('error', error);
      }
    };
    getNextPage();
    return stream;
  }
}
