import merge from "lodash/merge";
import buildDataProvider from "ra-data-graphql";
import pluralize from "pluralize";
import { camelCase } from "camel-case";

import defaultBuildQuery from "./buildQuery";

import {
  GET_LIST,
  GET_ONE,
  GET_MANY,
  GET_MANY_REFERENCE,
  DELETE_MANY,
  UPDATE_MANY,
} from "ra-core";

import { IntrospectionObjectType, FetchType } from "./types";

const defaultOptions = {
  buildQuery: defaultBuildQuery,
  introspection: {
    operationNames: {
      [GET_ONE]: (resource: IntrospectionObjectType) =>
        `${camelCase(resource.name as string)}`,
      [GET_LIST]: (resource: IntrospectionObjectType) => {
        return `${pluralize(camelCase(resource.name as string))}`;
      },
      [GET_MANY]: (resource: IntrospectionObjectType) =>
        `${pluralize(camelCase(resource.name as string))}`,
      [GET_MANY_REFERENCE]: (resource: IntrospectionObjectType) =>
        `${pluralize(camelCase(resource.name as string))}`,
    },
  },
};

export const buildQuery = defaultBuildQuery;

export default (options: any) => {
  return buildDataProvider(merge({}, defaultOptions, options)).then(
    (defaultDataProvider: any) => {
      return (
        fetchType: FetchType,
        resource: IntrospectionObjectType,
        params: any
      ) => {
        if (fetchType === DELETE_MANY) {
          throw new Error(`DELETE_MANY is not supported by this data provider`);
        }
        if (fetchType === UPDATE_MANY) {
          throw new Error(`UPDATE_MANY is not supported by this data provider`);
        }

        return defaultDataProvider(fetchType, resource, params);
      };
    }
  );
};
