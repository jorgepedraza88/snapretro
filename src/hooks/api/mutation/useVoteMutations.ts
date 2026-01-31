import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface VoteParams {
  retrospectiveId: string;
  postId: string;
  userId: string;
}

export function useAddVoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ retrospectiveId, postId, userId }: VoteParams) => {
      const response = await axios.post(`/api/retro/${retrospectiveId}/posts/${postId}/votes`, {
        userId
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['retrospective', variables.retrospectiveId] });
    }
  });
}

export function useRemoveVoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ retrospectiveId, postId, userId }: VoteParams) => {
      const response = await axios.delete(`/api/retro/${retrospectiveId}/posts/${postId}/votes`, {
        data: { userId }
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['retrospective', variables.retrospectiveId] });
    }
  });
}
