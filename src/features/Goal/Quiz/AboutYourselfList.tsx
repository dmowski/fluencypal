"use client";

import { useLingui } from "@lingui/react";
import { GraduationCap, Guitar, Music, Plane } from "lucide-react";
import { IconTextList, ListItem } from "../../Survey/IconTextList";

export const AboutYourselfList: React.FC = () => {
  const { i18n } = useLingui();

  const listItems: ListItem[] = [
    {
      title: i18n._("Hobbies or interests"),
      icon: Guitar,
    },
    {
      title: i18n._("Main goal in learning"),
      icon: GraduationCap,
    },
    {
      title: i18n._("Do you have any travel plans?"),
      icon: Plane,
    },
    {
      title: i18n._("Movies, books, or music"),
      icon: Music,
    },
  ];

  return <IconTextList listItems={listItems} />;
};
