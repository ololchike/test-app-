import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
  Svg,
  Path,
  Circle,
  G,
  Rect,
} from "@react-pdf/renderer"
import { format } from "date-fns"

// Brand Colors - Matching SafariPlus UI Theme
const colors = {
  // Primary brand color - Sunset Orange
  primary: "#E07B39",
  primaryDark: "#C56A2E",
  primaryLight: "#F5923F",
  primaryBg: "#FEF7F3",
  primaryBgAlt: "#FDEEE5",

  // Secondary - Forest Green
  secondary: "#1B4D3E",
  secondaryDark: "#0F2E25",
  secondaryLight: "#2D7A5F",
  secondaryBg: "#F0F7F5",

  // Accent - Safari Gold
  gold: "#C9A227",
  goldLight: "#E5C85C",
  goldDark: "#9A7B1A",
  goldBg: "#FFFBEB",

  // Safari Theme Colors
  savanna: "#D4A574",
  terracotta: "#C75B39",
  clay: "#8B5E3C",
  cream: "#FDFBF7",

  // Neutrals
  white: "#ffffff",
  charcoal: "#1A1A1A",
  gray50: "#FDFBF7",
  gray100: "#f5f5f4",
  gray200: "#e5e5e5",
  gray300: "#d4d4d4",
  gray400: "#a3a3a3",
  gray500: "#737373",
  gray600: "#525252",
  gray700: "#404040",
  gray800: "#262626",
  gray900: "#171717",

  // Status colors
  success: "#059669",
  successBg: "#D1FAE5",
}

