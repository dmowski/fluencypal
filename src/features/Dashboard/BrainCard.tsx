import {
  Box,
  Button,
  LinearProgress,
  linearProgressClasses,
  Link,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { useLingui } from "@lingui/react";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { useWebCam } from "../webCam/useWebCam";
import { useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { Camera } from "lucide-react";
import { useTextAi } from "../Ai/useTextAi";
import { fullEnglishLanguageName, supportedLanguages } from "@/common/lang";
import React from "react";
import { sleep } from "openai/core.mjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getUrlStart } from "../Lang/getUrlStart";
import { AudioPlayIcon } from "../Audio/AudioPlayIcon";

interface GradingProgressBarProps {
  value: number; // from 0 to 100
  label?: string; // optional, like "Grading..."
}

const GradientLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 20,
  borderRadius: 10,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[300],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 10,
    backgroundImage: "linear-gradient(90deg, #e01cd5 0%, #1CB5E0 100%)",
  },
}));

export const GradingProgressBar: React.FC<GradingProgressBarProps> = ({
  value,
  label = "Grading in progress...",
}) => {
  return (
    <Box
      width="100%"
      sx={{
        boxSizing: "border-box",
      }}
    >
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {Math.round(value)}%
        </Typography>
      </Stack>
      <GradientLinearProgress variant="determinate" value={value} />
    </Box>
  );
};

