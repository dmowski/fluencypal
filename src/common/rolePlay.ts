import { AiVoice } from "./ai";

export interface InputStructureForUser {
  id: string;
  labelForUser: string;
  labelForAi: string;
  placeholder: string;
  type: "text-input" | "textarea";
  defaultValue: string;
  value: string;
  required: boolean;
}

export interface RolePlayInputResult {
  labelForAi: string;
  userValue: string;
}

export interface RolePlayInstruction {
  id: string;
  title: string;
  subTitle: string;
  instructionToAi: string;
  exampleOfFirstMessageFromAi: string;
  illustrationDescription: string;
  imageSrc?: string;
  voice: AiVoice;
  input: InputStructureForUser[];
}
