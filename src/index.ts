import merge from "lodash/merge";
import buildDataProvider from "ra-data-graphql";
import { DELETE, DELETE_MANY, UPDATE, UPDATE_MANY } from "ra-core";
import pluralize from "pluralize";

import defaultBuildQuery from "./buildQuery";

import {
  GET_LIST,
  GET_ONE,
  GET_MANY,
  GET_MANY_REFERENCE,
  // CREATE,
  // UPDATE,
  // UPDATE_MANY,
  // DELETE,
  // DELETE_MANY
} from "ra-core";

const defaultOptions = {
  buildQuery: defaultBuildQuery,
  introspection: {
    operationNames: {
      [GET_ONE]: (resource) => `${(resource.name as string).toLowerCase()}`,
      [GET_LIST]: (resource) =>
        `${pluralize((resource.name as string).toLowerCase())}`,
      [GET_MANY]: (resource) =>
        `${pluralize((resource.name as string).toLowerCase())}`,
      [GET_MANY_REFERENCE]: (resource) =>
        `${pluralize((resource.name as string).toLowerCase())}`,
    },
  },
};

export const buildQuery = defaultBuildQuery;

export default (options) => {
  return buildDataProvider(merge({}, defaultOptions, options)).then(
    (defaultDataProvider) => {
      return (fetchType, resource, params) => {
        // This provider does not support multiple deletions so instead we send multiple DELETE requests
        // This can be optimized using the apollo-link-batch-http link
        if (fetchType === DELETE_MANY) {
          const { ids, ...otherParams } = params;
          return Promise.all(
            ids.map((id) =>
              defaultDataProvider(DELETE, resource, {
                id,
                ...otherParams,
              })
            )
          ).then((results) => {
            const data = results.reduce(
              (acc, { data }) => [...acc, data.id],
              []
            );

            return { data };
          });
        }
        // This provider does not support multiple deletions so instead we send multiple UPDATE requests
        // This can be optimized using the apollo-link-batch-http link
        if (fetchType === UPDATE_MANY) {
          const { ids, data, ...otherParams } = params;
          return Promise.all(
            ids.map((id) =>
              defaultDataProvider(UPDATE, resource, {
                data: {
                  id,
                  ...data,
                },
                ...otherParams,
              })
            )
          ).then((results) => {
            const data = results.reduce(
              (acc, { data }) => [...acc, data.id],
              []
            );

            return { data };
          });
        }

        return defaultDataProvider(fetchType, resource, params);
      };
    }
  );
};
