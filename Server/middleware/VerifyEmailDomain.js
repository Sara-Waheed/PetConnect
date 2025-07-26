import dns from 'dns';

const verifyEmailDomain = (req, res, next) => {
  const { email } = req.body;
  console.log("email in verify email domain middleware", email);

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  // Extract the domain from the email
  const domain = email.split('@')[1];

  if (!domain) {
    return res.status(400).json({ success: false, message: "Invalid email format: No domain found" });
  }

  // Lookup MX (Mail Exchange) records for the domain
  dns.resolveMx(domain, (err, addresses) => {
    if (err) {
      return res.status(400).json({ success: false, message: "Invalid email domain or domain doesn't exist" });
    }

    if (!addresses || addresses.length === 0) {
      return res.status(400).json({ success: false, message: "Domain exists but has no email servers (MX records)" });
    }

    // Domain is valid and has MX records
    next();
  });
};

export default verifyEmailDomain;
