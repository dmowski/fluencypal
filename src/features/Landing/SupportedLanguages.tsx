import { Button, Stack, Typography } from "@mui/material";
import {
  emojiLanguageName,
  fullEnglishLanguageName,
  supportedLanguages,
} from "@/features/Lang/lang";

export const SupportedLanguages = () => {
  return (
    <Stack
      sx={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px 0 80px 0",
        backgroundColor: "#070f1a",
        marginTop: "50px",
        position: "relative",
        zIndex: 1,
        gap: "40px",
      }}
    >
      <Stack
        gap={"5px"}
        sx={{
          padding: "0 30px ",
          boxSizing: "border-box",
        }}
      >
        <Typography variant="h2" align="center">
          Languages
        </Typography>
        <Typography
          variant="body2"
          align="center"
          sx={{
            opacity: 0.8,
          }}
        >
          Learning languages is fun and easy with our AI tutor. Choose from 20+ languages to start
          practicing today.
        </Typography>
      </Stack>
      <Stack
        sx={{
          flexDirection: "row",
          gap: "40px 20px",
          maxWidth: "1300px",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 30px",
          boxSizing: "border-box",
        }}
      >
        {supportedLanguages.map((lang) => {
          return (
            <Stack
              key={lang}
              sx={{
                gap: "0px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "70px",
                  lineHeight: "1",
                }}
                align="center"
              >
                {emojiLanguageName[lang]}
              </Typography>
              <Typography align="center" variant="body2">
                {fullEnglishLanguageName[lang]}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
      <Button href="/practice" variant="contained">
        Start practicing
      </Button>
    </Stack>
  );
};
