import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Markdown } from "../uiKit/Markdown/Markdown";
import { useEffect, useRef, useState } from "react";
import { BadgeAlert, BadgeCheck, Badge, Loader, CloudAlert, FlaskConical } from "lucide-react";
import { useTextAi } from "../Ai/useTextAi";
import { MODELS } from "@/common/ai";

interface UserMessageProps {
  message: string;
}
type MessageQuality = "loading" | "great" | "bad" | "error";

export const UserMessage = ({ message }: UserMessageProps) => {
  const [level, setLevel] = useState<MessageQuality>("loading");
  const [correctedMessage, setCorrectedMessage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [isShowDetails, setIsShowDetails] = useState(false);

  const textAi = useTextAi();
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
      const aiResult = await textAi.generate({
        systemMessage: `You are grammar checker system.
Student gives a message, your role is to analyze it from the grammar prospective.

Return your result in JSON format.
Structure of result: {
  "quality": "great" | "bad",
  "correctedMessage": string,
  "suggestion": string
}

quality - return "great" if message is correct, "bad" if there are mistakes
correctedMessage - return corrected message if quality is "bad"
suggestion: A direct message to the student explaining the corrections.

Return info in JSON format.
Do not wrap answer with any wrappers like "answer": "...". Your response will be sent to JSON.parse() function.
`,
        userMessage: message,
        model: MODELS.gpt_4o,
      });
      console.log("Analyze message result", aiResult);

      if (message !== messageAnalyzing.current) {
        return;
      }

      const parsedAiResult = JSON.parse(aiResult);
      if (parsedAiResult?.quality === "great") {
        setLevel("great");
      } else {
        setLevel("bad");
      }

      setCorrectedMessage(parsedAiResult?.correctedMessage || null);
      setDescription(parsedAiResult?.suggestion || null);
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
        borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
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
        You:
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
          <Markdown>{message || ""}</Markdown>
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
                    gap: "5px",
                    alignItems: "center",
                  }}
                >
                  <FlaskConical color="#fa8500" size={"14px"} />
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Analysis:
                  </Typography>
                </Stack>

                <Markdown>{description || "no info"}</Markdown>
              </Stack>
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
                    gap: "5px",
                    alignItems: "center",
                  }}
                >
                  <BadgeCheck color="#558fdb" size={"14px"} />
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Corrected version:
                  </Typography>
                </Stack>
                <Markdown>{correctedMessage || ""}</Markdown>
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
          {level === "loading" && (
            <Tooltip title="Checking quality...">
              <Loader size={"16px"} color="#c2c2c2" />
            </Tooltip>
          )}
          {level === "great" && (
            <Tooltip title="Great message. Nothing to correct">
              <BadgeCheck color="#558fdb" size={"22px"} />
            </Tooltip>
          )}
          {level === "bad" && (
            <Tooltip title="There are some mistakes in your message. Press to see them">
              <IconButton onClick={() => setIsShowDetails(!isShowDetails)}>
                <BadgeAlert color="#fa8500" size={"22px"} />
              </IconButton>
            </Tooltip>
          )}
          {level === "error" && (
            <Tooltip title="Unable to check message">
              <IconButton>
                <CloudAlert color="#c2c2c2" size={"22px"} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
