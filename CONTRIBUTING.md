# Contributing to ScanStock

First off, thank you for considering contributing to ScanStock! It's people like you that make ScanStock such a great tool for small businesses.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples** to demonstrate the steps
* **Describe the behavior you observed** and what you expected
* **Include screenshots** if possible
* **Specify your environment**: OS, device, app version

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description** of the proposed functionality
* **Explain why this enhancement would be useful**
* **List some examples** of how it would be used

### Pull Requests

* Fill in the required template
* Follow the TypeScript styleguide
* Include appropriate test cases
* Update documentation as needed
* End all files with a newline

## Development Setup

1. **Fork and clone the repo**
   ```bash
   git clone https://github.com/yourusername/scanstock.git
   cd scanstock
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/my-feature
   # or
   git checkout -b fix/bug-fix
   ```

4. **Start development server**
   ```bash
   npm start
   ```

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

**Examples:**
```
Add barcode scanning for UPC codes
Fix crash when deleting product with photo
Update README with installation instructions
```

### TypeScript Styleguide

* Use TypeScript strict mode
* Prefer `const` over `let`, avoid `var`
* Use explicit types when they improve readability
* Use async/await over promises when possible
* Use meaningful variable and function names

**Good:**
```typescript
const handleProductDelete = async (productId: string): Promise<void> => {
  await ProductRepository.delete(productId);
};
```

**Avoid:**
```typescript
function del(id) {
  return ProductRepository.delete(id);
}
```

### React/React Native Styleguide

* Use functional components with hooks
* Extract complex logic into custom hooks
* Keep components small and focused
* Use TypeScript interfaces for props
* Prefer named exports over default exports

**Component Example:**
```typescript
interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Text>{product.name}</Text>
    </Pressable>
  );
}
```

### File Structure

* Keep related files together
* Use index files to export public API
* Separate concerns (UI, logic, data)

```
src/
├── components/
│   └── ProductCard/
│       ├── ProductCard.tsx       # Main component
│       ├── ProductCard.test.tsx  # Tests
│       └── index.ts              # Public exports
```

## Testing

### Running Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
```

### Writing Tests

* Write tests for all new features
* Update tests when modifying existing code
* Aim for meaningful test coverage

## Documentation

* Update README.md if you change functionality
* Add JSDoc comments for public APIs
* Update IAP_SETUP.md for IAP-related changes

## Questions?

Feel free to open an issue with the question label, or reach out via email.

Thank you for contributing! 🎉
