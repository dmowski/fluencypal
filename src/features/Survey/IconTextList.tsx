"use client";
import { Link, Stack, Typography } from "@mui/material";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export interface ListItem {
  title: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  href?: string;
}

export const IconTextList = ({ listItems, gap }: { listItems: ListItem[]; gap?: string }) => {
  return (
    <Stack
      sx={{
        gap: gap || "18px",
        width: "100%",
      }}
    >
      {listItems.map((item, index) => (
        <Stack
          key={index}
          sx={{
            flexDirection: "row",
            gap: "15px",
            alignItems: "center",
            width: "100%",
          }}
        >
          <item.icon
            style={{
              opacity: 0.7,
            }}
            size={18}
          />
          <Typography
            variant="body2"
            target={item.href ? "_blank" : undefined}
            component={item.href ? Link : "div"}
            href={item.href}
          >
            {item.title}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
};
