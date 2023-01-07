import { API_URL } from "utils/constants";
import wretch from "wretch";
import QueryStringAddon from "wretch/addons/queryString";

export const api = wretch(API_URL).addon(QueryStringAddon).errorType("json");
