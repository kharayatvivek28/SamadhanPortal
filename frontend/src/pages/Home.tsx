import { Link } from "react-router-dom";
import { FileText, Search, CheckCircle2, Users, Clock, Building2, ArrowRight, Eye, Lock, BarChart3, UserCheck } from "lucide-react";
import { stats } from "@/data/mockData";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const steps = [
  { icon: FileText, label: "Complaint Submitted", desc: "Citizen files complaint via portal" },
  { icon: Building2, label: "Assigned to Department", desc: "Routed to relevant department" },
  { icon: UserCheck, label: "Assigned to Officer", desc: "Department head assigns officer" },
  { icon: Clock, label: "In Progress", desc: "Officer investigates and acts" },
  { icon: CheckCircle2, label: "Resolved", desc: "Issue resolved, citizen notified" },
];

const features = [
  { icon: Lock, title: "Secure Login", desc: "Role-based secure authentication for citizens, officers, and admins." },
  { icon: Users, title: "Role-Based Dashboards", desc: "Customized dashboards for citizens, employees, and administrators." },
  { icon: Eye, title: "Real-time Tracking", desc: "Track your complaint status at every stage of the process." },
  { icon: UserCheck, title: "Officer Accountability", desc: "Every action is logged with officer name and timestamp." },
  { icon: Clock, title: "Complaint Timeline", desc: "Visual timeline showing complete lifecycle of every complaint." },
  { icon: BarChart3, title: "Analytics & Reports", desc: "Comprehensive stats on complaint resolution and performance." },
];

const Home = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />

    {/* Hero */}
    <section className="bg-hero text-hero-foreground py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Samadhan Portal" className="h-20 w-20" />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Samadhan Portal</h1>
        <p className="text-lg md:text-xl text-hero-muted mb-8 max-w-2xl mx-auto">
          Transparent. Accountable. Efficient.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/login" className="bg-primary-foreground text-primary px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity">
            File a Complaint
          </Link>
          <Link to="/login" className="border border-hero-muted text-hero-foreground px-6 py-3 rounded-md font-medium hover:bg-hero-foreground/10 transition-colors">
            Track Complaint
          </Link>
          <Link to="/login" className="text-hero-muted px-6 py-3 rounded-md font-medium hover:text-hero-foreground transition-colors flex items-center gap-1">
            Login <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>

    {/* Objective */}
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Our Objective</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Samadhan Portal is a government initiative designed to provide citizens with a transparent,
          accountable, and efficient mechanism for filing, tracking, and resolving complaints. Every step of the
          complaint lifecycle is visible to the citizen, ensuring complete transparency.
        </p>
      </div>
    </section>

    {/* Problem We Solve */}
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Problems We Solve</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { title: "Lack of Transparency", desc: "Citizens often don't know what happens after filing a complaint. Our portal makes every step visible." },
            { title: "No Accountability", desc: "Without tracking, officers face no accountability. Our system logs every action with timestamps." },
            { title: "No Tracking Visibility", desc: "Traditional systems lack real-time tracking. Our portal provides live status updates at every stage." },
          ].map((p) => (
            <div key={p.title} className="bg-card rounded-lg border shadow-sm p-6 text-center">
              <h3 className="font-semibold text-card-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">How It Works</h2>
        <div className="flex flex-col md:flex-row items-start justify-center gap-4 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.label} className="flex flex-col items-center text-center flex-1 min-w-[120px]">
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
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f) => (
            <div key={f.title} className="bg-card rounded-lg border shadow-sm p-6">
              <div className="bg-primary/10 rounded-lg p-2.5 w-fit mb-3">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Transparency Stats */}
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Transparency Dashboard</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: "Total Complaints", value: stats.totalComplaints },
            { label: "Resolved", value: stats.resolved },
            { label: "Pending", value: stats.pending },
            { label: "Active Departments", value: stats.activeDepartments },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-lg border shadow-sm p-6 text-center">
              <p className="text-3xl font-bold text-primary">{s.value.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Home;
