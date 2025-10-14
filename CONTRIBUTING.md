# Contributing to SnifferX

First off, thank you for considering contributing to SnifferX! It's people like you that make SnifferX such a great tool.

## 🌟 Ways to Contribute

- 🐛 **Report Bugs** - Help us identify issues
- 💡 **Suggest Features** - Share your ideas
- 📝 **Improve Documentation** - Help others understand
- 🧪 **Add Tests** - Increase code reliability
- 🔧 **Fix Issues** - Submit pull requests
- 🎨 **Improve UI/UX** - Enhance user experience

## 📋 Getting Started

### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/SnifferX.git
cd SnifferX
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

## 🔨 Development Setup

### Install Dependencies

```bash
npm install
```

### Run in Development Mode

```bash
sudo node snifferx.js monitor -i <interface-id>
```

### Run Tests

```bash
npm test
```

## 📝 Coding Standards

### JavaScript Style Guide

- Use **ES6+** features where appropriate
- Follow **camelCase** for variable and function names
- Use **PascalCase** for class names
- Add **JSDoc comments** for functions
- Keep functions **small and focused**

### Example

```javascript
/**
 * Calculate packets per second for an IP address
 * @param {string} ipAddress - The IP address to analyze
 * @param {number} timeWindow - Time window in milliseconds
 * @returns {number} Packets per second
 */
function calculatePacketRate(ipAddress, timeWindow) {
    const packets = this.packetsByIP.get(ipAddress) || 0;
    return packets / (timeWindow / 1000);
}
```

## 🐛 Reporting Bugs

### Before Submitting

1. Check the [existing issues](https://github.com/Vyomkhurana/SnifferX/issues)
2. Ensure you're using the latest version
3. Test on a clean installation if possible

### Bug Report Template

```markdown
**Describe the Bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Run command '...'
2. See error '...'

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Ubuntu 22.04]
- Node.js Version: [e.g. 18.0.0]
- SnifferX Version: [e.g. 1.0.0]

**Additional Context**
Any other relevant information.
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature.

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've considered.

**Additional Context**
Mockups, examples, or references.
```

## 🔀 Pull Request Process

### 1. Update Your Branch

```bash
git checkout main
git pull origin main
git checkout feature/your-feature-name
git rebase main
```

### 2. Make Your Changes

- Write **clear commit messages**
- Add **tests** for new features
- Update **documentation** as needed
- Ensure **code passes linting**

### 3. Test Your Changes

```bash
# Run tests
npm test

# Test manually
sudo node snifferx.js monitor -i <interface-id>
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "Add feature: description of feature"
```

**Commit Message Format:**
```
Type: Short description

Longer description if needed.

Fixes #issue_number
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to the original repository
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template
5. Submit!

### Pull Request Template

```markdown
**Description**
What does this PR do?

**Related Issue**
Fixes #issue_number

**Changes Made**
- Change 1
- Change 2

**Testing Done**
How was this tested?

**Screenshots**
If applicable.

**Checklist**
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No new warnings generated
```

## 🧪 Testing Guidelines

### Unit Tests

Place tests in `tests/` directory:

```javascript
// tests/packet.test.js
const Packet = require('../src/models/Packet');

describe('Packet Model', () => {
    test('should create packet with valid data', () => {
        const packet = new Packet({
            srcIP: '192.168.1.1',
            dstIP: '192.168.1.2'
        });
        expect(packet.srcIP).toBe('192.168.1.1');
    });
});
```

### Integration Tests

Test complete workflows:

```javascript
// tests/detection.test.js
describe('DDoS Detection', () => {
    test('should detect high traffic rate', () => {
        // Test implementation
    });
});
```

## 📚 Documentation

### Updating Documentation

- Update **README.md** for user-facing changes
- Update **inline comments** for code changes
- Add examples in **docs/** folder
- Update **CHANGELOG.md** with changes

### Documentation Style

- Use **clear, simple language**
- Provide **code examples**
- Include **screenshots** where helpful
- Keep it **up to date**

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested

## 💬 Community

### Code of Conduct

- Be **respectful** and **inclusive**
- Use **welcoming** language
- Accept **constructive criticism**
- Focus on what's **best for the community**

### Communication Channels

- 💬 [GitHub Discussions](https://github.com/Vyomkhurana/SnifferX/discussions)
- 🐛 [Issue Tracker](https://github.com/Vyomkhurana/SnifferX/issues)
- 📧 Email: [your-email@example.com]

## 🎉 Recognition

Contributors will be:
- Listed in **README.md** acknowledgments
- Mentioned in **release notes**
- Given **contributor badge** on GitHub

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Your contributions make SnifferX better for everyone. We appreciate your time and effort!

---

**Questions?** Feel free to ask in [Discussions](https://github.com/Vyomkhurana/SnifferX/discussions)!
