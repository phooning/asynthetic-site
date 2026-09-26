export interface ProjectLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface ProjectMedia {
  wordmark: string;
  hero: string;
  heroSources?: readonly { src: string; width: number }[];
  socialImage: string;
}

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  metaDescription: string;
  status: readonly string[];
  technologies: readonly string[];
  links: readonly ProjectLink[];
  media: ProjectMedia;
}

export const projects = {
  sigma: {
    slug: "sigma",
    name: "SIGMA Canvas Studio",
    tagline: "Spatial media infrastructure",
    description:
      "SIGMA is a local-first, Rust-backed spatial canvas where images and video are first-class objects you can arrange, crop, scrub, and loop across an effectively unbounded workspace, rather than a folder tree.",
    metaDescription:
      "SIGMA is a high-performance, local-first infinite spatial canvas for organizing, visualizing, and editing media from video to high-resolution imagery built on Rust and Tauri.",
    status: ["Local, offline use", "Rust + Tauri", "Desktop app"],
    technologies: ["React", "TypeScript", "Tauri", "Rust", "FFmpeg"],
    links: [
      { label: "Product page", href: "/products/sigma/" },
      {
        label: "GitHub",
        href: "https://github.com/phooning/sigma",
        external: true,
      },
    ],
    media: {
      wordmark: "/assets/sigma/sigma-wordmark.svg",
      hero: "/assets/sigma/sigma-hero-1200.jpg",
      heroSources: [
        { src: "/assets/sigma/sigma-hero-800.jpg", width: 800 },
        { src: "/assets/sigma/sigma-hero-1200.jpg", width: 1200 },
        { src: "/assets/sigma/sigma-hero-1600.jpg", width: 1600 },
      ],
      socialImage: "/assets/sigma/sigma-og.jpg",
    },
  },
} as const satisfies Record<string, Project>;

export const projectList: Project[] = Object.values(projects);
