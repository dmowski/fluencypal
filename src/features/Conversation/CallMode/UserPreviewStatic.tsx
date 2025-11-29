import { Avatar, Stack } from "@mui/material";

export const UserPreviewStatic = ({ bgUrl, avatarUrl }: { bgUrl: string; avatarUrl: string }) => {
  return (
    <>
      <Stack
        sx={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          background: `url('${bgUrl}')`,
          backgroundSize: "cover",
          opacity: 0.57,
        }}
      ></Stack>

      <Stack
        sx={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack
          sx={{
            borderRadius: "50%",
            overflow: "hidden",
            padding: "0",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
          }}
        >
          <Avatar
            alt={""}
            src={avatarUrl}
            sx={{
              width: "110px",
              height: "110px",
              borderRadius: "50%",
              fontSize: "10px",
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};
