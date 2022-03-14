import { camelCase } from 'camel-case';
import merge from 'lodash/merge';
import pluralize from 'pluralize';
import {
  DataProvider,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
} from 'ra-core';
import buildDataProvider, { BuildQueryFactory, Options } from 'ra-data-graphql';
import defaultBuildQuery from './buildQuery';
import { IntrospectionObjectType } from './types';

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

export default (
  options: Omit<Options, 'buildQuery'> & { buildQuery?: BuildQueryFactory }
): Promise<DataProvider> => {
  return buildDataProvider(merge({}, defaultOptions, options)).then(
    (defaultDataProvider) => {
      return {
        ...defaultDataProvider,
        deleteMany: () => {
          throw new Error(`DELETE_MANY is not supported by this data provider`);
        },
        updateMany: () => {
          throw new Error(`UPDATE_MANY is not supported by this data provider`);
        },
      };
    }
  );
};
