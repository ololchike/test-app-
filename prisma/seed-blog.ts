import { PrismaClient, BlogPostStatus, BlogSubmitterType, Prisma } from "@prisma/client"

const prisma = new PrismaClient()

// Type for blog post seed data
type BlogPostSeed = {
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  images: string[]
  categoryId: string
  tags: string[]
  authorId: string
  authorName: string | null
  status: BlogPostStatus
  submittedBy: BlogSubmitterType
  submitterId: string
  isFeatured: boolean
  publishedAt?: Date | null
  viewCount: number
  readingTime: number
  reviewedBy?: string
  reviewedAt?: Date
  rejectionReason?: string
}

// Sample Cloudinary/Unsplash images for blog posts
const blogImages = {
  safari: [
    "https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=1200",
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200",
    "https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=1200",
  ],
  wildlife: [
    "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?q=80&w=1200",
    "https://images.unsplash.com/photo-1574068468520-6bfe0c3b9fd0?q=80&w=1200",
    "https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=1200",
  ],
  destinations: [
    "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?q=80&w=1200",
    "https://images.unsplash.com/photo-1523805009345-7448845a9e53?q=80&w=1200",
    "https://images.unsplash.com/photo-1516298773066-c48f8e9bd92b?q=80&w=1200",
  ],
  travel: [
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200",
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200",
  ],
}

