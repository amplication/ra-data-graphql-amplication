import { TypeKind } from "graphql";
import { GraphQLType } from "./types";
/**
 * Ensure we get the real type even if the root type is NON_NULL or LIST
 * @param {GraphQLType} type
 */
const getFinalType = (type: any): any => {
  if (type.kind === TypeKind.NON_NULL || type.kind === TypeKind.LIST) {
    return getFinalType(type.ofType);
  }

  return type;
};

export default getFinalType;
