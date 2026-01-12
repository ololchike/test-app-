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
    tour: {
      title: string
      destination: string
      durationDays: number
      durationNights: number
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
        {/* Premium Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View>
              <Text style={styles.logoText}>SafariPlus</Text>
              <Text style={styles.logoSubtext}>Your African Adventure Awaits</Text>
            </View>
          </View>
          <View style={styles.bookingRefBox}>
            <Text style={styles.bookingRefLabel}>Booking Reference</Text>
            <Text style={styles.bookingRefValue}>{booking.bookingReference}</Text>
            <View style={styles.confirmationBadge}>
              <Text style={styles.confirmationText}>Confirmed</Text>
            </View>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          {/* Tour Hero */}
          <View style={styles.tourHero}>
            <Text style={styles.tourTitle}>{booking.tour.title}</Text>
            <View style={styles.tourSubtitle}>
              <Text>
                {booking.tour.durationDays} Days / {booking.tour.durationNights} Nights
                {" • "}{booking.tour.destination}
              </Text>
            </View>
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

          {/* Itinerary Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBox}>
                <CalendarIcon />
              </View>
              <Text style={styles.sectionTitle}>Your Itinerary</Text>
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

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalValue}>${pricing.total.toLocaleString()}</Text>
            </View>
          </View>

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
    </Document>
  )
}
