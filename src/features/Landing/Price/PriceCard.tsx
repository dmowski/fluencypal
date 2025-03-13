import { Button, Stack, Tooltip, Typography } from "@mui/material";
import { buttonStyle } from "../landingSettings";
import { Check, Info } from "lucide-react";

interface PriceCardProps {
  title: string;
  subTitle: string;
  price: string;
  priceDescription: string;

  listTitle: string;
  listItems: {
    title: string;
    tooltip?: string;
  }[];
  buttonTitle: string;
  buttonLink: string;
  isLightButton?: boolean;
}

export const PriceCard: React.FC<PriceCardProps> = ({
  title,
  subTitle,
  price,
  priceDescription,
  listTitle,
  listItems,
  buttonTitle,
  buttonLink,
  isLightButton,
}) => {
  return (
    <Stack
      sx={{
        border: `1px solid rgba(0, 0, 0, 0.2)`,
        padding: "25px",
        gap: "20px",
        height: "100%",
        boxSizing: "border-box",
        borderRadius: "3px",
        width: "100%",
        maxWidth: "90vw",
        transition: "box-shadow 0.1s",
        ":hover": {
          border: `1px solid rgba(0, 0, 0, 0.4)`,
          boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <Stack
        sx={{
          height: "100px",
          "@media (max-width: 1000px)": {
            height: "auto",
            paddingBottom: "20px",
          },
        }}
      >
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "1.5rem",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            opacity: 0.7,
          }}
        >
          {subTitle}
        </Typography>
      </Stack>

      <Stack
        sx={{
          height: "100px",
          gap: "5px",
          "@media (max-width: 1000px)": {
            height: "auto",
            paddingBottom: "15px",
          },
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "1.5rem",
          }}
        >
          {price}
        </Typography>
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 350,
            opacity: 0.8,
          }}
        >
          {priceDescription}
        </Typography>
      </Stack>

      <Stack
        sx={{
          height: "auto",
          "@media (max-width: 1000px)": {
            alignItems: "flex-start",
          },
        }}
      >
        <Button
          href={buttonLink}
          sx={{
            ...buttonStyle,
            backgroundColor: isLightButton ? "transparent" : "#1f74be",
            color: isLightButton ? "#444" : "#fff",
            borderColor: isLightButton ? "#666" : "#1f74be",
            borderWidth: "1px",
          }}
          variant={isLightButton ? "outlined" : "contained"}
        >
          {buttonTitle}
        </Button>
      </Stack>

      <Stack gap={"12px"}>
        <Typography
          sx={{
            fontWeight: 700,
          }}
        >
          {listTitle}
        </Typography>

        <Stack gap="10px">
          {listItems.map((item) => {
            return (
              <Stack
                key={item.title}
                sx={{
                  flexDirection: "row",
                  gap: "5px",
                  alignItems: "center",
                }}
              >
                <Check color={"#1f74be"} size={"1.2rem"} strokeWidth={"3px"} />
                <Typography>{item.title}</Typography>
                {item.tooltip && (
                  <>
                    <Tooltip title={item.tooltip} arrow color="primary">
                      <Info size={"16px"} color="#111" />
                    </Tooltip>
                  </>
                )}
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};
