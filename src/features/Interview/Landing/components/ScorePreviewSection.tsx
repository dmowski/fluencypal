import { Button, Stack, Typography } from "@mui/material";
import { BadgeCheck } from "lucide-react";

export interface ScoreMetric {
  title: string;
  score: number;
}

export interface ScorePreview {
  totalScore: number;
  label: string;
  description: string;
  scoreMetrics: ScoreMetric[];
}

export interface ScorePreviewSectionProps {
  id: string;
  title: string;
  subTitle: string;
  infoList: string[];
  buttonTitle: string;
  buttonHref: string;
  scorePreview: ScorePreview;
}

const scoreColors: string[] = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];

/** Interview Landing Score Preview Section */
export const ScorePreviewSection = (props: ScorePreviewSectionProps) => {
  return (
    <Stack
      id={props.id}
      sx={{
        padding: "150px 0",
        alignItems: "center",
        width: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
      }}
    >
      <Stack
        sx={{
          maxWidth: "1400px",
          width: "100%",
          gap: "15px",
          padding: "0 10px",
          alignItems: "center",
        }}
      >
        <Stack
          sx={{
            display: "grid",
            gridTemplateColumns: `4fr 3fr`,
            alignItems: "center",
            gap: "100px",
            width: "100%",
          }}
        >
          <Stack
            sx={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Stack
              sx={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "30px",
                width: "100%",
                borderRadius: "16px",
                "&::before": {
                  content: '""',
                  display: "block",
                  background:
                    "linear-gradient(90deg, hsla(197, 100%, 64%, 1) 0%, hsla(339, 100%, 55%, 1) 100%)",
                  height: "100%",
                  width: "100%",
                  position: "absolute",
                  animation: "rotate 4s linear infinite",
                  zIndex: 0,
                  filter: "blur(1px)",
                },
                "@keyframes rotate": {
                  from: {
                    transform: "rotate(0deg) scale(1.9)",
                  },
                  to: {
                    transform: "rotate(360deg) scale(1.9)",
                  },
                },
              }}
            >
              <Stack
                sx={{
                  position: "relative",
                  zIndex: 1,
                  width: "100%",
                  padding: "40px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(34, 34, 34, 1)",
                  boxShadow: "2px 4px 6px rgba(0, 0, 0, 0.2)",
                  gap: "20px",
                }}
              >
                <Typography
                  variant="h5"
                  component={"span"}
                  sx={{
                    fontWeight: 600,
                    color: "#fff",
                    fontSize: "16px",
                  }}
                >
                  {props.scorePreview.label}
                </Typography>
                <Typography
                  variant="h2"
                  component={"span"}
                  sx={{
                    fontWeight: 600,
                    fontSize: "48px",
                  }}
                >
                  {props.scorePreview.totalScore}%
                </Typography>
                <Typography variant="body1">{props.scorePreview.description}</Typography>
                <Stack
                  sx={{
                    width: "100%",
                    borderTop: "1px solid rgba(229, 231, 235, 0.4)",
                  }}
                />

                <Stack
                  sx={{
                    gap: "10px",
                  }}
                >
                  {props.scorePreview.scoreMetrics.map((metric, index) => (
                    <Stack key={index}>
                      <Stack
                        key={index}
                        sx={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body1">{metric.title}</Typography>
                        <Typography variant="body1">{metric.score}%</Typography>
                      </Stack>
                      <Stack
                        sx={{
                          width: "100%",
                          height: "11px",
                          backgroundColor: "rgba(229, 231, 235, 0.3)",
                          borderRadius: "14px",
                          overflow: "hidden",
                          marginTop: "8px",
                          marginBottom: "16px",
                        }}
                      >
                        <Stack
                          sx={{
                            width: `${metric.score}%`,
                            height: "100%",
                            backgroundColor: scoreColors[index % scoreColors.length],
                            borderRadius: "14px",
                          }}
                        />
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            sx={{
              gap: "10px",
              alignItems: "flex-start",
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                fontSize: "42px",
              }}
            >
              {props.title}
            </Typography>

            <Typography variant="body1" sx={{ opacity: 0.8, fontSize: "20px" }}>
              {props.subTitle}
            </Typography>

            <Stack
              sx={{
                marginTop: "30px",
                gap: "20px",
                maxWidth: "550px",
              }}
            >
              {props.infoList.map((info, index) => (
                <Stack
                  key={index}
                  sx={{
                    flexDirection: "row",
                    gap: "20px",
                    alignItems: "center",
                  }}
                >
                  <BadgeCheck color="#60A5FA" size={"30px"} />
                  <Typography key={index} variant="body2" sx={{ fontSize: "16px" }}>
                    {info}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Button
              href={props.buttonHref}
              variant="outlined"
              size="large"
              color="info"
              sx={{
                marginTop: "40px",
                borderRadius: "48px",
                fontSize: "16px",
                padding: "10px 46px",
              }}
            >
              {props.buttonTitle}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
