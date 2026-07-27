import { parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server";
import { PAGINATION } from "@/config/constant";

export const workflowsParams = {
  page: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),

  search: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
  sortBy: parseAsString.withDefault("newest").withOptions({
    clearOnDefault: true,
  }),
  layout: parseAsStringEnum(["grid", "list"]).withDefault("grid").withOptions({
    clearOnDefault: true,
  }),
};
