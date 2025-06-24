import { IconButton, Stack, TextField, Typography } from "@mui/material";
import { useGame } from "./useGame";
import { useLingui } from "@lingui/react";
import { useEffect, useState } from "react";
import { CheckIcon, PencilIcon } from "lucide-react";
import { Trans } from "@lingui/react/macro";

export const GameMyUsername = () => {
  const game = useGame();
  const { i18n } = useLingui();

  const [isEditUsername, setIsEditUsername] = useState(false);
  const [internalUsername, setInternalUsername] = useState(game.myProfile?.username || "");
  useEffect(() => {
    if (game.myProfile?.username) {
      setInternalUsername(game.myProfile.username);
    }
  }, [game.myProfile?.username]);

  const saveUsername = async () => {
    const internalUsernameTrimmed = internalUsername.trim().replaceAll(/\s+/g, " ");
    if (internalUsernameTrimmed.length < 3) {
      alert(i18n._(`Username must be at least 3 characters long.`));
      return;
    }
    setIsEditUsername(false);
    await game.updateUsername(internalUsernameTrimmed);
  };

  return (
    <Stack>
      <Typography
        variant="caption"
        sx={{
          opacity: 0.8,
        }}
      >
        <Trans>Your Username:</Trans>
      </Typography>
      <Stack
        sx={{
          flexDirection: "row",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {isEditUsername ? (
          <>
            <TextField
              variant="outlined"
              size="small"
              value={internalUsername}
              onChange={(e) => setInternalUsername(e.target.value)}
              sx={{ width: "220px" }}
            />
            <IconButton onClick={() => saveUsername()} disabled={internalUsername.length < 3}>
              <CheckIcon size={"18px"} />
            </IconButton>
          </>
        ) : (
          <>
            <Typography variant="h6">{game.myProfile?.username || "-"} </Typography>
            <IconButton
              disabled={game.loadingProfile}
              size="small"
              onClick={() => setIsEditUsername(!isEditUsername)}
            >
              <PencilIcon size={"11px"} />
            </IconButton>
          </>
        )}
      </Stack>
    </Stack>
  );
};
