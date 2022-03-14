import {
  IntrospectionSchema,
  IntrospectionType,
  IntrospectionField,
  IntrospectionObjectType,
} from 'graphql';

export {
  IntrospectionInputObjectType,
  IntrospectionType,
  IntrospectionField,
  IntrospectionInputValue,
  IntrospectionUnionType,
  IntrospectionObjectType,
  IntrospectionNamedTypeRef,
  GraphQLType,
} from 'graphql';

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

export type Resource = {
  type: IntrospectionObjectType;
  GET_LIST: IntrospectionField | undefined;
  GET_MANY: IntrospectionField | undefined;
  GET_MANY_REFERENCE: IntrospectionField | undefined;
  GET_ONE: IntrospectionField | undefined;
  CREATE: IntrospectionField | undefined;
  UPDATE: IntrospectionField | undefined;
  DELETE: IntrospectionField | undefined;
  UPDATE_MANY: IntrospectionField | undefined;
  DELETE_MANY: IntrospectionField | undefined;
};

export type IntrospectionResults = {
  types: IntrospectionType[];
  queries: IntrospectionField[];
  resources: [Resource];
  schema: IntrospectionSchema;
};

export type Variables = {
  [key: string]: any;
};
