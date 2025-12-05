import { Typography, TypographyOwnProps } from "@mui/material";

export const H1 = ({ children }: { children: string }) => {
  return (
    <Typography
      variant="h1"
      align="center"
      sx={{
        fontWeight: 800,
        fontSize: "96px",
        lineHeight: "110%",
        "@media (max-width: 600px)": {
          fontSize: "34px",
        },
      }}
    >
      {children}
    </Typography>
  );
};

export const H2 = (props: TypographyOwnProps) => {
  return (
    <Typography
      variant="h2"
      align="center"
      sx={{
        fontWeight: 800,
        fontSize: "86px",

        "@media (max-width: 600px)": {
          fontSize: "30px",
        },
      }}
      {...props}
    >
      {props.children}
    </Typography>
  );
};

export const SubTitle = (props: TypographyOwnProps) => {
  return (
    <Typography variant="body1" sx={{ opacity: 0.8, fontSize: "18px", maxWidth: "700px" }}>
      {props.children}
    </Typography>
  );
};
