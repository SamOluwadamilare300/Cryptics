
import {
  onGetAllGroupMembers,
  onGetGroupChannels,
  onGetGroupInfo,
  onGetGroupSubscriptions,
  onGetUserGroups,
} from "@/actions/groups";
import SideBar from "@/components/global/sidebar";
import { auth } from "@clerk/nextjs/server";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import MobileNav from "../_components/mobile-nav";
import { Navbar } from "../_components/navbar";
import { getServerAuthUser } from "@/lib/getServerAuthUser";

type Props = {
  children: React.ReactNode;
  params: Promise<{ groupid: string }>;
};

const GroupLayout = async ({ children, params }: Props) => {
  try {
    // Await params to extract route parameters
    const { groupid } = await params;

    // Validate params
    if (!groupid) {
      throw new Error("Group ID is missing from route parameters.");
    }

    // Fetch user authentication server-side
    const { userId } = await auth();
    // const userId = await getServerAuthUser()
    if (!userId) {
      redirect("/sign-in"); // Redirect if not authenticated
    }

    // Initialize the Query Client
    const queryClient = new QueryClient();

    // Prefetch multiple data sets
    await queryClient.prefetchQuery({
      queryKey: ["group-info", groupid], // Unique query key
      queryFn: () => onGetGroupInfo(groupid),
    });

    await queryClient.prefetchQuery({
      queryKey: ["user-groups", userId], // Unique query key
      queryFn: () => onGetUserGroups(userId),
    });

    await queryClient.prefetchQuery({
      queryKey: ["group-channels", groupid], // Unique query key
      queryFn: () => onGetGroupChannels(groupid),
    });

    await queryClient.prefetchQuery({
      queryKey: ["group-subscriptions", groupid], // Unique query key
      queryFn: () => onGetGroupSubscriptions(groupid),
    });

    await queryClient.prefetchQuery({
      queryKey: ["member-chats", groupid], // Unique query key
      queryFn: () => onGetAllGroupMembers(groupid),
    });

    // Render the layout with the hydrated query state
    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex h-screen md:pt-5">
          <SideBar groupid={groupid} userid={userId} />
          <div className="md:ml-[300px] flex flex-col flex-1 bg-[#101011] md:rounded-tl-xl overflow-y-auto border-l-[1px] border-t-[1px] border-[#28282D]">
            <Navbar groupid={groupid} userid={userId} />
            {children}
            <MobileNav groupid={groupid} />
          </div>
        </div>
      </HydrationBoundary>
    );
  } catch (error) {
    console.error("Error in GroupLayout:", error);
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">
          An error occurred: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }
};

export default GroupLayout;