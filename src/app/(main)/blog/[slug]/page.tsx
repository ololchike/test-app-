import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BlogPostContent } from "./blog-post-content"

interface Props {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      category: true,
      submitter: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  })

  if (!post || post.status !== "PUBLISHED") {
    return null
  }

  // Increment view count
  await prisma.blogPost.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {})

  return post
}

async function getRelatedPosts(postId: string, categoryId: string | null, tags: string[]) {
  const posts = await prisma.blogPost.findMany({
    where: {
      id: { not: postId },
      status: "PUBLISHED",
      OR: [
        { categoryId: categoryId || undefined },
        { tags: { hasSome: tags } },
      ],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      readingTime: true,
      category: {
        select: {
          name: true,
          color: true,
        },
      },
    },
    take: 6,
    orderBy: { publishedAt: "desc" },
  })

  return posts
}

async function getRecentPosts(excludeId: string) {
  const posts = await prisma.blogPost.findMany({
    where: {
      id: { not: excludeId },
      status: "PUBLISHED",
    },
    select: {
      id: true,
      slug: true,
      title: true,
      coverImage: true,
      publishedAt: true,
      readingTime: true,
    },
    take: 5,
    orderBy: { publishedAt: "desc" },
  })

  return posts
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      metaTitle: true,
      metaDescription: true,
      coverImage: true,
    },
  })

  if (!post) {
    return { title: "Post Not Found" }
  }

  return {
    title: post.metaTitle || `${post.title} | SafariPlus Blog`,
    description: post.metaDescription || post.excerpt || undefined,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
      type: "article",
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post.id, post.categoryId, post.tags)
  const recentPosts = await getRecentPosts(post.id)

  // Article JSON-LD Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.coverImage || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.authorName || post.submitter?.name || "SafariPlus Team",
    },
    publisher: {
      "@type": "Organization",
      name: "SafariPlus",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_APP_URL}/icons/icon-192x192.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`,
    },
  }

  // Serialize data for client component
  const serializedPost = {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() || null,
    reviewedAt: post.reviewedAt?.toISOString() || null,
  }

  const serializedRelatedPosts = relatedPosts.map(p => ({
    ...p,
    publishedAt: p.publishedAt?.toISOString() || null,
  }))

  const serializedRecentPosts = recentPosts.map(p => ({
    ...p,
    publishedAt: p.publishedAt?.toISOString() || null,
  }))

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <BlogPostContent
        post={serializedPost}
        relatedPosts={serializedRelatedPosts}
        recentPosts={serializedRecentPosts}
      />
    </>
  )
}
