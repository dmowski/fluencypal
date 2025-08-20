import { Stack, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getI18nInstance } from "@/appRouterI18n";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { BlogPost } from "./types";

interface BlogCardProps {
  blog: BlogPost;
  variant?: "default" | "highlight";
  height?: string;
  lang: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, lang, height, variant }) => {
  const i18n = getI18nInstance(lang);
  return (
    <Stack
      component={"a"}
      href={`${getUrlStart(lang)}blog/${blog.id}`}
      sx={{
        position: "relative",
        backgroundColor: "rgba(0, 0, 10, 0.01)",
        color: "#111",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "calc(100vw - 30px)",
        alignItems: "flex-start",
        cursor: "pointer",
        borderRadius: "15px",
        overflow: "hidden",
        textAlign: "left",
        padding: "0px",
        boxSizing: "border-box",
        textDecoration: "none",
        ".role-play-image video": {
          opacity: 1,
        },

        ":hover": {
          border: "1px solid rgba(0, 0, 0, 0.3)",
          ".role-play-image": {
            backgroundImage:
              variant === "highlight" && blog.videoSrc ? "" : `url(${blog.imagePreviewUrl})`,

            video: {
              opacity: 1,
            },
          },
        },
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          gap: "20px",
          width: "100%",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            backgroundColor: "rgba(125, 123, 74, 0.4)",
            alignItems: "center",
            borderRadius: "12px 12px 0 0",
            padding: "40px 15px 0 15px",
            boxSizing: "border-box",
            overflow: "hidden",
            maxHeight: "300px",
            position: "relative",
            img: {
              height: "400px",
              width: "max-content",
              maxWidth: "100%",
              borderRadius: "20px 20px 0 0",
              boxShadow: "0px 0px 20px 0px rgba(0,0,0,0.3)",
              position: "relative",
            },
            "@media (max-width: 600px)": {
              padding: "0",
              img: {
                borderRadius: "12px 12px 0 0",
                height: "auto",
              },
            },
          }}
        >
          <img src={blog.imagePreviewUrl} alt={`Illustration for ${blog.title}`} style={{}} />
          <Stack
            sx={{
              backgroundImage: `url(${blog.imagePreviewUrl})`,
              filter: "blur(50px)",
              backgroundSize: "cover",
              opacity: 0.5,
              position: "absolute",
              bottom: 0,
              left: "-50%",
              top: "-50%",

              width: "200%",
              height: "200%",
              zIndex: -1,
            }}
          ></Stack>
        </Stack>
      </Stack>

      <Stack
        sx={{
          padding: "20px 20px 30px 20px",
          boxSizing: "border-box",
          width: "100%",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <Stack>
          {variant === "highlight" && (
            <Typography
              variant="body2"
              sx={{
                color: "#555",
                textTransform: "uppercase",
                paddingBottom: "10px",
              }}
            >
              {blog.category.categoryTitle}
            </Typography>
          )}
          <Typography
            variant={variant === "highlight" ? "h5" : "h6"}
            component={"h3"}
            sx={{
              fontWeight: 600,
              color: "#121214",
            }}
          >
            {blog.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#666",
              paddingTop: variant === "highlight" ? "10px" : "0px",
              fontSize: variant === "highlight" ? "1.1rem" : "1rem",
            }}
          >
            {blog.subTitle}
          </Typography>
        </Stack>

        <Stack
          sx={{
            alignItems: "center",
            justifyContent: "flex-start",
            flexDirection: "row",
            gap: "10px",
            padding: "30px 0 10px 0",
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
            {i18n._(`Read more`)}
            <ArrowForwardIcon
              className="link-icon"
              sx={{
                position: "relative",
                top: "6px",
                left: "4px",
                fontSize: "1rem",
                transition: "left 0.3s",
              }}
            />
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
