import { ApolloClient } from '@apollo/client';
import { IntrospectionField, IntrospectionObjectType } from 'graphql';
import { BuildQueryFactory, Options } from 'ra-data-graphql';

export enum FetchType {
  GET_LIST = 'GET_LIST',
  GET_ONE = 'GET_ONE',
  GET_MANY = 'GET_MANY',
  GET_MANY_REFERENCE = 'GET_MANY_REFERENCE',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  DELETE_MANY = 'DELETE_MANY',
  UPDATE_MANY = 'UPDATE_MANY',
}

export type Variables = {
  [key: string]: any;
};

/**
 * This options overwrite the default amplication options
 */
export type AmplicationRaDataGraphQLProviderOptions = {
  client: ApolloClient<any>;
};
