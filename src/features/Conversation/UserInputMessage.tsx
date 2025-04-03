import { Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { BadgeAlert, FlaskConical } from "lucide-react";
import { StringDiff } from "react-string-diff";

interface UserInputMessageProps {
  message: string;
  analyzeUserMessage: (message: string) => Promise<{
    sourceMessage: string;
    correctedMessage: string;
    description: string;
  }>;
  balanceHours: number;
}
type MessageQuality = "loading" | "great" | "bad" | "error";

export const UserInputMessage = ({
  message,
  analyzeUserMessage,
  balanceHours,
}: UserInputMessageProps) => {
  const [level, setLevel] = useState<MessageQuality>("loading");
  const [correctedMessage, setCorrectedMessage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  const messageAnalyzing = useRef("");

  const analyzeMessage = async () => {
    if (message === messageAnalyzing.current) {
      return;
    }

    messageAnalyzing.current = message;

    setLevel("loading");
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

  const isLowBalance = balanceHours < 0.01;

  useEffect(() => {
    if (isLowBalance) {
      setLevel("loading");
      setDescription(null);
      setCorrectedMessage(null);
      return;
    }

    if (message) {
      analyzeMessage();
    }
  }, [message, isLowBalance]);

  const isNeedToShowCorrection = level === "bad" && description && correctedMessage?.trim();

  return (
    <Stack
      sx={{
        gap: "10px",
        paddingBottom: "10px",
      }}
    >
      <Stack>
        <Typography
          variant="caption"
          sx={{
            opacity: 0.7,
          }}
        >
          Your Message
        </Typography>
        <Typography>{message}</Typography>
      </Stack>

      {isNeedToShowCorrection && (
        <Stack>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.7,
            }}
          >
            Your Corrected Message:
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
                      display: "none",
                    },
                    default: {},
                  }}
                  oldValue={message || ""}
                  newValue={correctedMessage || message || ""}
                />
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      )}

      <Stack>
        <Typography
          variant="caption"
          sx={{
            opacity: 0.7,
          }}
        >
          Review:
        </Typography>
        <Stack
          sx={{
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <Typography sx={{}}>{description || "Everything is great!"}</Typography>
          {isNeedToShowCorrection ? (
            <FlaskConical color="#fa8500" size={"14px"} />
          ) : (
            <BadgeAlert color="#81e381" size={"14px"} />
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
