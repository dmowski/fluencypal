import { Button, Stack, Tooltip, Typography } from "@mui/material";
import { buttonStyle } from "../landingSettings";
import { Check, Info, LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, JSX, RefAttributes } from "react";

interface PriceCardProps {
  title: string;
  subTitle: string;
  price: JSX.Element;
  priceSubDescription?: string;

  listTitle: string;
  listItems: {
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
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
  listTitle,
  listItems,
  buttonTitle,
  buttonLink,
  isLightButton,
  priceSubDescription,
}) => {
  return (
    <Stack
      sx={{
        border: `1px solid rgba(0, 0, 0, 0.15)`,
        padding: "30px 25px",
        backgroundColor: "#fff",
        gap: "20px",
        height: "100%",
        boxSizing: "border-box",
        borderRadius: "18px",
        width: "100%",
        maxWidth: "90vw",
        transition: "all 0.3s",
        ":hover": {
          borderColor: `rgba(0, 0, 0, 0.2)`,
          boxShadow: "2px 3px 20px rgba(0, 0, 0, 0.07)",
        },
      }}
    >
      <Stack
        sx={{
          height: "50px",
          "@media (max-width: 1000px)": {
            height: "auto",
            paddingBottom: "20px",
          },
        }}
      >
        <Typography
          sx={{
            fontWeight: 550,
            fontSize: "1.5rem",
          }}
        >
          {title}
        </Typography>
      </Stack>

      <Stack
        sx={{
          height: "120px",
          gap: "5px",

          "@media (max-width: 1000px)": {
            height: "auto",
            paddingBottom: "15px",
          },
        }}
      >
        {price}

        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 350,
            color: "#000",
          }}
        >
          {priceSubDescription}
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
        <Stack
          gap="15px"
          sx={{
            paddingBottom: "40px",
            paddingTop: "10px",
            paddingLeft: "3px",
          }}
        >
          {listItems.map((item) => {
            return (
              <Stack
                key={item.title}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "23px 1fr",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <item.icon
                  color={"#1f74be"}
                  size={"1rem"}
                  strokeWidth={"1.6px"}
                />
                <Typography>{item.title}</Typography>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};
