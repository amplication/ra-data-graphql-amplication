import { ApolloQueryResult } from '@apollo/client';
import { IntrospectionField } from 'graphql';
import { GET_LIST, GET_MANY, GET_MANY_REFERENCE } from 'ra-core';
import { IntrospectedResource, IntrospectionResult } from 'ra-data-graphql';
import { FetchType } from 'types';

export default (introspectionResults: IntrospectionResult) =>
  (raFetchMethod: FetchType) =>
  (response: ApolloQueryResult<any>) => {
    const data = response.data;

    if (
      raFetchMethod === GET_LIST ||
      raFetchMethod === GET_MANY ||
      raFetchMethod === GET_MANY_REFERENCE
    ) {
      return {
        data: response.data.items.map(sanitizeResource),
        total: response.data.total.count,
      };
    }

    return { data: sanitizeResource(data.data) };
  };

const sanitizeResource = (data: any): any => {
  const result = Object.keys(data).reduce((acc, key) => {
    if (key.startsWith('_')) {
      return acc;
    }

    const dataForKey = data[key];

    if (dataForKey === null || dataForKey === undefined) {
      return acc;
    }

    if (Array.isArray(dataForKey)) {
      if (typeof dataForKey[0] === 'object' && dataForKey[0] !== null) {
        return {
          ...acc,
          [key]: dataForKey.map(sanitizeResource),
          [`${key}Ids`]: dataForKey.map((d) => d.id),
        };
      } else {
        return { ...acc, [key]: dataForKey };
      }
    }

    if (typeof dataForKey === 'object' && dataForKey !== null) {
      return {
        ...acc,
        ...(dataForKey &&
          dataForKey.id && {
            [`${key}.id`]: dataForKey.id,
          }),
        // We should only sanitize gql types, not objects
        [key]: dataForKey.__typename
          ? sanitizeResource(dataForKey)
          : dataForKey,
      };
    }

    return { ...acc, [key]: dataForKey };
  }, {});

  return result;
};
