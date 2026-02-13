import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // --- CLEAN CODE RULES ---
      "no-console": ["warn", { allow: ["warn", "error"] }], // Cảnh báo console.log, chỉ cho phép warn/error
      "no-debugger": "error", // Cấm tuyệt đối debugger
      "prefer-const": "error", // Ép dùng const nếu biến không thay đổi
      "no-var": "error", // Cấm dùng var
      "eqeqeq": ["error", "always"], // Bắt buộc dùng === và !==

      // --- TYPESCRIPT STRICT RULES ---
      "@typescript-eslint/no-explicit-any": "error", // Cấm dùng kiểu 'any' - linh hồn của Clean Code trong TS
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }], // Cấm biến không sử dụng (ngoại trừ biến bắt đầu bằng _)
      "@typescript-eslint/consistent-type-imports": "error", // Ép dùng 'import type' cho các type/interface

      // --- REACT / NEXT.JS RULES ---
      "react-hooks/rules-of-hooks": "error", // Ép tuân thủ luật React Hooks
      "react-hooks/exhaustive-deps": "warn", // Cảnh báo thiếu dependency trong useEffect
      "react/self-closing-comp": "error", // Ép dùng thẻ tự đóng nếu không có children
    }
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/**",
  ]),
]);

export default eslintConfig;
