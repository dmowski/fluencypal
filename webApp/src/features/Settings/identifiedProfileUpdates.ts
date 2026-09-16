export type IdentifiedProfileFields = {
  email?: string | null;
  photoUrl?: string | null;
  displayName?: string | null;
};

export const getIdentifiedProfileUpdates = ({
  existing,
  authEmail,
  photoUrl,
  displayName,
}: {
  existing: IdentifiedProfileFields | undefined;
  authEmail: string | null | undefined;
  photoUrl: string | null | undefined;
  displayName: string | null | undefined;
}): IdentifiedProfileFields => {
  const updates: IdentifiedProfileFields = {};

  if (authEmail && authEmail !== existing?.email) {
    updates.email = authEmail;
  }
  if (photoUrl && photoUrl !== existing?.photoUrl) {
    updates.photoUrl = photoUrl;
  }
  if (displayName && displayName !== existing?.displayName) {
    updates.displayName = displayName;
  }

  return updates;
};
