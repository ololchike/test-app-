import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { Clock, Eye, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Safari Blog | SafariPlus",
  description: "Expert tips, destination guides, and safari stories from East Africa. Plan your perfect safari adventure with our travel insights.",
}

async function getBlogPosts() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      authorName: true,
      authorAvatar: true,
      tags: true,
      isFeatured: true,
      viewCount: true,
      readingTime: true,
      publishedAt: true,
      category: {
        select: {
          slug: true,
          name: true,
          color: true,
        },
      },
    },
    orderBy: [
      { isFeatured: "desc" },
      { publishedAt: "desc" },
    ],
    take: 20,
  })

  return posts
}

async function getCategories() {
  const categories = await prisma.blogCategory.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      name: true,
      color: true,
      _count: {
        select: {
          posts: {
            where: { status: "PUBLISHED" },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  })

  return categories
}

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getBlogPosts(),
    getCategories(),
  ])

  const featuredPost = posts.find((p) => p.isFeatured)
  const regularPosts = posts.filter((p) => p.id !== featuredPost?.id)

  return (
    <div className="pt-20 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Safari Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expert tips, destination guides, and inspiring stories from East Africa.
            Plan your perfect safari adventure with our travel insights.
          </p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <Button variant="outline" asChild>
              <Link href="/blog">All Posts</Link>
            </Button>
            {categories.map((category) => (
              <Button
                key={category.slug}
                variant="outline"
                asChild
                style={{
                  borderColor: category.color || undefined,
                }}
              >
                <Link href={`/blog/category/${category.slug}`}>
                  {category.name}
                  <Badge variant="secondary" className="ml-2">
                    {category._count.posts}
                  </Badge>
                </Link>
              </Button>
            ))}
          </div>
        )}

        {/* Featured Post */}
        {featuredPost && (
          <Link href={`/blog/${featuredPost.slug}`} className="block mb-12">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-96">
                  {featuredPost.coverImage ? (
                    <Image
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  <Badge className="absolute top-4 left-4 bg-primary">
                    Featured
                  </Badge>
                </div>
                <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                  {featuredPost.category && (
                    <Badge
                      variant="outline"
                      className="w-fit mb-4"
                      style={{
                        borderColor: featuredPost.category.color || undefined,
                        color: featuredPost.category.color || undefined,
                      }}
                    >
                      {featuredPost.category.name}
                    </Badge>
                  )}
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    {featuredPost.title}
                  </h2>
                  {featuredPost.excerpt && (
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {featuredPost.publishedAt && (
                      <span>
                        {format(new Date(featuredPost.publishedAt), "MMM d, yyyy")}
                      </span>
                    )}
                    {featuredPost.readingTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {featuredPost.readingTime} min read
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {featuredPost.viewCount.toLocaleString()} views
                    </span>
                  </div>
                </CardContent>
              </div>
            </Card>
          </Link>
        )}

        {/* Posts Grid */}
        {regularPosts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {regularPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    {post.category && (
                      <Badge
                        variant="outline"
                        className="mb-3"
                        style={{
                          borderColor: post.category.color || undefined,
                          color: post.category.color || undefined,
                        }}
                      >
                        {post.category.name}
                      </Badge>
                    )}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {post.publishedAt && (
                        <span>
                          {format(new Date(post.publishedAt), "MMM d, yyyy")}
                        </span>
                      )}
                      {post.readingTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readingTime} min
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              No blog posts published yet.
            </p>
            <Button asChild>
              <Link href="/tours">
                Browse Tours Instead
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
