import type {Buffer} from "node:buffer";
import type {Readable} from "node:stream";

export type NetsuiteOptions = {
  consumer_key: string;
  consumer_secret_key: string;
  token: string;
  token_secret: string;
  realm: string;
  base_url?: string;
};

type BaseRequestOptions = {
    /**
     * The HTTP method to use
     */
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS" | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';
    /**
     * The body of the request
     */
    body?: string;
    /**
     * Additional headers to send with the request
     */
    heads?: any;
};

export type NetsuiteRequestOptions =
    | (BaseRequestOptions & { path?: string; restletUrl?: never })
    | (BaseRequestOptions & { path?: never; restletUrl?: string });

export type NetsuiteResponse = {
  statusCode: number;
  headers: NodeJS.Dict<string | string[]>;
  data: any;
};

export type NetsuiteQueryResult = {
  items: any[];
  hasMore: boolean;
};
