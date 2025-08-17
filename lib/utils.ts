import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert string to kebab-case
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Insert hyphen between lowercase and uppercase letters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .toLowerCase(); // Convert to lowercase
}

// Fetch brand logo
export async function fetchCompanyLogo(ticker: string): Promise<string> {
  const apiKey = process.env.LOGO_DEV_API_KEY;
  if (!apiKey) {
    throw new Error("LOGO_DEV_API_KEY is not defined in environment variables.");
  }

  const response = await fetch(
    `https://img.logo.dev/ticker/${ticker}.com?token=${apiKey}&format=png`
  );
  // const response = await fetch(`https://img.logo.dev/microsoft.com`, {
  //   headers: {
  //     Authorization: `Bearer ${apiKey}`,
  //   },
  // });

  // const response = await fetch(`https://logo.clearbit.com/${ticker.toLowerCase()}.com?size=80`, {
  //   headers: {
  //     Authorization: `Bearer ${apiKey}`,
  //   },
  // });

  if (!response.ok) {
    throw new Error(`Failed to fetch logo for ${ticker}: ${response.statusText}`);
  }
  return response.url; // Return the URL of the logo
}
