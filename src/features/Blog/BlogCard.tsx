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
        height: height || "370px",
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
        className="role-play-image"
        sx={{
          backgroundImage: `url(${blog.imagePreviewUrl})`,
          width: "100%",
          height: "230px",
          minHeight: "230px",
          backgroundSize: "cover",
          backgroundPosition: "center",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        {variant === "highlight" && blog.videoSrc && (
          <video
            src={blog.videoSrc}
            loop
            autoPlay
            muted={true}
            playsInline
            style={{
              width: "100%",
              backgroundColor: "rgba(10, 18, 30, 1)",
              height: "230px",
              objectFit: "cover",
            }}
          />
        )}
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
              {blog.category}
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
        {variant === "highlight" && (
          <>
            <Stack
              sx={{
                alignItems: "center",
                justifyContent: "flex-start",
                flexDirection: "row",
                gap: "10px",
                padding: "40px 0 10px 0",
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
          </>
        )}
      </Stack>
    </Stack>
  );
};
