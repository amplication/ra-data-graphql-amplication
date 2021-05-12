/* eslint-disable default-case */
import {
  GET_LIST,
  GET_ONE,
  GET_MANY,
  GET_MANY_REFERENCE,
  CREATE,
  UPDATE,
  DELETE,
} from "ra-core";

import getFinalType from "./getFinalType";
import isList from "./isList";
import {
  IntrospectionResults,
  IntrospectionType,
  IntrospectionInputObjectType,
  IntrospectionField,
  Resource,
  FetchType,
  QueryType,
} from "./types";
import { IntrospectionInputType } from "graphql";

const NON_UPDATABLE_FIELDS = ["id", "createdAt", "updatedAt"];

const sanitizeValue = (type: IntrospectionType, value: any) => {
  if (type.name === "Int") {
    return parseInt(value, 10);
  }

  if (type.name === "Float") {
    return parseFloat(value);
  }

  return value;
};

const castType = (type: any, value: any) => {
  const realType = type.kind === "NON_NULL" ? type.ofType : type;
  switch (`${realType.kind}:${realType.name}`) {
    case "SCALAR:Int":
      return Number(value);

    case "SCALAR:String":
      return String(value);

    case "SCALAR:Boolean":
      return Boolean(value);

    default:
      return value;
  }
};

const prepareParams = (
  params: any,
  queryType: QueryType,
  introspectionResults: IntrospectionResults
) => {
  const result: { [key: string]: any } = {};

  if (!params) {
    return params;
  }

  Object.keys(params).forEach((key) => {
    const param = params[key];
    let arg: { type: IntrospectionType } | null = null;

    if (!param) {
      result[key] = param;
      return;
    }

    //skip params like "customer.id"
    if (key.endsWith(".id")) {
      return;
    }

    if (key === "target") {
      const target: string = param;
      if (target.endsWith("Id")) {
        result[key] = target.slice(0, -2).toLowerCase();
        return;
      }
    }

    if (queryType && Array.isArray(queryType.args)) {
      arg = queryType.args.find((item) => item.name === key);
    }

    if (param instanceof File) {
      result[key] = param;
      return;
    }

    if (param instanceof Date) {
      result[key] = param.toISOString();
      return;
    }

    if (
      param instanceof Object &&
      !Array.isArray(param) &&
      arg &&
      arg.type.kind === "INPUT_OBJECT"
    ) {
      const args = (
        introspectionResults.types.find(
          (item) => item.kind === arg?.type.kind && item.name === arg?.type.name
        ) as IntrospectionInputObjectType
      )?.inputFields;
      //@ts-ignore
      result[key] = prepareParams(param, { args }, introspectionResults);
      return;
    }

    if (
      param instanceof Object &&
      !(param instanceof Date) &&
      !Array.isArray(param)
    ) {
      result[key] = prepareParams(param, queryType, introspectionResults);
      return;
    }

    if (!arg) {
      result[key] = param;
      return;
    }

    result[key] = castType(param, arg.type);
  });

  return result;
};

const buildGetListVariables =
  (introspectionResults: IntrospectionResults) =>
  (resource: Resource, aorFetchType: FetchType, params: any) => {
    let variables: { [key: string]: any } = {};

    if (params.filter) {
      variables.where = Object.keys(params.filter).reduce((acc, key) => {
        if (key === "ids") {
          return { ...acc, ids: params.filter[key] };
        }

        if (typeof params.filter[key] === "object") {
          const type = introspectionResults.types.find(
            (t) => t.name === `${resource.type.name}Filter`
          );
          const filterSome = (
            type as IntrospectionInputObjectType
          )?.inputFields?.find((t) => t.name === `${key}_some`);

          if (filterSome) {
            const filter = Object.keys(params.filter[key]).reduce(
              (acc, k) => ({
                ...acc,
                [`${k}_in`]: params.filter[key][k],
              }),
              {}
            );
            return { ...acc, [`${key}_some`]: filter };
          }
        }

        const parts = key.split(".");

        if (parts.length > 1) {
          if (parts[1] === "id") {
            const type = introspectionResults.types.find(
              (t) => t.name === `${resource.type.name}Filter`
            );
            const filterSome = (
              type as IntrospectionInputObjectType
            )?.inputFields?.find((t) => t.name === `${parts[0]}_some`);

            if (filterSome) {
              return {
                ...acc,
                [`${parts[0]}_some`]: { id: params.filter[key] },
              };
            }

            return { ...acc, [parts[0]]: { id: params.filter[key] } };
          }

          const resourceField = resource.type.fields.find(
            (f) => f.name === parts[0]
          );
          const type = getFinalType(resourceField?.type);
          return {
            ...acc,
            [key]: sanitizeValue(type, params.filter[key]),
          };
        }

        const resourceField = resource.type.fields.find((f) => f.name === key);

        if (resourceField) {
          const type = getFinalType(resourceField.type);
          const isAList = isList(resourceField.type);

          if (isAList) {
            return {
              ...acc,
              [key]: Array.isArray(params.filter[key])
                ? params.filter[key].map((value: any) =>
                    sanitizeValue(type, value)
                  )
                : sanitizeValue(type, [params.filter[key]]),
            };
          }

          return {
            ...acc,
            [key]: sanitizeValue(type, params.filter[key]),
          };
        }

        return { ...acc, [key]: params.filter[key] };
      }, {});
    }

    if (params.pagination) {
      variables.take = parseInt(params.pagination.perPage, 10);
      variables.skip =
        (parseInt(params.pagination.page, 10) - 1) * variables.take;
    }

    if (params.sort) {
      const sortField = params.sort.field.endsWith(".id")
        ? `${params.sort.field.slice(0, -3)}Id`
        : params.sort.field;

      variables.orderBy = {
        [sortField]: params.sort.order === "DESC" ? "Desc" : "Asc",
      };
    }

    return variables;
  };

