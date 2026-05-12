//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  arrowParens: "avoid",
  bracketSameLine: true,
  bracketSpacing: true,
  endOfLine: "lf",
  printWidth: 80,
  proseWrap: "always",
  quoteProps: "consistent",
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
