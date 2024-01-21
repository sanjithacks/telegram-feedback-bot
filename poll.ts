import { bot } from "./bot.ts";

await bot.api.deleteWebhook();

bot.start({
  drop_pending_updates: true,
  allowed_updates: ["message"],
});
