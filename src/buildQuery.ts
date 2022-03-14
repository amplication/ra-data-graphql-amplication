import { BuildQuery, IntrospectionResult } from 'ra-data-graphql';
import buildGqlQuery from './buildGqlQuery';
import buildVariables from './buildVariables';
import getResponseParser from './getResponseParser';
import { FetchType } from './types';

export const buildQueryFactory =
  (
    buildVariablesImpl = buildVariables,
    buildGqlQueryImpl = buildGqlQuery,
    getResponseParserImpl = getResponseParser
  ) =>
  (introspectionResults: IntrospectionResult): BuildQuery => {
    const knownResources = introspectionResults.resources.map(
      (r) => r.type.name
    );
    //@ts-ignore
    const buildQuery: BuildQuery = (
      raFetchType: FetchType,
      resourceName: string,
      params: any
    ) => {
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

    return buildQuery;
  };

export default buildQueryFactory(
  buildVariables,
  buildGqlQuery,
  getResponseParser
);
