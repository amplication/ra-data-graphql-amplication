import { IntrospectionField } from 'graphql';
import { DELETE, GET_LIST, GET_MANY, GET_MANY_REFERENCE } from 'ra-core';
import { IntrospectedResource, IntrospectionResult } from 'ra-data-graphql';
import buildVariables from './buildVariables';
import { FetchType } from './types';

describe('buildVariables', () => {
  const introspectionResult = {
    types: [
      {
        name: 'PostFilter',
        inputFields: [{ name: 'tags_some' }],
      },
    ],
  } as unknown as IntrospectionResult;
  describe('GET_LIST', () => {
    it('returns correct variables', () => {
      const params = {
        filter: {
          ids: ['foo1', 'foo2'],
          tags: { id: ['tag1', 'tag2'] },
          'author.id': 'author1',
          views: 100,
        },
        pagination: { page: 10, perPage: 10 },
        sort: { field: 'sortField', order: 'DESC' },
      };

      expect(
        buildVariables(introspectionResult)(
          {
            type: { name: 'Post', fields: [] },
          } as unknown as IntrospectedResource,
          GET_LIST as FetchType,
          params,
          {} as IntrospectionField
        )
      ).toEqual({
        where: {
          ids: ['foo1', 'foo2'],
          tags_some: { id_in: ['tag1', 'tag2'] },
          views: 100,
        },
        skip: 90,
        take: 10,
        orderBy: {
          sortField: 'Desc',
        },
      });
    });
  });

  describe('GET_MANY', () => {
    it('returns correct variables', () => {
      const params = {
        ids: ['tag1', 'tag2'],
      };

      expect(
        buildVariables(introspectionResult)(
          { type: { name: 'Post' } } as unknown as IntrospectedResource,
          GET_MANY as FetchType,
          params,
          {} as IntrospectionField
        )
      ).toEqual({
        where: {
          id: {
            in: ['tag1', 'tag2'],
          },
        },
      });
    });
  });

  describe('GET_MANY_REFERENCE', () => {
    it('returns correct variables', () => {
      const params = {
        target: 'author_id',
        id: 'author1',
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'name', order: 'ASC' },
      };

      expect(
        buildVariables(introspectionResult)(
          { type: { name: 'Post' } } as unknown as IntrospectedResource,
          GET_MANY_REFERENCE as FetchType,
          params,
          {} as IntrospectionField
        )
      ).toEqual({
        where: {
          author_id: { id: 'author1' },
        },
        orderBy: {
          name: 'Asc',
        },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('DELETE', () => {
    it('returns correct variables', () => {
      const params = {
        id: 'post1',
      };
      expect(
        buildVariables(introspectionResult)(
          {
            type: { name: 'Post', inputFields: [] },
          } as unknown as IntrospectedResource,
          DELETE as FetchType,
          params,
          {} as IntrospectionField
        )
      ).toEqual({
        where: {
          id: 'post1',
        },
      });
    });
  });
});
