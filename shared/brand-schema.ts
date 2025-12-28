import { z } from "zod";

export const brandColorSchema = z.object({
  name: z.string(),
  hex: z.string(),
  rgb: z.object({
    r: z.number(),
    g: z.number(),
    b: z.number(),
  }),
  hsl: z.object({
    h: z.number(),
    s: z.number(),
    l: z.number(),
  }),
  usage: z.string(),
  category: z.enum(["primary", "secondary", "accent", "neutral", "semantic"]),
});

export const brandTypographySchema = z.object({
  name: z.string(),
  family: z.string(),
  weights: z.array(z.object({
    name: z.string(),
    value: z.number(),
  })),
  usage: z.string(),
  fallback: z.string(),
});

export const brandLogoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  variants: z.array(z.object({
    name: z.string(),
    url: z.string(),
    format: z.enum(["svg", "png", "jpg"]),
    background: z.enum(["light", "dark", "transparent"]),
  })),
  minSize: z.object({
    width: z.number(),
    height: z.number(),
  }),
  clearSpace: z.string(),
});

export const brandDesignTokenSchema = z.object({
  name: z.string(),
  category: z.enum(["spacing", "borderRadius", "shadow", "animation", "breakpoint"]),
  value: z.string(),
  cssVariable: z.string(),
  tailwindClass: z.string().optional(),
});

export const brandGuidelineSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum(["logo", "color", "typography", "imagery", "voice"]),
  dos: z.array(z.string()),
  donts: z.array(z.string()),
  examples: z.array(z.object({
    image: z.string().optional(),
    description: z.string(),
    isCorrect: z.boolean(),
  })).optional(),
});

export const brandConfigSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  version: z.string(),
  lastUpdated: z.string(),
  colors: z.array(brandColorSchema),
  typography: z.array(brandTypographySchema),
  logos: z.array(brandLogoSchema),
  designTokens: z.array(brandDesignTokenSchema),
  guidelines: z.array(brandGuidelineSchema),
});

export type BrandColor = z.infer<typeof brandColorSchema>;
export type BrandTypography = z.infer<typeof brandTypographySchema>;
export type BrandLogo = z.infer<typeof brandLogoSchema>;
export type BrandDesignToken = z.infer<typeof brandDesignTokenSchema>;
export type BrandGuideline = z.infer<typeof brandGuidelineSchema>;
export type BrandConfig = z.infer<typeof brandConfigSchema>;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function createColor(name: string, hex: string, usage: string, category: BrandColor["category"]): BrandColor {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return { name, hex, rgb, hsl, usage, category };
}

