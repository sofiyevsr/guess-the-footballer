import { API_URL } from "utils/constants";
import wretch from "wretch";
import QueryStringAddon from "wretch/addons/queryString";
import FormDataAddon from "wretch/addons/formData";

export const api = wretch(API_URL, { mode: "cors", credentials: "include" })
  .addon(QueryStringAddon)
  .addon(FormDataAddon)
  .errorType("json");
