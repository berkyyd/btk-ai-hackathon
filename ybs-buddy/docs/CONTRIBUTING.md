# Contributing to YBS Buddy

Thank you for your interest in contributing to YBS Buddy! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+
- Git

### Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/ybs-buddy.git
   cd ybs-buddy
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```
5. Configure your environment variables in `.env.local`
6. Start development server:
   ```bash
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style
- Follow the existing code style and formatting
- Use Prettier for code formatting: `npm run format`
- Use ESLint for code quality: `npm run lint`
- Follow TypeScript best practices

### Clean Code Principles
1. **DRY (Don't Repeat Yourself)** - Avoid code duplication
2. **KISS (Keep It Simple, Stupid)** - Write simple, readable code
3. **SOLID Principles** - Focus on Single Responsibility Principle
4. **YAGNI (You Aren't Gonna Need It)** - Don't add features you don't need
5. **Meaningful Naming** - Use descriptive variable and function names
6. **Constants Over Magic Numbers** - Use constants from `src/constants.ts`
7. **Error Handling** - Implement proper error handling
8. **Modularity** - Keep functions and components small and focused

### File Structure
```
src/
├── app/           # Next.js App Router pages
├── components/    # Reusable React components
├── contexts/      # React contexts
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── constants.ts   # Application constants
```

### Naming Conventions
- **Files**: kebab-case (e.g., `file-upload.tsx`)
- **Components**: PascalCase (e.g., `FileUpload`)
- **Functions**: camelCase (e.g., `handleFileUpload`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (e.g., `FileUploadProps`)

## 🔧 Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Write clean, readable code
- Add appropriate comments
- Follow the existing patterns
- Use constants instead of magic numbers
- Implement proper error handling

### 3. Test Your Changes
```bash
npm run type-check  # TypeScript type checking
npm run lint        # ESLint checking
npm run format      # Prettier formatting
npm run dev         # Development server
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add new feature description"
```

### 5. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

## 📝 Commit Message Format

Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(quiz): add timer functionality
fix(auth): resolve login validation issue
docs(readme): update setup instructions
```

## 🧪 Testing

### Manual Testing
- Test all user flows
- Test error scenarios
- Test responsive design
- Test with different browsers

### Code Quality
- Ensure TypeScript compilation passes
- Fix all ESLint warnings
- Follow Prettier formatting
- Remove console.log statements (except for debugging)

## 🐛 Bug Reports

When reporting bugs, please include:
1. **Description** - Clear description of the bug
2. **Steps to Reproduce** - Detailed steps to reproduce
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Environment** - Browser, OS, device info
6. **Screenshots** - If applicable

## 💡 Feature Requests

When suggesting features:
1. **Description** - Clear description of the feature
2. **Use Case** - Why this feature is needed
3. **Implementation Ideas** - How it could be implemented
4. **Mockups** - If applicable

## 📚 Documentation

- Update README.md if needed
- Add JSDoc comments for new functions
- Update API documentation
- Update environment variable documentation

## 🔒 Security

- Never commit sensitive information (API keys, passwords)
- Use environment variables for configuration
- Follow security best practices
- Report security issues privately

## 🤝 Code Review

### Review Checklist
- [ ] Code follows project guidelines
- [ ] No magic numbers (use constants)
- [ ] Proper error handling
- [ ] TypeScript types are correct
- [ ] No console.log statements
- [ ] Code is readable and well-documented
- [ ] Tests pass (if applicable)
- [ ] No breaking changes (unless documented)

### Review Process
1. Create pull request with clear description
2. Request review from team members
3. Address review comments
4. Merge after approval

## 📞 Getting Help

- Check existing documentation
- Search existing issues
- Ask questions in discussions
- Contact maintainers if needed

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to YBS Buddy! 🚀 