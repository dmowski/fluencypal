import { Button, Chip, Stack, Typography } from "@mui/material";

export interface TechStackSectionProps {
  id: string;
  title: string;
  subTitle: string;
  techItems: string[];
  buttonTitle?: string;
  buttonHref?: string;
}

/** Interview Landing – Tech Stack Covered */
export const TechStackSection = (props: TechStackSectionProps) => {
  return (
    <Stack
      id={props.id}
      sx={{
        padding: "150px 0",
        alignItems: "center",
        "@media (max-width: 600px)": {
          paddingTop: "100px",
        },
        width: "100%",
      }}
    >
      <Stack
        sx={{
          maxWidth: "1200px",
          width: "100%",
          gap: "24px",
          padding: "0 10px",
        }}
      >
        <Stack
          sx={{
            alignItems: "center",
            gap: "10px",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: "42px",
              "@media (min-width: 900px)": {
                fontSize: "56px",
              },
            }}
          >
            {props.title}
          </Typography>

          <Typography variant="body1" sx={{ opacity: 0.8, fontSize: "18px", maxWidth: "700px" }}>
            {props.subTitle}
          </Typography>
        </Stack>

        <Stack
          sx={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center",
            marginTop: "26px",
          }}
        >
          {props.techItems.map((item, index) => (
            <Chip
              key={index}
              label={item}
              sx={{
                borderRadius: "999px",
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: "13px",
                padding: "3px 2px",
              }}
            />
          ))}
        </Stack>

        {props.buttonTitle && props.buttonHref && (
          <Stack alignItems="center">
            <Button
              href={props.buttonHref}
              variant="contained"
              size="large"
              color="info"
              sx={{
                marginTop: "32px",
                borderRadius: "48px",
                fontSize: "16px",
              }}
            >
              {props.buttonTitle}
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
