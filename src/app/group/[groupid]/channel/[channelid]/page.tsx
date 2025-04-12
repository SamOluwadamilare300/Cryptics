import { auth } from "@clerk/nextjs/server";
import { onGetChannelInfo } from "@/actions/channels";
import { onGetGroupInfo } from "@/actions/groups";

import { LeaderBoardCard } from "@/app/group/_components/leaderboard";
import GroupSideWidget from "@/components/global/group-side-widget";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import Menu from "../../_components/group-navbar";
import CreateNewPost from "./_components/create-post";
import { PostFeed } from "./_components/post-feed";

type Props = {
  params:Promise< { channelid: string; groupid: string }>;
};

const GroupChannelPage = async ({ params }: Props) => {
  try {
    const { channelid, groupid } = await  params;
    // Validate params
    if (!channelid || !groupid) {
      throw new Error("Missing required route parameters.");
    }


    // Fetch user authentication server-side
    const { userId } = await auth();
    if (!userId) {
      return {
        redirect: {
          destination: "/sign-in",
          permanent: false,
        },
      };
    }

    // Initialize Query Client
    const client = new QueryClient();

    // Prefetch channel and group data
    await client.prefetchQuery({
      queryKey: ["channel-info"],
      queryFn: () => onGetChannelInfo(channelid),
    });

    await client.prefetchQuery({
      queryKey: ["about-group-info"],
      queryFn: () => onGetGroupInfo(groupid),
    });

    // Render the page
    return (
      <HydrationBoundary state={dehydrate(client)}>
        <div className="grid lg:grid-cols-4 grid-cols-1 w-full flex-1 h-0 gap-x-5 px-5 s">
          <div className="col-span-1 lg:inline relative hidden py-5">
            <LeaderBoardCard light />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-y-5 py-5">
            <Menu orientation="desktop" />
            <CreateNewPost
              userId={userId}
              channelid={channelid}
              userImage={""}
              username={""}
            />
            <PostFeed channelid={channelid} userid={userId} />
          </div>
          <div className="col-span-1 hidden lg:inline relative py-5">
            <GroupSideWidget light />
          </div>
        </div>
      </HydrationBoundary>
    );
  } catch (error) {
    console.error("Error loading GroupChannelPage:", error);
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">
          An error occurred: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }
};

export default GroupChannelPage;