const styles = StyleSheet.create({
  // ===== PAGE LAYOUT =====
  page: {
    padding: 0,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: colors.white,
  },

  // ===== HEADER =====
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerGradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primaryDark,
    opacity: 0.3,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIcon: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  logoText: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.white,
    letterSpacing: 0.5,
  },
  logoSubtext: {
    fontSize: 9,
    color: colors.primaryBg,
    marginTop: 2,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bookingRefBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    padding: 12,
    alignItems: "flex-end",
  },
  bookingRefLabel: {
    fontSize: 8,
    color: colors.primaryBg,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  bookingRefValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    letterSpacing: 1,
  },
  confirmationBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  confirmationText: {
    fontSize: 8,
    color: colors.primary,
    fontWeight: "bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // ===== CONTENT AREA =====
  content: {
    padding: 40,
    paddingTop: 30,
  },

  // ===== TOUR HERO SECTION =====
  tourHero: {
    marginBottom: 25,
  },
  tourTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.gray800,
    marginBottom: 6,
  },
  tourSubtitle: {
    fontSize: 12,
    color: colors.gray500,
    flexDirection: "row",
    alignItems: "center",
  },
  tourSubtitleIcon: {
    width: 12,
    height: 12,
    marginRight: 6,
  },

  // ===== INFO CARDS GRID =====
  infoCardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 25,
    gap: 12,
  },
  infoCard: {
    width: "48%",
    backgroundColor: colors.gray50,
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  infoCardSecondary: {
    borderLeftColor: colors.secondary,
  },
  infoCardGold: {
    borderLeftColor: colors.gold,
  },
  infoCardTerracotta: {
    borderLeftColor: colors.terracotta,
  },
  infoCardLabel: {
    fontSize: 8,
    color: colors.gray500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.gray800,
  },

  // ===== SECTION STYLES =====
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  sectionIconBox: {
    width: 28,
    height: 28,
    backgroundColor: colors.primaryBg,
    borderRadius: 6,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.gray800,
    letterSpacing: 0.3,
  },

  // ===== DAY CARDS =====
  dayCard: {
    marginBottom: 16,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  dayCardHeader: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryBgAlt,
  },
  dayNumberCircle: {
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dayNumberText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  dayTitleContainer: {
    flex: 1,
  },
  dayTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.gray800,
  },
  dayLocation: {
    fontSize: 9,
    color: colors.gray500,
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  dayCardBody: {
    padding: 14,
  },
  dayDescription: {
    fontSize: 10,
    color: colors.gray600,
    lineHeight: 1.5,
    marginBottom: 12,
  },
  dayMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  dayMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  dayMetaLabel: {
    fontSize: 8,
    color: colors.gray500,
    marginRight: 4,
    textTransform: "uppercase",
  },
  dayMetaValue: {
    fontSize: 9,
    color: colors.gray700,
    fontWeight: "bold",
  },

  // ===== ACCOMMODATION BOX =====
  accommodationBox: {
    marginTop: 10,
    backgroundColor: colors.secondaryBg,
    borderRadius: 6,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  accommodationLabel: {
    fontSize: 8,
    color: colors.gray500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  accommodationName: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.gray800,
  },
  accommodationTierBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  accommodationTierText: {
    fontSize: 7,
    color: colors.white,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  // ===== ADD-ONS SECTION =====
  addonsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  addonBadge: {
    backgroundColor: colors.goldBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  addonText: {
    fontSize: 9,
    color: colors.goldDark,
    fontWeight: "bold",
  },

  // ===== PRICE SECTION =====
  priceSection: {
    backgroundColor: colors.primaryBg,
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.primaryBgAlt,
  },
  priceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryBgAlt,
  },
  priceTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.gray800,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 10,
    color: colors.gray600,
  },
  priceValue: {
    fontSize: 10,
    color: colors.gray800,
    fontWeight: "bold",
  },
  priceDivider: {
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    borderStyle: "dashed",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.primary,
    marginHorizontal: -20,
    marginBottom: -20,
    marginTop: 5,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.white,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },

  // ===== CONTACT SECTION =====
  contactSection: {
    flexDirection: "row",
    marginTop: 25,
    gap: 20,
  },
  contactCard: {
    flex: 1,
    backgroundColor: colors.gray50,
    borderRadius: 8,
    padding: 15,
  },
  contactCardPrimary: {
    borderTopWidth: 3,
    borderTopColor: colors.primary,
  },
  contactCardSecondary: {
    borderTopWidth: 3,
    borderTopColor: colors.secondary,
  },
  contactTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.gray800,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  contactIcon: {
    width: 12,
    height: 12,
    marginRight: 8,
  },
  contactText: {
    fontSize: 9,
    color: colors.gray600,
  },

  // ===== SPECIAL REQUESTS =====
  specialRequestsBox: {
    marginTop: 20,
    backgroundColor: colors.goldBg,
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
  },
  specialRequestsTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.goldDark,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  specialRequestsText: {
    fontSize: 9,
    color: colors.gray600,
    lineHeight: 1.5,
  },

  // ===== FOOTER =====
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.charcoal,
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    flex: 1,
  },
  footerLogo: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 4,
  },
  footerText: {
    fontSize: 8,
    color: colors.gray400,
    marginBottom: 2,
  },
  footerRight: {
    alignItems: "flex-end",
  },
  footerHighlight: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 6,
  },
  footerHighlightText: {
    fontSize: 8,
    color: colors.white,
    fontWeight: "bold",
  },
  footerWebsite: {
    fontSize: 9,
    color: colors.gray300,
  },

  // ===== PAYMENT STATUS =====
  paymentStatusBox: {
    marginTop: 15,
    backgroundColor: colors.successBg,
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  paymentStatusBoxPending: {
    backgroundColor: "#FEF3C7",
    borderLeftColor: "#D97706",
  },
  paymentStatusTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.success,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  paymentStatusTitlePending: {
    color: "#D97706",
  },
  paymentStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  paymentStatusLabel: {
    fontSize: 9,
    color: colors.gray600,
  },
  paymentStatusValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.gray800,
  },
  paymentStatusValueSuccess: {
    color: colors.success,
  },
  paymentStatusValuePending: {
    color: "#D97706",
  },
  balanceDueBox: {
    marginTop: 10,
    backgroundColor: "#FFFBEB",
    borderRadius: 6,
    padding: 10,
  },
  balanceDueText: {
    fontSize: 9,
    color: "#92400E",
  },

  // ===== AFRICAN DECORATIONS =====
  decorationContainer: {
    position: "absolute",
    opacity: 0.15,
  },
  patternBorder: {
    marginVertical: 10,
  },
  cornerDecoration: {
    position: "absolute",
  },

  // ===== IMAGE GALLERY =====
  galleryPage: {
    padding: 40,
    backgroundColor: colors.cream,
  },
  galleryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  galleryTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.secondary,
    textAlign: "center",
    marginHorizontal: 15,
  },
  gallerySubtitle: {
    fontSize: 11,
    color: colors.gray500,
    textAlign: "center",
    marginBottom: 20,
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    justifyContent: "center",
  },
  galleryImageContainer: {
    width: "47%",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.white,
    shadowColor: colors.gray400,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  galleryImage: {
    width: "100%",
    height: 140,
    objectFit: "cover",
  },
  galleryImageLarge: {
    width: "100%",
    height: 200,
    objectFit: "cover",
  },
  galleryImageCaption: {
    padding: 8,
    backgroundColor: colors.white,
  },
  galleryCaptionText: {
    fontSize: 8,
    color: colors.gray500,
    textAlign: "center",
  },
  coverImageContainer: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: colors.primary,
  },
  coverImage: {
    width: "100%",
    height: 220,
    objectFit: "cover",
  },
  decorativeAnimalRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginTop: 20,
    opacity: 0.6,
  },
})

interface ItineraryPDFProps {
  booking: {
    bookingReference: string
    startDate: string
    endDate: string
    adults: number
    children: number
    totalAmount: number
    contactName: string
    contactEmail: string
    contactPhone: string
    specialRequests?: string | null
    // Payment status info
    status: string
    paymentStatus: string
    paymentType: string
    depositAmount?: number | null
    balanceAmount?: number | null
    balanceDueDate?: string | null
    tour: {
      title: string
      destination: string
      durationDays: number
      durationNights: number
      coverImage?: string | null
      images?: string[]
    }
    agent: {
      businessName: string
      businessEmail?: string | null
      businessPhone?: string | null
    }
    accommodations: Array<{
      dayNumber: number
      price: number
      accommodationOption: {
        name: string
        tier: string
      }
    }>
    activities: Array<{
      price: number
      activityAddon: {
        name: string
      }
    }>
  }
  itinerary: Array<{
    dayNumber: number
    title: string
    description: string
    location?: string | null
    meals: string[]
    activities: string[]
    overnight?: string | null
  }>
  pricing: {
    baseTotal: number
    childTotal: number
    accommodationTotal: number
    addonsTotal: number
    serviceFee: number
    total: number
  }
}

