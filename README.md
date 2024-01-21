# Telegram Feedback Bot

A simple telegram feedback bot written in Typescript Deno using [Grammy](https://github.com/grammyjs/grammY) inspired from Livegram Bot.

This bot can forward private message to targeted group or supergroup after added as admin.

⚠️ Message_id auto deleted after 7 days, how ever you can modify or remove this line to not delete.

From

```ts
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
```

To

```ts
const dc = await ctx.forwardMessage(Env.group_id); //Forward message to SUDO group or supergroup.
await kv.set(["messages", dc.message_id.toString()], {
  message_id: dc.message_id.toString(),
  user_id: id.toString(),
  name: first_name,
}); //Not expire
```

## Features

- Only admin or SUDO users can reply back to forwarded message.
- Supported replies

  - animation 🪄
  - audio 🔉
  - contact 🤳
  - document 📄
  - location 🌍
  - photo 🖼️
  - text 🅰️
  - sticker 🎨
  - video 🎥
  - video_note 🎥📝
  - voice 🎤
  - You can add more...

- Using Deno KV for low latency.

## Environment variables

Example of environment variables

| Name      | Example               | Required |
| --------- | --------------------- | -------- |
| BOT_TOKEN | 10030303:xuzissjsljsl | ✅       |
| ADMIN_IDS | 109091122,2982282982  | ✅       |
| GROUP_ID  | -100388398398         | ✅       |

## Bot commands

Commands avilable in bot

- ✅ => Available for both admins and users
- ❌ => Available for admins only

| Command | Description                                 | Permission |
| ------- | ------------------------------------------- | ---------- |
| start   | Start the bot                               | ✅         |
| export  | Export list of user_id or message_id as csv | ❌         |

- Example usage of Export command

  1.  Export user_ids `/export users` or `/export`
  2.  Export message_ids `/export messages`

## How to start

Must installed Deno in your system

### 1. Start Development

```bash
deno task dev
```

### 2. Start Production

```bash
deno task start
```

### 3. Set webook

Make a GET request to API

```
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<DEPLOYMENT_URL>.deno.dev/<BOT_TOKEN>
```
