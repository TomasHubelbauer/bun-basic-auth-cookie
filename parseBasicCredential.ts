const AUTH_SCHEME = "Basic ";

export default function parseBasicCredential(value: string) {
  if (!value.startsWith(AUTH_SCHEME)) {
    throw new Error(
      `Unexpected authorization scheme "${value}". Expected "${AUTH_SCHEME}".`
    );
  }

  const buffer = Buffer.from(value.slice(AUTH_SCHEME.length), "base64");
  const [userName, password] = buffer.toString().split(":");
  return [userName, password] as const;
}
