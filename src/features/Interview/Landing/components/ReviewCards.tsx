import { Stack, Typography } from "@mui/material";
import { Quote } from "lucide-react";

export interface Review {
  name: string;
  jobTitle: string;
  rate: number;
  review: string;
}

export interface ReviewCardsProps {
  title: string;
  subTitle: string;
  reviews: Review[];
  id: string;
}

const avatarColors = [
  "#4338ca", // Darker indigo (WCAG AA compliant)
  "#6d28d9", // Darker purple (WCAG AA compliant)
  "#7e22ce", // Darker violet (WCAG AA compliant)
  "#4338ca", // Darker indigo
  "#6d28d9", // Darker purple
  "#7e22ce", // Darker violet
];

/** Interview Landing Review Cards */
export const ReviewCards = ({ title, subTitle, reviews, id }: ReviewCardsProps) => {
  return (
    <Stack
      id={id}
      sx={{
        padding: "150px 0",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Stack
        sx={{
          maxWidth: "1300px",
          width: "100%",
          gap: "15px",
          padding: "0 10px",
          alignItems: "center",
        }}
      >
        <Stack
          sx={{
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Typography
            variant="h2"
            align="center"
            sx={{
              fontWeight: 800,
              fontSize: "86px",
            }}
          >
            {title}
          </Typography>

          <Typography variant="body1" align="center" sx={{ opacity: 0.8, fontSize: "20px" }}>
            {subTitle}
          </Typography>
        </Stack>

        <Stack
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "30px",
            paddingTop: "50px",
            width: "100%",
            "@media (max-width: 1024px)": {
              gridTemplateColumns: "repeat(2, 1fr)",
            },
            "@media (max-width: 600px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          {reviews.map((review, index) => {
            const initials = review.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <Stack
                key={index}
                sx={{
                  padding: "40px 30px 40px 30px",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  gap: "24px",
                  width: "100%",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.01)",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  justifyContent: "space-between",
                }}
              >
                <Stack
                  sx={{
                    gap: "16px",
                  }}
                >
                  <Quote size={32} color="#6366f1" strokeWidth={2} />

                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "16px",
                      fontStyle: "italic",
                      lineHeight: 1.6,
                      color: "#fff",
                      opacity: 0.9,
                    }}
                  >
                    {review.review}
                  </Typography>
                </Stack>

                <Stack
                  sx={{
                    gap: "12px",
                  }}
                >
                  <Stack direction="row" sx={{ alignItems: "center", gap: "12px" }}>
                    <Stack
                      component={"span"}
                      sx={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: avatarColors[index % avatarColors.length],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: "16px",
                        color: "#fff",
                      }}
                    >
                      {initials}
                    </Stack>

                    <Stack>
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: "16px",
                          fontWeight: 500,
                        }}
                      >
                        {review.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "14px",
                          color: "#fff",
                          opacity: 0.6,
                        }}
                      >
                        {review.jobTitle}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack direction="row" sx={{ gap: "4px", position: "relative" }}>
                    {[...Array(5)].map((_, i) => (
                      <Typography
                        key={`filled-${i}`}
                        component={"span"}
                        aria-hidden="true"
                        sx={{
                          fontSize: "18px",
                          color: i < review.rate ? "#fbbf24" : "rgba(251, 191, 36, 0.3)",
                        }}
                      >
                        ★
                      </Typography>
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};
