"use client";

import { useLingui } from "@lingui/react";
import { IconTextList, ListItem } from "../../Survey/IconTextList";

export const AboutYourselfList: React.FC = () => {
  const { i18n } = useLingui();

  const listItems: ListItem[] = [
    {
      title: i18n._("Hobbies or interests"),
      iconName: "guitar",
    },
    {
      title: i18n._("Main goal in learning"),
      iconName: "graduation-cap",
    },
    {
      title: i18n._("Do you have any travel plans?"),
      iconName: "plane",
    },
    {
      title: i18n._("Movies, books, or music"),
      iconName: "music",
    },
  ];

  return <IconTextList listItems={listItems} />;
};
