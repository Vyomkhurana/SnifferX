# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do Not** Publicly Disclose

Please do not create a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Email security reports to: **[your-email@example.com]**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Status Updates**: Every 7 days until resolved
- **Resolution**: Typically within 30 days

### 4. Responsible Disclosure

- Allow reasonable time for fix before public disclosure
- Credit will be given for responsible disclosure
- Security advisories will be published after fixes

## Security Best Practices

### For Users

- ✅ Keep SnifferX updated to latest version
- ✅ Run with minimum required privileges
- ✅ Review configuration settings carefully
- ✅ Only monitor networks you have authorization for
- ✅ Secure log files containing captured data
- ✅ Use strong access controls on deployment systems

### For Contributors

- ✅ Validate all user inputs
- ✅ Sanitize data before logging
- ✅ Use secure dependencies (no known vulnerabilities)
- ✅ Follow principle of least privilege
- ✅ Avoid storing sensitive data unnecessarily
- ✅ Use secure communication protocols

## Known Security Considerations

### Packet Capture Privileges

SnifferX requires elevated privileges (root/administrator) for packet capture. This is inherent to network monitoring tools and uses the system's tshark utility.

**Mitigation**: 
- Run only when needed
- Use dedicated monitoring accounts
- Review captured data access controls

### Data Sensitivity

Network traffic may contain sensitive information.

**Mitigation**:
- Secure log storage
- Implement data retention policies
- Comply with applicable privacy regulations

### Dependency Security

We regularly audit dependencies for known vulnerabilities.

**Check yourself**:
```bash
npm audit
npm audit fix
```

## Security Updates

Security patches are released as soon as possible after discovery. Monitor:

- GitHub Security Advisories
- Release notes (CHANGELOG.md)
- Email notifications (if subscribed)

## Compliance

### Legal Use Only

SnifferX is for:
- ✅ Authorized network monitoring
- ✅ Security testing on your own networks
- ✅ Educational purposes
- ✅ Research with proper authorization

**NOT for**:
- ❌ Unauthorized network monitoring
- ❌ Attacking third-party systems
- ❌ Any illegal activities

### Privacy Considerations

When using SnifferX:
- Comply with local privacy laws
- Obtain proper authorization
- Inform users if monitoring their traffic (where required)
- Implement appropriate data handling procedures

## Contact

For security concerns:
- 📧 Email: [your-email@example.com]
- 🔒 PGP Key: [Link if available]

---

**Thank you for helping keep SnifferX and its users safe!**
