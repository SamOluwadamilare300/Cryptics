import {
  Chat,
  Courses,
  Document,
  Grid,
  Heart,
  MegaPhone,
  WhiteLabel,
} from "@/icons"

import { MdLiveTv } from "react-icons/md";

export type CreateGroupPlaceholderProps = {
  id: string
  label: string
  icon: JSX.Element
}

export const CREATE_GROUP_PLACEHOLDER: CreateGroupPlaceholderProps[] = [
  {
    id: "0",
    label: "Engage Affiliates with Interactive Campaigns",
    icon: <MegaPhone />,
  },
  {
    id: "1",
    label: "Simple & Quick Setup Process",
    icon: <Heart />,
  },
  {
    id: "2",
    label: "Real-time Group Chats & Posts",
    icon: <Chat />,
  },
  {
    id: "3",
    label: "Enable Students to Create Their Own Teams",
    icon: <Grid />,
  },
  {
    id: "4",
    label: "Incorporate Gamification Features",
    icon: <Document />,
  },
  {
    id: "5",
    label: "Host Unlimited Courses & Modules",
    icon: <Courses />,
  },
  {
    id: "6",
    label: "Full White-labeling Customization",
    icon: <WhiteLabel />,
  },
  {
    id: "7",
    label: "Host Live Sessions & Coaching Across All Campuses",
    icon: <MdLiveTv />,
  },
]
