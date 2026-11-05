import { editableSite } from "@/lib/EDIT-SITE-HERE";

// How the Threads and blog writers describe the company. The services come from the homepage
// Services section, so editing it in the admin panel keeps the writers in step.
const otherServices = editableSite.homepage.services.items
  .map((item) => item.title.toLowerCase())
  .filter((title) => !title.includes("podcast"));

export const companyRole = "a creative production studio in Malaysia whose speciality is business podcasts";
export const companyServices = `Besides podcasts, the same team also does ${otherServices.slice(0, -1).join(", ")} and ${otherServices.at(-1)}.`;
