import { FAQAccordion } from "@/components/FAQAccordion";
import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function FaqPage() {
  return (
    <>
      <StaticInfoPage titleKey="faqPageTitle" bodyKey="faqPageBody" />
      <FAQAccordion />
    </>
  );
}