// Simple icon components for PDF
const MapPinIcon = () => (
  <Svg viewBox="0 0 24 24" style={{ width: 12, height: 12 }}>
    <Path
      fill={colors.gray500}
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
    />
  </Svg>
)

const CalendarIcon = () => (
  <Svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
    <Path
      fill={colors.primary}
      d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"
    />
  </Svg>
)

const SparklesIcon = ({ color = colors.primary }: { color?: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
    <Path
      fill={color}
      d="M12 3L10.34 8.13 5 9.24l4 3.89-.94 5.47L12 16.5l3.94 2.1-.94-5.47 4-3.89-5.34-1.11L12 3z"
    />
  </Svg>
)

// ============================================
// PREMIUM AFRICAN-INSPIRED DECORATIVE ELEMENTS
// ============================================

// Elegant geometric border with African motif
const PremiumAfricanBorder = ({ width = 515, variant = "primary" }: { width?: number; variant?: "primary" | "gold" | "secondary" }) => {
  const colorMap = { primary: colors.primary, gold: colors.gold, secondary: colors.secondary }
  const color = colorMap[variant]
  return (
    <Svg viewBox={`0 0 ${width} 8`} style={{ width, height: 8 }}>
      {/* Main line */}
      <Path d={`M0 4 L${width} 4`} stroke={color} strokeWidth={1} opacity={0.3} />
      {/* Diamond pattern */}
      {Array.from({ length: Math.floor(width / 30) }).map((_, i) => (
        <G key={i}>
          <Path
            d={`M${i * 30 + 15} 0 L${i * 30 + 19} 4 L${i * 30 + 15} 8 L${i * 30 + 11} 4 Z`}
            fill={i % 3 === 0 ? color : "none"}
            stroke={color}
            strokeWidth={0.5}
          />
        </G>
      ))}
    </Svg>
  )
}

// Flight route with airplane
const FlightRouteDecoration = ({ width = 200 }: { width?: number }) => (
  <Svg viewBox={`0 0 ${width} 30`} style={{ width, height: 30 }}>
    {/* Dotted flight path */}
    <Path
      d={`M10 20 Q${width / 4} 5 ${width / 2} 15 Q${width * 0.75} 25 ${width - 30} 10`}
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.5}
      strokeDasharray="4,3"
      opacity={0.6}
    />
    {/* Takeoff point */}
    <Circle cx={10} cy={20} r={4} fill={colors.secondary} />
    <Path d="M5 24 L15 24" stroke={colors.secondary} strokeWidth={2} />
    {/* Airplane icon at end */}
    <G transform={`translate(${width - 25}, 5)`}>
      <Path
        d="M12 2L8 6H4L2 10L6 10L4 14H8L12 10L16 10L14 6H18L20 2L16 4L12 2Z"
        fill={colors.primary}
        transform="rotate(30, 10, 8) scale(0.8)"
      />
    </G>
    {/* Landing point */}
    <Circle cx={width - 10} cy={15} r={3} fill={colors.gold} stroke={colors.primary} strokeWidth={1} />
  </Svg>
)

// Safari Jeep silhouette
const SafariJeepIcon = ({ size = 40, color = colors.secondary }: { size?: number; color?: string }) => (
  <Svg viewBox="0 0 50 25" style={{ width: size, height: size * 0.5 }}>
    <Path
      d="M5 18 L5 12 L12 12 L15 8 L35 8 L38 12 L45 12 L45 18 L40 18 L40 15 C40 13 38 13 38 15 L38 18 L15 18 L15 15 C15 13 13 13 13 15 L13 18 Z"
      fill={color}
    />
    {/* Windows */}
    <Path d="M17 10 L22 10 L22 12 L17 12 Z" fill={colors.white} opacity={0.5} />
    <Path d="M24 10 L29 10 L29 12 L24 12 Z" fill={colors.white} opacity={0.5} />
    {/* Wheels */}
    <Circle cx={14} cy={18} r={3} fill={colors.charcoal} />
    <Circle cx={39} cy={18} r={3} fill={colors.charcoal} />
  </Svg>
)