async function main() {
  console.log("🌱 Starting blog seed...")

  // Create blog categories
  const categories = [
    {
      slug: "safari-tips",
      name: "Safari Tips",
      description: "Expert advice and tips for planning your perfect safari adventure",
      color: "#D97706",
      order: 1,
    },
    {
      slug: "travel-stories",
      name: "Travel Stories",
      description: "Personal accounts and experiences from safari travelers",
      color: "#059669",
      order: 2,
    },
    {
      slug: "wildlife",
      name: "Wildlife",
      description: "Learn about African wildlife and conservation efforts",
      color: "#7C3AED",
      order: 3,
    },
    {
      slug: "destinations",
      name: "Destinations",
      description: "Explore amazing safari destinations across Africa",
      color: "#DC2626",
      order: 4,
    },
    {
      slug: "conservation",
      name: "Conservation",
      description: "Wildlife conservation and sustainable tourism",
      color: "#0891B2",
      order: 5,
    },
  ]

  const createdCategories: Record<string, string> = {}

  for (const category of categories) {
    const created = await prisma.blogCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
    createdCategories[category.slug] = created.id
    console.log(`✅ Created/Updated category: ${category.name}`)
  }

  // Get existing users
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } })
  const agentUser = await prisma.user.findFirst({ where: { role: "AGENT" } })
  const clientUser = await prisma.user.findFirst({ where: { role: "CLIENT" } })

  if (!adminUser) {
    console.log("⚠️ No admin user found. Run main seed first.")
    return
  }

  // Blog posts data
  const blogPosts: BlogPostSeed[] = [
    // Admin published posts
    {
      slug: "ultimate-guide-first-safari",
      title: "The Ultimate Guide to Your First Safari",
      excerpt: "Everything you need to know before embarking on your first African safari adventure. From packing tips to wildlife etiquette.",
      content: `
<h2>Planning Your First Safari</h2>
<p>Embarking on your first African safari is an experience that will stay with you forever. The vast savannahs, incredible wildlife, and stunning sunsets create memories that last a lifetime. Here's everything you need to know to make your first safari unforgettable.</p>

<h3>When to Go</h3>
<p>The best time for safari depends on what you want to see. The dry season (June to October) offers the best wildlife viewing as animals gather around water sources. However, the wet season brings lush landscapes and fewer tourists.</p>

<h3>What to Pack</h3>
<ul>
<li>Neutral-colored clothing (khaki, olive, brown)</li>
<li>Good quality binoculars</li>
<li>Sunscreen and insect repellent</li>
<li>Camera with a good zoom lens</li>
<li>Comfortable walking shoes</li>
</ul>

<h3>Wildlife Etiquette</h3>
<p>Respect the animals and their habitat. Never approach wildlife too closely, keep noise to a minimum, and always follow your guide's instructions. Remember, you're a guest in their home.</p>

<h3>Choosing the Right Safari</h3>
<p>Consider your budget, time available, and what experiences matter most to you. Whether it's a luxury lodge safari or a budget camping adventure, there's something for everyone.</p>
      `,
      coverImage: blogImages.safari[0],
      images: blogImages.safari,
      categoryId: createdCategories["safari-tips"],
      tags: ["safari tips", "first safari", "planning", "travel guide"],
      authorId: adminUser.id,
      authorName: adminUser.name,
      status: BlogPostStatus.PUBLISHED,
      submittedBy: BlogSubmitterType.ADMIN,
      submitterId: adminUser.id,
      isFeatured: true,
      publishedAt: new Date("2024-11-15"),
      viewCount: 1250,
      readingTime: 8,
    },
    {
      slug: "big-five-kenya",
      title: "Spotting the Big Five in Kenya",
      excerpt: "A comprehensive guide to finding lions, elephants, leopards, rhinos, and buffalo in Kenya's best national parks.",
      content: `
<h2>The Big Five Experience</h2>
<p>Kenya is one of the best places in Africa to spot the legendary Big Five. These magnificent animals - lion, elephant, leopard, rhino, and buffalo - represent the ultimate safari experience.</p>

<h3>Where to Find Them</h3>

<h4>Lions</h4>
<p>The Masai Mara is famous for its lion population. Early morning game drives offer the best chances of seeing lions active and hunting.</p>

<h4>Elephants</h4>
<p>Amboseli National Park offers stunning views of elephant herds against the backdrop of Mount Kilimanjaro.</p>

<h4>Leopards</h4>
<p>These elusive cats are best spotted in the Mara's riverine forests. Look for them lounging in trees during the heat of the day.</p>

<h4>Rhinos</h4>
<p>Ol Pejeta Conservancy and Lake Nakuru National Park are excellent for both black and white rhino sightings.</p>

<h4>Buffalo</h4>
<p>Large herds can be found throughout the Mara and other major parks. They're often seen grazing near water sources.</p>
      `,
      coverImage: blogImages.wildlife[0],
      images: blogImages.wildlife,
      categoryId: createdCategories["wildlife"],
      tags: ["big five", "kenya", "wildlife", "safari"],
      authorId: adminUser.id,
      authorName: adminUser.name,
      status: BlogPostStatus.PUBLISHED,
      submittedBy: BlogSubmitterType.ADMIN,
      submitterId: adminUser.id,
      isFeatured: true,
      publishedAt: new Date("2024-10-20"),
      viewCount: 890,
      readingTime: 6,
    },
    {
      slug: "serengeti-migration-guide",
      title: "The Great Migration: When and Where to See It",
      excerpt: "Follow the world's largest animal migration from the Serengeti to the Masai Mara and witness nature's greatest spectacle.",
      content: `
<h2>Understanding the Great Migration</h2>
<p>The Great Migration is one of nature's most spectacular events, involving over 1.5 million wildebeest and hundreds of thousands of zebra and gazelle on an annual journey across the Serengeti-Mara ecosystem.</p>

<h3>The Migration Calendar</h3>

<h4>January - March: Calving Season</h4>
<p>The herds are in the southern Serengeti and Ndutu area. This is calving season, with thousands of wildebeest born each day.</p>

<h4>April - June: The Long Rains</h4>
<p>The herds begin moving northwest towards the Western Corridor of the Serengeti, following the rains.</p>

<h4>July - October: River Crossings</h4>
<p>The most dramatic part of the migration. Watch herds cross the Mara River, facing crocodiles and strong currents.</p>

<h4>November - December: Return South</h4>
<p>The herds begin their journey back south to the Serengeti as the short rains begin.</p>

<h3>Best Viewing Tips</h3>
<ul>
<li>Book accommodations well in advance, especially for July-October</li>
<li>Be patient - migration timing is unpredictable</li>
<li>Consider a balloon safari for aerial views</li>
<li>Stay multiple days in each area for best chances</li>
</ul>
      `,
      coverImage: blogImages.safari[1],
      images: [blogImages.safari[1], blogImages.wildlife[1]],
      categoryId: createdCategories["wildlife"],
      tags: ["migration", "serengeti", "masai mara", "wildebeest"],
      authorId: adminUser.id,
      authorName: adminUser.name,
      status: BlogPostStatus.PUBLISHED,
      submittedBy: BlogSubmitterType.ADMIN,
      submitterId: adminUser.id,
      isFeatured: false,
      publishedAt: new Date("2024-09-10"),
      viewCount: 2100,
      readingTime: 7,
    },
    {
      slug: "best-safari-destinations-2024",
      title: "Top 10 Safari Destinations for 2024",
      excerpt: "Discover the most incredible safari destinations in Africa, from classic Kenya to hidden gems in Botswana and beyond.",
      content: `
<h2>Africa's Premier Safari Destinations</h2>
<p>Africa offers an incredible variety of safari experiences. Here are our top picks for 2024.</p>

<h3>1. Masai Mara, Kenya</h3>
<p>The quintessential safari destination, famous for the Great Migration and abundant wildlife year-round.</p>

<h3>2. Serengeti, Tanzania</h3>
<p>Vast plains that host millions of animals and offer incredible photographic opportunities.</p>

<h3>3. Okavango Delta, Botswana</h3>
<p>A unique water-based safari experience in one of Africa's most pristine wilderness areas.</p>

<h3>4. Kruger National Park, South Africa</h3>
<p>Self-drive options and excellent infrastructure make this perfect for first-time safari-goers.</p>

<h3>5. South Luangwa, Zambia</h3>
<p>Birthplace of walking safaris and home to exceptional leopard sightings.</p>

<h3>6. Etosha, Namibia</h3>
<p>A vast salt pan that attracts wildlife to its waterholes, perfect for photography.</p>

<h3>7. Hwange, Zimbabwe</h3>
<p>Massive elephant herds and diverse landscapes make this an underrated gem.</p>

<h3>8. Ngorongoro Crater, Tanzania</h3>
<p>A natural amphitheater teeming with wildlife in a stunning volcanic caldera.</p>

<h3>9. Samburu, Kenya</h3>
<p>Home to unique northern species and stunning semi-arid landscapes.</p>

<h3>10. Volcanoes National Park, Rwanda</h3>
<p>The ultimate destination for mountain gorilla trekking.</p>
      `,
      coverImage: blogImages.destinations[0],
      images: blogImages.destinations,
      categoryId: createdCategories["destinations"],
      tags: ["destinations", "travel", "2024", "best safari"],
      authorId: adminUser.id,
      authorName: adminUser.name,
      status: BlogPostStatus.PUBLISHED,
      submittedBy: BlogSubmitterType.ADMIN,
      submitterId: adminUser.id,
      isFeatured: true,
      publishedAt: new Date("2024-12-01"),
      viewCount: 3450,
      readingTime: 10,
    },
  ]

  // Agent submitted posts (various statuses)
  if (agentUser) {
    blogPosts.push(
      {
        slug: "insider-tips-masai-mara",
        title: "Insider Tips for the Masai Mara from a Local Guide",
        excerpt: "15 years of guiding experience distilled into essential tips for making the most of your Mara safari.",
        content: `
<h2>Expert Knowledge from the Ground</h2>
<p>After 15 years of guiding safaris in the Masai Mara, I've learned a few things that can make the difference between a good safari and an extraordinary one.</p>

<h3>Best Time of Day</h3>
<p>The first and last hours of daylight are magical. This is when predators are most active and the light is perfect for photography.</p>

<h3>Lesser-Known Spots</h3>
<p>While everyone heads to the river crossings, the Mara Triangle often offers equally incredible sightings with fewer vehicles.</p>

<h3>What Most Tourists Miss</h3>
<ul>
<li>The smaller cats - servals and caracals are fascinating to watch</li>
<li>Bird life - the Mara has over 450 species</li>
<li>Night sounds from your tent - a true African experience</li>
<li>The Maasai culture and their relationship with wildlife</li>
</ul>
        `,
        coverImage: blogImages.safari[2],
        images: [blogImages.safari[2]],
        categoryId: createdCategories["safari-tips"],
        tags: ["masai mara", "insider tips", "local guide", "kenya"],
        authorId: agentUser.id,
        authorName: agentUser.name,
        status: BlogPostStatus.PUBLISHED,
        submittedBy: BlogSubmitterType.AGENT,
        submitterId: agentUser.id,
        isFeatured: false,
        publishedAt: new Date("2024-11-25"),
        viewCount: 567,
        readingTime: 5,
        reviewedBy: adminUser.id,
        reviewedAt: new Date("2024-11-24"),
      },
      {
        slug: "sustainable-safari-practices",
        title: "Sustainable Safari: How We Protect Wildlife",
        excerpt: "Learn about conservation efforts and how responsible tourism helps protect Africa's wildlife for future generations.",
        content: `
<h2>Tourism as Conservation</h2>
<p>Responsible safari tourism plays a crucial role in wildlife conservation. Here's how the industry is making a difference.</p>

<h3>Community Conservation</h3>
<p>Local communities are the frontline of conservation. Tourism revenue funds education, healthcare, and creates alternatives to poaching.</p>

<h3>What You Can Do</h3>
<ul>
<li>Choose operators with proven conservation commitments</li>
<li>Minimize plastic use during your safari</li>
<li>Support community-run initiatives</li>
<li>Share your experience to inspire others</li>
</ul>
        `,
        coverImage: blogImages.wildlife[2],
        images: [blogImages.wildlife[2]],
        categoryId: createdCategories["conservation"],
        tags: ["conservation", "sustainable tourism", "wildlife protection"],
        authorId: agentUser.id,
        authorName: agentUser.name,
        status: BlogPostStatus.PENDING_APPROVAL,
        submittedBy: BlogSubmitterType.AGENT,
        submitterId: agentUser.id,
        isFeatured: false,
        viewCount: 0,
        readingTime: 4,
      },
    )
  }

  // Client submitted posts
  if (clientUser) {
    blogPosts.push(
      {
        slug: "my-first-safari-experience",
        title: "My First Safari: A Dream Come True",
        excerpt: "Personal account of experiencing the African bush for the first time - the highs, the surprises, and unforgettable moments.",
        content: `
<h2>When Dreams Become Reality</h2>
<p>I had dreamed of going on safari since I was a child watching nature documentaries. Last month, that dream finally came true.</p>

<h3>Day One: Arrival</h3>
<p>The moment I stepped off the bush plane onto the red African soil, I knew this would be unlike anything I'd experienced. The air smelled different - earthy, wild, alive.</p>

<h3>The First Game Drive</h3>
<p>Within the first hour, we had seen elephants, giraffes, and a family of warthogs. I was clicking my camera non-stop!</p>

<h3>The Highlight</h3>
<p>Nothing prepared me for seeing a lioness with her cubs just 20 feet from our vehicle. Time stood still. It was the most magical moment of my life.</p>

<h3>Advice for First-Timers</h3>
<ul>
<li>Bring more camera batteries than you think you need</li>
<li>The early wake-up calls are 100% worth it</li>
<li>Don't just look for the big animals - everything is fascinating</li>
<li>Put the camera down sometimes and just be present</li>
</ul>

<p>I'm already planning my next safari. Africa has a way of calling you back.</p>
        `,
        coverImage: blogImages.travel[0],
        images: blogImages.travel,
        categoryId: createdCategories["travel-stories"],
        tags: ["first safari", "personal story", "travel experience"],
        authorId: clientUser.id,
        authorName: clientUser.name,
        status: BlogPostStatus.PUBLISHED,
        submittedBy: BlogSubmitterType.CLIENT,
        submitterId: clientUser.id,
        isFeatured: false,
        publishedAt: new Date("2024-12-05"),
        viewCount: 234,
        readingTime: 5,
        reviewedBy: adminUser.id,
        reviewedAt: new Date("2024-12-04"),
      },
      {
        slug: "family-safari-with-kids",
        title: "Safari with Kids: Our Family Adventure",
        excerpt: "Taking the whole family on safari - tips, challenges, and why it was the best vacation we've ever had.",
        content: `
<h2>An Unforgettable Family Experience</h2>
<p>Taking three kids aged 6, 9, and 12 on safari seemed daunting, but it turned out to be the best family holiday we've ever had.</p>

<h3>Choosing the Right Safari</h3>
<p>We opted for a family-friendly lodge with a pool and shorter game drives. This gave the kids downtime between adventures.</p>

<h3>What the Kids Loved Most</h3>
<ul>
<li>The junior ranger program at the lodge</li>
<li>Tracking animals and learning to identify prints</li>
<li>Swimming while elephants drank nearby</li>
<li>Making friends with children from around the world</li>
</ul>

<h3>Tips for Parents</h3>
<p>Pack snacks, games for downtime, and manage expectations. Some drives are slow, but the magical moments make it all worthwhile.</p>
        `,
        coverImage: blogImages.travel[1],
        images: [blogImages.travel[1]],
        categoryId: createdCategories["travel-stories"],
        tags: ["family travel", "kids safari", "travel tips"],
        authorId: clientUser.id,
        authorName: clientUser.name,
        status: BlogPostStatus.PENDING_APPROVAL,
        submittedBy: BlogSubmitterType.CLIENT,
        submitterId: clientUser.id,
        isFeatured: false,
        viewCount: 0,
        readingTime: 4,
      },
      {
        slug: "safari-photography-tips",
        title: "Safari Photography on a Budget",
        excerpt: "You don't need expensive gear to get amazing safari photos. Here's what I learned.",
        content: `
<h2>Great Photos Without Breaking the Bank</h2>
<p>I went on safari with a mid-range DSLR and kit lens. Here's how I still got shots I'm proud of.</p>

<h3>Camera Settings</h3>
<p>Use burst mode, keep ISO flexible, and don't be afraid to crop later.</p>

<h3>Composition Tips</h3>
<ul>
<li>Include the environment, not just close-ups</li>
<li>Wait for behavior moments</li>
<li>Use the golden hours</li>
</ul>
        `,
        coverImage: blogImages.travel[2],
        images: [blogImages.travel[2]],
        categoryId: createdCategories["safari-tips"],
        tags: ["photography", "budget", "tips"],
        authorId: clientUser.id,
        authorName: clientUser.name,
        status: BlogPostStatus.REJECTED,
        submittedBy: BlogSubmitterType.CLIENT,
        submitterId: clientUser.id,
        isFeatured: false,
        viewCount: 0,
        readingTime: 3,
        reviewedBy: adminUser.id,
        reviewedAt: new Date("2024-12-10"),
        rejectionReason: "Content too brief. Please expand on the photography tips with more specific examples and techniques.",
      },
    )
  }

  // Create all blog posts
  for (const post of blogPosts) {
    try {
      await prisma.blogPost.upsert({
        where: { slug: post.slug },
        update: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          images: post.images,
          categoryId: post.categoryId,
          tags: post.tags,
          authorId: post.authorId,
          authorName: post.authorName,
          status: post.status,
          submittedBy: post.submittedBy,
          submitterId: post.submitterId,
          isFeatured: post.isFeatured,
          publishedAt: post.publishedAt,
          viewCount: post.viewCount,
          readingTime: post.readingTime,
          reviewedBy: post.reviewedBy,
          reviewedAt: post.reviewedAt,
          rejectionReason: post.rejectionReason,
        },
        create: {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          images: post.images,
          categoryId: post.categoryId,
          tags: post.tags,
          authorId: post.authorId,
          authorName: post.authorName,
          status: post.status,
          submittedBy: post.submittedBy,
          submitterId: post.submitterId,
          isFeatured: post.isFeatured,
          publishedAt: post.publishedAt,
          viewCount: post.viewCount || 0,
          readingTime: post.readingTime,
          reviewedBy: post.reviewedBy,
          reviewedAt: post.reviewedAt,
          rejectionReason: post.rejectionReason,
        },
      })
      console.log(`✅ Created/Updated blog post: ${post.title} (${post.status})`)
    } catch (error) {
      console.error(`❌ Error creating post ${post.slug}:`, error)
    }
  }

  console.log("\n🎉 Blog seeding completed!")
  console.log("\n📊 Blog Summary:")
  console.log("-----------------------------------")
  console.log(`Categories: ${categories.length}`)
  console.log(`Total Posts: ${blogPosts.length}`)
  console.log(`Published: ${blogPosts.filter(p => p.status === BlogPostStatus.PUBLISHED).length}`)
  console.log(`Pending Approval: ${blogPosts.filter(p => p.status === BlogPostStatus.PENDING_APPROVAL).length}`)
  console.log(`Rejected: ${blogPosts.filter(p => p.status === BlogPostStatus.REJECTED).length}`)
  console.log("-----------------------------------\n")
}

main()
  .catch((e) => {
    console.error("❌ Blog seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
