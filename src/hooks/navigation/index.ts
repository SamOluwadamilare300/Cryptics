import { onCreateNewChannel } from "@/actions/channels";
import { onGetGroupChannels, onGetGroupInfo, onGetUserGroups } from "@/actions/groups";
import { IGroupInfo, IGroups } from "@/components/global/sidebar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const useNavigation = () => {
  const pathName = usePathname();
  const [section, setSection] = useState<string>(pathName);
  const onSetSection = (page: string) => setSection(page);
  return {
    section,
    onSetSection,
  };
};

export const useSideBar = (groupid: string) => {
  const { data: groups = { status: 0, groups: [] } } = useQuery({
    queryKey: ["user-groups"],
    queryFn: () => onGetUserGroups( groupid), 
  }) as { data: IGroups };

  const { data: groupInfo = { status: 0, group: undefined } } = useQuery({
    queryKey: ["group-info"],
    queryFn: () => onGetGroupInfo(groupid), // Ensure a query function is provided
  }) as { data: IGroupInfo };

  const { data: channels = { status: 0, channels: [] } } = useQuery({
    queryKey: ["group-channels"],
    queryFn: () => onGetGroupChannels(groupid), // Query function for channels
  });

  const client = useQueryClient();

  // We use useMutation to optimistically add a channel
  // Once the mutation is settled or complete, we invalidate the group-channel query and trigger a refetch
  // This makes the optimistic UI seamless

  const { mutate, variables, isPending, isError } = useMutation({
    mutationFn: (data: {
      id: string;
      name: string;
      icon: string;
      createdAt: Date;
      groupId: string | null;
    }) =>
      onCreateNewChannel(groupid, {
        id: data.id,
        name: data.name.toLowerCase(),
        icon: data.icon,
      }),
    onSettled: async () => {
      await client.invalidateQueries({
        queryKey: ["group-channels"],
      });
    },
  });

  if (isPending)
    toast("Success", {
      description: "Channel created",
    });

  if (isError)
    toast("Error", {
      description: "Oops! Something went wrong",
    });

  return { groupInfo, groups, mutate, variables, isPending, channels };
};