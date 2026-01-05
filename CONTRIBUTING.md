# Contributing to Scalable E-Commerce Backend

Thank you for considering contributing to this project! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive criticism
- Respect differing opinions and experiences

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear, descriptive title
- Steps to reproduce the bug
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, Docker version, etc.)

### Suggesting Enhancements

For feature requests or enhancements:
- Check if the feature already exists
- Clearly describe the enhancement
- Explain why it would be useful
- Provide examples or mockups if possible

### Pull Requests

1. **Fork the Repository**
   ```bash
   git clone https://github.com/subashsa1014/scalable-ecommerce-backend.git
   cd scalable-ecommerce-backend
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow the coding standards (see below)
   - Add tests if applicable
   - Update documentation

4. **Test Your Changes**
   ```bash
   # Test locally
   docker compose up -d
   
   # Run tests (if applicable)
   npm test
   
   # Check linting
   npm run lint
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   
   Follow conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes
   - `refactor:` - Code refactoring
   - `test:` - Test additions/changes
   - `chore:` - Maintenance tasks

6. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   
   Then create a Pull Request on GitHub with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots (if UI changes)

## Coding Standards

### JavaScript/Node.js

- Use ES6+ features
- Follow consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Handle errors properly
- Use async/await over callbacks

### File Structure

```
service-name/
├── src/
│   ├── index.js          # Main entry point
│   ├── routes/           # Route definitions
│   ├── controllers/      # Business logic
│   ├── models/           # Database models
│   ├── middleware/       # Custom middleware
│   └── utils/            # Utility functions
├── tests/                # Test files
├── Dockerfile            # Docker configuration
└── package.json          # Dependencies
```

### API Design

- Use RESTful conventions
- Use plural nouns for endpoints (`/products`, not `/product`)
- Use HTTP methods correctly (GET, POST, PUT, DELETE, PATCH)
- Return appropriate status codes
- Include pagination for list endpoints
- Provide clear error messages

### Error Handling

```javascript
// Always use try-catch with async/await
try {
  const result = await someAsyncOperation();
  res.json(result);
} catch (error) {
  next(error);
}

// Use AppError for operational errors
throw new AppError('User not found', 404);
```

### Security

- Never commit sensitive data
- Use environment variables
- Validate all inputs
- Sanitize user data
- Use parameterized queries
- Keep dependencies updated
- Follow OWASP guidelines

## Testing

- Write unit tests for business logic
- Write integration tests for APIs
- Aim for high code coverage (>80%)
- Test error cases
- Test edge cases

```javascript
// Example test structure
describe('User Service', () => {
  describe('POST /register', () => {
    it('should register a new user', async () => {
      // Test code
    });
    
    it('should return error for duplicate email', async () => {
      // Test code
    });
  });
});
```

## Documentation

- Update README.md if needed
- Update API_DOCUMENTATION.md for API changes
- Add JSDoc comments for functions
- Update DEPLOYMENT_GUIDE.md for deployment changes
- Include examples in documentation

## Development Workflow

1. **Set Up Development Environment**
   ```bash
   # Clone and install
   git clone https://github.com/subashsa1014/scalable-ecommerce-backend.git
   cd scalable-ecommerce-backend
   
   # Start services
   docker compose up -d
   
   # For service-specific development
   cd services/user-service
   npm install
   npm run dev
   ```

2. **Make Changes**
   - Work on one feature/fix at a time
   - Keep commits atomic and focused
   - Test changes locally

3. **Before Submitting**
   - Run linter: `npm run lint`
   - Run tests: `npm test`
   - Test with Docker: `docker compose up --build`
   - Update documentation
   - Check for console warnings/errors

## Service-Specific Guidelines

### API Gateway
- Keep routing logic simple
- Add new service routes in the main index.js
- Test proxy forwarding

### Microservices
- Keep services independent
- Use shared utilities from `/shared` folder
- Document environment variables
- Add health check endpoint

### Database Models
- Define clear schemas
- Add validation
- Index frequently queried fields
- Document field purposes

## Review Process

All PRs will be reviewed for:
- Code quality and standards
- Test coverage
- Documentation completeness
- Security concerns
- Performance implications
- Breaking changes

## Questions?

- Open an issue for questions
- Start a discussion for larger topics
- Email: subashsa1014@gmail.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
