export function renderTemplate(template, vars) {
  let t = String(template || "");
  const map = {
    first_name: String(vars?.first_name || ""),
    username: String(vars?.username || ""),
    chat_title: String(vars?.chat_title || "")
  };

  t = t.replaceAll("{first_name}", map.first_name);
  t = t.replaceAll("{username}", map.username);
  t = t.replaceAll("{chat_title}", map.chat_title);

  return t;
}
