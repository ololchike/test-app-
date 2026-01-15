import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Path,
  Circle,
  G,
  Rect,
  Line,
  Defs,
  LinearGradient,
  Stop,
} from "@react-pdf/renderer"
import { format } from "date-fns"

// ============================================
// PREMIUM EXECUTIVE COLOR PALETTE
// ============================================
const colors = {
  // Primary - Deep Navy (Executive)
  navy: "#0A1628",
  navyLight: "#1A2942",
  navyDark: "#050D18",

  // Accent - Luxury Gold
  gold: "#B8860B",
  goldLight: "#D4A84B",
  goldMuted: "#C9A227",
  goldPale: "#F5ECD7",

  // Safari Signature - Sunset Orange
  sunset: "#E07B39",
  sunsetLight: "#F5923F",
  sunsetDark: "#C56A2E",
  sunsetPale: "#FEF7F3",

  // Forest - Deep Green
  forest: "#1B4D3E",
  forestLight: "#2D7A5F",
  forestPale: "#E8F5F0",

  // Premium Neutrals
  white: "#FFFFFF",
  ivory: "#FDFCFA",
  cream: "#F8F6F3",
  sand: "#EDE8E0",
  stone: "#D4CFC5",
  slate: "#6B7280",
  charcoal: "#374151",
  black: "#111827",

  // Status
  success: "#059669",
  successPale: "#D1FAE5",
  warning: "#D97706",
  warningPale: "#FEF3C7",
}

