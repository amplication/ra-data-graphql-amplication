import { IntrospectionField } from 'graphql';
import {
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  CREATE,
  UPDATE,
  DELETE,
} from 'ra-core';
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
        filter: {
          ids: ['foo1', 'foo2'],
          tags_some: { id_in: ['tag1', 'tag2'] },
          author: { id: 'author1' },
          views: 100,
        },
        page: 9,
        perPage: 10,
        sortField: 'sortField',
        sortOrder: 'DESC',
      });
    });
  });

  describe('CREATE', () => {
    it('returns correct variables', () => {
      const params = {
        data: {
          author: { id: 'author1' },
          tags: [{ id: 'tag1' }, { id: 'tag2' }],
          title: 'Foo',
        },
      };
      const queryType = {
        args: [{ name: 'tagsIds' }, { name: 'authorId' }],
      } as unknown as IntrospectionField;

      expect(
        buildVariables(introspectionResult)(
          { type: { name: 'Post' } } as unknown as IntrospectedResource,
          CREATE as FetchType,
          params,
          queryType
        )
      ).toEqual({
        authorId: 'author1',
        tagsIds: ['tag1', 'tag2'],
        title: 'Foo',
      });
    });
  });

  describe('UPDATE', () => {
    it('returns correct variables', () => {
      const params = {
        id: 'post1',
        data: {
          author: { id: 'author1' },
          tags: [{ id: 'tag1' }, { id: 'tag2' }],
          title: 'Foo',
        },
      };
      const queryType = {
        args: [{ name: 'tagsIds' }, { name: 'authorId' }],
      } as unknown as IntrospectionField;

      expect(
        buildVariables(introspectionResult)(
          { type: { name: 'Post' } } as unknown as IntrospectedResource,
          UPDATE as FetchType,
          params,
          queryType
        )
      ).toEqual({
        id: 'post1',
        authorId: 'author1',
        tagsIds: ['tag1', 'tag2'],
        title: 'Foo',
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
        filter: { ids: ['tag1', 'tag2'] },
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
        filter: { author_id: 'author1' },
        page: 0,
        perPage: 10,
        sortField: 'name',
        sortOrder: 'ASC',
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
        id: 'post1',
      });
    });
  });
});
