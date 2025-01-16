import { atom } from "jotai";
interface IArticle {
  title: string;
  url: string;
}
export const article = atom<IArticle>({
  title: "Harry Potter (film series)",
  url: "https://en.wikipedia.org/wiki/Harry_Potter_(film_series)",
});
