// Defining schema interface
export interface UserSchema {
  user_id: string;
  name: string;
  date: string;
}

// Defining schema interface
export interface MessageSchema {
  message_id: string;
  user_id: string;
  name: string;
}

export const kv = await Deno.openKv();
