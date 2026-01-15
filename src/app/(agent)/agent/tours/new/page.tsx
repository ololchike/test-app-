"use client"

import { SectionError } from "@/components/error"
import { TourWizard } from "@/components/agent/tour-wizard"

export default function CreateTourPage() {
  return (
    <SectionError name="Tour Wizard">
      <TourWizard />
    </SectionError>
  )
}
