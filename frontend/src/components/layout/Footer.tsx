

const Footer = () => (
  <footer className="bg-primary text-primary-foreground mt-auto">
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-lg mb-3">
            <img src="/logo.png" alt="Samadhan" className="h-6 w-6" />
            Samadhan Portal
          </div>
          <p className="text-sm text-hero-muted">Transparent. Accountable. Efficient. A government initiative for citizen complaint redressal.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-1 text-sm text-hero-muted">
            <li><a href="/" className="hover:text-primary-foreground transition-colors">Home</a></li>
            <li><a href="/login" className="hover:text-primary-foreground transition-colors">Login</a></li>
            <li><a href="/signup" className="hover:text-primary-foreground transition-colors">Register</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <ul className="space-y-1 text-sm text-hero-muted">
            <li>Toll Free: 1800-XXX-XXXX</li>
            <li>Email: support@crp.gov.in</li>
            <li>Mon-Sat, 9AM - 6PM</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Legal</h4>
          <ul className="space-y-1 text-sm text-hero-muted">
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Accessibility</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sidebar-border mt-8 pt-6 text-center text-sm text-hero-muted">
        © 2026 Samadhan Portal. Government of India. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
