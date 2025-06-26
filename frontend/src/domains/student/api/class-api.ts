// Optional: Use this if your class API endpoint isn't working
// Replace your class API with this mock version temporarily

import { api, Tag } from '@/api';
import { ClassData, ClassDataProps, ClassDataPropsWithId } from '../types';

// Mock classes data
const mockClassesData = {
  classes: [
    { id: 1, name: 'Class 1', sections: 'A,B,C' },
    { id: 2, name: 'Class 2', sections: 'A,B,C,D' },
    { id: 3, name: 'Class 3', sections: 'A,B' },
    { id: 4, name: 'Class 4', sections: 'A,B,C' },
    { id: 5, name: 'Class 5', sections: 'A,B,C,D,E' },
    { id: 6, name: 'Class 6', sections: 'A,B,C' },
    { id: 7, name: 'Class 7', sections: 'A,B,C,D' },
    { id: 8, name: 'Class 8', sections: 'A,B,C' },
    { id: 9, name: 'Class 9', sections: 'A,B,C,D' },
    { id: 10, name: 'Class 10', sections: 'A,B,C' },
    { id: 11, name: 'Class 11', sections: 'Science,Commerce,Arts' },
    { id: 12, name: 'Class 12', sections: 'Science,Commerce,Arts' }
  ]
};

const simulateApiDelay = () => new Promise((resolve) => setTimeout(resolve, 300));

export const classApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getClasses: builder.query<ClassData, void>({
      queryFn: async () => {
        await simulateApiDelay();
        return { data: mockClassesData };
      },
      providesTags: (result) =>
        result?.classes?.map(({ id }) => {
          return { type: Tag.CLASSES, id };
        }) || [{ type: Tag.CLASSES }]
    }),

    getClassDetail: builder.query<ClassDataPropsWithId, string | undefined>({
      queryFn: async (id) => {
        await simulateApiDelay();

        if (!id) {
          return { error: { status: 400, data: 'Class ID is required' } };
        }

        const classItem = mockClassesData.classes.find((c) => c.id === parseInt(id));

        if (!classItem) {
          return { error: { status: 404, data: 'Class not found' } };
        }

        return { data: classItem };
      },
      providesTags: (result) => (result ? [{ type: Tag.CLASSES, id: result.id }] : [])
    }),

    addClass: builder.mutation<{ message: string }, ClassDataProps>({
      queryFn: async (payload) => {
        await simulateApiDelay();

        // Add to mock data
        const newClass = {
          id: mockClassesData.classes.length + 1,
          ...payload
        };
        mockClassesData.classes.push(newClass);

        return { data: { message: 'Class added successfully' } };
      },
      invalidatesTags: [Tag.CLASSES]
    }),

    updateClass: builder.mutation<{ message: string }, ClassDataPropsWithId>({
      queryFn: async ({ id, ...payload }) => {
        await simulateApiDelay();

        const index = mockClassesData.classes.findIndex((c) => c.id === id);
        if (index === -1) {
          return { error: { status: 404, data: 'Class not found' } };
        }

        mockClassesData.classes[index] = { id, ...payload };

        return { data: { message: 'Class updated successfully' } };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: Tag.CLASSES, id }]
    }),

    deleteClass: builder.mutation<{ message: string }, number>({
      queryFn: async (id) => {
        await simulateApiDelay();

        const index = mockClassesData.classes.findIndex((c) => c.id === id);
        if (index === -1) {
          return { error: { status: 404, data: 'Class not found' } };
        }

        mockClassesData.classes.splice(index, 1);

        return { data: { message: 'Class deleted successfully' } };
      },
      invalidatesTags: [Tag.CLASSES]
    })
  })
});

export const {
  useGetClassesQuery,
  useLazyGetClassesQuery,
  useGetClassDetailQuery,
  useAddClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation
} = classApi;