const getCreateUpdateInputType = (
  queryType: QueryType
): IntrospectionInputType => {
  const inputType = queryType.args.find((arg) => arg.name === "data");
  return getFinalType(inputType?.type);
};

const getInputTypeFieldsNames = (
  introspectionResults: IntrospectionResults,
  typeName: String
): string[] => {
  const type = introspectionResults.types.find(
    (type) => type.name === typeName && type.kind === "INPUT_OBJECT"
  );

  return (type as IntrospectionInputObjectType).inputFields.map(
    (field) => field.name
  );
};

const buildCreateUpdateVariables = (
  resource: Resource,
  aorFetchType: FetchType,
  params: any,
  queryType: QueryType,
  introspectionResults: IntrospectionResults
) => {
  const inputType = getCreateUpdateInputType(queryType);
  const fields = getInputTypeFieldsNames(introspectionResults, inputType.name);
  /*@todo: check how array types are passed */

  return {
    where: {
      id: params.id,
    },
    data: Object.keys(params.data).reduce((acc, key) => {
      //skip non-updatable fields
      if (NON_UPDATABLE_FIELDS.includes(key)) return acc;

      //skips any fields that are not part of the Input Type (related lists...)
      if (!fields.includes(key)) return acc;

      if (Array.isArray(params.data[key])) {
        const arg = queryType.args.find((a) => a.name === `${key}Ids`);

        if (arg) {
          return {
            ...acc,
            [`${key}Ids`]: params.data[key].map(({ id }: any) => id),
          };
        }
      }

      if (typeof params.data[key] === "object") {
        const arg = queryType.args.find((a) => a.name === `${key}Id`);

        if (arg) {
          return {
            ...acc,
            [`${key}Id`]: params.data[key].id,
          };
        }
      }

      return {
        ...acc,
        [key]: params.data[key],
      };
    }, {}),
  };
};

const buildVariables =
  (introspectionResults: IntrospectionResults) =>
  (
    resource: Resource,
    aorFetchType: FetchType,
    params: any,
    queryType: QueryType
  ) => {
    const preparedParams = prepareParams(
      params,
      queryType,
      introspectionResults
    );

    switch (aorFetchType) {
      case GET_LIST: {
        return buildGetListVariables(introspectionResults)(
          resource,
          aorFetchType,
          preparedParams
          //queryType
        );
      }
      case GET_MANY:
        return {
          where: { id: { in: preparedParams.ids } },
        };
      case GET_MANY_REFERENCE: {
        let variables = buildGetListVariables(introspectionResults)(
          resource,
          aorFetchType,
          preparedParams
          //queryType
        );

        variables = {
          ...variables,
          where: {
            [preparedParams.target]: {
              id: preparedParams.id,
            },
          },
          //[preparedParams.target]: preparedParams.id,
        };

        return variables;
      }
      case GET_ONE:
      case DELETE:
        return {
          where: {
            id: preparedParams.id,
          },
        };
      case CREATE:
      case UPDATE: {
        return buildCreateUpdateVariables(
          resource,
          aorFetchType,
          preparedParams,
          queryType,
          introspectionResults
        );
      }
    }
  };
export default buildVariables;
