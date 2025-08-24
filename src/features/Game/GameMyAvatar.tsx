import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useGame } from "./useGame";
import { useState } from "react";
import { avatars, defaultAvatar } from "./avatars";
import { Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import { useWindowSizes } from "../Layout/useWindowSizes";

export const GameMyAvatar = () => {
  const game = useGame();
  const myAvatar = game.gameAvatars[game.myProfile?.username || ""] || defaultAvatar;
  const [isShowAvatarSelector, setIsShowAvatarSelector] = useState(false);
  const { i18n } = useLingui();
  const { topOffset } = useWindowSizes();

  return (
    <>
      {isShowAvatarSelector && (
        <CustomModal onClose={() => setIsShowAvatarSelector(false)} isOpen={isShowAvatarSelector}>
          <Stack
            sx={{
              paddingTop: `calc(${topOffset} + 0px)`,
            }}
          >
            <Typography variant="h6" align="center" sx={{ marginBottom: "20px" }}>
              {i18n._("Select your avatar")}
            </Typography>
            <Stack
              sx={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "20px",
                justifyContent: "center",
              }}
            >
              {avatars.map((avatar, index) => {
                const isSelected = avatar === myAvatar;
                return (
                  <Stack
                    key={index}
                    sx={{
                      img: {
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        boxShadow: isSelected
                          ? "0px 0px 0px 2px rgba(0, 0, 0, 1), 0px 0px 0px 5px rgba(255, 255, 255, 1)"
                          : "0px 0px 0px 3px rgba(55, 55, 55, 1)",
                        cursor: "pointer",
                        ":hover": {
                          boxShadow: "0px 0px 0px 3px rgba(255, 255, 255, 0.8)",
                        },
                      },
                    }}
                    onClick={() => {
                      game.setAvatar(avatar);
                      setIsShowAvatarSelector(false);
                    }}
                  >
                    <img src={avatar} />
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        </CustomModal>
      )}

      <Stack
        sx={{
          img: {
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: "0px 0px 0px 3px rgba(55, 55, 55, 1)",
            position: "relative",
            zIndex: 1,
          },
          position: "relative",
          cursor: "pointer",
        }}
        onClick={() => {
          setIsShowAvatarSelector(!isShowAvatarSelector);
        }}
      >
        <img src={myAvatar} />
      </Stack>
    </>
  );
};
