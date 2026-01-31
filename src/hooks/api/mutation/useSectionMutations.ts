import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface UpdateSectionTitleParams {
  retrospectiveId: string;
  sectionId: string;
  title: string;
}

export function useUpdateSectionTitleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ retrospectiveId, sectionId, title }: UpdateSectionTitleParams) => {
      const response = await axios.patch(`/api/retro/${retrospectiveId}/sections/${sectionId}`, {
        title
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['retrospective', variables.retrospectiveId] });
    }
  });
}
