import type { ImageMetadata } from "astro";
import hero from "../assets/sigma/hero.jpg";

export interface ProjectLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface ProjectMedia {
  wordmark: string;
  hero: ImageMetadata;
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
    name: "Sigma Canvas Studio",
    tagline: "Spatial media infrastructure",
    description:
      "Sigma is a local-first spatial workspace where images and video are first-class objects you can arrange, crop, scrub, and loop across an effectively unbounded workspace, rather than a folder tree.",
    metaDescription:
      "Sigma is a high-performance, local-first infinite spatial canvas for organizing, visualizing, and editing media from video to high-resolution imagery built on Rust and Tauri.",
    status: ["Local, offline use", "Rust + Tauri", "Desktop app"],
    technologies: ["React", "TypeScript", "Tauri", "Rust", "FFmpeg"],
    links: [
      { label: "Product page", href: "/products/sigma/" },
      {
        label: "GitHub",
        href: "https://github.com/phooning/sigma",
        external: true
      }
    ],
    media: {
      wordmark: "/assets/sigma/sigma-wordmark.svg",
      hero,
      socialImage: "/assets/sigma/sigma-og.jpg"
    }
  }
} as const satisfies Record<string, Project>;
