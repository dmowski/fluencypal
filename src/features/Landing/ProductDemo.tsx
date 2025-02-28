import { Stack, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
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
          <Stack
            component={"button"}
            sx={{
              width: "100%",
              aspectRatio: "16/9",
              backgroundColor: "transparent",
              background: `url("/previewProductDemo.png")`,
              backgroundSize: "cover",
              border: "none",
              backgroundPosition: "center",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              ":hover, :focus": {
                ".playButton": {
                  transform: "scale(0.94)",
                  opacity: 1,
                },
              },
            }}
          >
            <Stack
              className="playButton"
              sx={{
                borderRadius: "200px",
                backgroundColor: `rgba(5, 172, 255, 1)`,
                opacity: 0.9,
                width: "130px",
                aspectRatio: "1/1",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              <PlayArrowIcon
                sx={{
                  color: "#fff",
                  fontSize: "90px",
                }}
              />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
