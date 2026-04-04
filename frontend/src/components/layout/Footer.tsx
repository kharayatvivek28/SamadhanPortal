import FadeInView from "@/components/motion/FadeInView";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
  <footer className="bg-primary text-primary-foreground mt-auto">
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Animation: Each footer column fades in from below with staggered delay */}
        <FadeInView delay={0}>
          <div className="flex items-center gap-2 font-bold text-lg mb-3">
            <img src="/logo.png" alt="Samadhan" className="h-12 w-auto" />
            Samadhan Portal
          </div>
          <p className="text-sm text-hero-muted">{t("footer.tagline")}</p>
        </FadeInView>
        <FadeInView delay={0.1}>
          <h4 className="font-semibold mb-3">{t("footer.quickLinks")}</h4>
          <ul className="space-y-1 text-sm text-hero-muted">
            <li><a href="/" className="hover:text-primary-foreground transition-colors">{t("footer.home")}</a></li>
            <li><a href="/login" className="hover:text-primary-foreground transition-colors">{t("footer.login")}</a></li>
            <li><a href="/signup" className="hover:text-primary-foreground transition-colors">{t("footer.register")}</a></li>
          </ul>
        </FadeInView>
        <FadeInView delay={0.2}>
          <h4 className="font-semibold mb-3">{t("footer.contact")}</h4>
          <ul className="space-y-1 text-sm text-hero-muted">
            <li>{t("footer.tollFree")}</li>
            <li>{t("footer.email")}</li>
            <li>{t("footer.hours")}</li>
          </ul>
        </FadeInView>
        <FadeInView delay={0.3}>
          <h4 className="font-semibold mb-3">{t("footer.legal")}</h4>
          <ul className="space-y-1 text-sm text-hero-muted">
            <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.terms")}</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.privacy")}</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.accessibility")}</a></li>
          </ul>
        </FadeInView>
      </div>
      {/* Animation: Bottom bar fades in last */}
      <FadeInView delay={0.4}>
        <div className="border-t border-sidebar-border mt-8 pt-6 text-center text-sm text-hero-muted">
          {t("footer.copyright")}
        </div>
      </FadeInView>
    </div>
  </footer>
  );
};

export default Footer;
