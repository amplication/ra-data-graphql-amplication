import { GET_LIST, GET_MANY, GET_MANY_REFERENCE } from 'ra-core';
import { IntrospectionResult } from 'ra-data-graphql';
import { FetchType } from 'types';

const sanitizeResource = (data: any): any => {
  const result = Object.keys(data).reduce((acc, key) => {
    if (key.startsWith('_')) {
      return acc;
    }

    const dataKey = data[key];

    if (dataKey === null || dataKey === undefined) {
      return acc;
    }

    if (Array.isArray(dataKey)) {
      if (typeof dataKey[0] === 'object' && dataKey[0] !== null) {
        return {
          ...acc,
          [key]: dataKey.map(sanitizeResource),
          [`${key}Ids`]: dataKey.map((d) => d.id),
        };
      } else {
        return { ...acc, [key]: dataKey };
      }
    }

    if (typeof dataKey === 'object' && dataKey !== null) {
      return {
        ...acc,
        ...(dataKey &&
          dataKey.id && {
            [`${key}.id`]: dataKey.id,
          }),
        [key]: sanitizeResource(dataKey),
      };
    }

    return { ...acc, [key]: dataKey };
  }, {});

  return result;
};

const getResponseParser =
  (introspectionResults: IntrospectionResult) =>
  (raFetchType: FetchType) =>
  (response: any) => {
    const data = response.data;

    if (
      raFetchType === GET_LIST ||
      raFetchType === GET_MANY ||
      raFetchType === GET_MANY_REFERENCE
    ) {
      return {
        data: response?.data?.items?.map(sanitizeResource),
        total: response?.data?.total?.count,
      };
    }

    return { data: sanitizeResource(data.data) };
  };

export default getResponseParser;
