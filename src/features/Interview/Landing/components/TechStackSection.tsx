import { Box, Chip, Stack, Typography } from "@mui/material";

export interface TechStackGroup {
  groupTitle: string;
  items: string[];
}

export interface TechStackSectionProps {
  id: string;
  title: string;
  subTitle: string;
  keyPoints: string[];
  techGroups: TechStackGroup[];
}

/** Interview Landing – Tech Stack Covered */
export const TechStackSection = (props: TechStackSectionProps) => {
  return (
    <Stack
      id={props.id}
      sx={{
        padding: "150px 0",
        alignItems: "center",
        "@media (max-width: 600px)": {
          paddingTop: "100px",
        },
        width: "100%",
        position: "relative",
      }}
    >
      <Stack
        sx={{
          maxWidth: "1200px",
          width: "100%",
          gap: "60px",
          padding: "0 20px",
          flexDirection: "row",
          "@media (max-width: 900px)": {
            flexDirection: "column",
            gap: "40px",
          },
        }}
      >
        {/* Left column: Title, subtitle, key points */}
        <Stack
          sx={{
            flex: "0 0 45%",
            gap: "24px",
            "@media (max-width: 900px)": {
              flex: "1",
            },
            position: "sticky",
            top: "100px",
            height: "max-content",
          }}
        >
          <Stack sx={{ gap: "12px" }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: "36px",
                "@media (min-width: 900px)": {
                  fontSize: "48px",
                },
              }}
            >
              {props.title}
            </Typography>

            <Typography variant="body1" sx={{ opacity: 0.7, fontSize: "16px", lineHeight: 1.6 }}>
              {props.subTitle}
            </Typography>
          </Stack>

          <Stack sx={{ gap: "12px", marginTop: "8px" }}>
            {props.keyPoints.map((point, index) => (
              <Stack
                key={index}
                sx={{
                  flexDirection: "row",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <Box
                  sx={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.6)",
                    marginTop: "8px",
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.8,
                    fontSize: "15px",
                    lineHeight: 1.6,
                  }}
                >
                  {point}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>

        {/* Right column: Tech groups */}
        <Stack
          sx={{
            flex: "1",
            gap: "16px",
          }}
        >
          {props.techGroups.map((group, groupIndex) => (
            <Stack
              key={groupIndex}
              sx={{
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "20px 24px",
                gap: "12px",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderColor: "rgba(255,255,255,0.12)",
                },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  fontSize: "13px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  opacity: 0.6,
                }}
              >
                {group.groupTitle}
              </Typography>

              <Stack
                sx={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {group.items.map((item, itemIndex) => (
                  <Chip
                    key={itemIndex}
                    label={item}
                    sx={{
                      borderRadius: "8px",
                      backgroundColor: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      fontSize: "13px",
                      padding: "2px 4px",
                      height: "28px",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.12)",
                      },
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};
