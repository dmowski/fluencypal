import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useGame } from "./useGame";
import { avatars, defaultAvatar } from "./avatars";
import { Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import { useUrlParam } from "../Url/useUrlParam";

export const GameMyAvatar = () => {
  const game = useGame();
  const myAvatar = game.gameAvatars[game.myProfile?.username || ""] || defaultAvatar;
  const [isShowAvatarSelector, setIsShowAvatarSelector] = useUrlParam("showAvatarSelector");
  const { i18n } = useLingui();

  return (
    <>
      {isShowAvatarSelector && (
        <CustomModal onClose={() => setIsShowAvatarSelector(false)} isOpen={isShowAvatarSelector}>
          <Stack
            sx={{
              gap: "30px",
              width: "100%",
              maxWidth: "600px",
              "@media (max-width: 600px)": {
                padding: "15px",
              },
            }}
          >
            <Typography variant="h5" component="h2">
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
