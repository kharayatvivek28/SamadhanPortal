import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileText, Search, CheckCircle2, Users, Clock, Building2, ArrowRight, Eye, Lock, BarChart3, UserCheck } from "lucide-react";
import { stats } from "@/data/mockData";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeedbackSlider from "@/components/layout/FeedbackSlider";
// Animation: Added useScroll + useTransform for hero parallax effect
import { motion, Variants, TargetAndTransition, useScroll, useTransform } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

const stepsIcons = [FileText, Building2, UserCheck, Clock, CheckCircle2];

const featureIcons = [Lock, Users, Eye, UserCheck, Clock, BarChart3];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const child: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const floatAnimation: TargetAndTransition = {
  y: [0, -8, 0],
  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
};

// Animation: StatCounter with scale entrance + CountUp
const StatCounter = ({ label, value }: { label: string; value: number }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  return (
    <motion.div
      ref={ref}
      className="bg-card rounded-lg border shadow-sm p-6 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <p className="text-3xl font-bold text-primary">
        {inView ? <CountUp end={value} duration={2} separator="," /> : "0"}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
};

const Home = () => {
  const { t } = useTranslation();
  // Animation: Parallax scroll transforms for hero depth effect
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 80]);
  const logoY = useTransform(scrollY, [0, 400], [0, -30]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  // State for realtime dashboard statistics
  const [dashboardStats, setDashboardStats] = useState({
    totalComplaints: 0,
    resolved: 0,
    pending: 0,
    activeDepartments: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiFetch("/api/complaints/public/stats");
        if (response.ok) {
          const data = await response.json();
          setDashboardStats(data);
        } else {
          console.error("Failed to fetch public stats");
          // Fallback to mock data if API call fails
          setDashboardStats(stats);
        }
      } catch (error) {
        console.error("Error fetching public stats:", error);
        // Fallback to mock data if network request fails
        setDashboardStats(stats);
      }
    };

    fetchStats();
  }, []);

  // Build translated data arrays
  const steps = [
    { icon: stepsIcons[0], label: t("home.steps.submitted"), desc: t("home.steps.submittedDesc") },
    { icon: stepsIcons[1], label: t("home.steps.assigned"), desc: t("home.steps.assignedDesc") },
    { icon: stepsIcons[2], label: t("home.steps.officer"), desc: t("home.steps.officerDesc") },
    { icon: stepsIcons[3], label: t("home.steps.progress"), desc: t("home.steps.progressDesc") },
    { icon: stepsIcons[4], label: t("home.steps.resolved"), desc: t("home.steps.resolvedDesc") },
  ];

  const features = [
    { icon: featureIcons[0], title: t("home.featuresList.secureLogin"), desc: t("home.featuresList.secureLoginDesc") },
    { icon: featureIcons[1], title: t("home.featuresList.dashboards"), desc: t("home.featuresList.dashboardsDesc") },
    { icon: featureIcons[2], title: t("home.featuresList.realtime"), desc: t("home.featuresList.realtimeDesc") },
    { icon: featureIcons[3], title: t("home.featuresList.accountability"), desc: t("home.featuresList.accountabilityDesc") },
    { icon: featureIcons[4], title: t("home.featuresList.timeline"), desc: t("home.featuresList.timelineDesc") },
    { icon: featureIcons[5], title: t("home.featuresList.analytics"), desc: t("home.featuresList.analyticsDesc") },
  ];

  const problems = [
    { title: t("home.problems.transparency"), desc: t("home.problems.transparencyDesc") },
    { title: t("home.problems.accountability"), desc: t("home.problems.accountabilityDesc") },
    { title: t("home.problems.tracking"), desc: t("home.problems.trackingDesc") },
  ];

  return (
  <div className="min-h-screen flex flex-col">
    <Navbar />

    {/* Hero — Animation: Parallax scroll effect on logo and text */}
    <section className="bg-hero text-hero-foreground py-20 md:py-28 overflow-hidden relative">
      <motion.div className="container mx-auto px-4 text-center" style={{ y: heroY, opacity: heroOpacity }}>
        <motion.div
          className="flex justify-center mb-6"
          animate={floatAnimation}
          style={{ y: logoY }}
        >
          <img src="/logo.png" alt="Samadhan Portal" className="h-32 w-auto" />
        </motion.div>
        <motion.h1
          className="text-3xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {t("home.title")}
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-hero-muted mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        >
          {t("home.subtitle")}
        </motion.p>
        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          {/* Animation: Button tap scale effects */}
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link to="/login" className="bg-primary-foreground text-primary px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity inline-block">
              {t("home.fileComplaint")}
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link to="/login" className="border border-hero-muted text-hero-foreground px-6 py-3 rounded-md font-medium hover:bg-hero-foreground/10 transition-colors inline-block">
              {t("home.trackComplaint")}
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link to="/login" className="text-hero-muted px-6 py-3 rounded-md font-medium hover:text-hero-foreground transition-colors flex items-center gap-1">
              {t("nav.login")} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>

    {/* Objective */}
    <section className="py-16 bg-background">
      <motion.div
        className="container mx-auto px-4 text-center max-w-3xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
      >
        <motion.h2 variants={child} className="text-2xl md:text-3xl font-bold text-foreground mb-4">{t("home.objective")}</motion.h2>
        <motion.p variants={child} className="text-muted-foreground leading-relaxed">
          {t("home.objectiveDesc")}
        </motion.p>
      </motion.div>
    </section>

    {/* Problem We Solve */}
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {t("home.problemsTitle")}
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          {problems.map((p) => (
            <motion.div key={p.title} variants={child} className="bg-card rounded-lg border shadow-sm p-6 text-center hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-card-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* How It Works */}
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {t("home.howItWorks")}
        </motion.h2>
        <div className="flex flex-col md:flex-row items-start justify-center gap-4 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              className="flex flex-col items-center text-center flex-1 min-w-[120px]"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
            >
              <div className="bg-primary/10 rounded-full p-4 mb-3">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center text-xs font-bold mb-2">
                {i + 1}
              </div>
              <h3 className="font-semibold text-sm text-foreground">{step.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="h-5 w-5 text-muted-foreground mt-3 hidden md:block rotate-0 md:rotate-0" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {t("home.features")}
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={child}
              className="bg-card rounded-lg border shadow-sm p-6 hover:shadow-md transition-shadow"
              whileHover={{ y: -4 }}
            >
              <div className="bg-primary/10 rounded-lg p-2.5 w-fit mb-3">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* Our Works / Success Stories */}
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.5 }}
           className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {t("home.feedback")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("home.feedbackDesc")}
          </p>
        </motion.div>
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
        >
           <FeedbackSlider />
        </motion.div>
      </div>
    </section>

    {/* Transparency Stats */}
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {t("home.transparencyDashboard")}
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <StatCounter label={t("home.totalComplaints")} value={dashboardStats.totalComplaints} />
          <StatCounter label={t("home.resolved")} value={dashboardStats.resolved} />
          <StatCounter label={t("home.pending")} value={dashboardStats.pending} />
          <StatCounter label={t("home.activeDepartments")} value={dashboardStats.activeDepartments} />
        </div>
      </div>
    </section>

    <Footer />
  </div>
  );
};

export default Home;
