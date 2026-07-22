import { Poppins } from "next/font/google";

export const siteFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-site",
  display: "swap",
});
