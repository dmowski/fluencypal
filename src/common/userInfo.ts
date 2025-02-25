export interface AiUserInfoRecord {
  content: string;
  createdAt: number;
}

export interface AiUserInfo {
  records: AiUserInfoRecord[];
  createdAt: number;
  updatedAt: number;
}
