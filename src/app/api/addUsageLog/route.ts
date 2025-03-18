import { AddUsageLogRequest, AddUsageLogResponse } from "@/common/requests";
import { validateAuthToken } from "../config/firebase";
import { addUsage, isUsageLogExists } from "../payment/addUsage";
import { sentSupportTelegramMessage } from "../telegram/sendTelegramMessage";

export async function POST(request: Request) {
  try {
    const userInfo = await validateAuthToken(request);
    const userId = userInfo.uid;
    const logRequestData = (await request.json()) as AddUsageLogRequest;
    const logData = logRequestData.usageLog;
    const logId = logData.usageId;
    const isExists = await isUsageLogExists(userId, logId);

    if (logData.priceHours < 0) {
      sentSupportTelegramMessage(
        `User ${userInfo.email} tried to add usage log with negative priceHours: ${logData.priceHours}`
      );
      throw new Error("Price can't be negative");
    }
    if (isExists) {
      const response: AddUsageLogResponse = {
        done: true,
        message: "Usage log already exists",
      };
      console.warn("Usage log already exists");
      return Response.json(response);
    }

    await addUsage(userInfo.uid, logData);

    const response: AddUsageLogResponse = {
      done: true,
    };

    return Response.json(response);
  } catch (error) {
    sentSupportTelegramMessage(`Error in addUsageLog: ${error}`);
    throw error;
  }
}
