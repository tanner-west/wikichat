import { useState, useEffect } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { queryWikipedia, WikipediaSearchResult } from "@/services/queries";

export function useWikipediaSearch() {
  const [searchResults, setSearchResults] = useState<WikipediaSearchResult>();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const search = (term: string) => {
    setSearchTerm(term);
  };

  useEffect(() => {
    if (!debouncedSearchTerm) {
      return;
    }
    const encodedSearchTerm = encodeURIComponent(debouncedSearchTerm);
    queryWikipedia(encodedSearchTerm).then((results) => {
      if (!results) {
        return;
      }
      setSearchResults(results);
    });
  }, [debouncedSearchTerm]);

  return {
    search,
    searchResults,
  };
}
