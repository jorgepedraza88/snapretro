import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface CreatePostParams {
  retrospectiveId: string;
  sectionId: string;
  userId: string;
  content: string;
  votes?: string[];
}

interface DeletePostParams {
  retrospectiveId: string;
  postId: string;
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      retrospectiveId,
      sectionId,
      userId,
      content,
      votes = []
    }: CreatePostParams) => {
      const response = await axios.post(`/api/retro/${retrospectiveId}/posts`, {
        sectionId,
        userId,
        content,
        votes
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['retrospective', variables.retrospectiveId] });
    }
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ retrospectiveId, postId }: DeletePostParams) => {
      await axios.delete(`/api/retro/${retrospectiveId}/posts/${postId}`);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['retrospective', variables.retrospectiveId] });
    }
  });
}
