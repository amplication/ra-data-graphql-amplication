import buildVariables from './buildVariables';
import buildGqlQuery from './buildGqlQuery';
import getResponseParser from './getResponseParser';

import { FetchType, IntrospectionResults } from './types';

export const buildQueryFactory =
  (
    buildVariablesImpl: any,
    buildGqlQueryImpl: any,
    getResponseParserImpl: any
  ) =>
  (introspectionResults: IntrospectionResults) => {
    const knownResources = introspectionResults.resources.map(
      (r) => r.type.name
    );

    return (raFetchType: FetchType, resourceName: string, params: any) => {
      const resource = introspectionResults.resources.find(
        (r) => r.type.name === resourceName
      );

      if (!resource) {
        throw new Error(
          `Unknown resource ${resourceName}. Make sure it has been declared on your server side schema. Known resources are ${knownResources.join(
            ', '
          )}`
        );
      }

      const queryType = resource[raFetchType];

      if (!queryType) {
        throw new Error(
          `No query or mutation matching fetch type ${raFetchType} could be found for resource ${resource.type.name}`
        );
      }

      const variables = buildVariablesImpl(introspectionResults)(
        resource,
        raFetchType,
        params,
        queryType
      );
      const query = buildGqlQueryImpl(introspectionResults)(
        resource,
        raFetchType,
        queryType,
        variables
      );
      const parseResponse = getResponseParserImpl(introspectionResults)(
        raFetchType,
        resource,
        queryType
      );

      return {
        query,
        variables,
        parseResponse,
      };
    };
  };

export default buildQueryFactory(
  buildVariables,
  buildGqlQuery,
  getResponseParser
);
