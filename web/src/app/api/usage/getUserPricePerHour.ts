import { pricePerHourUsd } from '@/common/ai';

export const getUserPricePerHour = async (userId: string | null | undefined): Promise<number> => {
  // todo: implement different pricing tiers based on userId
  return pricePerHourUsd;
};
