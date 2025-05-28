import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import type { GitHubRepo } from "./types";
import starIcon from './assets/star-symbol-icon.png';

const GITHUB_API = "https://api.github.com/search/repositories";

const getLast10DaysDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 10);
  return date.toISOString().split("T")[0];
};

const App: React.FC = () => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(GITHUB_API, {
        params: {
          q: `created:>${getLast10DaysDate()}`,
          sort: "stars",
          order: "desc",
          page,
        },
      });
      setRepos((prev) => [...prev, ...response.data.items]);
    } catch (error) {
      console.error("Error fetching repos:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRepos();
  }, [page]);

  const lastRepoRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading]
  );

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <h1 className="text-xl font-bold text-center text-gray-800 py-4 border-b">Trending Repos</h1>

          <div>
            {repos.map((repo, index) => {
              const isLast = index === repos.length - 1;
              return (
                <div
                  key={repo.id}
                  ref={isLast ? lastRepoRef : null}
                  className="p-4 border-b last:border-none hover:bg-gray-50 transition"
                >
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    {repo.name}
                  </h2>
                  <p className="text-sm text-gray-600 mb-3">
                    {repo.description || "No description available."}
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <img
                        src={repo.owner.avatar_url}
                        alt={repo.owner.login}
                        className="w-6 h-6 rounded-full border"
                      />
                      <span className="text-gray-700 font-medium">{repo.owner.login}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 font-medium">
                      {/* <span>⭐</span> */}
                      <img src={starIcon} alt="stars" className="w-5 h-5 object-contain" />
                      <span>{(repo.stargazers_count / 1000).toFixed(1)}k</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {loading && (
              <p className="text-center py-4 text-gray-500">Loading...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;