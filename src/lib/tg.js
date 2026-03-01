export function isPrivateChat(ctx) {
  return ctx.chat?.type === "private";
}

export function isGroupChat(ctx) {
  return ctx.chat?.type === "group" || ctx.chat?.type === "supergroup";
}
