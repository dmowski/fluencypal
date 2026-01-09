import { Button, ButtonGroup, Stack } from "@mui/material";
import { ChatSection } from "./ChatSection";
import { ChatProvider } from "./useChat";
import { useState } from "react";
import { useLingui } from "@lingui/react";
import { Globe, HatGlasses } from "lucide-react";

export const ChatPage = () => {
  const { i18n } = useLingui();

  const [page, setPage] = useState<"public" | "private">("public");

  return (
    <Stack>
      <Stack
        sx={{
          padding: "10px 2px",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          gap: "10px",
          "@media (max-width: 600px)": {
            border: "none",
          },
        }}
      >
        <ButtonGroup>
          <Button
            size="small"
            startIcon={<Globe size={"14px"} />}
            variant={page === "public" ? "contained" : "outlined"}
            onClick={() => setPage("public")}
          >
            {i18n._("Public")}
          </Button>
          <Button
            startIcon={<HatGlasses size={"14px"} />}
            variant={page === "private" ? "contained" : "outlined"}
            onClick={() => setPage("private")}
          >
            {i18n._("Private")}
          </Button>
        </ButtonGroup>
      </Stack>

      {page === "public" ? (
        <ChatProvider
          metadata={{
            space: "global",
            allowedUserIds: null,
            isPrivate: false,
          }}
        >
          <ChatSection />
        </ChatProvider>
      ) : (
        <></>
      )}
    </Stack>
  );
};
