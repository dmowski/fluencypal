import { Typography, TypographyOwnProps } from "@mui/material";

export const PageLabel = (props: TypographyOwnProps) => {
  return (
    <Typography
      component={"p"}
      align="center"
      sx={{
        fontWeight: 500,
        fontSize: "18px",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: "28px",
        padding: "6px 42px",
        marginBottom: "10px",
        "@media (max-width: 600px)": {
          width: "max-content",
          textAlign: "left",
          padding: "6px 12px",
          //borderRadius: "10px",
          fontSize: "14px",
        },
      }}
    >
      {props.children}
    </Typography>
  );
};

export const PageLabel2 = (props: TypographyOwnProps) => {
  return (
    <Typography
      component={"p"}
      align="center"
      sx={{
        fontWeight: 500,
        fontSize: "18px",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: "28px",
        padding: "6px 42px",
        marginBottom: "10px",
        "@media (max-width: 600px)": {
          width: "max-content",
          textAlign: "left",
          padding: "6px 12px",
          //borderRadius: "10px",
          fontSize: "14px",
        },
      }}
    >
      {props.children}
    </Typography>
  );
};

export const H1 = ({ children }: { children: string }) => {
  return (
    <Typography
      variant="h1"
      align="center"
      sx={{
        fontWeight: 800,
        fontSize: "96px",
        lineHeight: "110%",
        width: "100%",
        "@media (max-width: 600px)": {
          fontSize: "34px",
          textAlign: "left",
        },
      }}
    >
      {children}
    </Typography>
  );
};

export const H1SubTitle = (props: TypographyOwnProps) => {
  return (
    <Typography
      variant="body1"
      align="center"
      sx={{
        fontWeight: 400,
        fontSize: "24px",
        maxWidth: "800px",
        "@media (max-width: 600px)": {
          fontSize: "18px",
          textAlign: "left",
        },
      }}
    >
      {props.children}
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
        width: "100%",

        "@media (max-width: 600px)": {
          fontSize: "30px",
          textAlign: "left",
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
    <Typography
      variant="body1"
      sx={{
        opacity: 0.8,
        fontSize: "18px",
        maxWidth: "700px",
        //textAlign: "center",
        width: "100%",
        "@media (max-width: 600px)": {
          textAlign: "left",
        },
      }}
      align="center"
      {...props}
    >
      {props.children}
    </Typography>
  );
};
