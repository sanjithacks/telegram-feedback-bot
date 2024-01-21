const ADMIN = Deno.env.get("ADMIN_IDS") || "11234567,09876543";

const CHANNEL = Deno.env.get("GROUP_ID") || "-10034567890";

const TOKEN =
  Deno.env.get("BOT_TOKEN") || "876567876545678:ASDFGhsguiwiuhgbnsoiuhnuy";

export const Env = {
  group_id: CHANNEL, //Group or Supergroup ID
  admins: ADMIN ? ADMIN.split(",") : [], //SUDO users ID
  token: TOKEN, //BOT token
};
