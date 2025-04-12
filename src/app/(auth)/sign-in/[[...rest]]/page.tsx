// // import { GoogleAuthButton } from "@/components/global/google-oauth-button"
// import SignInForm from "@/components/forms/sign-in"
// import { GoogleAuthButton } from "@/components/global/google-oauth-button"
// import { Separator } from "@/components/ui/separator"

// const SignInPage = () => {
//   return (
//     <>
//       <h5 className="font-bold text-base text-themeTextWhite">Login</h5>
//       <p className="text-themeTextGray leading-tight">
//         Network with people from around the world, join groups, create your own,
//         watch courses and become the best version of yourself.
//       </p>
//       <SignInForm />
//       <div className="my-10 w-full relative">
//         <div className="bg-black p-3 absolute text-themeTextGray text-xs top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//           OR CONTINUE WITH
//         </div>
//         <Separator orientation="horizontal" className="bg-themeGray" />
//       </div>
//       <GoogleAuthButton method="signin" />
//     </>
//   )
// }

// export default SignInPage


import { redirect } from "next/navigation"
import { auth } from '@clerk/nextjs/server';
import { SignIn } from "@clerk/nextjs"

export default async function SignInPage() {
  const { userId } = await auth();
  // if (!userId) return null;
  if (!userId) redirect("/group/create")

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="w-full max-w-md px-4">
        <h5 className="font-bold text-base text-themeTextWhite mb-2">Login</h5>
        <p className="text-themeTextGray leading-tight mb-6">
          Network with people from around the world, join groups, create your own,
          watch courses and become the best version of yourself.
        </p>
        <SignIn 
          path="/sign-in" 
          routing="path" 
          signUpUrl="/sign-up"
          afterSignInUrl="/group/create"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-themeBlack border border-themeGray w-full",
              headerTitle: "text-themeTextWhite",
              headerSubtitle: "text-themeTextGray",
              socialButtonsBlockButton: "border-themeGray hover:bg-themeDark",
              socialButtonsBlockButtonText: "text-themeTextWhite",
              dividerText: "text-themeTextGray",
              formFieldLabel: "text-themeTextWhite",
              formFieldInput: "bg-themeDark border-themeGray text-themeTextWhite",
              footerActionText: "text-themeTextGray",
              footerActionLink: "text-themeTextWhite hover:text-themeAccent",
              formButtonPrimary: "bg-themeAccent hover:bg-themeAccentHover",
            }
          }}
        />
      </div>
    </div>
  )
}
