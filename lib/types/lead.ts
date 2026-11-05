import { editableSite } from "@/lib/EDIT-SITE-HERE";

type EditablePackage = (typeof editableSite.packages.items)[number];
export type PackageInterestOption = {
  id: string;
  label: string;
};

export type LeadFormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  packageId: string;
  message: string;
};

export type LeadInput = {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  packageId?: unknown;
  message?: unknown;
  source?: unknown;
  form?: unknown;
  "cf-turnstile-response"?: unknown;
  website?: unknown;
};

function getPackageDisplayLabel(packageItem: EditablePackage) {
  const customLabel = packageItem.formLabel.trim();

  if (customLabel) {
    return customLabel;
  }

  if (!editableSite.packages.showPrices) return packageItem.name;

  return [packageItem.name, packageItem.price, packageItem.priceSuffix]
    .filter(Boolean)
    .join(" — ");
}

const packageOptions: ReadonlyArray<PackageInterestOption> = editableSite.packages.items.map((item) => ({
  id: item.id,
  label: getPackageDisplayLabel(item),
}));

// Used instead of the packages when the packages section is turned off. IDs come from the
// service names, so renaming a service in the admin panel starts a new ID.
const serviceOptions: ReadonlyArray<PackageInterestOption> = [
  ...editableSite.homepage.services.items.map((item) => ({
    id: `service-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    label: item.title,
  })),
];

const otherOptions: ReadonlyArray<PackageInterestOption> = editableSite.forms.contact.additionalPackageOptions;

/** What the contact form offers right now. */
export const packageInterestOptions: ReadonlyArray<PackageInterestOption> = [
  ...(editableSite.packages.showSection ? packageOptions : serviceOptions),
  ...otherOptions,
];

// Both lists stay valid, so a form opened before the switch changed still submits,
// and enquiries saved under either list keep their label.
const allOptions = [...packageOptions, ...serviceOptions, ...otherOptions];

export const packageInterestIds = allOptions.map((option) => option.id);

export function getPackageInterestLabel(id: string) {
  return allOptions.find((option) => option.id === id)?.label || "";
}
