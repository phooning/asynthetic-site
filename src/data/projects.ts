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

export interface ReleasePlatform {
  os: string;
  arch: string;
  formats: readonly string[];
}

export interface ProjectRelease {
  version: string;
  /** Release channel label, e.g. "Experimental preview". */
  channel: string;
  date: string;
  url: string;
  platforms: readonly ReleasePlatform[];
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
  release?: ProjectRelease;
}

export const projects = {
  sigma: {
    slug: "sigma",
    name: "Sigma Canvas",
    tagline: "Spatial media infrastructure",
    description:
      "Sigma is a local-first spatial workspace where images and video are first-class objects you can arrange, crop, scrub, and loop across an effectively unbounded workspace, rather than a folder tree.",
    metaDescription:
      "Sigma Canvas is the operating workspace for creative media: a high-performance, locally friendly spatial canvas for organizing, visualizing, and refining 4K video, hi-res photos, and more. Built on Rust and Tauri.",
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
    },
    release: {
      version: "0.1.0",
      channel: "Experimental preview",
      date: "2026-05-13",
      url: "https://github.com/phooning/sigma/releases",
      platforms: [
        { os: "macOS", arch: "Apple Silicon", formats: [".dmg", ".app.tar.gz"] },
        { os: "Windows", arch: "x64", formats: [".exe", ".msi"] },
        { os: "Linux", arch: "x64", formats: [".AppImage", ".deb", ".rpm"] }
      ]
    }
  }
} as const satisfies Record<string, Project>;
