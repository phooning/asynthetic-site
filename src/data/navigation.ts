export interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
  /** Show only while this article collection has entries in the build. */
  collection?: "blog" | "research";
}

export const primaryNavigation: NavigationItem[] = [
  { label: "Work", href: "/#work" },
  { label: "Approach", href: "/#approach" },
  { label: "About", href: "/#about" },
  { label: "Blog", href: "/blog/", collection: "blog" },
  { label: "GitHub", href: "https://github.com/phooning", external: true },
];