export const BrainCard = () => {
  const webCam = useWebCam();
  const { i18n } = useLingui();
  const textAi = useTextAi();
  const searchParams = useSearchParams();
  const router = useRouter();

  const pathname = usePathname();
  const locale = pathname?.split("/")[1] as string;
  const supportedLang = supportedLanguages.find((l) => l === locale) || "en";

  const isShowPreparingModal = searchParams.get("brain") === "true";

  const setIsShowPreparingModal = (value: boolean) => {
    if (value) {
      router.push(`${getUrlStart(supportedLang)}practice?brain=true`, { scroll: false });
    } else {
      webCam.resetWebCam();
      setIsAnalyzing(false);
      setIsInstalling(false);
      setInstallProgress(0);
      setImageDescription("");
      setLanguagesToLearn([]);
      setIsError(false);
      router.push(`${getUrlStart(supportedLang)}practice`, { scroll: false });
    }
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageDescription, setImageDescription] = useState("");
  const [isError, setIsError] = useState(false);
  const [languagesToLearn, setLanguagesToLearn] = useState<string[]>([]);

  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const installProgressRef = React.useRef(installProgress);
  installProgressRef.current = installProgress;
  const isInstallComplete = installProgress >= 100;

  const startInstall = async () => {
    setIsInstalling(true);
    setInstallProgress(10);
    do {
      const randTime = Math.floor(Math.random() * 1000) + 500;
      await sleep(randTime);
      setInstallProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    } while (installProgressRef.current <= 100);
  };

  const descriptionFromWebCam = async () => {
    setIsAnalyzing(true);
    setIsError(false);
    setIsInstalling(false);
    setLanguagesToLearn([]);
    setInstallProgress(0);
    try {
      setImageDescription(i18n._(`Connecting to the brain...`));

      setTimeout(() => {
        setImageDescription(i18n._(`Connected...`));
      }, 2000);

      setTimeout(() => {
        setImageDescription(i18n._(`Processing existing knowledge in that brain...`));
      }, 3000);

      const newImageDescription = await webCam.getImageDescription();
      setImageDescription(i18n._(`Thinking about which languages might be good to install...`));
      if (!newImageDescription) {
        setImageDescription(i18n._(`Brain connection failed.`));
        setIsAnalyzing(false);
        return;
      }

      const fullLangList = supportedLanguages.map((l) => fullEnglishLanguageName[l]).join(", ");
      const t2 = setTimeout(() => {
        setImageDescription(i18n._(`Finalizing decision ...`));
      }, 1000);
      const languagesToLearnText = await textAi.generate({
        systemMessage: `Given description of the user, generate list of 3 languages user might be interested to learn.
Pick languages from the list: ${fullLangList}

Return the list in a comma-separated format. On the next line, write a short and funny explanation of your choice.
Address directly to the user.
`,
        userMessage: newImageDescription,
        model: "gpt-4o",
      });
      clearTimeout(t2);
      if (!languagesToLearnText) {
        setImageDescription(i18n._(`Brain connection failed.`));
        setIsAnalyzing(false);
        return;
      }
      setImageDescription(i18n._(`Brain connection successful!`));

      const languagesToLearnList = languagesToLearnText
        .split("\n")[0]
        .split(",")
        .map((l) => l.trim());
      setLanguagesToLearn(languagesToLearnList);
      const [_, ...languagesToLearnDescription] = languagesToLearnText.split("\n");
      setImageDescription(languagesToLearnDescription.join(" ").trim());
    } catch (error) {
      setIsError(true);
    }
    setIsAnalyzing(false);
  };

  const initCamera = async () => {
    await webCam.init();
  };

  return (
    <DashboardCard>
      <CustomModal
        width="min(900px, 100vw)"
        isOpen={isShowPreparingModal}
        onClose={() => {
          setIsShowPreparingModal(false);
        }}
        padding="0"
      >
        <Stack
          sx={{
            alignItems: "flex-start",
            gap: "20px",
            width: "100%",
            position: "relative",
            zIndex: 0,
          }}
        >
          <Stack
            sx={{
              flexDirection: "column",
              gap: "5px",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Stack
              sx={{
                width: "100%",
                height: "90dvh",
                backgroundColor: "#121215",
                borderRadius: "16px",
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {webCam.isWebCamEnabled && (
                <Stack
                  sx={{
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "10px",
                    zIndex: 1,
                    width: "100%",
                    height: "100%",
                    padding: "0px",
                  }}
                >
                  {imageDescription && !isInstallComplete && (
                    <Stack
                      sx={{
                        backgroundColor: "rgba(10, 18, 30, 0.91)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "0 0 16px 16px",
                        boxSizing: "border-box",
                        width: "100%",
                        padding: "20px 20px",
                        gap: "20px",
                      }}
                    >
                      {languagesToLearn.length > 0 ? (
                        <Stack
                          sx={{
                            gap: "5px",
                            paddingBottom: "5px",
                          }}
                        >
                          <Typography
                            sx={{
                              width: "calc(100% - 30px)",
                              boxSizing: "border-box",
                              borderRadius: "5px",
                              fontSize: "1.7rem",
                              lineHeight: "1.7rem",
                              zIndex: 1,
                              fontWeight: 600,
                            }}
                          >
                            {isInstalling
                              ? i18n._(`Installing...`)
                              : i18n._(`Connection Established`)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              width: "calc(100% - 30px)",
                              boxSizing: "border-box",
                              borderRadius: "5px",
                              fontSize: "0.9rem",
                              fontWeight: 400,
                            }}
                          >
                            {imageDescription}
                          </Typography>
                        </Stack>
                      ) : (
                        <>
                          <Typography
                            align="center"
                            className="decor-text"
                            sx={{
                              width: "calc(100% - 30px)",
                              boxSizing: "border-box",
                              borderRadius: "5px",
                              fontSize: "1.6rem",
                              lineHeight: "2rem",
                              zIndex: 1,
                            }}
                          >
                            {imageDescription}
                          </Typography>
                        </>
                      )}

                      {languagesToLearn.length > 0 && !isInstalling && (
                        <Button
                          sx={{
                            width: "max-content",
                            padding: "10px 30px",
                          }}
                          startIcon={
                            <PsychologyIcon
                              sx={{
                                width: "2rem",
                                height: "2rem",
                              }}
                            />
                          }
                          variant="contained"
                          disabled={isAnalyzing}
                          onClick={async () => startInstall()}
                        >
                          {i18n._(`Install languages into my brain`)}
                          {" | "}
                          <b
                            style={{
                              fontWeight: 800,
                              padding: "0px 5px",
                            }}
                          >
                            {languagesToLearn.join(", ")}
                          </b>
                        </Button>
                      )}

                      {isInstalling && (
                        <Stack
                          sx={{
                            padding: "0px 0px",
                            width: "calc(100% - 20px)",
                          }}
                        >
                          <GradingProgressBar
                            value={Math.min(installProgress, 100)}
                            label="Installing languages into your brain…"
                          />
                        </Stack>
                      )}
                    </Stack>
                  )}

                  {isInstallComplete && (
                    <Stack
                      sx={{
                        height: "100%",
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: `rgba(10, 18, 30, 0.91)`,
                        padding: "30px",
                        gap: "20px",
                      }}
                    >
                      <PsychologyIcon
                        sx={{
                          fontSize: "4rem",
                          width: "4rem",
                          height: "4rem",
                        }}
                      />
                      <Stack
                        sx={{
                          alignItems: "center",
                          gap: "25px",
                        }}
                      >
                        <Typography
                          variant="h3"
                          component="h2"
                          align="center"
                          className="decor-text"
                        >
                          {i18n._(`Install complete`)}
                        </Typography>

                        <Stack
                          sx={{
                            alignItems: "center",
                          }}
                        >
                          <Typography align="center">
                            {i18n._(`Languages installed in your brain:`)}
                          </Typography>
                          <Typography
                            align="center"
                            sx={{
                              fontSize: "2rem",
                              fontWeight: 900,
                            }}
                          >
                            {languagesToLearn.join(", ")}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack
                        className="fade-in-delayed"
                        sx={{
                          alignItems: "center",
                          gap: "5px",
                          paddingTop: "10px",
                        }}
                      >
                        <Typography align="center" sx={{}} variant="caption">
                          {i18n._(`One thing left to do`)}
                        </Typography>
                        <Button
                          sx={{
                            padding: "20px 90px",
                          }}
                          variant="contained"
                          onClick={async () => setIsShowPreparingModal(false)}
                        >
                          {i18n._(`PRACTICE AND HARD WORK`)}
                        </Button>

                        <Typography
                          align="center"
                          sx={{
                            opacity: 0.7,
                          }}
                          variant="caption"
                        >
                          {i18n._(`Happy April 1st!`)}
                        </Typography>
                      </Stack>
                    </Stack>
                  )}

                  {!isInstalling && !isAnalyzing && !languagesToLearn.length && (
                    <Stack
                      sx={{
                        width: "max-content",
                        paddingBottom: "20px",
                      }}
                    >
                      <Button
                        sx={{
                          width: "100%",
                          padding: "0px 20px",
                          transition: "transform 0.3s",
                          "&:hover": {
                            transform: "scale(1.02)",
                          },
                        }}
                        color="info"
                        startIcon={
                          <PsychologyIcon
                            sx={{
                              width: "3rem",
                              height: "4rem",
                            }}
                          />
                        }
                        variant="contained"
                        disabled={isAnalyzing}
                        onClick={async () => {
                          if (isAnalyzing) {
                            return;
                          }
                          if (languagesToLearn.length > 0) {
                            startInstall();
                            return;
                          }

                          descriptionFromWebCam();
                        }}
                      >
                        {languagesToLearn.length > 0
                          ? i18n._(`Install:`) + " " + languagesToLearn.join(", ")
                          : isAnalyzing
                            ? i18n._(`Connecting...`)
                            : i18n._(`Initiate brain connection`)}
                      </Button>
                    </Stack>
                  )}
                </Stack>
              )}

              {!webCam.isWebCamEnabled && (
                <Stack
                  sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "50px",
                    zIndex: 1,
                  }}
                >
                  <Stack
                    sx={{
                      maxWidth: "500px",
                      gap: "10px",
                    }}
                  >
                    <PsychologyIcon
                      sx={{
                        fontSize: "4rem",
                        width: "4rem",
                        height: "4rem",
                      }}
                    />
                    <Stack
                      sx={{
                        paddingBottom: "20px",
                      }}
                    >
                      <Typography variant="h3" component="h2" className="decor-text">
                        {i18n._(`Preparing the brain`)}
                      </Typography>

                      <Typography>
                        {i18n._(`Upload language skills directly to your brain`)}
                      </Typography>
                    </Stack>

                    <Button
                      sx={{
                        width: "100%",
                        padding: "20px 90px",
                        transition: "transform 0.3s",
                        "&:hover": {
                          transform: "scale(1.02)",
                        },
                      }}
                      startIcon={<Camera size={"25px"} />}
                      variant="contained"
                      color="info"
                      onClick={async () => {
                        initCamera();
                      }}
                    >
                      Enable Camera
                    </Button>

                    <Typography
                      sx={{
                        paddingTop: "60px",
                      }}
                      variant="h5"
                    >
                      How does it work?
                    </Typography>
                    <Typography variant="caption">
                      Our AI-powered Neural Sync Engine analyzes your cognitive signature using your
                      webcam feed — inspired by recent research in neuro-symbolic AI and
                      brain-computer interfaces (BCI). Based on your focus, micro-expressions, and
                      language exposure history, the system recommends optimal language packs and
                      begins real-time skill embedding.{" "}
                      <Link
                        variant="caption"
                        href="https://en.wikipedia.org/wiki/Brain%E2%80%93computer_interface"
                      >
                        Learn more
                      </Link>{" "}
                      •{" "}
                      <Link
                        variant="caption"
                        href="https://www.nature.com/articles/d41586-025-01001-6"
                      >
                        Research Paper
                      </Link>
                    </Typography>
                  </Stack>
                </Stack>
              )}

              <video
                ref={webCam.videoRef}
                style={{
                  width: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  objectFit: "cover",
                  transform: "scaleX(-1)", // Flip the video horizontally
                }}
                autoPlay
                muted
                playsInline
              />
            </Stack>
          </Stack>
        </Stack>
      </CustomModal>

      <Stack gap="4px">
        <Typography variant="h2" className="decor-title">
          {i18n._(`Upload language skills directly to your brain`)}
        </Typography>
        <Typography
          sx={{
            fontWeight: 400,
            color: "rgb(206, 249, 229)",
            paddingTop: "10px",
            width: "max-content",
            alignItems: "center",
            border: "1px solid rgb(206, 249, 229)",
            backgroundColor: "rgb(206, 249, 229, 0.05)",
            fontSize: "0.9rem",
            lineHeight: "0.9rem",
            padding: "5px 12px 5px 10px",
            borderRadius: "5px",
          }}
          textAlign={"center"}
        >
          🧪 Experimental AI
        </Typography>
      </Stack>
      <Stack
        sx={{
          gap: "20px",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "max-content",
          flexDirection: "row",
        }}
      >
        <Stack>
          <Button
            variant="contained"
            onClick={async () => {
              setIsShowPreparingModal(true);
              webCam.resetWebCam();
            }}
            sx={{
              padding: "15px 100px",
              borderRadius: "4px",
              fontSize: "1.2rem",
              fontWeight: 990,
              transition: "transform 0.3s",
              "&:hover": {
                transform: "scale(1.02)",
              },
            }}
            startIcon={
              <PsychologyIcon
                sx={{
                  fontSize: "3rem",
                  width: "3rem",
                  height: "3rem",
                }}
              />
            }
          >
            START BRAIN SYNC
          </Button>
        </Stack>
        <Typography sx={{}} variant="caption">
          This feature is part of Fluency Lab's experimental
          <br />
          technology — surprises may occur.
          <br />
          <Link
            variant="caption"
            href="https://en.wikipedia.org/wiki/Brain%E2%80%93computer_interface"
          >
            Ogtopenetic activations
          </Link>{" "}
          •{" "}
          <Link variant="caption" href="https://www.nature.com/articles/d41586-025-01001-6">
            Brain Transferring Research Paper
          </Link>
          •{" "}
          <Link variant="caption" href="https://www.nature.com/articles/d41586-025-01001-6">
            Research paper
          </Link>
        </Typography>
      </Stack>
    </DashboardCard>
  );
};