// ============================================
// EXECUTIVE STYLE DEFINITIONS
// ============================================
const styles = StyleSheet.create({
  // ===== PAGE LAYOUT =====
  page: {
    backgroundColor: colors.white,
    fontFamily: "Helvetica",
  },

  // ===== PREMIUM HEADER =====
  headerContainer: {
    position: "relative",
    height: 140,
    backgroundColor: colors.navy,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    position: "relative",
    paddingHorizontal: 50,
    paddingTop: 30,
    paddingBottom: 25,
    height: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  brandIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 10,
    color: colors.goldLight,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 4,
    marginLeft: 2,
  },
  documentTitle: {
    fontSize: 11,
    color: colors.stone,
    marginTop: 15,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  referenceBox: {
    alignItems: "flex-end",
  },
  referenceLabel: {
    fontSize: 8,
    color: colors.slate,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  referenceValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.white,
    letterSpacing: 2,
  },
  statusBadge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.success,
  },
  statusBadgePending: {
    backgroundColor: colors.warning,
  },
  statusText: {
    fontSize: 8,
    fontWeight: "bold",
    color: colors.white,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.gold,
  },

  // ===== CONTENT AREA =====
  content: {
    paddingHorizontal: 50,
    paddingTop: 35,
    paddingBottom: 100,
  },

  // ===== TOUR HERO =====
  heroSection: {
    marginBottom: 30,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.navy,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  heroMetaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroMetaText: {
    fontSize: 11,
    color: colors.slate,
  },
  heroMetaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },

  // ===== INFO GRID =====
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    marginBottom: 35,
  },
  infoCard: {
    width: "48%",
    backgroundColor: colors.cream,
    borderRadius: 10,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
  },
  infoCardAlt: {
    borderLeftColor: colors.sunset,
  },
  infoCardSecondary: {
    borderLeftColor: colors.forest,
  },
  infoCardNavy: {
    borderLeftColor: colors.navy,
  },
  infoCardLabel: {
    fontSize: 8,
    color: colors.slate,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  infoCardValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.navy,
    lineHeight: 1.3,
  },
  infoCardSubtext: {
    fontSize: 9,
    color: colors.slate,
    marginTop: 4,
  },

  // ===== SECTION STYLES =====
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand,
    paddingBottom: 12,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    backgroundColor: colors.navy,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  sectionIconAlt: {
    backgroundColor: colors.sunset,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.navy,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 10,
    color: colors.slate,
    marginTop: 2,
  },

  // ===== ITINERARY TIMELINE =====
  timelineContainer: {
    position: "relative",
    paddingLeft: 25,
  },
  timelineLine: {
    position: "absolute",
    left: 7,
    top: 20,
    bottom: 20,
    width: 2,
    backgroundColor: colors.sand,
  },
  dayCard: {
    marginBottom: 18,
    position: "relative",
  },
  dayMarker: {
    position: "absolute",
    left: -25,
    top: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.gold,
    borderWidth: 3,
    borderColor: colors.white,
  },
  dayMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.navy,
  },
  dayContent: {
    backgroundColor: colors.ivory,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.sand,
  },
  dayHeader: {
    backgroundColor: colors.navy,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayNumber: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.goldLight,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  dayTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.white,
    flex: 1,
    marginLeft: 12,
  },
  dayLocation: {
    fontSize: 9,
    color: colors.stone,
    flexDirection: "row",
    alignItems: "center",
  },
  dayBody: {
    padding: 18,
  },
  dayDescription: {
    fontSize: 10,
    color: colors.charcoal,
    lineHeight: 1.6,
    marginBottom: 14,
  },
  dayDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  dayDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  dayDetailIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  dayDetailText: {
    fontSize: 9,
    color: colors.charcoal,
  },
  accommodationBadge: {
    marginTop: 14,
    backgroundColor: colors.forestPale,
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.forest,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  accommodationImage: {
    width: 60,
    height: 45,
    borderRadius: 6,
    objectFit: "cover",
  },
  accommodationInfo: {
    flex: 1,
  },
  accommodationLabel: {
    fontSize: 8,
    color: colors.slate,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  accommodationName: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.navy,
  },
  accommodationTier: {
    fontSize: 8,
    color: colors.forest,
    fontWeight: "bold",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Day-specific add-ons
  dayAddonsBadge: {
    marginTop: 14,
    backgroundColor: colors.goldPale,
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
  },
  dayAddonsLabel: {
    fontSize: 8,
    color: colors.slate,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  dayAddonsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  dayAddonTag: {
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.goldMuted,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dayAddonImage: {
    width: 36,
    height: 28,
    borderRadius: 4,
    objectFit: "cover",
  },
  dayAddonInfo: {
    flex: 1,
  },
  dayAddonText: {
    fontSize: 9,
    color: colors.charcoal,
    fontWeight: "bold",
  },
  dayAddonPriceType: {
    fontSize: 7,
    color: colors.slate,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ===== ADD-ONS =====
  addonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  addonItem: {
    backgroundColor: colors.goldPale,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.goldMuted,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addonText: {
    fontSize: 10,
    color: colors.charcoal,
    fontWeight: "bold",
  },

  // ===== PRICE BREAKDOWN =====
  priceContainer: {
    backgroundColor: colors.navy,
    borderRadius: 16,
    overflow: "hidden",
  },
  priceHeader: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.navyLight,
  },
  priceTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.white,
    letterSpacing: 0.5,
  },
  priceBody: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 10,
    color: colors.stone,
  },
  priceValue: {
    fontSize: 10,
    color: colors.white,
    fontWeight: "bold",
  },
  priceDivider: {
    height: 1,
    backgroundColor: colors.navyLight,
    marginVertical: 15,
  },
  priceSubtotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  priceSubtotalLabel: {
    fontSize: 11,
    color: colors.goldLight,
    fontWeight: "bold",
  },
  priceSubtotalValue: {
    fontSize: 11,
    color: colors.goldLight,
    fontWeight: "bold",
  },
  priceTotal: {
    backgroundColor: colors.gold,
    marginTop: 15,
    marginHorizontal: -24,
    marginBottom: -20,
    paddingHorizontal: 24,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceTotalLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.navy,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  priceTotalValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.navy,
  },

  // ===== PAYMENT STATUS =====
  paymentNotice: {
    marginTop: 20,
    backgroundColor: colors.successPale,
    borderRadius: 10,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  paymentNoticePending: {
    backgroundColor: colors.warningPale,
    borderLeftColor: colors.warning,
  },
  paymentNoticeTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.success,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paymentNoticeTitlePending: {
    color: colors.warning,
  },
  paymentNoticeText: {
    fontSize: 10,
    color: colors.charcoal,
    lineHeight: 1.5,
  },
  paymentNoticeAmount: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.navy,
    marginTop: 8,
  },

  // ===== CONTACT SECTION =====
  contactGrid: {
    flexDirection: "row",
    gap: 20,
    marginTop: 25,
  },
  contactCard: {
    flex: 1,
    backgroundColor: colors.cream,
    borderRadius: 10,
    padding: 18,
  },
  contactCardPrimary: {
    borderTopWidth: 3,
    borderTopColor: colors.sunset,
  },
  contactCardSecondary: {
    borderTopWidth: 3,
    borderTopColor: colors.navy,
  },
  contactTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.navy,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  contactIcon: {
    width: 14,
    height: 14,
    marginRight: 10,
  },
  contactText: {
    fontSize: 10,
    color: colors.charcoal,
  },

  // ===== SPECIAL REQUESTS =====
  specialRequestsBox: {
    marginTop: 20,
    backgroundColor: colors.sunsetPale,
    borderRadius: 10,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: colors.sunset,
  },
  specialRequestsTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.sunsetDark,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  specialRequestsText: {
    fontSize: 10,
    color: colors.charcoal,
    lineHeight: 1.5,
  },

  // ===== FOOTER =====
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.navy,
    paddingHorizontal: 50,
    paddingVertical: 22,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    flex: 1,
  },
  footerBrand: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 4,
  },
  footerTagline: {
    fontSize: 9,
    color: colors.slate,
    marginBottom: 3,
  },
  footerRight: {
    alignItems: "flex-end",
  },
  footerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.navyLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 6,
  },
  footerBadgeText: {
    fontSize: 8,
    color: colors.goldLight,
    fontWeight: "bold",
  },
  footerUrl: {
    fontSize: 10,
    color: colors.goldLight,
    fontWeight: "bold",
  },

  // ===== GALLERY PAGE =====
  galleryPage: {
    backgroundColor: colors.ivory,
    padding: 0,
  },
  galleryHeader: {
    backgroundColor: colors.navy,
    paddingHorizontal: 50,
    paddingVertical: 35,
    alignItems: "center",
  },
  galleryTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    letterSpacing: 1,
    marginBottom: 6,
  },
  gallerySubtitle: {
    fontSize: 11,
    color: colors.goldLight,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  galleryContent: {
    padding: 50,
  },
  coverImageWrapper: {
    marginBottom: 25,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: colors.gold,
  },
  coverImage: {
    width: "100%",
    height: 240,
    objectFit: "cover",
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  galleryImageWrapper: {
    width: "48%",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  galleryImage: {
    width: "100%",
    height: 150,
    objectFit: "cover",
  },
  galleryFooter: {
    marginTop: 40,
    alignItems: "center",
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: colors.sand,
  },
  galleryTagline: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.navy,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  gallerySubTagline: {
    fontSize: 10,
    color: colors.slate,
    marginBottom: 20,
  },
  galleryBrandUrl: {
    fontSize: 11,
    color: colors.gold,
    fontWeight: "bold",
  },

  // ===== DECORATIVE ELEMENTS =====
  goldLine: {
    height: 2,
    backgroundColor: colors.gold,
  },
  dividerLine: {
    height: 1,
    backgroundColor: colors.sand,
    marginVertical: 25,
  },
})

// ============================================
// PREMIUM SVG ICONS
// ============================================
const PremiumBrandIcon = () => (
  <Svg viewBox="0 0 40 40" style={{ width: 32, height: 32 }}>
    <Circle cx={20} cy={20} r={18} fill={colors.gold} />
    <Circle cx={20} cy={20} r={14} fill={colors.navy} />
    <Path
      d="M20 8 L23 16 L31 16 L25 21 L27 29 L20 24 L13 29 L15 21 L9 16 L17 16 Z"
      fill={colors.goldLight}
    />
  </Svg>
)

const CalendarIcon = ({ color = colors.white }: { color?: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
    <Path
      fill={color}
      d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z"
    />
  </Svg>
)

const MapPinIcon = ({ color = colors.slate }: { color?: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 12, height: 12 }}>
    <Path
      fill={color}
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
    />
  </Svg>
)

const SparkleIcon = ({ color = colors.gold }: { color?: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
    <Path
      fill={color}
      d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"
    />
  </Svg>
)

const CheckCircleIcon = ({ color = colors.success }: { color?: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
    <Path
      fill={color}
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
    />
  </Svg>
)

const UserIcon = ({ color = colors.slate }: { color?: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
    <Path
      fill={color}
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
    />
  </Svg>
)

const MailIcon = ({ color = colors.slate }: { color?: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
    <Path
      fill={color}
      d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
    />
  </Svg>
)

const PhoneIcon = ({ color = colors.slate }: { color?: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
    <Path
      fill={color}
      d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
    />
  </Svg>
)

const MealIcon = ({ color = colors.charcoal }: { color?: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
    <Path
      fill={color}
      d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"
    />
  </Svg>
)

const ShieldIcon = ({ color = colors.goldLight }: { color?: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 12, height: 12 }}>
    <Path
      fill={color}
      d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"
    />
  </Svg>
)

const StarIcon = ({ color = colors.gold }: { color?: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 40, height: 40 }}>
    <Path
      fill={color}
      d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"
    />
  </Svg>
)

// Decorative line with diamonds
const PremiumDivider = ({ width = 495 }: { width?: number }) => (
  <Svg viewBox={`0 0 ${width} 12`} style={{ width, height: 12, marginVertical: 20 }}>
    <Line x1={0} y1={6} x2={width * 0.4} y2={6} stroke={colors.sand} strokeWidth={1} />
    <Path
      d={`M${width * 0.42} 6 L${width * 0.45} 2 L${width * 0.48} 6 L${width * 0.45} 10 Z`}
      fill={colors.gold}
    />
    <Circle cx={width * 0.5} cy={6} r={3} fill={colors.navy} />
    <Path
      d={`M${width * 0.52} 6 L${width * 0.55} 2 L${width * 0.58} 6 L${width * 0.55} 10 Z`}
      fill={colors.gold}
    />
    <Line x1={width * 0.6} y1={6} x2={width} y2={6} stroke={colors.sand} strokeWidth={1} />
  </Svg>
)

// ============================================
// MAIN COMPONENT INTERFACE
// ============================================
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
        images?: string[]
      }
    }>
    activities: Array<{
      price: number
      quantity: number
      dayNumber?: number | null // Day this add-on is assigned to
      activityAddon: {
        name: string
        priceType: "PER_PERSON" | "PER_GROUP" | "FLAT_RATE"
        maxCapacity?: number | null
        images?: string[]
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

// ============================================
// MAIN PDF COMPONENT
// ============================================
export function ItineraryPDF({ booking, itinerary, pricing }: ItineraryPDFProps) {
  const startDate = new Date(booking.startDate)
  const endDate = new Date(booking.endDate)

  // Create accommodation map by day
  const accommodationByDay: Record<number, { name: string; tier: string; image?: string }> = {}
  booking.accommodations.forEach((acc) => {
    accommodationByDay[acc.dayNumber] = {
      name: acc.accommodationOption.name,
      tier: acc.accommodationOption.tier,
      image: acc.accommodationOption.images?.[0],
    }
  })

  // Create add-ons map by day
  interface AddonInfo {
    name: string
    price: number
    quantity: number
    priceType: "PER_PERSON" | "PER_GROUP" | "FLAT_RATE"
    maxCapacity?: number | null
    image?: string
  }
  const addonsByDay: Record<number, AddonInfo[]> = {}
  const generalAddons: AddonInfo[] = [] // Add-ons without a specific day

  booking.activities.forEach((activity) => {
    const addonInfo: AddonInfo = {
      name: activity.activityAddon.name,
      price: activity.price,
      quantity: activity.quantity,
      priceType: activity.activityAddon.priceType,
      maxCapacity: activity.activityAddon.maxCapacity,
      image: activity.activityAddon.images?.[0],
    }
    if (activity.dayNumber) {
      if (!addonsByDay[activity.dayNumber]) {
        addonsByDay[activity.dayNumber] = []
      }
      addonsByDay[activity.dayNumber].push(addonInfo)
    } else {
      // Add-ons without a day assignment go to general list
      generalAddons.push(addonInfo)
    }
  })

  // Helper to format pricing type label
  const formatPriceType = (priceType: "PER_PERSON" | "PER_GROUP" | "FLAT_RATE", maxCapacity?: number | null) => {
    switch (priceType) {
      case "PER_PERSON":
        return "per person"
      case "PER_GROUP":
        return maxCapacity ? `per group (up to ${maxCapacity})` : "per group"
      case "FLAT_RATE":
      default:
        return "flat rate"
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`
  }

  const isPaid = booking.paymentStatus === "COMPLETED"
  const isDeposit = booking.paymentType === "DEPOSIT"
  const hasBalance = isDeposit && booking.balanceAmount && booking.balanceAmount > 0

  return (
    <Document>
      {/* ===== MAIN ITINERARY PAGE ===== */}
      <Page size="A4" style={styles.page}>
        {/* Premium Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.brandContainer}>
                <PremiumBrandIcon />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.brandName}>SafariPlus</Text>
                  <Text style={styles.brandTagline}>Luxury African Expeditions</Text>
                </View>
              </View>
              <Text style={styles.documentTitle}>Travel Itinerary</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.referenceBox}>
                <Text style={styles.referenceLabel}>Booking Reference</Text>
                <Text style={styles.referenceValue}>{booking.bookingReference}</Text>
              </View>
              <View style={isPaid ? styles.statusBadge : [styles.statusBadge, styles.statusBadgePending]}>
                <Text style={styles.statusText}>
                  {isPaid
                    ? (isDeposit ? "Deposit Confirmed" : "Fully Paid")
                    : "Payment Pending"}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.headerAccent} />
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          {/* Tour Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>{booking.tour.title}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.heroMetaItem}>
                <Text style={styles.heroMetaText}>
                  {booking.tour.durationDays} Days / {booking.tour.durationNights} Nights
                </Text>
              </View>
              <View style={styles.heroMetaDivider} />
              <View style={styles.heroMetaItem}>
                <MapPinIcon color={colors.gold} />
                <Text style={[styles.heroMetaText, { marginLeft: 4 }]}>
                  {booking.tour.destination}
                </Text>
              </View>
            </View>
          </View>

          {/* Premium Divider */}
          <PremiumDivider width={495} />

          {/* Info Cards Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardLabel}>Travel Dates</Text>
              <Text style={styles.infoCardValue}>
                {format(startDate, "MMMM d")} - {format(endDate, "d, yyyy")}
              </Text>
              <Text style={styles.infoCardSubtext}>
                {booking.tour.durationDays} days of adventure
              </Text>
            </View>
            <View style={[styles.infoCard, styles.infoCardAlt]}>
              <Text style={styles.infoCardLabel}>Travelers</Text>
              <Text style={styles.infoCardValue}>
                {booking.adults} Adult{booking.adults > 1 ? "s" : ""}
                {booking.children > 0 && `, ${booking.children} Child${booking.children > 1 ? "ren" : ""}`}
              </Text>
              <Text style={styles.infoCardSubtext}>
                {booking.adults + booking.children} total guests
              </Text>
            </View>
            <View style={[styles.infoCard, styles.infoCardSecondary]}>
              <Text style={styles.infoCardLabel}>Lead Traveler</Text>
              <Text style={styles.infoCardValue}>{booking.contactName}</Text>
              <Text style={styles.infoCardSubtext}>{booking.contactEmail}</Text>
            </View>
            <View style={[styles.infoCard, styles.infoCardNavy]}>
              <Text style={styles.infoCardLabel}>Tour Operator</Text>
              <Text style={styles.infoCardValue}>{booking.agent.businessName}</Text>
              <Text style={styles.infoCardSubtext}>Your safari partner</Text>
            </View>
          </View>

          {/* Itinerary Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <CalendarIcon color={colors.white} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Your Journey</Text>
                <Text style={styles.sectionSubtitle}>Day-by-day adventure itinerary</Text>
              </View>
            </View>

            <View style={styles.timelineContainer}>
              <View style={styles.timelineLine} />
              {itinerary.map((day) => (
                <View key={day.dayNumber} style={styles.dayCard} wrap={false}>
                  <View style={styles.dayMarker} />
                  <View style={styles.dayContent}>
                    <View style={styles.dayHeader}>
                      <Text style={styles.dayNumber}>Day {day.dayNumber}</Text>
                      <Text style={styles.dayTitle}>{day.title}</Text>
                      {day.location && (
                        <View style={styles.dayLocation}>
                          <MapPinIcon color={colors.stone} />
                          <Text style={{ fontSize: 9, color: colors.stone, marginLeft: 4 }}>
                            {day.location}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.dayBody}>
                      <Text style={styles.dayDescription}>{day.description}</Text>

                      {day.meals.length > 0 && (
                        <View style={styles.dayDetails}>
                          <View style={styles.dayDetailItem}>
                            <MealIcon color={colors.charcoal} />
                            <Text style={styles.dayDetailText}>
                              {day.meals.join(", ")}
                            </Text>
                          </View>
                        </View>
                      )}

                      {accommodationByDay[day.dayNumber] && (
                        <View style={styles.accommodationBadge}>
                          {accommodationByDay[day.dayNumber].image && (
                            <Image
                              src={accommodationByDay[day.dayNumber].image}
                              style={styles.accommodationImage}
                            />
                          )}
                          <View style={styles.accommodationInfo}>
                            <Text style={styles.accommodationLabel}>Overnight Stay</Text>
                            <Text style={styles.accommodationName}>
                              {accommodationByDay[day.dayNumber].name}
                            </Text>
                            <Text style={styles.accommodationTier}>
                              {accommodationByDay[day.dayNumber].tier} Accommodation
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Day-specific add-ons */}
                      {addonsByDay[day.dayNumber] && addonsByDay[day.dayNumber].length > 0 && (
                        <View style={styles.dayAddonsBadge}>
                          <Text style={styles.dayAddonsLabel}>Premium Experiences</Text>
                          <View style={styles.dayAddonsGrid}>
                            {addonsByDay[day.dayNumber].map((addon, idx) => (
                              <View key={idx} style={styles.dayAddonTag}>
                                {addon.image && (
                                  <Image
                                    src={addon.image}
                                    style={styles.dayAddonImage}
                                  />
                                )}
                                <View style={styles.dayAddonInfo}>
                                  <Text style={styles.dayAddonText}>{addon.name}</Text>
                                  <Text style={styles.dayAddonPriceType}>
                                    {formatCurrency(addon.price)} {formatPriceType(addon.priceType, addon.maxCapacity)}
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* General Add-ons Section (only for add-ons not assigned to specific days) */}
          {generalAddons.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, styles.sectionIconAlt]}>
                  <SparkleIcon color={colors.white} />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Additional Experiences</Text>
                  <Text style={styles.sectionSubtitle}>Trip-wide add-ons and activities</Text>
                </View>
              </View>
              <View style={styles.addonsContainer}>
                {generalAddons.map((addon, idx) => (
                  <View key={idx} style={styles.addonItem}>
                    {addon.image && (
                      <Image
                        src={addon.image}
                        style={styles.dayAddonImage}
                      />
                    )}
                    <View>
                      <Text style={styles.addonText}>{addon.name}</Text>
                      <Text style={styles.dayAddonPriceType}>
                        {formatCurrency(addon.price)} {formatPriceType(addon.priceType, addon.maxCapacity)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Price Breakdown */}
          <View style={styles.priceContainer}>
            <View style={styles.priceHeader}>
              <Text style={styles.priceTitle}>Investment Summary</Text>
            </View>
            <View style={styles.priceBody}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  Safari Package ({booking.adults} adult{booking.adults > 1 ? "s" : ""})
                </Text>
                <Text style={styles.priceValue}>{formatCurrency(pricing.baseTotal)}</Text>
              </View>

              {booking.children > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>
                    Children ({booking.children})
                  </Text>
                  <Text style={styles.priceValue}>{formatCurrency(pricing.childTotal)}</Text>
                </View>
              )}

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Accommodations</Text>
                <Text style={styles.priceValue}>{formatCurrency(pricing.accommodationTotal)}</Text>
              </View>

              {pricing.addonsTotal > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Premium Experiences</Text>
                  <Text style={styles.priceValue}>{formatCurrency(pricing.addonsTotal)}</Text>
                </View>
              )}

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Service Fee & Taxes</Text>
                <Text style={styles.priceValue}>{formatCurrency(pricing.serviceFee)}</Text>
              </View>

              <View style={styles.priceDivider} />

              {isDeposit && booking.depositAmount ? (
                <>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Deposit Paid</Text>
                    <Text style={[styles.priceValue, { color: colors.success }]}>
                      {formatCurrency(booking.depositAmount)}
                    </Text>
                  </View>
                  {hasBalance && (
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Balance Due</Text>
                      <Text style={[styles.priceValue, { color: colors.warning }]}>
                        {formatCurrency(booking.balanceAmount!)}
                      </Text>
                    </View>
                  )}
                </>
              ) : null}

              <View style={styles.priceTotal}>
                <Text style={styles.priceTotalLabel}>
                  {isPaid ? "Total Paid" : "Total Due"}
                </Text>
                <Text style={styles.priceTotalValue}>{formatCurrency(pricing.total)}</Text>
              </View>
            </View>
          </View>

          {/* Payment Status Notice */}
          {hasBalance && (
            <View style={[styles.paymentNotice, styles.paymentNoticePending]}>
              <Text style={[styles.paymentNoticeTitle, styles.paymentNoticeTitlePending]}>
                Balance Payment Required
              </Text>
              <Text style={styles.paymentNoticeText}>
                Please pay the remaining balance to complete your booking confirmation.
                {booking.balanceDueDate && (
                  ` Payment due by ${format(new Date(booking.balanceDueDate), "MMMM d, yyyy")}.`
                )}
              </Text>
              <Text style={styles.paymentNoticeAmount}>
                Amount Due: {formatCurrency(booking.balanceAmount!)}
              </Text>
            </View>
          )}

          {isPaid && !hasBalance && (
            <View style={styles.paymentNotice}>
              <Text style={styles.paymentNoticeTitle}>Payment Confirmed</Text>
              <Text style={styles.paymentNoticeText}>
                Your payment has been received. Your African safari adventure is fully confirmed.
                We look forward to creating unforgettable memories with you!
              </Text>
            </View>
          )}

          {/* Contact Section */}
          <View style={styles.contactGrid}>
            <View style={[styles.contactCard, styles.contactCardPrimary]}>
              <Text style={styles.contactTitle}>Your Details</Text>
              <View style={styles.contactRow}>
                <UserIcon color={colors.slate} />
                <Text style={styles.contactText}>{booking.contactName}</Text>
              </View>
              <View style={styles.contactRow}>
                <MailIcon color={colors.slate} />
                <Text style={styles.contactText}>{booking.contactEmail}</Text>
              </View>
              <View style={styles.contactRow}>
                <PhoneIcon color={colors.slate} />
                <Text style={styles.contactText}>{booking.contactPhone}</Text>
              </View>
            </View>

            <View style={[styles.contactCard, styles.contactCardSecondary]}>
              <Text style={styles.contactTitle}>Tour Operator</Text>
              <View style={styles.contactRow}>
                <UserIcon color={colors.slate} />
                <Text style={styles.contactText}>{booking.agent.businessName}</Text>
              </View>
              {booking.agent.businessEmail && (
                <View style={styles.contactRow}>
                  <MailIcon color={colors.slate} />
                  <Text style={styles.contactText}>{booking.agent.businessEmail}</Text>
                </View>
              )}
              {booking.agent.businessPhone && (
                <View style={styles.contactRow}>
                  <PhoneIcon color={colors.slate} />
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

        {/* Premium Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerBrand}>SafariPlus</Text>
              <Text style={styles.footerTagline}>
                Thank you for choosing us for your African adventure.
              </Text>
              <Text style={styles.footerTagline}>
                Questions? Contact us at support@safariplus.com
              </Text>
            </View>
            <View style={styles.footerRight}>
              <View style={styles.footerBadge}>
                <ShieldIcon color={colors.goldLight} />
                <Text style={[styles.footerBadgeText, { marginLeft: 6 }]}>
                  100% Secure Booking
                </Text>
              </View>
              <Text style={styles.footerUrl}>www.safariplus.com</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* ===== GALLERY PAGE ===== */}
      {(booking.tour.coverImage || (booking.tour.images && booking.tour.images.length > 0)) && (
        <Page size="A4" style={[styles.page, styles.galleryPage]}>
          <View style={styles.galleryHeader}>
            <Text style={styles.galleryTitle}>Your Destination Gallery</Text>
            <Text style={styles.gallerySubtitle}>
              {booking.tour.title} • {booking.tour.destination}
            </Text>
          </View>

          <View style={styles.galleryContent}>
            {/* Cover Image */}
            {booking.tour.coverImage && (
              <View style={styles.coverImageWrapper}>
                <Image
                  src={booking.tour.coverImage}
                  style={styles.coverImage}
                />
              </View>
            )}

            {/* Gallery Grid */}
            {booking.tour.images && booking.tour.images.length > 0 && (
              <View style={styles.galleryGrid}>
                {booking.tour.images.slice(0, 4).map((image, index) => (
                  <View key={index} style={styles.galleryImageWrapper}>
                    <Image
                      src={image}
                      style={styles.galleryImage}
                    />
                  </View>
                ))}
              </View>
            )}

            {/* Gallery Footer */}
            <View style={styles.galleryFooter}>
              <StarIcon color={colors.gold} />
              <Text style={styles.galleryTagline}>
                Experience the Magic of Africa
              </Text>
              <Text style={styles.gallerySubTagline}>
                Unforgettable adventures await with SafariPlus
              </Text>
              <Text style={styles.galleryBrandUrl}>www.safariplus.com</Text>
            </View>
          </View>
        </Page>
      )}
    </Document>
  )
}
