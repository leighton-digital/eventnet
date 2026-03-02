# Contributing

Thank you for considering contributing to LLM Test Tools! We welcome contributions from the community to help improve this project. Here are some guidelines to help you get started:

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## Getting Started

1. Install Node.js (v22.15.1 recommended)
2. Clone the repository
3. Install dependencies: `pnpm install`
4. Run tests: `pnpm test`

## Local Development

To test changes to this package locally in another project:

1. Build the package which will create a `dist` folder:
   ```bash
   pnpm run build
   ```

2. Create a symbolic link:
   ```bash
   pnpm link
   ```

3. In your test project:
   ```bash
   pnpm link @leighton-digital/eventnet
   ```

4. To remove the link:
   ```bash
   pnpm unlink @leighton-digital/eventnet
   ```


## How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit`) which will use Commitizen in interactive mode
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Style

- Follow TypeScript best practices
- Use Biome for linting and formatting
- Write clear commit messages
- Add tests for new features
- Update documentation

## Testing Guidelines

We use Jest for testing. Please ensure:

1. All existing tests pass
2. New features have appropriate tests
3. Factual checking is properly implemented
4. Tone detection works correctly
5. Confidence scores follow the established ranges

## Pull Request Process

1. Ensure all tests pass: `pnpm test`
2. Update the documentation if needed
3. Add a clear description of your changes
4. Reference any related issues
5. Wait for review
6. Be prepared to make requested changes

## Code of Conduct

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) in all interactions.

## Questions?

If you have any questions about contributing, feel free to open an issue or contact the maintainers.

---

<img src="https://raw.githubusercontent.com/leighton-digital/eventnet/refs/heads/main/images/leighton-logo.svg" width="200" sanitize="true" />
