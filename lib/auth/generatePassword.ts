import { PASSWORD_CHARSET } from "./charsets";

export function generateRandomPassword(length = 10) {
  const chars = PASSWORD_CHARSET;
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
