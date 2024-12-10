import type { Timings } from "@szmarczak/http-timer";

export type NetsuiteOptions = {
  consumer_key: string;
  consumer_secret_key: string;
  token: string;
  token_secret: string;
  realm: string;
  base_url?: string;
};

export type NetsuiteRequestOptions = {
  path?: string;
  method?: string;
  body?: any;
  heads?: any;
};

export type NetsuiteResponse = {
  statusCode: number;
  headers: NodeJS.Dict<string | string[]>;
  data: any;
  timings?: Timings;
};

export type NetsuiteQueryResult = {
  items: any[];
  hasMore: boolean;
};
