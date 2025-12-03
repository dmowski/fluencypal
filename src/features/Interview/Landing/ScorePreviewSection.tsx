import { Button, Stack, Typography } from "@mui/material";
import { BadgeCheck } from "lucide-react";

export interface ScoreMetric {
  title: string;
  score: number;
}

export interface ScorePreview {
  totalScore: number;
  buttonTitle: string;
  buttonHref: string;
  label: string;
  description: string;
  scoreMetrics: ScoreMetric[];
}

export interface ScorePreviewSectionProps {
  title: string;
  subtitle: string;
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
      sx={{
        padding: "100px 0 300px 0",
        alignItems: "center",
        "@media (max-width: 600px)": {
          paddingTop: "100px",
        },
        width: "100%",
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
            gridTemplateColumns: `3fr 4fr`,
            //alignItems: "center",
            gap: "100px",
            paddingTop: "50px",
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
                padding: "40px",
                width: "100%",
                borderRadius: "16px",
                border: "1px solid rgba(229, 231, 235, 0.3)",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                gap: "20px",
              }}
            >
              <Typography
                variant="h5"
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
                        height: "8px",
                        backgroundColor: "rgba(229, 231, 235, 0.3)",
                        borderRadius: "4px",
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
                          borderRadius: "4px",
                        }}
                      />
                    </Stack>
                  </Stack>
                ))}
              </Stack>

              <Button
                href={props.scorePreview.buttonHref}
                variant="contained"
                size="large"
                color="primary"
                sx={{
                  marginTop: "20px",
                  borderRadius: "48px",
                  fontSize: "16px",
                  padding: "6px 46px",
                  backgroundColor: "#FFF",
                }}
              >
                {props.scorePreview.buttonTitle}
              </Button>
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
              {props.subtitle}
            </Typography>

            <Stack
              sx={{
                marginTop: "30px",
                gap: "25px",
              }}
            >
              {props.infoList.map((info, index) => (
                <Stack
                  key={index}
                  sx={{
                    flexDirection: "row",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <BadgeCheck color="#60A5FA" size={"20px"} />
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
