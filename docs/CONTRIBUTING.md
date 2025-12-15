# Contributing to Vibe Trading

Thank you for your interest in contributing to Vibe Trading! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/vibe-trading.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit your changes: `git commit -m "Add your meaningful commit message"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

See [README.md](README.md) for detailed setup instructions.

## Code Style

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing code style
- Use ESLint and Prettier for code formatting
- Use meaningful variable and function names
- Add comments for complex logic

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use proper TypeScript types
- Follow shadcn/ui component patterns

### Backend (Lambda Functions)

- Keep functions focused on single responsibility
- Add proper error handling
- Use async/await for asynchronous operations
- Log important events for debugging

## Commit Messages

Follow conventional commit format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
- `feat: add real-time stock price updates`
- `fix: resolve CORS issue in API Gateway`
- `docs: update deployment guide`

## Testing

- Write tests for new features
- Ensure existing tests pass
- Test both happy path and error cases
- Test on multiple browsers for frontend changes

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md if applicable
5. Request review from maintainers
6. Address review feedback

## What to Contribute

### High Priority

- Real Vietnam stock market API integrations
- WebSocket support for real-time updates
- Enhanced technical analysis algorithms
- Additional AI model support
- Mobile responsive improvements
- Performance optimizations

### Medium Priority

- Additional chart types
- Portfolio tracking features
- Backtesting capabilities
- Email/SMS notifications
- Dark mode enhancements
- Localization (Vietnamese language)

### Low Priority

- UI/UX improvements
- Documentation improvements
- Code refactoring
- Additional examples

## Bug Reports

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (browser, OS, etc.)

## Feature Requests

When requesting features:

- Clearly describe the feature
- Explain the use case
- Provide examples if possible
- Consider implementation complexity

## Code Review

All submissions require review. We use GitHub pull requests for this purpose.

## Community

- Be respectful and constructive
- Help others when you can
- Follow the code of conduct
- Ask questions if unclear

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Open an issue or reach out to the maintainers.

Thank you for contributing! 🚀
