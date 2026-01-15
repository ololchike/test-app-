import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { Clock, Eye, ChevronRight, ChevronLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SectionError } from "@/components/error"

export const metadata: Metadata = {
  title: "Safari Blog | SafariPlus",
  description: "Expert tips, destination guides, and safari stories from East Africa. Plan your perfect safari adventure with our travel insights.",
}

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

async function getBlogPosts(page: number = 1, perPage: number = 12) {
  const skip = (page - 1) * perPage

  // Get featured post first (always show on page 1)
  const featuredPost = page === 1 ? await prisma.blogPost.findFirst({
    where: { status: "PUBLISHED", isFeatured: true },
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
    orderBy: { publishedAt: "desc" },
  }) : null

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        // Exclude featured post from regular list on page 1
        ...(featuredPost && page === 1 ? { id: { not: featuredPost.id } } : {}),
      },
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
        { publishedAt: "desc" },
      ],
      skip,
      take: perPage,
    }),
    prisma.blogPost.count({
      where: { status: "PUBLISHED" },
    }),
  ])

  return {
    featuredPost,
    posts,
    total,
    totalPages: Math.ceil(total / perPage),
  }
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

export default async function BlogPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams
  const page = parseInt(pageParam || "1", 10)

  const [{ featuredPost, posts, total, totalPages }, categories] = await Promise.all([
    getBlogPosts(page),
    getCategories(),
  ])

  const regularPosts = posts

  return (
    <div className="pt-20 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <SectionError name="Blog Header">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Safari Blog</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expert tips, destination guides, and inspiring stories from East Africa.
              Plan your perfect safari adventure with our travel insights.
            </p>
          </div>
        </SectionError>

        {/* Categories */}
        <SectionError name="Categories">
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
        </SectionError>

        {/* Featured Post - Only on page 1 */}
        <SectionError name="Featured Post">
          {featuredPost && page === 1 && (
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
        </SectionError>

        {/* Posts Grid */}
        <SectionError name="Blog Posts">
          {regularPosts.length > 0 ? (
            <>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  {page > 1 && (
                    <Button variant="outline" asChild>
                      <Link href={`/blog?page=${page - 1}`}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Link>
                    </Button>
                  )}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      // Show pages around current page
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (page <= 3) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = page - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          asChild
                        >
                          <Link href={`/blog?page=${pageNum}`}>{pageNum}</Link>
                        </Button>
                      )
                    })}
                  </div>
                  {page < totalPages && (
                    <Button variant="outline" asChild>
                      <Link href={`/blog?page=${page + 1}`}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              )}

              {/* Total count */}
              <p className="text-center text-sm text-muted-foreground mt-4">
                Showing {regularPosts.length} of {total} posts
              </p>
            </>
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
        </SectionError>
      </div>
    </div>
  )
}
