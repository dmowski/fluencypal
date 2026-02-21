type ServiceAccount = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function validateServiceAccountEnv(): void {
  const raw = process.env.FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS;

  if (!raw) {
    throw new Error("Missing FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS");
  }

  let parsed: ServiceAccount;

  try {
    parsed = JSON.parse(raw) as ServiceAccount;
  } catch {
    throw new Error("FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS is not valid JSON");
  }

  if (!parsed.project_id) {
    throw new Error("Service account JSON is missing project_id");
  }

  if (!parsed.client_email) {
    throw new Error("Service account JSON is missing client_email");
  }

  if (!parsed.private_key) {
    throw new Error("Service account JSON is missing private_key");
  }

  console.log(`[check] service account project_id: ${parsed.project_id}`);
}

export async function runCheck(): Promise<void> {
  try {
    validateServiceAccountEnv();

    const { getBucket } = await import("../core/firebase.js");
    const bucket = getBucket();

    const [metadata] = await bucket.getMetadata();

    console.log("[check] Firebase connection: OK");
    console.log(`[check] bucket: ${bucket.name}`);
    if (metadata.location) {
      console.log(`[check] bucket location: ${metadata.location}`);
    }
    process.exitCode = 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[check] Firebase connection: FAILED");
    console.error(`[check] reason: ${message}`);
    process.exitCode = 1;
  }
}
