import { IconButton, Stack, Typography } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

type AliasGamePanelUIProps = {
  wordsUserToDescribe: string[];
  wordsAiToDescribe: string[];
  describedByUserWords: string[];
  describedByAiWords: string[];
  usersMarkedWords: Record<string, boolean | undefined>;
  setUsersMarkedWords: React.Dispatch<React.SetStateAction<Record<string, boolean | undefined>>>;
};

export const AliasGamePanelUI = ({
  wordsUserToDescribe,
  wordsAiToDescribe,
  describedByUserWords,
  describedByAiWords,
  usersMarkedWords,
  setUsersMarkedWords,
}: AliasGamePanelUIProps) => {
  return (
    <Stack
      sx={{
        gap: "20px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "4px",
        padding: "10px",
      }}
    >
      {/* Words to Describe */}
      <Stack sx={{ flexDirection: "column", gap: "10px" }}>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          To describe:
        </Typography>
        <Stack sx={{ flexDirection: "row", gap: "5px", flexWrap: "wrap" }}>
          {wordsUserToDescribe.map((word, index, list) => {
            const trimWord = word.trim().toLowerCase();
            const isDescribed = describedByUserWords.includes(trimWord);
            const isMarkedByUser = usersMarkedWords[trimWord] === true;
            const isUnmarkedByUser = usersMarkedWords[trimWord] === false;
            const isDone = (isDescribed && !isUnmarkedByUser) || isMarkedByUser;
            const isLast = index === list.length - 1;

            return (
              <Typography
                variant="h4"
                className="decor-text"
                key={index}
                sx={{
                  textDecoration: isDone ? "line-through" : "none",
                  opacity: isDone ? 0.3 : 1,
                  borderRadius: "4px",
                  padding: "2px 10px 2px 0px",
                  textTransform: "capitalize",
                }}
              >
                <IconButton
                  size="small"
                  onClick={() =>
                    setUsersMarkedWords((prev) => ({
                      ...prev,
                      [trimWord]: !prev[trimWord],
                    }))
                  }
                >
                  {isDone ? (
                    <CheckBoxIcon fontSize="small" />
                  ) : (
                    <CheckBoxOutlineBlankIcon fontSize="small" />
                  )}
                </IconButton>
                {trimWord}
                {isLast ? "" : ","}
              </Typography>
            );
          })}
        </Stack>
      </Stack>

      {/* Words to Guess */}
      <Stack sx={{ flexDirection: "column", gap: "10px" }}>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          To guess:
        </Typography>
        <Stack sx={{ flexDirection: "row", gap: "5px", flexWrap: "wrap" }}>
          {wordsAiToDescribe.map((word, index, arr) => {
            const trimWord = word.trim().toLowerCase();
            const isGuessed = describedByAiWords.includes(trimWord);
            const isLast = index === arr.length - 1;

            return (
              <Typography
                variant="h4"
                className="decor-text"
                key={index}
                sx={{
                  opacity: isGuessed ? 1 : 0.3,
                  textTransform: "capitalize",
                }}
              >
                {isGuessed ? word : "*".repeat(word.length)}
                {isLast ? "" : ","}
              </Typography>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};
