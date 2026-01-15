import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { Clock, Eye, ChevronRight, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SectionError } from "@/components/error"

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

async function getCategory(slug: string) {
  const category = await prisma.blogCategory.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      color: true,
    },
  })

  return category
}

async function getCategoryPosts(categoryId: string, page: number = 1, perPage: number = 12) {
  const skip = (page - 1) * perPage

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        categoryId,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        authorName: true,
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
      skip,
      take: perPage,
    }),
    prisma.blogPost.count({
      where: {
        status: "PUBLISHED",
        categoryId,
      },
    }),
  ])

  return { posts, total, totalPages: Math.ceil(total / perPage) }
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return {
      title: "Category Not Found | SafariPlus",
    }
  }

  return {
    title: `${category.name} | Safari Blog | SafariPlus`,
    description: category.description || `Browse ${category.name} articles on SafariPlus blog.`,
  }
}

export default async function BlogCategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = parseInt(pageParam || "1", 10)

  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const [{ posts, total, totalPages }, categories] = await Promise.all([
    getCategoryPosts(category.id, page),
    getCategories(),
  ])

  return (
    <div className="pt-20 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <SectionError name="Navigation">
          <div className="mb-6">
            <Button variant="ghost" asChild className="pl-0">
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                All Posts
              </Link>
            </Button>
          </div>
        </SectionError>

        {/* Header */}
        <SectionError name="Category Header">
          <div className="text-center mb-12">
            <Badge
              className="mb-4 text-lg px-4 py-1"
              style={{
                backgroundColor: category.color || undefined,
                color: category.color ? "#fff" : undefined,
              }}
            >
              {category.name}
            </Badge>
            <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {category.description}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {total} {total === 1 ? "article" : "articles"}
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
              {categories.map((cat) => (
                <Button
                  key={cat.slug}
                  variant={cat.slug === slug ? "default" : "outline"}
                  asChild
                  style={{
                    borderColor: cat.color || undefined,
                    backgroundColor: cat.slug === slug ? cat.color || undefined : undefined,
                  }}
                >
                  <Link href={`/blog/category/${cat.slug}`}>
                    {cat.name}
                    <Badge variant="secondary" className="ml-2">
                      {cat._count.posts}
                    </Badge>
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </SectionError>

        {/* Posts Grid */}
        <SectionError name="Category Posts">
          {posts.length > 0 ? (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
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
                        {post.isFeatured && (
                          <Badge className="absolute top-3 left-3 bg-primary">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-5">
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
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.viewCount.toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {page > 1 && (
                    <Button variant="outline" asChild>
                      <Link href={`/blog/category/${slug}?page=${page - 1}`}>
                        Previous
                      </Link>
                    </Button>
                  )}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="sm"
                        asChild
                      >
                        <Link href={`/blog/category/${slug}?page=${p}`}>{p}</Link>
                      </Button>
                    ))}
                  </div>
                  {page < totalPages && (
                    <Button variant="outline" asChild>
                      <Link href={`/blog/category/${slug}?page=${page + 1}`}>
                        Next
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                No articles in this category yet.
              </p>
              <Button asChild>
                <Link href="/blog">
                  View All Posts
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
