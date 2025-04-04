// import { onAuthenticatedUser } from "@/actions/auth"
import { auth } from '@clerk/nextjs/server';
import { onGetAffiliateInfo } from "@/actions/groups"
import CreateGroup from "@/components/forms/create-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import { redirect } from "next/navigation"

const GroupCreatePage = async ({
  searchParams,
}: {
  searchParams: { affiliate?: string }
}) => {
  // First await all async operations sequentially
  const { userId } = await auth()
  // Check user auth before proceeding
  if (!userId) {
    redirect("/sign-in")
  }

  // Then get affiliate info with proper null check
  const affiliate = await onGetAffiliateInfo(searchParams?.affiliate || "")

  return (
    <div className="px-7 flex flex-col gap-4">
      <h5 className="font-bold text-base text-themeTextWhite">
        Payment Method
      </h5>
      <p className="text-themeTextGray leading-tight">
        Free for 14 days, then $99/month. Cancel anytime. All features.
        Unlimited everything. No hidden fees.
      </p>
      
      {affiliate.status === 200 && (
        <div className="w-full mt-5 flex justify-center items-center gap-x-2 italic text-themeTextGray text-sm">
          You were referred by
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={affiliate.user?.Group?.User.image as string}
              alt="Referrer"
            />
            <AvatarFallback className="bg-themeDark">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          {affiliate.user?.Group?.User.firstname}{" "}
          {affiliate.user?.Group?.User.lastname}
        </div>
      )}
      
      <CreateGroup
        userId={userId}
        affiliate={affiliate.status === 200}
        stripeId={affiliate.user?.Group?.User.stripeId || ""}
      />
         <CreateGroup
        userId={userId}
        affiliate={affiliate.status === 200}
        stripeId={affiliate.user?.Group?.User.stripeId || ""}
      />
    </div>
  )
}

export default GroupCreatePage