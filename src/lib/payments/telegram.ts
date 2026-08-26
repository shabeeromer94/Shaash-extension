import "server-only";

function getTelegramConfig() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return null;
  return { botToken, chatId };
}

/**
 * Sends a plain text/HTML message to the configured Telegram chat.
 *
 * Deliberately never throws — this is a "nice to have" side effect of a
 * confirmed order, not part of the order's correctness. If it's not
 * configured yet, or Telegram is briefly unreachable, the checkout flow
 * must still succeed; Supabase (not Telegram) is the source of truth for
 * orders.
 */
export async function sendTelegramOrderNotification(message: string): Promise<void> {
  const config = getTelegramConfig();
  if (!config) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set — skipping order notification.");
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`[telegram] sendMessage failed (${response.status}): ${detail}`);
    }
  } catch (error) {
    console.error("[telegram] sendMessage request failed", error);
  }
}
