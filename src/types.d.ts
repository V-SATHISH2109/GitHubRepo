export interface GitHubRepo {
    id: number;
    name: string;
    description: string;
    stargazers_count: number;
    owner: {
      login: string;
      avatar_url: string;
    };
  }
  