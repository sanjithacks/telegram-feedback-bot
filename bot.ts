import { Bot, GrammyError, HttpError } from "./deps.ts";
import { Env } from "./env.ts";
import { kv, MessageSchema } from "./lib/database.ts";

export const bot = new Bot(Env.token);

bot.chatType("private").command("start", async (ctx) => {
  const uid = ctx.from?.id.toString();
  const name = ctx.from?.first_name;
  const payload = ctx?.match;
  if (Env.admins.includes(uid)) {
    await ctx.reply("Hi boss!, why are you here!😅");
    return;
  }

  await ctx.reply(
    `Hi ${name},\nYou can contact admins through me if you are limited or restricted.`
  );

  if (payload === "newUser") {
    await kv.set(["users", uid.toString()], {
      user_id: uid.toString(),
      name: name.toString(),
      date: Date.now().toString(),
    });
  }
  return;
});

bot.chatType("private").on("msg", async (ctx) => {
  const { id, first_name } = ctx.from;
  if (Env.admins.includes(id.toString())) {
    await ctx.reply("Hi boss! 😅"); //Check if it's not from admins.
    return;
  }

  const dc = await ctx.forwardMessage(Env.group_id); //Forward message to SUDO group or supergroup.
  await kv.set(
    ["messages", dc.message_id.toString()],
    {
      message_id: dc.message_id.toString(),
      user_id: id.toString(),
      name: first_name,
    },
    { expireIn: 7 * 24 * 60 * 60 * 1000 }
  ); //Expires after 7 days

  return;
});

bot
  .chatType(["supergroup", "group"])
  .on([
    ":animation",
    ":audio",
    ":contact",
    ":document",
    ":location",
    ":photo",
    ":text",
    ":sticker",
    ":video",
    ":video_note",
    ":voice",
  ])
  .filter(
    async (ctx) => {
      const user = await ctx.getAuthor();
      return user.status === "creator" || user.status === "administrator"; //only admins can reply
      //return Env.admins.includes(user.user.id); //Only SUDO users can reply.
    },
    async (ctx) => {
      // Handles messages from creators and admins or SUDO users

      if (ctx.msg?.reply_to_message) {
        const msg_id = ctx?.msg?.reply_to_message?.message_id;
        let ref_id =
          ctx.msg.reply_to_message?.forward_origin?.type === "user"
            ? ctx.msg.reply_to_message.forward_origin.sender_user.id
            : 0;

        if (!ref_id) {
          const db = await kv.get<MessageSchema>([
            "messages",
            msg_id.toString(),
          ]);
          if (!db) {
            await ctx.reply("❌ Message_id not found in database.");
            return;
          }
          ref_id = +db.value?.user_id!;
        }

        if (ctx.msg?.animation) {
          await ctx.api.raw.sendAnimation({
            chat_id: ref_id,
            animation: ctx.msg.animation.file_id,
          });
          return;
        }
        if (ctx.msg?.audio) {
          await ctx.api.raw.sendAudio({
            chat_id: ref_id,
            audio: ctx.msg.audio.file_id,
            caption: ctx.msg?.caption,
          });
          return;
        }
        if (ctx.msg?.contact) {
          await ctx.api.raw.sendContact({
            chat_id: ref_id,
            phone_number: ctx.msg.contact?.phone_number,
            first_name: ctx.msg.contact?.first_name,
            last_name: ctx.msg.contact?.last_name,
            vcard: ctx.msg.contact?.vcard,
          });
          return;
        }
        if (ctx.msg?.document) {
          await ctx.api.raw.sendDocument({
            chat_id: ref_id,
            document: ctx.msg?.document?.file_id,
            caption: ctx.msg?.caption,
          });
          return;
        }
        if (ctx.msg?.location) {
          await ctx.api.raw.sendLocation({
            chat_id: ref_id,
            longitude: ctx.msg?.location?.longitude || 0,
            latitude: ctx.msg?.location?.latitude || 0,
            horizontal_accuracy: ctx.msg?.location?.horizontal_accuracy || 0,
            live_period: ctx.msg?.location?.live_period || 0,
            heading: ctx.msg?.location?.heading || 0,
            proximity_alert_radius:
              ctx.msg?.location?.proximity_alert_radius || 0,
          });
          return;
        }
        if (ctx.msg?.photo) {
          const _fl = ctx.message.photo;
          const _highID = _fl?.pop();

          await ctx.api.raw.sendPhoto({
            chat_id: ref_id,
            photo: _highID?.file_id!,
            caption: ctx.message?.caption,
          });
          return;
        }
        if (ctx.msg?.text) {
          await ctx.api.raw.sendMessage({
            chat_id: ref_id,
            text: ctx.msg?.text,
          });
          return;
        }
        if (ctx.msg?.sticker) {
          const _fl = ctx.message?.sticker!;
          await ctx.api.raw.sendSticker({
            chat_id: ref_id,
            sticker: _fl.file_id,
          });
          return;
        }
        if (ctx.msg?.video) {
          const _fl = ctx.message?.video!;
          await ctx.api.raw.sendVideo({
            chat_id: ref_id,
            video: _fl.file_id,
          });
          return;
        }
        if (ctx.msg?.video_note) {
          const _fl = ctx.message?.video_note!;
          await ctx.api.raw.sendVideoNote({
            chat_id: ref_id,
            video_note: _fl.file_id,
          });
        }
        if (ctx.msg?.voice) {
          const _fl = ctx.message?.voice!;
          await ctx.api.raw.sendVoice({
            chat_id: ref_id,
            voice: _fl.file_id!,
            caption: ctx.message?.caption,
          });
          return;
        }
      } else {
        //console.warn("you can reply to forwarded msg.");
        await ctx.reply("🚫 You can only reply to forwarded message.");
        return;
      }
    }
  );

bot.catch((err) => {
  const ctx = err?.ctx;
  console.warn(`Error while handling update ${ctx?.update?.update_id}:`);
  const e = err?.error;
  if (e instanceof GrammyError) {
    console.warn("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.warn("Could not contact Telegram:", e);
  } else {
    console.warn("Unknown error:", e);
  }
});
