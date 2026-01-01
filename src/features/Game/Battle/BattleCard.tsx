import { useLingui } from "@lingui/react";
import { Stack, Typography } from "@mui/material";
import { useBattle } from "./useBattle";

export const BattleCard = ({ userId }: { userId?: string }) => {
  const { i18n } = useLingui();
  const battles = useBattle();

  const battlesToShow = battles.battles.filter((battle) => {
    if (userId) {
      return battle.usersIds.includes(userId);
    }
    return true;
  });

  if (battlesToShow.length === 0) {
    return null;
  }

  return (
    <Stack
      sx={{
        padding: "21px 20px 24px 20px",
        color: "#fff",
        textDecoration: "none",
        maxWidth: "700px",
        borderRadius: "8px",
        width: "100%",
        height: "auto",

        background: "rgba(115, 25, 35, 1)",
        boxShadow: "0px 0px 0px 1px rgba(255, 255, 255, 0.2)",
        flexDirection: "row",
        transition: "all 0.3s ease",
        gap: "20px",
        alignItems: "center",
        boxSizing: "border-box",
        display: "grid",
        minHeight: "120px",
        gridTemplateColumns: "1fr",
      }}
    >
      <Stack
        sx={{
          width: "100%",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
            color: "#feb985ff",
          }}
        >
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <img
              src="/icons/flame-icon.svg"
              style={{ width: 20, height: 20, position: "relative", top: "-2px", left: "-1px" }}
            />
            <Typography
              variant="body2"
              sx={{
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              {i18n._("Alex asks you to debate")}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{
              color: "#faae98",
            }}
          >
            Debates
          </Typography>
        </Stack>

        <Typography
          sx={{
            paddingTop: "10px",
            fontSize: "1.7rem",
            fontWeight: 560,
            lineHeight: 1.2,
            "@media (max-width:600px)": {
              fontSize: "1.5rem",
            },
          }}
        >
          {i18n._("Win 20 game points by debating with Alex on the topic")}
        </Typography>
      </Stack>
    </Stack>
  );
};
