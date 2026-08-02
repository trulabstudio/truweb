import { editableSite } from "@/lib/EDIT-SITE-HERE";

type EditablePackage = (typeof editableSite.packages.items)[number];
type AdditionalPackageOption =
  (typeof editableSite.forms.contact.additionalPackageOptions)[number];

type PackageId = EditablePackage["id"];
type PackageInterestId = PackageId | AdditionalPackageOption["id"];

export type PackageInterestOption = {
  id: PackageInterestId;
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
  "cf-turnstile-response"?: unknown;
  website?: unknown;
};

function getPackageDisplayLabel(packageItem: EditablePackage) {
  const customLabel = packageItem.formLabel.trim();

  if (customLabel) {
    return customLabel;
  }

  return [packageItem.name, packageItem.price, packageItem.priceSuffix]
    .filter(Boolean)
    .join(" — ");
}

export const packageInterestOptions: ReadonlyArray<PackageInterestOption> = [
  ...editableSite.packages.items.map((item) => ({
    id: item.id,
    label: getPackageDisplayLabel(item),
  })),
  ...editableSite.forms.contact.additionalPackageOptions,
];

export const packageInterestIds = packageInterestOptions.map((option) => option.id);

export function getPackageInterestLabel(id: string) {
  return packageInterestOptions.find((option) => option.id === id)?.label || "";
}
