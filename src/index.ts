import { camelCase } from 'camel-case';
import { IntrospectionType } from 'graphql';
import merge from 'lodash/merge';
import pluralize from 'pluralize';
import {
  DataProvider,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
} from 'ra-core';
import buildDataProvider, {
  IntrospectionOptions,
  Options,
} from 'ra-data-graphql';
import { AmplicationRaDataGraphQLProviderOptions } from 'types';
import defaultAmplicationBuildQuery from './buildQuery';

/**
 * You can see more details about the introspection object in the link
 * https://github.com/marmelab/react-admin/tree/master/packages/ra-data-graphql#introspection-options
 */
const introspection: IntrospectionOptions = {
  operationNames: {
    [GET_ONE]: (resource: IntrospectionType) =>
      `${camelCase(resource.name as string)}`,
    [GET_LIST]: (resource: IntrospectionType) => {
      return `${pluralize(camelCase(resource.name as string))}`;
    },
    [GET_MANY]: (resource: IntrospectionType) =>
      `${pluralize(camelCase(resource.name as string))}`,
    [GET_MANY_REFERENCE]: (resource: IntrospectionType) =>
      `${pluralize(camelCase(resource.name as string))}`,
  },
};

const defaultAmplicationOptions: Options = {
  //@ts-ignore
  buildQuery: defaultAmplicationBuildQuery,
  introspection,
};

export default (
  options: AmplicationRaDataGraphQLProviderOptions
): Promise<DataProvider> => {
  return buildDataProvider(merge({}, defaultAmplicationOptions, options)).then(
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
