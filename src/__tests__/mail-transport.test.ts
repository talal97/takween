import { createServer } from "node:net";
import { afterEach, expect, it, vi } from "vitest";
import { sendEmail } from "@/lib/mail";

vi.mock("@/lib/settings", () => ({ getSettings: async () => ({ mail_from: "Takween <sender@example.test>" }) }));
afterEach(() => vi.unstubAllEnvs());

it("sends a real SMTP message with the upgraded transport without external delivery", async () => {
  let message = "";
  const commands: string[] = [];
  const server = createServer((socket) => {
    socket.write("220 localhost test SMTP\r\n");
    let pending = "";
    let data = false;
    socket.on("data", (chunk) => {
      pending += chunk.toString();
      while (pending.includes("\r\n")) {
        const end = pending.indexOf("\r\n");
        const line = pending.slice(0, end);
        pending = pending.slice(end + 2);
        if (data) {
          if (line === ".") { data = false; socket.write("250 accepted\r\n"); }
          else message += line + "\r\n";
        } else {
          commands.push(line);
          if (line === "DATA") { data = true; socket.write("354 send data\r\n"); }
          else if (line === "QUIT") socket.end("221 bye\r\n");
          else socket.write("250 localhost\r\n");
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing SMTP test port");
  vi.stubEnv("SMTP_HOST", "127.0.0.1");
  vi.stubEnv("SMTP_PORT", String(address.port));
  vi.stubEnv("SMTP_USER", "");
  try {
    expect(await sendEmail({ type: "register", locale: "ar", brand: "Takween", tagline: "التدريب والتطوير", fullName: "مراجع", courseTitle: "دورة عربية" }, "customer", "recipient@example.test")).toBe(true);
    expect(commands).toContain("MAIL FROM:<sender@example.test>");
    expect(commands).toContain("RCPT TO:<recipient@example.test>");
    expect(message).toContain("Content-Type: multipart/alternative");
    expect(message).toMatch(/charset=utf-8/i);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
