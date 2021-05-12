import {
  IntrospectionSchema,
  IntrospectionType,
  IntrospectionField,
  IntrospectionObjectType,
} from "graphql";

export {
  IntrospectionInputObjectType,
  IntrospectionType,
  IntrospectionField,
  IntrospectionInputValue,
  IntrospectionUnionType,
  IntrospectionObjectType,
  IntrospectionNamedTypeRef,
  GraphQLType,
} from "graphql";

export enum FetchType {
  GET_LIST = "GET_LIST",
  GET_ONE = "GET_ONE",
  GET_MANY = "GET_MANY",
  GET_MANY_REFERENCE = "GET_MANY_REFERENCE",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  DELETE_MANY = "DELETE_MANY",
  UPDATE_MANY = "UPDATE_MANY",
}

export type QueryType = IntrospectionField;

export type Resource = {
  type: IntrospectionObjectType;
  GET_LIST: QueryType | undefined;
  GET_MANY: QueryType | undefined;
  GET_MANY_REFERENCE: QueryType | undefined;
  GET_ONE: QueryType | undefined;
  CREATE: QueryType | undefined;
  UPDATE: QueryType | undefined;
  DELETE: QueryType | undefined;
  UPDATE_MANY: QueryType | undefined;
  DELETE_MANY: QueryType | undefined;
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
