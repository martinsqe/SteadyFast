import "./footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">

        {/* BRAND */}
        <div className="footer-col">
          <h2 className="footer-logo">SteadyFast</h2>
          <p>
            24/7 Online Roadside Assistance.  
            Fast, Reliable & Always There When You Need Us.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li>Home</li>
            <li>Dashboard</li>
            <li>Emergency</li>
            <li>Chat Support</li>
            <li>Login</li>
          </ul>
        </div>

        {/* SERVICES */}
        <div className="footer-col">
          <h3>Our Services</h3>
          <ul>
            <li>Flat Tyre Assistance</li>
            <li>Battery Jumpstart</li>
            <li>Fuel Delivery</li>
            <li>Engine Diagnostics</li>
            <li>Towing Service</li>
            <li>All Bike Services</li>
            <li>Break fixing</li>
            <li>Clutch replacement</li>
            <li>Engine oiling</li>
            <li>Wheel alignment</li>
            <li>Greecing</li>
            <li>Transportaion to work</li>
        
          </ul>
        </div>

        {/* CONTACT */}
        <div className="footer-col">
          <h3>Contact</h3>
          <p>📍 SteadyFast Global Support Network</p>
          <p>📞 +91 8735833199</p>
          <p>✉ mjjemba414@rku.ac.in</p>

          <div className="social-icons">
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="WhatsApp"><i className="fab fa-whatsapp"></i></a>
            <a href="#" aria-label="X"><i className="fab fa-x-twitter"></i></a>
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
            <a href="tel:+1800STEADYFAST" aria-label="Call"><i className="fas fa-phone"></i></a>
</div>

        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} SteadyFast. All rights reserved.</p>
        <p>Privacy Policy • Terms of Service</p>
      </div>
    </footer>
  );
}

export default Footer;
