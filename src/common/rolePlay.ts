import { AiVoice } from "./ai";

export interface RolePlayInstruction {
  title: string;
  subTitle: string;
  instructionToAi: string;
  exampleOfFirstMessageFromAi: string;
  illustrationDescription: string;
  imageSrc?: string;
  voice: AiVoice;
}
