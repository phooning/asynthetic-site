export interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
}

export const primaryNavigation: NavigationItem[] = [
  { label: "Work", href: "/#work" },
  { label: "Approach", href: "/#approach" },
  { label: "About", href: "/#about" },
  { label: "GitHub", href: "https://github.com/phooning", external: true },
];
