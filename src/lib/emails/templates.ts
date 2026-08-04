import { renderEmail, renderPlainText, type EmailContent } from "./render";

export type SubmissionType = "register" | "contact" | "enquiry" | "online" | "inhouse";
export type Audience = "customer" | "admin";

export type EmailInput = {
  type: SubmissionType;
  locale: "en" | "ar";
  brand: string;
  tagline: string;
  fullName: string;
  courseTitle: string;
  courseCode?: string;
  email?: string;
  phone?: string;
  company?: string;
  designation?: string;
  country?: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
  fee?: string;
  currency?: string;
  format?: string;
  paymentMode?: string;
  message?: string;
  scheduleSummary?: string;
  adminUrl?: string;
  siteUrl?: string;
};

const COPY = {
  en: {
    tagline: "Training & Professional Development",
    subject: {
      register: "Registration received: {title}",
      contact: "Thank you for contacting us",
      enquiry: "Enquiry received: {title}",
      online: "Online course request: {title}",
      inhouse: "In-house training request: {title}",
    },
    adminSubject: {
      register: "New registration: {title}",
      contact: "New contact enquiry",
      enquiry: "New course enquiry: {title}",
      online: "New online request: {title}",
      inhouse: "New in-house request: {title}",
    },
    title: {
      register: "Thank you for registering",
      contact: "Thank you for contacting us",
      enquiry: "Enquiry received",
      online: "Online course request received",
      inhouse: "In-house training request received",
    },
    adminTitle: {
      register: "New course registration",
      contact: "New contact enquiry",
      enquiry: "New course enquiry",
      online: "New online course request",
      inhouse: "New in-house training request",
    },
    body: {
      register: "We have received your registration for the following course. Our team will contact you shortly to confirm your booking and send the payment details.",
      contact: "We have received your message and will get back to you as soon as possible.",
      enquiry: "We have received your enquiry about the following course. A member of our team will contact you with the details you requested.",
      online: "We have received your request to attend the following course online. Our team will contact you shortly with the joining instructions.",
      inhouse: "We have received your request for in-house training on the following course. Our team will contact you to discuss delivering it at your organisation.",
    },
    adminBody: {
      register: "A new course registration has been submitted. Details are below.",
      contact: "A new contact enquiry has been submitted. Details are below.",
      enquiry: "A new course enquiry has been submitted. Details are below.",
      online: "A request to attend a course online has been submitted. Details are below.",
      inhouse: "A request for in-house training has been submitted. Details are below.",
    },
    greeting: "Dear {name},",
    closing: "Best regards, The {brand} Team",
    ctaAdmin: "Open in admin panel",
    labels: {
      course: "Course",
      code: "Course code",
      name: "Full name",
      email: "Email",
      phone: "Phone",
      company: "Company",
      designation: "Job title",
      country: "Country",
      venue: "Venue / location",
      schedule: "Dates",
      fee: "Fee",
      format: "Delivery mode",
      payment: "Payment method",
      message: "Message",
    },
  },
  ar: {
    tagline: "التدريب والتطوير المهني",
    subject: {
      register: "تم استلام طلب التسجيل: {title}",
      contact: "شكراً لتواصلك معنا",
      enquiry: "تم استلام استفسارك: {title}",
      online: "طلب الدورة عبر الإنترنت: {title}",
      inhouse: "طلب التدريب الداخلي: {title}",
    },
    adminSubject: {
      register: "تسجيل جديد: {title}",
      contact: "استفسار جديد",
      enquiry: "استفسار جديد عن دورة: {title}",
      online: "طلب جديد للدورة عبر الإنترنت: {title}",
      inhouse: "طلب جديد للتدريب الداخلي: {title}",
    },
    title: {
      register: "شكراً لتسجيلك",
      contact: "شكراً لتواصلك معنا",
      enquiry: "تم استلام استفسارك",
      online: "تم استلام طلب الدورة عبر الإنترنت",
      inhouse: "تم استلام طلب التدريب الداخلي",
    },
    adminTitle: {
      register: "تسجيل جديد في دورة",
      contact: "استفسار جديد",
      enquiry: "استفسار جديد عن دورة",
      online: "طلب جديد للدورة عبر الإنترنت",
      inhouse: "طلب جديد للتدريب الداخلي",
    },
    body: {
      register: "لقد استلمنا طلب تسجيلك في الدورة التالية. سيتواصل معك فريقنا قريباً لتأكيد الحجز وإرسال تفاصيل الدفع.",
      contact: "لقد استلمنا رسالتك وسنعاود التواصل معك في أقرب وقت ممكن.",
      enquiry: "لقد استلمنا استفسارك حول الدورة التالية. سيتواصل معك أحد أعضاء فريقنا بالتفاصيل التي طلبتها.",
      online: "لقد استلمنا طلبك للالتحاق بالدورة التالية عبر الإنترنت. سيتواصل معك فريقنا قريباً بتعليمات الانضمام.",
      inhouse: "لقد استلمنا طلبك للتدريب الداخلي على الدورة التالية. سيتواصل معك فريقنا لمناقشة تنفيذه داخل مؤسستك.",
    },
    adminBody: {
      register: "تم إرسال تسجيل جديد في دورة. التفاصيل أدناه.",
      contact: "تم إرسال استفسار جديد. التفاصيل أدناه.",
      enquiry: "تم إرسال استفسار جديد عن دورة. التفاصيل أدناه.",
      online: "تم إرسال طلب حضور دورة عبر الإنترنت. التفاصيل أدناه.",
      inhouse: "تم إرسال طلب تدريب داخلي. التفاصيل أدناه.",
    },
    greeting: "عزيزي/عزيزتي {name}،",
    closing: "مع أطيب التحيات، فريق {brand}",
    ctaAdmin: "فتح في لوحة التحكم",
    labels: {
      course: "الدورة",
      code: "رمز الدورة",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      company: "الشركة",
      designation: "المسمى الوظيفي",
      country: "الدولة",
      venue: "المكان / الموقع",
      schedule: "التواريخ",
      fee: "الرسوم",
      format: "طريقة التقديم",
      payment: "طريقة الدفع",
      message: "الرسالة",
    },
  },
} as const;

