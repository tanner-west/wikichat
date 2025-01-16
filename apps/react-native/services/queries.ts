import { fetch } from "expo/fetch";
export type WikipediaSearchResult = Array<{ title: string; url: string }>;
export async function queryWikipedia(
  encodedSearchTerm: string
): Promise<WikipediaSearchResult | undefined> {
  try {
    if (!encodedSearchTerm) {
      throw new Error("queryWikipedia: missing search term");
    }
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodedSearchTerm}`
    );
    const data = await res.json();
    return data[1].map((title: string, i: number) => {
      return { title, url: data[3][i] };
    });
  } catch (error) {
    console.error("query wikipedia error: ", error);
  }
}
