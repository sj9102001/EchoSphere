"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton"; 

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
  published_at: string;
}

const NewsPage = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/news");
        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }
        const data = await response.json();

        // ✅ Fix: Ensure `data.results` exists before setting state
        if (data && Array.isArray(data.results)) {
          setNews(data.results);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

    fetchNews();
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen py-10 px-4 md:px-10">
      <h2 className="text-3xl font-bold text-center mb-6">📰 Latest News</h2>

      {error && (
        <div className="flex items-center justify-center text-red-400">
          <p className="text-lg">Error: {error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? // ✅ Skeleton Loaders
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-gray-800 p-5 rounded-xl shadow-md">
                <Skeleton className="h-48 w-full rounded-md" />
                <Skeleton className="h-6 w-3/4 mt-3" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-5/6 mt-2" />
                <Skeleton className="h-4 w-1/3 mt-3" />
              </div>
            ))
          : news.length > 0
          ? // ✅ Show News Articles
            news.map((article) => (
              <a
                key={article.id}
                href={article.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-5 rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
              >
                {article.image && (
                  <div className="relative w-full h-48 rounded-md overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </div>
                )}
                <h3 className="text-xl font-semibold mt-3">{article.title}</h3>
                <p className="text-gray-400 mt-2 line-clamp-3">{article.description}</p>
                <p className="text-gray-500 text-sm mt-3">
                  📅 {new Date(article.published_at).toLocaleString()}
                </p>
              </a>
            ))
          : // ✅ Handle case where no news is available
            !loading && (
              <div className="text-center text-gray-400">
                <p>No news available at the moment.</p>
              </div>
            )}
      </div>
    </div>
  );
};

export default NewsPage;
