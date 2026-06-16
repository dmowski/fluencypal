export type ExamGenerateImagePurpose = 'writing-prompt' | 'speaking-photo';

export interface ExamGenerateImageRequest {
  prompt: string;
  examId?: string;
  purpose: ExamGenerateImagePurpose;
}

export interface ExamGenerateImageResponse {
  imageUrl: string;
  imageDescription: string;
}
