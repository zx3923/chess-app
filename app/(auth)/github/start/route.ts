import { redirect } from "next/navigation";

export function GET() {
  const baseURL = "https://github.com/login/oauth/authorize";
  const formattedParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    scope: "read:user,user:email",
    allow_signup: "false",
  }).toString();
  const finalUrl = `${baseURL}?${formattedParams}`;
  return redirect(finalUrl);
}