export const defaultMolochainBrand: BrandConfig = {
  name: "Molochain",
  tagline: "Connecting Global Trade",
  description: "Molochain is a comprehensive ecosystem for global trade, supply chain management, and business services. Our brand represents trust, innovation, and seamless connectivity.",
  version: "1.0.0",
  lastUpdated: new Date().toISOString().split("T")[0],
  colors: [
    createColor("Molochain Blue", "#2563EB", "Primary brand color for buttons, links, and key UI elements", "primary"),
    createColor("Molochain Blue Light", "#4A90FF", "Hover states, gradients, and accents", "primary"),
    createColor("Molochain Blue Dark", "#1D4ED8", "Active states and dark mode primary", "primary"),
    createColor("Sky Blue", "#0EA5E9", "Secondary actions and informational elements", "secondary"),
    createColor("Emerald", "#10B981", "Success states and positive indicators", "semantic"),
    createColor("Amber", "#F59E0B", "Warning states and attention indicators", "semantic"),
    createColor("Red", "#EF4444", "Error states and destructive actions", "semantic"),
    createColor("Slate 900", "#0F172A", "Primary text color", "neutral"),
    createColor("Slate 600", "#475569", "Secondary text color", "neutral"),
    createColor("Slate 400", "#94A3B8", "Muted text and placeholders", "neutral"),
    createColor("Slate 200", "#E2E8F0", "Borders and dividers", "neutral"),
    createColor("Slate 100", "#F1F5F9", "Background surfaces", "neutral"),
    createColor("White", "#FFFFFF", "Primary background", "neutral"),
  ],
  typography: [
    {
      name: "Inter",
      family: "Inter",
      weights: [
        { name: "Regular", value: 400 },
        { name: "Medium", value: 500 },
        { name: "Semibold", value: 600 },
        { name: "Bold", value: 700 },
      ],
      usage: "Primary typeface for all UI elements, headings, and body text",
      fallback: "system-ui, -apple-system, sans-serif",
    },
    {
      name: "Mono",
      family: "JetBrains Mono",
      weights: [
        { name: "Regular", value: 400 },
        { name: "Medium", value: 500 },
      ],
      usage: "Code snippets, technical data, and monospaced content",
      fallback: "Menlo, Monaco, monospace",
    },
  ],
  logos: [
    {
      id: "primary",
      name: "Primary Logo",
      description: "The main Molochain logo for general use",
      variants: [
        { name: "Full Color", url: "/brand/logo-full-color.svg", format: "svg", background: "light" },
        { name: "White", url: "/brand/logo-white.svg", format: "svg", background: "dark" },
        { name: "Black", url: "/brand/logo-black.svg", format: "svg", background: "light" },
      ],
      minSize: { width: 120, height: 40 },
      clearSpace: "Equal to the height of the 'M' in Molochain",
    },
    {
      id: "icon",
      name: "Icon Mark",
      description: "Standalone icon for favicons, app icons, and small spaces",
      variants: [
        { name: "Full Color", url: "/brand/icon-full-color.svg", format: "svg", background: "transparent" },
        { name: "White", url: "/brand/icon-white.svg", format: "svg", background: "dark" },
      ],
      minSize: { width: 32, height: 32 },
      clearSpace: "25% of icon width on all sides",
    },
  ],
  designTokens: [
    { name: "Spacing XS", category: "spacing", value: "4px", cssVariable: "--spacing-xs", tailwindClass: "p-1" },
    { name: "Spacing SM", category: "spacing", value: "8px", cssVariable: "--spacing-sm", tailwindClass: "p-2" },
    { name: "Spacing MD", category: "spacing", value: "16px", cssVariable: "--spacing-md", tailwindClass: "p-4" },
    { name: "Spacing LG", category: "spacing", value: "24px", cssVariable: "--spacing-lg", tailwindClass: "p-6" },
    { name: "Spacing XL", category: "spacing", value: "32px", cssVariable: "--spacing-xl", tailwindClass: "p-8" },
    { name: "Spacing 2XL", category: "spacing", value: "48px", cssVariable: "--spacing-2xl", tailwindClass: "p-12" },
    { name: "Border Radius SM", category: "borderRadius", value: "4px", cssVariable: "--radius-sm", tailwindClass: "rounded" },
    { name: "Border Radius MD", category: "borderRadius", value: "8px", cssVariable: "--radius-md", tailwindClass: "rounded-lg" },
    { name: "Border Radius LG", category: "borderRadius", value: "12px", cssVariable: "--radius-lg", tailwindClass: "rounded-xl" },
    { name: "Border Radius Full", category: "borderRadius", value: "9999px", cssVariable: "--radius-full", tailwindClass: "rounded-full" },
    { name: "Shadow SM", category: "shadow", value: "0 1px 2px rgba(0,0,0,0.05)", cssVariable: "--shadow-sm", tailwindClass: "shadow-sm" },
    { name: "Shadow MD", category: "shadow", value: "0 4px 6px rgba(0,0,0,0.1)", cssVariable: "--shadow-md", tailwindClass: "shadow-md" },
    { name: "Shadow LG", category: "shadow", value: "0 10px 15px rgba(0,0,0,0.1)", cssVariable: "--shadow-lg", tailwindClass: "shadow-lg" },
    { name: "Breakpoint SM", category: "breakpoint", value: "640px", cssVariable: "--breakpoint-sm", tailwindClass: "sm:" },
    { name: "Breakpoint MD", category: "breakpoint", value: "768px", cssVariable: "--breakpoint-md", tailwindClass: "md:" },
    { name: "Breakpoint LG", category: "breakpoint", value: "1024px", cssVariable: "--breakpoint-lg", tailwindClass: "lg:" },
    { name: "Breakpoint XL", category: "breakpoint", value: "1280px", cssVariable: "--breakpoint-xl", tailwindClass: "xl:" },
    { name: "Animation Fast", category: "animation", value: "150ms", cssVariable: "--animation-fast", tailwindClass: "duration-150" },
    { name: "Animation Normal", category: "animation", value: "300ms", cssVariable: "--animation-normal", tailwindClass: "duration-300" },
    { name: "Animation Slow", category: "animation", value: "500ms", cssVariable: "--animation-slow", tailwindClass: "duration-500" },
  ],
  guidelines: [
    {
      id: "logo-usage",
      title: "Logo Usage",
      category: "logo",
      dos: [
        "Use the logo with adequate clear space around it",
        "Maintain the original aspect ratio when scaling",
        "Use the white logo version on dark backgrounds",
        "Ensure the logo is clearly visible and legible",
      ],
      donts: [
        "Don't stretch or distort the logo",
        "Don't add effects like shadows or gradients to the logo",
        "Don't place the logo on busy backgrounds",
        "Don't use the logo smaller than minimum size (120px width)",
        "Don't change the logo colors outside of approved variants",
      ],
    },
    {
      id: "color-usage",
      title: "Color Usage",
      category: "color",
      dos: [
        "Use Molochain Blue as the primary accent color",
        "Maintain sufficient color contrast for accessibility (4.5:1 ratio)",
        "Use semantic colors consistently (green for success, red for errors)",
        "Apply neutral colors for text and backgrounds",
      ],
      donts: [
        "Don't use colors outside the brand palette",
        "Don't combine too many colors in one design",
        "Don't use low contrast color combinations",
        "Don't override semantic color meanings",
      ],
    },
    {
      id: "typography-usage",
      title: "Typography Usage",
      category: "typography",
      dos: [
        "Use Inter as the primary typeface for all content",
        "Maintain consistent heading hierarchy",
        "Use appropriate font weights for emphasis",
        "Ensure readable font sizes (minimum 14px for body text)",
      ],
      donts: [
        "Don't use more than 2 typefaces in a single design",
        "Don't use all caps for long passages of text",
        "Don't use font sizes smaller than 12px",
        "Don't mix too many font weights in one section",
      ],
    },
  ],
};