function formatLabel(key: keyof (typeof COPY)["en"]["labels"]): string {
  return COPY.en.labels[key];
}

export function buildEmail(input: EmailInput, audience: Audience): { subject: string; html: string; text: string } {
  const { type, locale, fullName, brand, tagline, siteUrl, adminUrl } = input;
  const copy = COPY[locale];
  const labels = copy.labels;

  const details: EmailContent["table"] = [];
  const add = (label: string, value?: string) => {
    if (value && value.trim()) details.push({ label, value });
  };

  add(labels.course, input.courseTitle);
  add(labels.code, input.courseCode);
  add(labels.name, fullName);
  add(labels.email, input.email);
  add(labels.phone, input.phone);
  add(labels.company, input.company);
  add(labels.designation, input.designation);
  add(labels.country, input.country);
  add(labels.venue, input.scheduleSummary || input.venue);
  add(labels.schedule, [input.startDate, input.endDate].filter(Boolean).join(" – "));
  const fee = input.fee ? `${input.currency || ""} ${input.fee}`.trim() : "";
  add(labels.fee, fee);
  add(labels.format, input.format);
  add(labels.payment, input.paymentMode);
  add(labels.message, input.message);

  const isAdmin = audience === "admin";
  const subject = isAdmin ? copy.adminSubject[type].replace("{title}", input.courseTitle) : copy.subject[type].replace("{title}", input.courseTitle);

  const content: EmailContent = {
    locale,
    brand,
    tagline,
    title: (isAdmin ? copy.adminTitle[type] : copy.title[type]).replace("{title}", input.courseTitle),
    greeting: copy.greeting.replace("{name}", fullName),
    paragraphs: [(isAdmin ? copy.adminBody[type] : copy.body[type]).replace("{title}", input.courseTitle)],
    table: details,
    cta:
      isAdmin && adminUrl
        ? { label: copy.ctaAdmin, url: adminUrl }
        : !isAdmin && siteUrl
          ? { label: formatLabel("course"), url: siteUrl }
          : undefined,
    closing: copy.closing.replace("{brand}", brand),
    footerNote: tagline,
  };

  return { subject, html: renderEmail(content), text: renderPlainText(content) };
}
