/**
 * GitHub API service
 * Handles all communication with GitHub's REST API
 */

const GITHUB_API = "https://api.github.com";

interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  html_url: string;
}

interface GitHubEvent {
  type: string;
  created_at: string;
  payload: {
    commits?: { message: string }[];
    size?: number;
  };
}

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

// Fetches with the user's OAuth token for higher rate limits
async function githubFetch<T>(
  endpoint: string,
  accessToken: string
): Promise<T> {
  const res = await fetch(`${GITHUB_API}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// Paginates through all results automatically
async function githubFetchAll<T>(
  endpoint: string,
  accessToken: string
): Promise<T[]> {
  const results: T[] = [];
  let page = 1;

  while (true) {
    const separator = endpoint.includes("?") ? "&" : "?";
    const data = await githubFetch<T[]>(
      `${endpoint}${separator}per_page=100&page=${page}`,
      accessToken
    );

    if (!Array.isArray(data) || data.length === 0) break;
    results.push(...data);
    if (data.length < 100) break;
    page++;
  }

  return results;
}

export async function fetchUserProfile(
  username: string,
  accessToken: string
): Promise<GitHubUser> {
  return githubFetch<GitHubUser>(`/users/${username}`, accessToken);
}

export async function fetchUserRepos(
  username: string,
  accessToken: string
): Promise<GitHubRepo[]> {
  const repos = await githubFetchAll<GitHubRepo>(
    `/users/${username}/repos?type=owner&sort=updated`,
    accessToken
  );
  return repos.filter((r) => !r.fork); // Exclude forks
}

export async function fetchUserEvents(
  username: string,
  accessToken: string
): Promise<GitHubEvent[]> {
  // GitHub returns only events from the last 90 days via this endpoint.
  return githubFetchAll<GitHubEvent>(
    `/users/${username}/events`,
    accessToken
  );
}
