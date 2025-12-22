import { LoadingShapes } from "@/features/uiKit/Loading/LoadingShapes";
import { Stack } from "@mui/material";

export const QuizPageLoader = () => {
  return (
    <Stack
      sx={{ paddingTop: "50px", alignItems: "center", justifyContent: "center", height: "100vh" }}
    >
      <Stack sx={{ width: "700px", maxWidth: "90vw" }}>
        <LoadingShapes sizes={["120px", "30px", "40px"]} />
      </Stack>
    </Stack>
  );
};
