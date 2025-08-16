import { Stack, Tooltip, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { BadgeAlert, FlaskConical } from "lucide-react";
import { StringDiff } from "react-string-diff";

interface UserMessageProps {
  message: string;
  analyzeUserMessage: (message: string) => Promise<{
    sourceMessage: string;
    correctedMessage: string;
    description: string;
  }>;
}
type MessageQuality = "loading" | "great" | "bad" | "error";

export const UserMessage = ({ message, analyzeUserMessage }: UserMessageProps) => {
  const [level, setLevel] = useState<MessageQuality>("loading");
  const [correctedMessage, setCorrectedMessage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [isShowDetails, setIsShowDetails] = useState(false);

  const messageAnalyzing = useRef("");

  const analyzeMessage = async () => {
    if (message === messageAnalyzing.current) {
      return;
    }

    messageAnalyzing.current = message;

    setLevel("loading");
    setIsShowDetails(false);
    setDescription(null);
    setCorrectedMessage(null);
    try {
      const { sourceMessage, correctedMessage, description } = await analyzeUserMessage(message);
      if (message !== sourceMessage) {
        return;
      }

      setLevel(
        correctedMessage.toLowerCase().trim() === sourceMessage.toLowerCase().trim() ||
          !correctedMessage.trim()
          ? "great"
          : "bad"
      );

      setCorrectedMessage(correctedMessage || null);
      setDescription(description || null);
    } catch (error) {
      setLevel("error");
      throw error;
    }
  };

  useEffect(() => {
    if (message) {
      analyzeMessage();
    }
  }, [message]);

  return (
    <Stack
      sx={{
        paddingBottom: "5px",
        opacity: 0.9,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          opacity: 0.5,
        }}
      >
        Your Message:
      </Typography>
      <Stack
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            gap: "5px",
          }}
        >
          <Typography
            variant="body2"
            component={"div"}
            sx={{
              fontWeight: 400,
              fontSize: "20px",
            }}
          >
            <StringDiff
              styles={{
                added: {
                  color: "#81e381",
                  fontWeight: 600,
                },
                removed: {
                  textDecoration: "line-through",
                  opacity: 0.5,
                  display: "none",
                },
                default: {},
              }}
              oldValue={message || ""}
              newValue={correctedMessage || message || ""}
            />
          </Typography>
          {isShowDetails && (
            <>
              <Stack
                sx={{
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  padding: "10px",
                  borderRadius: "5px",
                  gap: "10px",
                }}
              >
                <Stack
                  sx={{
                    flexDirection: "row",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <FlaskConical color="#fa8500" size={"14px"} />
                  <Typography>{description || "no info"}</Typography>
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
        <Stack
          sx={{
            padding: "5px",
            height: "20px",
            width: "20px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {level === "bad" && description && correctedMessage?.trim() && (
            <Tooltip
              title={
                <Typography
                  sx={{
                    fontSize: "20px",
                    lineHeight: "1.5",
                    padding: "10px",
                  }}
                >
                  {description || "There are some mistakes in your message. Press to see them"}
                </Typography>
              }
              placement="top"
              arrow
            >
              <Stack
                sx={{
                  padding: "10px 15px",
                }}
              >
                <BadgeAlert color="#fa8500" size={"22px"} />
              </Stack>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
