import { useTranslation } from "react-i18next";
import ComplaintForm from "@/components/complaint/ComplaintForm";
// Animation: Added PageTransition for page entrance animation
import PageTransition from "@/components/motion/PageTransition";

const FileComplaint = () => {
  const { t } = useTranslation();

  return (
    // Animation: Page entrance fade + slide
    <PageTransition>
      <h1 className="text-2xl font-bold text-foreground mb-1">{t("complaint.fileTitle")}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t("complaint.fileSubtitle")}</p>
      <ComplaintForm />
    </PageTransition>
  );
};

export default FileComplaint;
