import { createMDXSource } from "fumadocs-mdx";
import { InferMetaType, InferPageType, loader } from "fumadocs-core/source";
import { blogPosts } from "@/.source";

const mdxSource = createMDXSource(blogPosts);
export const blog = loader({
  baseUrl: "/blog",
  source: { files: mdxSource.files() },
});

export type BlogPage = InferPageType<typeof blog>;
export type BlogMeta = InferMetaType<typeof blog>;
