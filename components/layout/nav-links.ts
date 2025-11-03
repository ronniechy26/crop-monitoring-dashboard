import { LayoutDashboard, Sprout, Carrot } from "lucide-react";

export const navigationLinks = [
  {
    href: "/",
    label: "Overview",
    description: "Monitoring pulse",
    icon: LayoutDashboard,
  },
  {
    href: "/corn",
    label: "Corn",
    description: "Fields & insights",
    icon: Sprout,
  },
  {
    href: "/onion",
    label: "Onion",
    description: "Irrigation health",
    icon: Carrot,
  },
] as const;

export type NavigationLink = (typeof navigationLinks)[number];
