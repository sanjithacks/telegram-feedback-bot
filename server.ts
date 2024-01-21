import { bot } from "./bot.ts";
import { webhookCallback } from "./deps.ts";

const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve(async (req) => {
  if (req.method == "POST") {
    const url = new URL(req.url);
    if (url.pathname.slice(1) == bot.token) {
      try {
        return await handleUpdate(req);
      } catch (err) {
        console.error(err);
        return new Response("Internal server error", { status: 500 });
      }
    } else {
      return new Response("Bot token error", { status: 400 });
    }
  } else {
    return Response.redirect(
      `https://t.me/${(await bot.api.getMe()).username}`,
      301
    );
  }
});
