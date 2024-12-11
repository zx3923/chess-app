export async function getAccessToken(code: string) {
  let accessTokenURL = "https://github.com/login/oauth/access_token";

  const accessTokenParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET_KEY!,
    code: code,
  }).toString();

  accessTokenURL = `${accessTokenURL}?${accessTokenParams}`;

  const { error, access_token } = await (
    await fetch(accessTokenURL, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  return { error, access_token };
}

export async function getGithubEmail(access_token: string): Promise<string> {
  const userEmailResponse = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: "no-cache",
  });
  let email = "";
  const githubEmail = await userEmailResponse.json();

  for (let mail of githubEmail) {
    if (mail.primary && mail.verified && mail.visibility === "public") {
      email = mail.email;
      break;
    }
  }

  return email;
}

interface IProfileResponse {
  id: number;
  name: string;
  avatar_url: string;
}

export async function getGithubPropfile(
  access_token: string
): Promise<IProfileResponse> {
  const userProfileResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: "no-cache",
  });
  const profile = await userProfileResponse.json();

  return {
    id: profile.id,
    name: profile.name,
    avatar_url: profile.avatar_url,
  };
}
