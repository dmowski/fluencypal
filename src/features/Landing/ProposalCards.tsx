import { Card, CardContent, Stack, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { maxLandingWidth, subTitleFontStyle, titleFontStyle } from "./landingSettings";

const InfoCard: React.FC<{
  category: string;
  title: string;
  description: string;
  img: string;
  actionButtonTitle: string;
  href: string;
}> = ({ title, category, description, img, actionButtonTitle, href }) => {
  return (
    <Card
      sx={{
        backgroundColor: `rgba(205, 228, 225, 0.4)`,

        borderRadius: "20px",
        boxShadow: "0 0 0px rgba(0, 0, 0, 0.1)",
        textDecoration: "none !important",
        color: "#000",
        padding: "50px 40px 40px 40px",
        "@media (max-width: 900px)": {
          padding: "30px 20px 20px 20px",
        },
        "@media (max-width: 500px)": {
          padding: "20px 15px 15px 15px",
        },
        ":hover, :focus": {
          ".link-icon": {
            left: "5px",
          },
          ".link-text": {
            textDecoration: "none",
          },
        },
      }}
      component={"a"}
      href={href}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <Stack
          sx={{
            gap: "8px",
          }}
        >
          <Typography
            sx={{
              textTransform: "uppercase",
              paddingBottom: "10px",
              fontSize: "18px",
              opacity: 0.7,
            }}
          >
            {category}
          </Typography>

          <Typography
            variant="h5"
            component="h3"
            sx={{
              color: "#000",
              fontWeight: 650,
              fontSize: "1.75rem",
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              color: "#000",
              fontSize: "1.2rem",
            }}
          >
            {description}
          </Typography>
        </Stack>

        {img && (
          <img
            src={img}
            alt=""
            style={{
              width: "100%",
              height: "auto",
              aspectRatio: "421/269",
              backgroundColor: "rgba(10, 18, 30, 1)",
              marginTop: "20px",
              borderRadius: "10px",
            }}
          />
        )}
        <Stack
          sx={{
            alignItems: "center",
            justifyContent: "flex-start",
            flexDirection: "row",
            gap: "10px",
            paddingTop: "20px",
          }}
        >
          <Typography
            sx={{
              textDecoration: "underline",
              textUnderlineOffset: "8px",
              fontWeight: 550,
            }}
            className="link-text"
          >
            {actionButtonTitle}
          </Typography>
          <ArrowForwardIcon
            className="link-icon"
            sx={{
              position: "relative",
              left: "0px",
              fontSize: "20px",
              transition: "left 0.3s",
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export const ProposalCards = () => {
  return (
    <Stack
      sx={{
        width: "100%",
        padding: "100px 0 120px 0",
        alignItems: "center",
        justifyContent: "center",
        gap: "100px",
        backgroundColor: `rgb(255, 253, 249, 1)`,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          gap: "50px",
        }}
      >
        <Stack
          sx={{
            gap: "20px",
            maxWidth: maxLandingWidth,
            boxSizing: "border-box",
            alignItems: "center",
            padding: "0 10px",
          }}
        >
          <Typography
            align="center"
            variant="h3"
            component={"h2"}
            sx={{
              ...titleFontStyle,
              color: "#000",
            }}
          >
            Four Ways Dark Lang Accelerates Your Learning
          </Typography>
          <Typography
            align="center"
            variant="body1"
            sx={{
              maxWidth: "810px",
              color: "#000",
              ...subTitleFontStyle,
            }}
          >
            Target the specific skills you need—speaking, grammar, vocabulary, and progress
            tracking—to achieve online English fluency faster.
          </Typography>
        </Stack>

        <Stack
          sx={{
            display: "grid",
            maxWidth: maxLandingWidth,
            padding: "0 10px",
            boxSizing: "border-box",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            "@media (max-width: 900px)": {
              gridTemplateColumns: "1fr",
              gap: "30px",
            },
          }}
        >
          <InfoCard
            category={"Speaking"}
            title={"Boost Your Fluency in Record Time"}
            description={
              "Practice live conversations with Bruno. Whether you speak or type, the AI responds naturally, highlights mistakes, and helps you progress quickly."
            }
            img={"/talk.jpeg"}
            href="/practice"
            actionButtonTitle="Try Speaking Mode"
          />
          <InfoCard
            category={"Grammar"}
            title={"Master the Rules"}
            description={
              "Bruno provides real-time feedback and explains grammar points on the spot. Get daily tasks to learn new rules and apply them immediately."
            }
            img={"/rules.jpeg"}
            href="/practice"
            actionButtonTitle="Improve Your Grammar"
          />
          <InfoCard
            category={"Vocabulary"}
            title={"Expand Your Word Bank Every Day"}
            description={
              "Get daily new words based on your current level. Practice using them in sentences so they truly stick."
            }
            img={"/words.jpeg"}
            href="/practice"
            actionButtonTitle="Learn New Words"
          />
          <InfoCard
            category={"Progress Tracking"}
            title={"See Your Growth"}
            description={
              "Watch your confidence grow. The colorful calendar shows your daily progress at a glance."
            }
            img={"/progress.png"}
            href="/practice"
            actionButtonTitle="View Your Dashboard"
          />
        </Stack>
      </Stack>
    </Stack>
  );
};
