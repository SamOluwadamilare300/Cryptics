
import { onGetUserGroups } from "@/actions/groups"
import { auth } from '@clerk/nextjs/server';
import GlassSheet from "@/components/global/glass-sheet"
import { UserWidget } from "@/components/global/user-widget"
import { Button } from "@/components/ui/button"
import { CheckBadge, Logout } from "@/icons"
import { MenuIcon } from "lucide-react"
import Link from "next/link"
import { GroupDropDown } from "./group-dropdown"

export const Navbar = async () => {
  const { userId } = await auth();
  const groups = await onGetUserGroups(userId!)


  return (
    <div className="flex px-5 py-3 items-center bg-themeBlack border-b-[1px] border-themeDarkGray fixed z-50 w-full bg-clip-padding backdrop--blur__safari backdrop-filter backdrop-blur-2xl bg-opacity-60">
      <div className="hidden lg:inline">
        {userId ? (
          <GroupDropDown members={groups.members} groups={groups} />
        ) : (
          <p>Cryptics.</p>
        )}
      </div>
      <GlassSheet
        trigger={
          <span className="lg:hidden flex items-center gap-2 py-2">
            <MenuIcon className="cursor-pointer" />
            <p>Cryptics.</p>
          </span>
        }
      >
        <div>Content</div>
      </GlassSheet>
      <div className="flex-1 lg:flex hidden justify-end gap-3">
        <Link href={userId ? `/group/create` : "/sign-in"}>
          <Button
            variant="outline"
            className="bg-themeBlack rounded-2xl flex gap-2 border-themeGray hover:bg-themeGray"
          >
            <CheckBadge />
            Create Campus
          </Button>
        </Link>
        {userId ? (
          <UserWidget image={null} />
          // <UserWidget image={userId.image!} />
        ) : (
          <Link href="/sign-in">
            <Button
              variant="outline"
              className="bg-themeBlack rounded-2xl flex gap-2 border-themeGray hover:bg-themeGray"
            >
              <Logout />
              Login
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
