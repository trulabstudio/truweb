import { editableSite } from "@/lib/EDIT-SITE-HERE";

export const toolPageContent = {
  qrGenerator: editableSite.tools.qrGenerator.page,
  backgroundRemover: editableSite.tools.backgroundRemover.page,
};

export const toolInterfaceContent = {
  qrGenerator: editableSite.tools.qrGenerator.interface,
  backgroundRemover: editableSite.tools.backgroundRemover.interface,
};

export const statusPageContent = {
  forbidden: editableSite.statusPages.forbidden,
  notFound: editableSite.statusPages.notFound,
  maintenance: editableSite.statusPages.maintenance,
};

const contact = editableSite.forms.contact;

export const contactFormContent = {
  fields: {
    name: contact.fields.name.label,
    company: contact.fields.company.label,
    email: contact.fields.email.label,
    phone: contact.fields.phone.label,
    packageInterest: contact.fields.packageInterest.label,
    message: contact.fields.message.label,
  },
  placeholders: {
    name: contact.fields.name.placeholder,
    company: contact.fields.company.placeholder,
    email: contact.fields.email.placeholder,
    phone: contact.fields.phone.placeholder,
    message: contact.fields.message.placeholder,
  },
  packageInterestPlaceholder: contact.fields.packageInterest.placeholder,
  emptyValue: contact.emptyValue,
  submitLabel: contact.submitLabel,
  turnstileNotice: contact.turnstileNotice,
  turnstileMissing: contact.turnstileMissing,
  turnstileRequired: contact.turnstileRequired,
  submitFallbackError: contact.submitFallbackError,
  unexpectedError: contact.unexpectedError,
  success: contact.success,
  whatsapp: contact.whatsapp,
  apiMessages: contact.apiMessages,
  notificationEmail: contact.notificationEmail,
};
