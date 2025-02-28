import { Stack, Typography } from "@mui/material";
import { ProductVideo } from "./ProductVideo";

export const ProductDemo = () => {
  return (
    <Stack
      sx={{
        width: "100%",
        padding: "100px 0 120px 0",
        alignItems: "center",
        justifyContent: "center",
        gap: "100px",
        backgroundColor: `rgb(255, 253, 249, 1)`,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
        color: "#000",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          alignItems: "center",
          gap: "50px",
          maxWidth: "1200px",
          boxSizing: "border-box",
          padding: "0 10px",
        }}
      >
        <Stack
          sx={{
            gap: "50px",
            width: "100%",

            padding: "0 10px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack
            sx={{
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <Typography
              sx={{
                textTransform: "uppercase",
              }}
            >
              Product Demo
            </Typography>
            <Typography
              variant="h3"
              component={"h2"}
              sx={{
                fontWeight: 700,
              }}
            >
              Watch Dark Lang in Action
            </Typography>
          </Stack>
          <ProductVideo />
        </Stack>
      </Stack>
    </Stack>
  );
};
