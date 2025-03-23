import { AiVoice } from "@/common/ai";
import { ResourceCategory } from "@/common/category";

export type RolePlayInputType = "text-input" | "textarea" | "options" | "checkbox";
export interface InputStructureForUser {
  id: string;
  labelForUser: string;
  labelForAi: string;
  placeholder: string;
  type: RolePlayInputType;
  options?: string[];
  optionsAiDescriptions?: Record<string, string>;
  defaultValue: string;
  required: boolean;
  requiredFieldsToSummary?: string[];
  lengthToTriggerSummary?: number;
  aiSummarizingInstruction?: string;
  injectUserInfoToSummary?: boolean;
  cacheAiSummary?: boolean;
}

export interface RolePlayInputResult {
  labelForAi: string;
  userValue: string;
}

export type AiRolePlayInstructionCreator = (
  scenario: RolePlayInstruction,
  fullLanguageName: string,
  userInput: RolePlayInputResult[]
) => string;

export interface RolePlayInstruction {
  id: string;
  category: ResourceCategory;
  landingHighlight?: string;
  youTubeVideoUrl?: string;
  title: string;
  subTitle: string;
  instructionToAi: string;
  exampleOfFirstMessageFromAi: string;
  illustrationDescription: string;
  imageSrc: string;
  videoSrc?: string;
  voice: AiVoice;
  input: InputStructureForUser[];
  contentPage: string;
  gameMode?: "alias";
  analyzeResultAiInstruction?: string;
}