// Binoculars icon
const BinocularsIcon = ({ size = 20, color = colors.secondary }: { size?: number; color?: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
    <Circle cx={7} cy={14} r={5} fill="none" stroke={color} strokeWidth={2} />
    <Circle cx={17} cy={14} r={5} fill="none" stroke={color} strokeWidth={2} />
    <Path d="M12 12 L12 16" stroke={color} strokeWidth={2} />
    <Path d="M7 9 L7 6 L10 6" stroke={color} strokeWidth={1.5} />
    <Path d="M17 9 L17 6 L14 6" stroke={color} strokeWidth={1.5} />
  </Svg>
)

// Compass rose
const CompassIcon = ({ size = 30 }: { size?: number }) => (
  <Svg viewBox="0 0 40 40" style={{ width: size, height: size }}>
    <Circle cx={20} cy={20} r={18} fill="none" stroke={colors.gray300} strokeWidth={1} />
    <Circle cx={20} cy={20} r={15} fill="none" stroke={colors.gray200} strokeWidth={0.5} />
    {/* Cardinal directions */}
    <Path d="M20 5 L22 15 L20 12 L18 15 Z" fill={colors.primary} />
    <Path d="M20 35 L22 25 L20 28 L18 25 Z" fill={colors.gray400} />
    <Path d="M5 20 L15 18 L12 20 L15 22 Z" fill={colors.gray400} />
    <Path d="M35 20 L25 18 L28 20 L25 22 Z" fill={colors.gray400} />
    <Circle cx={20} cy={20} r={2} fill={colors.primary} />
    <Text style={{ fontSize: 5, fill: colors.gray600 }} x={19} y={4}>N</Text>
  </Svg>
)

// African sun with rays
const AfricanSunIcon = ({ size = 50 }: { size?: number }) => (
  <Svg viewBox="0 0 50 50" style={{ width: size, height: size }}>
    {/* Outer glow */}
    <Circle cx={25} cy={25} r={20} fill={colors.gold} opacity={0.15} />
    {/* Sun rays */}
    {Array.from({ length: 8 }).map((_, i) => (
      <Path
        key={i}
        d={`M25 25 L${25 + 22 * Math.cos((i * 45 * Math.PI) / 180)} ${25 + 22 * Math.sin((i * 45 * Math.PI) / 180)}`}
        stroke={colors.gold}
        strokeWidth={i % 2 === 0 ? 2 : 1}
        opacity={i % 2 === 0 ? 0.8 : 0.4}
      />
    ))}
    {/* Sun center */}
    <Circle cx={25} cy={25} r={10} fill={colors.gold} />
    <Circle cx={25} cy={25} r={7} fill={colors.primaryLight} opacity={0.5} />
  </Svg>
)

// Elegant acacia tree silhouette
const AcaciaTreeSilhouette = ({ size = 40, color = colors.secondary }: { size?: number; color?: string }) => (
  <Svg viewBox="0 0 40 50" style={{ width: size, height: size * 1.25 }}>
    {/* Tree canopy - umbrella shape */}
    <Path
      d="M5 20 Q8 12 15 15 Q18 8 20 8 Q22 8 25 15 Q32 12 35 20 Q32 22 28 20 Q25 25 20 25 Q15 25 12 20 Q8 22 5 20"
      fill={color}
      opacity={0.9}
    />
    {/* Trunk */}
    <Path d="M18 25 L18 45 L22 45 L22 25" fill={color} />
    {/* Ground line */}
    <Path d="M10 45 L30 45" stroke={color} strokeWidth={1} opacity={0.5} />
  </Svg>
)

// Mountain silhouette (Kilimanjaro style)
const MountainSilhouette = ({ width = 100 }: { width?: number }) => (
  <Svg viewBox="0 0 100 40" style={{ width, height: width * 0.4 }}>
    <Path
      d="M0 40 L20 25 L35 30 L50 10 L65 30 L80 25 L100 40 Z"
      fill={colors.secondary}
      opacity={0.2}
    />
    {/* Snow cap */}
    <Path
      d="M42 18 L50 10 L58 18 Q55 20 50 18 Q45 20 42 18"
      fill={colors.white}
      opacity={0.8}
    />
  </Svg>
)

// Safari animals row
const SafariAnimalsRow = ({ width = 300 }: { width?: number }) => (
  <Svg viewBox="0 0 300 30" style={{ width, height: 30 }}>
    {/* Elephant */}
    <G transform="translate(20, 5)">
      <Path
        d="M0 20 L2 10 Q5 5 10 5 L15 5 Q20 5 22 10 L22 15 L25 15 L25 20 L20 20 L20 25 L18 25 L18 20 L7 20 L7 25 L5 25 L5 20 Z M3 12 Q1 14 3 16"
        fill={colors.secondary}
        opacity={0.7}
        transform="scale(0.8)"
      />
    </G>
    {/* Giraffe */}
    <G transform="translate(80, 0)">
      <Path
        d="M10 5 L10 0 L12 0 L12 5 L14 8 L14 20 L16 20 L16 25 L14 25 L14 22 L8 22 L8 25 L6 25 L6 20 L8 20 L8 8 Z"
        fill={colors.gold}
        opacity={0.7}
        transform="scale(0.9)"
      />
    </G>
    {/* Lion */}
    <G transform="translate(140, 8)">
      <Circle cx={10} cy={8} r={8} fill={colors.primary} opacity={0.6} />
      <Circle cx={10} cy={8} r={5} fill={colors.primary} opacity={0.8} />
      <Path d="M5 16 L5 22 L7 22 L7 18 L13 18 L13 22 L15 22 L15 16 L20 14 L20 12 L15 14 L5 14 Z" fill={colors.primary} opacity={0.7} />
    </G>
    {/* Zebra */}
    <G transform="translate(200, 5)">
      <Path
        d="M5 15 L8 5 L12 5 L12 8 L18 8 L20 15 L20 20 L18 20 L18 22 L16 22 L16 20 L9 20 L9 22 L7 22 L7 20 L5 20 Z"
        fill={colors.charcoal}
        opacity={0.6}
      />
    </G>
    {/* Rhino */}
    <G transform="translate(260, 8)">
      <Path
        d="M0 12 L5 10 L5 8 L3 6 L8 8 L20 8 Q25 10 25 15 L25 18 L22 18 L22 20 L20 20 L20 18 L10 18 L10 20 L8 20 L8 18 L5 18 L5 15 L0 15 Z"
        fill={colors.gray500}
        opacity={0.6}
        transform="scale(0.8)"
      />
    </G>
  </Svg>
)

// Dotted journey path
const JourneyPath = ({ width = 400 }: { width?: number }) => (
  <Svg viewBox={`0 0 ${width} 20`} style={{ width, height: 20 }}>
    {/* Wavy dotted path */}
    <Path
      d={`M0 10 Q${width * 0.25} 0 ${width * 0.5} 10 Q${width * 0.75} 20 ${width} 10`}
      fill="none"
      stroke={colors.primary}
      strokeWidth={2}
      strokeDasharray="8,4"
      opacity={0.4}
    />
    {/* Journey markers */}
    <Circle cx={0} cy={10} r={4} fill={colors.secondary} />
    <Circle cx={width * 0.33} cy={5} r={3} fill={colors.gold} />
    <Circle cx={width * 0.66} cy={15} r={3} fill={colors.gold} />
    <Circle cx={width} cy={10} r={4} fill={colors.primary} />
  </Svg>
)

// Maasai spear decoration
const MaasaiSpearDecoration = ({ height = 60 }: { height?: number }) => (
  <Svg viewBox="0 0 15 80" style={{ width: height * 0.19, height }}>
    {/* Spear tip */}
    <Path d="M7.5 0 L10 15 L7.5 12 L5 15 Z" fill={colors.gray600} />
    {/* Shaft */}
    <Rect x={6.5} y={12} width={2} height={55} fill={colors.clay} />
    {/* Decorative bands */}
    <Rect x={5} y={20} width={5} height={3} fill={colors.terracotta} />
    <Rect x={5} y={25} width={5} height={2} fill={colors.charcoal} />
    <Rect x={5} y={55} width={5} height={3} fill={colors.terracotta} />
    {/* Bottom */}
    <Path d="M7.5 67 L9 80 L6 80 Z" fill={colors.gray600} />
  </Svg>
)

// Premium section divider
const SectionDivider = ({ width = 515, showIcon = true }: { width?: number; showIcon?: boolean }) => (
  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 15 }}>
    <Svg viewBox={`0 0 ${(width - 40) / 2} 2`} style={{ width: (width - 40) / 2, height: 2 }}>
      <Path d={`M0 1 L${(width - 40) / 2} 1`} stroke={colors.gray300} strokeWidth={1} />
      <Circle cx={(width - 40) / 4} cy={1} r={2} fill={colors.primary} opacity={0.5} />
    </Svg>
    {showIcon && (
      <View style={{ marginHorizontal: 8 }}>
        <CompassIcon size={20} />
      </View>
    )}
    <Svg viewBox={`0 0 ${(width - 40) / 2} 2`} style={{ width: (width - 40) / 2, height: 2 }}>
      <Path d={`M0 1 L${(width - 40) / 2} 1`} stroke={colors.gray300} strokeWidth={1} />
      <Circle cx={(width - 40) / 4} cy={1} r={2} fill={colors.primary} opacity={0.5} />
    </Svg>
  </View>
)

