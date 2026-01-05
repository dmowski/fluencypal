import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useGame } from "./useGame";
import { avatars } from "./avatars";
import { Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import { useUrlParam } from "../Url/useUrlParam";
import { useAuth } from "../Auth/useAuth";
import { Avatar } from "./Avatar";

export const GameMyAvatar = ({ avatarSize }: { avatarSize?: string }) => {
  const game = useGame();
  const [isShowAvatarSelector, setIsShowAvatarSelector] = useUrlParam("showAvatarSelector");
  const { i18n } = useLingui();
  const auth = useAuth();
  const myAuthAvatar = auth.userInfo?.photoURL;

  return (
    <>
      {isShowAvatarSelector && (
        <CustomModal onClose={() => setIsShowAvatarSelector(false)} isOpen={isShowAvatarSelector}>
          <Stack
            sx={{
              gap: "30px",
              width: "100%",
              maxWidth: "600px",
            }}
          >
            <Stack>
              <Typography variant="h5" component="h2" align="center">
                {i18n._("Avatar")}
              </Typography>
              <Typography
                align="center"
                variant="caption"
                sx={{
                  opacity: 0.7,
                }}
              >
                {i18n._("Select your game avatar")}
              </Typography>
            </Stack>

            <Stack
              sx={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "20px",
                justifyContent: "center",
              }}
            >
              {[myAuthAvatar || "", ...avatars].filter(Boolean).map((avatar, index) => {
                const isSelected = avatar === game.myAvatar;
                return (
                  <Stack
                    key={index}
                    sx={{
                      cursor: "pointer",
                    }}
                  >
                    <Avatar
                      url={avatar}
                      avatarSize="80px"
                      isSelected={isSelected}
                      onClick={() => {
                        game.setAvatar(avatar);
                        setIsShowAvatarSelector(false);
                      }}
                    />
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        </CustomModal>
      )}

      <Avatar
        avatarSize={avatarSize || "90px"}
        url={game.myAvatar}
        onClick={() => setIsShowAvatarSelector(true)}
      />
    </>
  );
};
