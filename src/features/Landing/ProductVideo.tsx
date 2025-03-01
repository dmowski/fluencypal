"use client";

import { Stack } from "@mui/material";
import { useState } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { CustomModal } from "../uiKit/Modal/CustomModal";

export const ProductVideo = () => {
  const [isShowModal, setIsShowModal] = useState(false);

  return (
    <>
      <CustomModal
        padding="0"
        width="100%"
        isOpen={isShowModal}
        onClose={() => {
          setIsShowModal(false);
        }}
      >
        <Stack
          sx={{
            height: "100vh",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <iframe
            src="https://www.youtube.com/embed/htg2R0jGZWk?si=l5DVwn2a3H-Y50br&autoplay=1"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            style={{
              border: "none",
              width: "90%",
              height: "calc(100% - 100px)",
            }}
          ></iframe>
        </Stack>
      </CustomModal>
      <Stack
        component={"button"}
        onClick={() => {
          setIsShowModal(true);
        }}
        sx={{
          width: "100%",
          aspectRatio: "16/9",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          backgroundImage: `url("/previewProductDemo.png")`,
          backgroundSize: "cover",
          border: "none",
          backgroundPosition: "center",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          ":hover, :focus": {
            ".playButton": {
              transform: "scale(0.94)",
              opacity: 1,
            },
          },
        }}
      >
        <p
          style={{
            position: "absolute",
            color: "transparent",
            fontSize: "0",
          }}
        >
          Play product demo
        </p>
        <Stack
          className="playButton"
          sx={{
            borderRadius: "200px",
            backgroundColor: `rgba(5, 172, 255, 1)`,
            opacity: 0.9,
            width: "130px",
            aspectRatio: "1/1",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          <PlayArrowIcon
            sx={{
              color: "#fff",
              fontSize: "90px",
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};
