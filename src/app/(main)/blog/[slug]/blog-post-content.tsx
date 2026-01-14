"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import {
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  Play,
  X,
  ArrowRight,
  Camera,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RichTextViewer } from "@/components/ui/rich-text-viewer"
import { ImageLightbox } from "@/components/ui/image-lightbox"
import {
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  StaggerContainer,
  StaggerItem,
  ScaleIn,
} from "@/components/ui/motion"
import { toast } from "sonner"

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  coverImage: string | null
  images: string[]
  videoUrl: string | null
  authorId: string | null
  authorName: string | null
  authorBio: string | null
  authorAvatar: string | null
  tags: string[]
  viewCount: number
  readingTime: number | null
  publishedAt: string | null
  category: {
    id: string
    name: string
    slug: string
    color: string | null
  } | null
  submitter: {
    id: string
    name: string | null
    avatar: string | null
  } | null
}

interface RelatedPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: string | null
  readingTime: number | null
  category: {
    name: string
    color: string | null
  } | null
}

interface RecentPost {
  id: string
  slug: string
  title: string
  coverImage: string | null
  publishedAt: string | null
  readingTime: number | null
}

interface Props {
  post: BlogPost
  relatedPosts: RelatedPost[]
  recentPosts: RecentPost[]
}

export function BlogPostContent({ post, relatedPosts, recentPosts }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const relatedScrollRef = useRef<HTMLDivElement>(null)

  // Gallery shows all images including cover for lightbox
  const allImages = post.coverImage
    ? [post.coverImage, ...post.images]
    : post.images

  // Gallery section shows only additional images (not cover which is in hero)
  const galleryImages = post.images

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const scrollRelated = (direction: "left" | "right") => {
    if (relatedScrollRef.current) {
      const scrollAmount = 340
      relatedScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const shareUrl = typeof window !== "undefined"
    ? window.location.href
    : `${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success("Link copied to clipboard!")
  }

  const authorName = post.authorName || post.submitter?.name || "SafariPlus Team"
  const authorAvatar = post.authorAvatar || post.submitter?.avatar

  return (
    <article className="pt-20 pb-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-[350px] md:h-[450px] lg:h-[500px] bg-muted overflow-hidden"
      >
        {post.coverImage && (
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button variant="ghost" className="text-white mb-4 -ml-2 hover:bg-white/10" asChild>
                <Link href="/blog">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Blog
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
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
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-4xl"
            >
              {post.title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap items-center gap-4 text-white/80"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-white/30">
                  <AvatarImage src={authorAvatar || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {authorName[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{authorName}</span>
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
            </motion.div>
          </div>
        </div>

        {/* Photo count badge */}
        {allImages.length > 1 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            onClick={() => openLightbox(0)}
            className="absolute bottom-8 right-4 md:right-8 bg-white/90 backdrop-blur-sm text-black px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-white transition-colors flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            View all {allImages.length} photos
          </motion.button>
        )}
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Excerpt */}
            {post.excerpt && (
              <FadeInUp>
                <p className="text-xl text-muted-foreground mb-8 font-medium leading-relaxed">
                  {post.excerpt}
                </p>
              </FadeInUp>
            )}

            {/* Share Buttons - Mobile */}
            <FadeInUp delay={0.1}>
              <div className="flex items-center gap-2 mb-8 pb-8 border-b lg:hidden">
                <span className="text-sm text-muted-foreground mr-2">Share:</span>
                <Button size="icon" variant="outline" className="h-9 w-9" onClick={copyLink}>
                  <Link2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="h-9 w-9" asChild>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
                <Button size="icon" variant="outline" className="h-9 w-9" asChild>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
                <Button size="icon" variant="outline" className="h-9 w-9" asChild>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </FadeInUp>

            {/* Article Content */}
            <FadeInUp delay={0.2}>
              <RichTextViewer content={post.content} />
            </FadeInUp>

            {/* Image Gallery */}
            {galleryImages.length > 0 && (
              <FadeInUp delay={0.1}>
                <div className="mt-10 pt-10 border-t">
                  <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Photo Gallery
                  </h3>
                  <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {galleryImages.map((image, index) => (
                      <StaggerItem key={index}>
                        <motion.button
                          onClick={() => openLightbox(post.coverImage ? index + 1 : index)}
                          className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Image
                            src={image}
                            alt={`${post.title} - Image ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileHover={{ opacity: 1, scale: 1 }}
                              className="bg-white/90 backdrop-blur-sm rounded-full p-2"
                            >
                              <Camera className="h-5 w-5" />
                            </motion.div>
                          </div>
                        </motion.button>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </FadeInUp>
            )}

            {/* Video */}
            {post.videoUrl && (
              <FadeInUp delay={0.1}>
                <div className="mt-10 pt-10 border-t">
                  <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
                    <Play className="h-5 w-5 text-primary" />
                    Video
                  </h3>
                  <motion.div
                    className="relative aspect-video rounded-xl overflow-hidden bg-black"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    {!showVideo ? (
                      <button
                        onClick={() => setShowVideo(true)}
                        className="absolute inset-0 flex items-center justify-center group"
                      >
                        {post.coverImage && (
                          <Image
                            src={post.coverImage}
                            alt="Video thumbnail"
                            fill
                            className="object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                        <motion.div
                          className="relative z-10 bg-white rounded-full p-4 shadow-xl"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Play className="h-8 w-8 text-primary fill-primary" />
                        </motion.div>
                      </button>
                    ) : (
                      <video
                        src={post.videoUrl}
                        controls
                        autoPlay
                        className="w-full h-full"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </motion.div>
                </div>
              </FadeInUp>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <FadeInUp delay={0.1}>
                <div className="mt-10 pt-10 border-t">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {post.tags.map((tag) => (
                      <motion.div
                        key={tag}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                          {tag}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </FadeInUp>
            )}

            {/* Author Bio */}
            {post.authorBio && (
              <FadeInUp delay={0.1}>
                <div className="mt-10 pt-10 border-t">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                          <AvatarImage src={authorAvatar || undefined} />
                          <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                            {authorName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Written by</p>
                          <h3 className="font-semibold text-lg">{authorName}</h3>
                          <p className="text-muted-foreground mt-2">{post.authorBio}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </FadeInUp>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Share Buttons - Desktop */}
              <FadeInRight delay={0.1}>
                <Card className="hidden lg:block">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-4">
                      SHARE THIS POST
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" onClick={copyLink}>
                        <Link2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" asChild>
                        <a
                          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button size="icon" variant="outline" asChild>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Facebook className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button size="icon" variant="outline" asChild>
                        <a
                          href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </FadeInRight>

              {/* Recent Posts */}
              {recentPosts.length > 0 && (
                <FadeInRight delay={0.2}>
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-sm text-muted-foreground mb-4">
                        RECENT POSTS
                      </h3>
                      <div className="space-y-4">
                        {recentPosts.map((recentPost, index) => (
                          <motion.div
                            key={recentPost.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * index }}
                          >
                            <Link
                              href={`/blog/${recentPost.slug}`}
                              className="flex gap-3 group"
                            >
                              {recentPost.coverImage && (
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                  <Image
                                    src={recentPost.coverImage}
                                    alt={recentPost.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                  {recentPost.title}
                                </h4>
                                {recentPost.publishedAt && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {format(new Date(recentPost.publishedAt), "MMM d, yyyy")}
                                  </p>
                                )}
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </FadeInRight>
              )}

              {/* CTA */}
              <FadeInRight delay={0.3}>
                <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden">
                  <CardContent className="pt-6 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                      <h3 className="font-semibold text-lg mb-2">
                        Ready for Your Safari?
                      </h3>
                      <p className="text-sm opacity-90 mb-4">
                        Browse our curated collection of safari tours across East Africa.
                      </p>
                      <Button variant="secondary" asChild className="w-full group">
                        <Link href="/tours">
                          Browse Tours
                          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </FadeInRight>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="bg-muted/50 py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FadeInUp>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">Related Posts</h2>
                  <p className="text-muted-foreground mt-1">
                    More stories you might enjoy
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scrollRelated("left")}
                    className="rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scrollRelated("right")}
                    className="rounded-full"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </FadeInUp>

            <div
              ref={relatedScrollRef}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {relatedPosts.map((relatedPost, index) => (
                <motion.div
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex-shrink-0 w-[300px] md:w-[340px] snap-start"
                >
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <Card className="h-full overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        {relatedPost.coverImage ? (
                          <Image
                            src={relatedPost.coverImage}
                            alt={relatedPost.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Camera className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        {relatedPost.category && (
                          <Badge
                            className="absolute top-3 left-3"
                            style={{
                              backgroundColor: relatedPost.category.color || undefined,
                            }}
                          >
                            {relatedPost.category.name}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedPost.title}
                        </h3>
                        {relatedPost.excerpt && (
                          <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                            {relatedPost.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                          {relatedPost.publishedAt && (
                            <span>{format(new Date(relatedPost.publishedAt), "MMM d, yyyy")}</span>
                          )}
                          {relatedPost.readingTime && (
                            <span>{relatedPost.readingTime} min read</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            <FadeInUp delay={0.2}>
              <div className="text-center mt-8">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/blog">
                    View All Posts
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </FadeInUp>
          </div>
        </section>
      )}

      {/* Lightbox */}
      <ImageLightbox
        images={allImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </article>
  )
}
