import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { Clock, Eye, ChevronLeft, Calendar, Tag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Props {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      category: true,
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
    },
    take: 3,
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
      name: post.authorName || "SafariPlus Team",
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

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article className="pt-20 pb-16">
        {/* Hero */}
        <div className="relative h-[300px] md:h-[400px] bg-muted">
          {post.coverImage && (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <Button variant="ghost" className="text-white mb-4 -ml-2" asChild>
                <Link href="/blog">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Blog
                </Link>
              </Button>
              {post.category && (
                <Badge
                  className="mb-4"
                  style={{
                    backgroundColor: post.category.color || undefined,
                  }}
                >
                  {post.category.name}
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.authorAvatar || undefined} />
                    <AvatarFallback>
                      {(post.authorName || "S")[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>{post.authorName || "SafariPlus Team"}</span>
                </div>
                {post.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                  </span>
                )}
                {post.readingTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readingTime} min read
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.viewCount.toLocaleString()} views
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {post.excerpt && (
                <p className="text-xl text-muted-foreground mb-8 font-medium">
                  {post.excerpt}
                </p>
              )}

              {/* Article Content */}
              <div
                className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Bio */}
              {post.authorBio && (
                <div className="mt-8 pt-8 border-t">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={post.authorAvatar || undefined} />
                      <AvatarFallback className="text-xl">
                        {(post.authorName || "S")[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {post.authorName || "SafariPlus Team"}
                      </h3>
                      <p className="text-muted-foreground mt-1">
                        {post.authorBio}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-lg mb-4">
                        Related Posts
                      </h3>
                      <div className="space-y-4">
                        {relatedPosts.map((relatedPost) => (
                          <Link
                            key={relatedPost.id}
                            href={`/blog/${relatedPost.slug}`}
                            className="flex gap-3 group"
                          >
                            {relatedPost.coverImage && (
                              <div className="relative w-20 h-16 rounded overflow-hidden flex-shrink-0">
                                <Image
                                  src={relatedPost.coverImage}
                                  alt={relatedPost.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                {relatedPost.title}
                              </h4>
                              {relatedPost.publishedAt && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(relatedPost.publishedAt), "MMM d, yyyy")}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* CTA */}
                <Card className="bg-primary text-primary-foreground">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-2">
                      Ready for Your Safari?
                    </h3>
                    <p className="text-sm opacity-90 mb-4">
                      Browse our curated collection of safari tours across East Africa.
                    </p>
                    <Button variant="secondary" asChild className="w-full">
                      <Link href="/tours">Browse Tours</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  )
}
