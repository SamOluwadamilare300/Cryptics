
// import { onAuthenticatedUser } from "@/actions/auth"
// import { auth } from '@clerk/nextjs/server';
// import { onGetAffiliateInfo } from "@/actions/groups"
// import CreateGroup from "@/components/forms/create-group"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { User } from "lucide-react"
// import { redirect } from "next/navigation"
// import CreatePaymentForm from "./_components/CreatePaymentForm";

// const GroupCreatePage = async ({
//   searchParams,
// }: {
//   searchParams: { affiliate?: string }
// }) => {
//   // First await all async operations sequentially
//   const { userId } = await auth()
//   // Check user auth before proceeding
//   if (!userId) {
//     redirect("/sign-in")
//   }

//     // In a real app, you'd get these values from your auth system or context
//     const userId = "user_123" // Replace with actual user ID
//     const isAffiliate = false // Or true if user is an affiliate
//     const monnifyId = "affiliate_456" // Only needed if isAffiliate is true
  

//   // Then get affiliate info with proper null check
//   const affiliate = await onGetAffiliateInfo(searchParams?.affiliate || "")

//   return (
//     <div className="px-7 flex flex-col gap-4">
//       <h5 className="font-bold text-base text-themeTextWhite">
//         Payment Method
//       </h5>
//       <p className="text-themeTextGray leading-tight">
//          We are still in development...
//       </p>
      
//       {affiliate.status === 200 && (
//         <div className="w-full mt-5 flex justify-center items-center gap-x-2 italic text-themeTextGray text-sm">
//           You were referred by
//           <Avatar className="h-8 w-8">
//             <AvatarImage
//               src={affiliate.user?.Group?.User.image as string}
//               alt="Referrer"
//             />
//             <AvatarFallback className="bg-themeDark">
//               <User className="h-4 w-4" />
//             </AvatarFallback>
//           </Avatar>
//           {affiliate.user?.Group?.User.firstname}{" "}
//           {affiliate.user?.Group?.User.lastname}
//         </div>
//       )}
// {/*       
//       <CreateGroup
//         userId={userId}
//         affiliate={affiliate.status === 200}
//         stripeId={affiliate.user?.Group?.User.stripeId || ""}
//       /> */}
//            <CreatePaymentForm />
//    </div>
//   )
// }

// export default GroupCreatePage


import { auth } from '@clerk/nextjs/server';
import { onGetAffiliateInfo } from "@/actions/groups"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import { redirect } from "next/navigation"
import MonnifyPaymentForm from "./_components/CreatePaymentForm";

const GroupCreatePage = async ({
  searchParams,
}: {
  searchParams: { affiliate?: string }
}) => {
  const { userId } = await auth();
  
  // Check user auth before proceeding
  if (!userId) {
    redirect("/sign-in");
  }

  // Get affiliate info with proper null check
  const affiliate = await onGetAffiliateInfo(searchParams?.affiliate || "");

  // Determine if user is an affiliate and get monnifyId
  const isAffiliate = affiliate.status === 200;
  const monnifyId = affiliate.user?.Group?.User.stripeId || ""; // Using 'stripeId' as a fallback

  return (
    <div className="px-7 flex flex-col gap-4">
      <h5 className="font-bold text-base text-themeTextWhite">
        Create Your Campus
      </h5>
      <p className="text-themeTextGray leading-tight">
        Get started by creating your campus community
      </p>
      
      {isAffiliate && (
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

      <MonnifyPaymentForm 
        userId={userId}
        affiliate={isAffiliate}
        monnifyId={isAffiliate ? monnifyId : undefined}
      />
    </div>
  );
};

export default GroupCreatePage;