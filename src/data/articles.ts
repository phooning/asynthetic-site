import { getCollection, type CollectionEntry } from "astro:content";

export type ArticleCollection = "blog" | "research";
export type Article<C extends ArticleCollection = ArticleCollection> =
  CollectionEntry<C>;

/**
 * Entries visible in the current build, newest first. Drafts appear in
 * development and are omitted from production builds.
 */
export async function getArticles<C extends ArticleCollection>(
  collection: C,
): Promise<Article<C>[]> {
  const entries = await getCollection(collection, ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );

  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const formatArticleDate = (value: Date) =>
  new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(value);
