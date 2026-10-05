type Fields = Record<string, string | number | boolean | null | undefined>;

function write(level: "info" | "error", event: string, fields?: Fields) {
  const payload = { level, event, at: new Date().toISOString(), ...fields };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else console.log(line);
}

export function logInfo(event: string, fields?: Fields) {
  write("info", event, fields);
}

export function logError(event: string, fields?: Fields) {
  write("error", event, fields);
}
