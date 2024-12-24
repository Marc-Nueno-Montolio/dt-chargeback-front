import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Disable TypeScript strict rules
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      
      // Disable React strict rules
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",
      
      // General rules
      "no-unused-vars": "warn",
      "no-console": "off",
      "no-debugger": "warn",
      "prefer-const": "warn",
      
      // Allow empty functions
      "no-empty-function": "off",
      "@typescript-eslint/no-empty-function": "off",
      
      // More lenient formatting rules
      "semi": ["warn", "always"],
      "quotes": ["warn", "single", { "allowTemplateLiterals": true }],
      "comma-dangle": "off",
      "max-len": "off"
    }
  }
];

export default eslintConfig;
