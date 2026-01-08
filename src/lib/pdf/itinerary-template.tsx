import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"
import { format } from "date-fns"

// Register fonts (using default for now)
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#16a34a",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#16a34a",
  },
  logoSubtext: {
    fontSize: 10,
    color: "#666666",
    marginTop: 2,
  },
  bookingRef: {
    textAlign: "right",
  },
  bookingRefLabel: {
    fontSize: 9,
    color: "#666666",
  },
  bookingRefValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#16a34a",
  },
  confirmationBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 5,
  },
  confirmationText: {
    fontSize: 9,
    color: "#16a34a",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tourTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  tourSubtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 15,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  infoItem: {
    width: "50%",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    color: "#1f2937",
    fontWeight: "bold",
  },
  dayCard: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#16a34a",
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dayNumber: {
    backgroundColor: "#16a34a",
    color: "#FFFFFF",
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 24,
    fontSize: 11,
    fontWeight: "bold",
    marginRight: 10,
  },
  dayTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
  },
  dayLocation: {
    fontSize: 9,
    color: "#6b7280",
  },
  dayDescription: {
    fontSize: 10,
    color: "#4b5563",
    marginBottom: 8,
    lineHeight: 1.4,
  },
  dayDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  dayDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  dayDetailLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginRight: 4,
  },
  dayDetailValue: {
    fontSize: 9,
    color: "#1f2937",
  },
  accommodationBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  accommodationLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 2,
  },
  accommodationName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1f2937",
  },
  accommodationTier: {
    fontSize: 8,
    color: "#16a34a",
  },
  priceSection: {
    backgroundColor: "#f0fdf4",
    padding: 15,
    borderRadius: 6,
    marginTop: 10,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  priceLabel: {
    fontSize: 10,
    color: "#4b5563",
  },
  priceValue: {
    fontSize: 10,
    color: "#1f2937",
  },
  priceDivider: {
    borderTopWidth: 1,
    borderTopColor: "#bbf7d0",
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#16a34a",
  },
  contactSection: {
    flexDirection: "row",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  contactColumn: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  contactText: {
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 2,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
    marginBottom: 2,
  },
  addonBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 5,
    marginTop: 5,
  },
  addonText: {
    fontSize: 8,
    color: "#92400e",
  },
  addonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>SafariPlus</Text>
            <Text style={styles.logoSubtext}>Your African Adventure Awaits</Text>
          </View>
          <View style={styles.bookingRef}>
            <Text style={styles.bookingRefLabel}>Booking Reference</Text>
            <Text style={styles.bookingRefValue}>{booking.bookingReference}</Text>
            <View style={styles.confirmationBadge}>
              <Text style={styles.confirmationText}>CONFIRMED</Text>
            </View>
          </View>
        </View>

        {/* Tour Title */}
        <View style={styles.section}>
          <Text style={styles.tourTitle}>{booking.tour.title}</Text>
          <Text style={styles.tourSubtitle}>
            {booking.tour.durationDays} Days / {booking.tour.durationNights} Nights in{" "}
            {booking.tour.destination}
          </Text>

          {/* Trip Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Travel Dates</Text>
              <Text style={styles.infoValue}>
                {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Travelers</Text>
              <Text style={styles.infoValue}>
                {booking.adults} Adult{booking.adults > 1 ? "s" : ""}
                {booking.children > 0 &&
                  `, ${booking.children} Child${booking.children > 1 ? "ren" : ""}`}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Lead Traveler</Text>
              <Text style={styles.infoValue}>{booking.contactName}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tour Operator</Text>
              <Text style={styles.infoValue}>{booking.agent.businessName}</Text>
            </View>
          </View>
        </View>

        {/* Itinerary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Itinerary</Text>
          {itinerary.map((day) => (
            <View key={day.dayNumber} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayNumber}>{day.dayNumber}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dayTitle}>{day.title}</Text>
                  {day.location && (
                    <Text style={styles.dayLocation}>{day.location}</Text>
                  )}
                </View>
              </View>
              <Text style={styles.dayDescription}>{day.description}</Text>
              <View style={styles.dayDetails}>
                {day.meals.length > 0 && (
                  <View style={styles.dayDetailItem}>
                    <Text style={styles.dayDetailLabel}>Meals:</Text>
                    <Text style={styles.dayDetailValue}>{day.meals.join(", ")}</Text>
                  </View>
                )}
              </View>
              {accommodationByDay[day.dayNumber] && (
                <View style={styles.accommodationBox}>
                  <Text style={styles.accommodationLabel}>Overnight Stay</Text>
                  <Text style={styles.accommodationName}>
                    {accommodationByDay[day.dayNumber].name}
                  </Text>
                  <Text style={styles.accommodationTier}>
                    {accommodationByDay[day.dayNumber].tier}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Add-ons */}
        {booking.activities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Included Add-ons</Text>
            <View style={styles.addonsContainer}>
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
          <Text style={styles.sectionTitle}>Price Summary</Text>
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
              <Text style={styles.priceLabel}>Add-ons</Text>
              <Text style={styles.priceValue}>
                ${pricing.addonsTotal.toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Fee</Text>
            <Text style={styles.priceValue}>${pricing.serviceFee.toLocaleString()}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>${pricing.total.toLocaleString()}</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <View style={styles.contactColumn}>
            <Text style={styles.contactTitle}>Your Contact Details</Text>
            <Text style={styles.contactText}>{booking.contactName}</Text>
            <Text style={styles.contactText}>{booking.contactEmail}</Text>
            <Text style={styles.contactText}>{booking.contactPhone}</Text>
          </View>
          <View style={styles.contactColumn}>
            <Text style={styles.contactTitle}>Tour Operator</Text>
            <Text style={styles.contactText}>{booking.agent.businessName}</Text>
            {booking.agent.businessEmail && (
              <Text style={styles.contactText}>{booking.agent.businessEmail}</Text>
            )}
            {booking.agent.businessPhone && (
              <Text style={styles.contactText}>{booking.agent.businessPhone}</Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for booking with SafariPlus!
          </Text>
          <Text style={styles.footerText}>
            For questions or changes, contact us at support@safariplus.com
          </Text>
          <Text style={styles.footerText}>
            Free cancellation up to 30 days before your trip
          </Text>
        </View>
      </Page>
    </Document>
  )
}