// Legacy components (keeping for compatibility)
const AfricanPatternBorder = ({ width = 515, color }: { width?: number; color?: string }) => {
  const variant = color === colors.secondary ? "secondary" : color === colors.gold ? "gold" : "primary"
  return <PremiumAfricanBorder width={width} variant={variant} />
}
const AfricanTrianglePattern = ({ size = 40 }: { size?: number }) => <CompassIcon size={size * 0.6} />
const AcaciaTreeIcon = AcaciaTreeSilhouette
const SafariAnimalIcon = ({ size = 24 }: { animal?: string; size?: number }) => <SafariJeepIcon size={size * 1.5} />
const SunburstDecoration = AfricanSunIcon
const MaasaiShieldPattern = ({ size = 50 }: { size?: number }) => <MaasaiSpearDecoration height={size} />

export function ItineraryPDF({ booking, itinerary, pricing }: ItineraryPDFProps) {
  const startDate = new Date(booking.startDate)
  const endDate = new Date(booking.endDate)

  // Create accommodation map by day
  const accommodationByDay: Record<number, { name: string; tier: string }> = {}
  booking.accommodations.forEach((acc) => {
    accommodationByDay[acc.dayNumber] = {
      name: acc.accommodationOption.name,
      tier: acc.accommodationOption.tier,
    }
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Premium Header with African decoration */}
        <View style={styles.header}>
          {/* Corner decorations - left */}
          <View style={[styles.cornerDecoration, { top: 8, left: 10, opacity: 0.4 }]}>
            <CompassIcon size={22} />
          </View>
          <View style={[styles.cornerDecoration, { bottom: 8, left: 10, opacity: 0.3 }]}>
            <BinocularsIcon size={18} color={colors.white} />
          </View>
          {/* Corner decorations - right */}
          <View style={[styles.cornerDecoration, { top: 5, right: 5, opacity: 0.25 }]}>
            <AfricanSunIcon size={35} />
          </View>
          <View style={[styles.cornerDecoration, { bottom: 5, right: 5, opacity: 0.2 }]}>
            <AcaciaTreeSilhouette size={25} color={colors.white} />
          </View>

          <View style={styles.logoContainer}>
            <View>
              <Text style={styles.logoText}>SafariPlus</Text>
              <Text style={styles.logoSubtext}>Your African Adventure Awaits</Text>
            </View>
          </View>
          <View style={styles.bookingRefBox}>
            <Text style={styles.bookingRefLabel}>Booking Reference</Text>
            <Text style={styles.bookingRefValue}>{booking.bookingReference}</Text>
            <View style={[
              styles.confirmationBadge,
              booking.paymentStatus !== "COMPLETED" ? { backgroundColor: "#FEF3C7" } : {}
            ]}>
              <Text style={[
                styles.confirmationText,
                booking.paymentStatus !== "COMPLETED" ? { color: "#D97706" } : {}
              ]}>
                {booking.paymentStatus === "COMPLETED"
                  ? (booking.paymentType === "DEPOSIT" ? "Deposit Paid" : "Fully Paid")
                  : booking.paymentStatus === "PENDING"
                    ? "Payment Pending"
                    : booking.paymentStatus}
              </Text>
            </View>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          {/* Tour Hero with Flight Route */}
          <View style={styles.tourHero}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.tourTitle}>{booking.tour.title}</Text>
                <View style={styles.tourSubtitle}>
                  <Text>
                    {booking.tour.durationDays} Days / {booking.tour.durationNights} Nights
                    {" • "}{booking.tour.destination}
                  </Text>
                </View>
              </View>
              {/* Safari Jeep Icon */}
              <View style={{ opacity: 0.7 }}>
                <SafariJeepIcon size={50} color={colors.secondary} />
              </View>
            </View>
            {/* Flight Route Decoration */}
            <View style={{ marginTop: 15 }}>
              <FlightRouteDecoration width={515} />
            </View>
          </View>

          {/* Premium African Pattern Divider */}
          <View style={styles.patternBorder}>
            <PremiumAfricanBorder width={515} variant="primary" />
          </View>

          {/* Info Cards Grid */}
          <View style={styles.infoCardsGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardLabel}>Travel Dates</Text>
              <Text style={styles.infoCardValue}>
                {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
              </Text>
            </View>
            <View style={[styles.infoCard, styles.infoCardSecondary]}>
              <Text style={styles.infoCardLabel}>Travelers</Text>
              <Text style={styles.infoCardValue}>
                {booking.adults} Adult{booking.adults > 1 ? "s" : ""}
                {booking.children > 0 &&
                  `, ${booking.children} Child${booking.children > 1 ? "ren" : ""}`}
              </Text>
            </View>
            <View style={[styles.infoCard, styles.infoCardGold]}>
              <Text style={styles.infoCardLabel}>Lead Traveler</Text>
              <Text style={styles.infoCardValue}>{booking.contactName}</Text>
            </View>
            <View style={[styles.infoCard, styles.infoCardTerracotta]}>
              <Text style={styles.infoCardLabel}>Tour Operator</Text>
              <Text style={styles.infoCardValue}>{booking.agent.businessName}</Text>
            </View>
          </View>

          {/* Journey Path Decoration */}
          <View style={{ marginBottom: 10 }}>
            <JourneyPath width={515} />
          </View>

          {/* Itinerary Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBox}>
                <CalendarIcon />
              </View>
              <Text style={styles.sectionTitle}>Your Itinerary</Text>
              <View style={{ marginLeft: "auto", opacity: 0.5 }}>
                <BinocularsIcon size={16} color={colors.secondary} />
              </View>
            </View>

            {itinerary.map((day) => (
              <View key={day.dayNumber} style={styles.dayCard} wrap={false}>
                <View style={styles.dayCardHeader}>
                  <View style={styles.dayNumberCircle}>
                    <Text style={styles.dayNumberText}>{day.dayNumber}</Text>
                  </View>
                  <View style={styles.dayTitleContainer}>
                    <Text style={styles.dayTitle}>{day.title}</Text>
                    {day.location && (
                      <Text style={styles.dayLocation}>{day.location}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.dayCardBody}>
                  <Text style={styles.dayDescription}>{day.description}</Text>

                  {day.meals.length > 0 && (
                    <View style={styles.dayMetaRow}>
                      <View style={styles.dayMetaItem}>
                        <Text style={styles.dayMetaLabel}>Meals:</Text>
                        <Text style={styles.dayMetaValue}>{day.meals.join(", ")}</Text>
                      </View>
                    </View>
                  )}

                  {accommodationByDay[day.dayNumber] && (
                    <View style={styles.accommodationBox}>
                      <Text style={styles.accommodationLabel}>Overnight Accommodation</Text>
                      <Text style={styles.accommodationName}>
                        {accommodationByDay[day.dayNumber].name}
                      </Text>
                      <View style={styles.accommodationTierBadge}>
                        <Text style={styles.accommodationTierText}>
                          {accommodationByDay[day.dayNumber].tier}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Section Divider before Add-ons */}
          {booking.activities.length > 0 && (
            <SectionDivider width={515} showIcon={false} />
          )}

          {/* Add-ons Section */}
          {booking.activities.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconBox, { backgroundColor: colors.goldBg }]}>
                  <SparklesIcon color={colors.gold} />
                </View>
                <Text style={styles.sectionTitle}>Included Add-ons</Text>
              </View>
              <View style={styles.addonsGrid}>
                {booking.activities.map((activity, idx) => (
                  <View key={idx} style={styles.addonBadge}>
                    <Text style={styles.addonText}>{activity.activityAddon.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Section Divider before Price Summary */}
          <SectionDivider width={515} showIcon={true} />

          {/* Price Summary */}
          <View style={styles.priceSection}>
            <View style={styles.priceHeader}>
              <Text style={styles.priceTitle}>Price Summary</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Base Package ({booking.adults} adult{booking.adults > 1 ? "s" : ""})
              </Text>
              <Text style={styles.priceValue}>${pricing.baseTotal.toLocaleString()}</Text>
            </View>

            {booking.children > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  Children ({booking.children})
                </Text>
                <Text style={styles.priceValue}>${pricing.childTotal.toLocaleString()}</Text>
              </View>
            )}

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Accommodations</Text>
              <Text style={styles.priceValue}>
                ${pricing.accommodationTotal.toLocaleString()}
              </Text>
            </View>

            {pricing.addonsTotal > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Add-ons & Activities</Text>
                <Text style={styles.priceValue}>
                  ${pricing.addonsTotal.toLocaleString()}
                </Text>
              </View>
            )}

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service Fee & Taxes</Text>
              <Text style={styles.priceValue}>${pricing.serviceFee.toLocaleString()}</Text>
            </View>

            <View style={styles.priceDivider} />

            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { fontWeight: "bold" }]}>Total Amount</Text>
              <Text style={[styles.priceValue, { fontSize: 12 }]}>${pricing.total.toLocaleString()}</Text>
            </View>

            {/* Payment Status Section */}
            {booking.paymentType === "DEPOSIT" && booking.depositAmount ? (
              <>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Deposit Paid</Text>
                  <Text style={[styles.priceValue, { color: colors.success }]}>
                    ${booking.depositAmount.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Balance Due</Text>
                  <Text style={[styles.priceValue, { color: "#D97706" }]}>
                    ${booking.balanceAmount?.toLocaleString() || 0}
                  </Text>
                </View>
                {booking.balanceDueDate && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Balance Due By</Text>
                    <Text style={styles.priceValue}>
                      {format(new Date(booking.balanceDueDate), "MMM d, yyyy")}
                    </Text>
                  </View>
                )}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Deposit Paid</Text>
                  <Text style={styles.totalValue}>${booking.depositAmount.toLocaleString()}</Text>
                </View>
              </>
            ) : (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  {booking.paymentStatus === "COMPLETED" ? "Total Paid" : "Amount Due"}
                </Text>
                <Text style={styles.totalValue}>${pricing.total.toLocaleString()}</Text>
              </View>
            )}
          </View>

          {/* Payment Status Notice for Deposit */}
          {booking.paymentType === "DEPOSIT" && booking.balanceAmount && booking.balanceAmount > 0 && (
            <View style={[styles.paymentStatusBox, styles.paymentStatusBoxPending]}>
              <Text style={[styles.paymentStatusTitle, styles.paymentStatusTitlePending]}>
                Balance Payment Required
              </Text>
              <Text style={styles.balanceDueText}>
                Please pay the remaining balance of ${booking.balanceAmount.toLocaleString()}
                {booking.balanceDueDate
                  ? ` by ${format(new Date(booking.balanceDueDate), "MMMM d, yyyy")}`
                  : " before your trip"} to complete your booking.
              </Text>
            </View>
          )}

          {/* Payment Confirmed Notice */}
          {booking.paymentStatus === "COMPLETED" && booking.paymentType !== "DEPOSIT" && (
            <View style={styles.paymentStatusBox}>
              <Text style={styles.paymentStatusTitle}>Payment Confirmed</Text>
              <Text style={{ fontSize: 9, color: colors.gray600 }}>
                Your payment has been received in full. Your safari adventure is confirmed!
              </Text>
            </View>
          )}

          {/* Contact Section */}
          <View style={styles.contactSection}>
            <View style={[styles.contactCard, styles.contactCardPrimary]}>
              <Text style={styles.contactTitle}>Your Contact Details</Text>
              <View style={styles.contactRow}>
                <Text style={styles.contactText}>{booking.contactName}</Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactText}>{booking.contactEmail}</Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactText}>{booking.contactPhone}</Text>
              </View>
            </View>

            <View style={[styles.contactCard, styles.contactCardSecondary]}>
              <Text style={styles.contactTitle}>Tour Operator</Text>
              <View style={styles.contactRow}>
                <Text style={styles.contactText}>{booking.agent.businessName}</Text>
              </View>
              {booking.agent.businessEmail && (
                <View style={styles.contactRow}>
                  <Text style={styles.contactText}>{booking.agent.businessEmail}</Text>
                </View>
              )}
              {booking.agent.businessPhone && (
                <View style={styles.contactRow}>
                  <Text style={styles.contactText}>{booking.agent.businessPhone}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Special Requests */}
          {booking.specialRequests && (
            <View style={styles.specialRequestsBox}>
              <Text style={styles.specialRequestsTitle}>Special Requests</Text>
              <Text style={styles.specialRequestsText}>{booking.specialRequests}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerLogo}>SafariPlus</Text>
              <Text style={styles.footerText}>
                Thank you for booking with us!
              </Text>
              <Text style={styles.footerText}>
                For questions or changes, contact us at support@safariplus.com
              </Text>
            </View>
            <View style={styles.footerRight}>
              <View style={styles.footerHighlight}>
                <Text style={styles.footerHighlightText}>
                  Free cancellation up to 30 days before your trip
                </Text>
              </View>
              <Text style={styles.footerWebsite}>www.safariplus.com</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* Image Gallery Page - Only if there are images */}
      {(booking.tour.coverImage || (booking.tour.images && booking.tour.images.length > 0)) && (
        <Page size="A4" style={[styles.page, styles.galleryPage]}>
          {/* Corner Decorations */}
          <View style={{ position: "absolute", top: 15, left: 15, opacity: 0.2 }}>
            <AcaciaTreeSilhouette size={35} color={colors.secondary} />
          </View>
          <View style={{ position: "absolute", top: 15, right: 15, opacity: 0.2, transform: "scaleX(-1)" }}>
            <AcaciaTreeSilhouette size={35} color={colors.secondary} />
          </View>

          {/* Gallery Header */}
          <View style={[styles.galleryHeader, { marginTop: 30 }]}>
            <MaasaiSpearDecoration height={45} />
            <View style={{ alignItems: "center" }}>
              <Text style={styles.galleryTitle}>Tour Gallery</Text>
              <View style={{ marginTop: 5 }}>
                <FlightRouteDecoration width={200} />
              </View>
            </View>
            <MaasaiSpearDecoration height={45} />
          </View>

          <Text style={styles.gallerySubtitle}>
            {booking.tour.title} • {booking.tour.destination}
          </Text>

          {/* Premium Section Divider */}
          <SectionDivider width={515} showIcon={true} />

          {/* Cover Image */}
          {booking.tour.coverImage && (
            <View style={styles.coverImageContainer}>
              <Image
                src={booking.tour.coverImage}
                style={styles.coverImage}
              />
              {/* Safari Jeep overlay on cover image */}
              <View style={{ position: "absolute", bottom: 10, right: 15, opacity: 0.7 }}>
                <SafariJeepIcon size={35} color={colors.white} />
              </View>
            </View>
          )}

          {/* Gallery Grid */}
          {booking.tour.images && booking.tour.images.length > 0 && (
            <View style={styles.galleryGrid}>
              {booking.tour.images.slice(0, 4).map((image, index) => (
                <View key={index} style={styles.galleryImageContainer}>
                  <Image
                    src={image}
                    style={styles.galleryImage}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Safari Animals Row - Full width decoration */}
          <View style={{ marginTop: 25, alignItems: "center" }}>
            <SafariAnimalsRow width={400} />
          </View>

          {/* Premium African Pattern */}
          <View style={[styles.patternBorder, { marginTop: 20 }]}>
            <PremiumAfricanBorder width={515} variant="gold" />
          </View>

          {/* Gallery Footer with African Sun */}
          <View style={{ marginTop: 25, alignItems: "center", position: "relative" }}>
            {/* Background mountain silhouette */}
            <View style={{ position: "absolute", top: -10, opacity: 0.1, zIndex: -1 }}>
              <MountainSilhouette width={300} />
            </View>

            <AfricanSunIcon size={60} />
            <Text style={{ fontSize: 12, color: colors.secondary, marginTop: 12, textAlign: "center", fontWeight: "bold" }}>
              Experience the Magic of Africa
            </Text>
            <Text style={{ fontSize: 9, color: colors.gray500, marginTop: 5, textAlign: "center" }}>
              Unforgettable adventures await with SafariPlus
            </Text>

            {/* Acacia trees flanking the text */}
            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "flex-end", marginTop: 15, gap: 80 }}>
              <AcaciaTreeSilhouette size={30} color={colors.secondary} />
              <CompassIcon size={25} />
              <AcaciaTreeSilhouette size={30} color={colors.secondary} />
            </View>

            <Text style={{ fontSize: 9, color: colors.primary, marginTop: 15, fontWeight: "bold" }}>
              www.safariplus.com
            </Text>
          </View>
        </Page>
      )}
    </Document>
  )
}
