import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ---------------------------------------------------------------
  // Admin bootstrap account
  // ---------------------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL || "admin@takween.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Administrator",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "owner",
    },
  });

  // ---------------------------------------------------------------
  // Regions + Venues (from glomacs.com)
  // ---------------------------------------------------------------
  const regions = {
    europe: { slug: "europe", nameEn: "Europe", nameAr: "أوروبا", sort: 1 },
    middleEast: { slug: "middle-east", nameEn: "Middle East", nameAr: "الشرق الأوسط", sort: 2 },
    asia: { slug: "asia", nameEn: "Asia", nameAr: "آسيا", sort: 3 },
    america: { slug: "america", nameEn: "America", nameAr: "الأمريكتان", sort: 4 },
    africa: { slug: "africa", nameEn: "Africa", nameAr: "أفريقيا", sort: 5 },
  };
  const regionIds: Record<string, string> = {};
  for (const [k, r] of Object.entries(regions)) {
    regionIds[k] = await prisma.region.upsert({ where: { slug: r.slug }, update: r, create: r }).then((x) => x.id);
  }

  const venues: Array<{ region: string; city: string; country: string; slug: string }> = [
    { region: "europe", city: "London", country: "UK", slug: "london-uk" },
    { region: "europe", city: "Amsterdam", country: "The Netherlands", slug: "amsterdam-the-netherlands" },
    { region: "europe", city: "Paris", country: "France", slug: "paris-france" },
    { region: "europe", city: "Barcelona", country: "Spain", slug: "barcelona-spain" },
    { region: "europe", city: "Vienna", country: "Austria", slug: "vienna-austria" },
    { region: "europe", city: "Istanbul", country: "Turkey", slug: "istanbul-turkey" },
    { region: "europe", city: "Geneva", country: "Switzerland", slug: "geneva-switzerland" },
    { region: "europe", city: "Milan", country: "Italy", slug: "milan-italy" },
    { region: "europe", city: "Madrid", country: "Spain", slug: "madrid-spain" },
    { region: "europe", city: "Lisbon", country: "Portugal", slug: "lisbon-portugal" },
    { region: "middleEast", city: "Dubai", country: "UAE", slug: "dubai-uae" },
    { region: "middleEast", city: "Abu Dhabi", country: "UAE", slug: "abu-dhabi-uae" },
    { region: "middleEast", city: "Doha", country: "Qatar", slug: "doha-qatar" },
    { region: "middleEast", city: "Riyadh", country: "Saudi Arabia", slug: "riyadh-saudi-arabia" },
    { region: "middleEast", city: "Jeddah", country: "Saudi Arabia", slug: "jeddah-saudi-arabia" },
    { region: "middleEast", city: "Amman", country: "Jordan", slug: "amman-jordan" },
    { region: "middleEast", city: "Manama", country: "Bahrain", slug: "manama-bahrain" },
    { region: "middleEast", city: "Muscat", country: "Oman", slug: "muscat-oman" },
    { region: "asia", city: "Singapore City", country: "Singapore", slug: "singapore-city-singapore" },
    { region: "asia", city: "Kuala Lumpur", country: "Malaysia", slug: "kuala-lumpur-malaysia" },
    { region: "asia", city: "Tokyo", country: "Japan", slug: "tokyo-japan" },
    { region: "asia", city: "Manila", country: "Philippines", slug: "manila-philippines" },
    { region: "america", city: "New York", country: "USA", slug: "new-york-usa" },
    { region: "america", city: "Houston", country: "USA", slug: "houston-usa" },
    { region: "america", city: "Toronto", country: "Canada", slug: "toronto-canada" },
    { region: "africa", city: "Cairo", country: "Egypt", slug: "cairo-egypt" },
    { region: "africa", city: "Cape Town", country: "South Africa", slug: "cape-town-south-africa" },
    { region: "africa", city: "Casablanca", country: "Morocco", slug: "casablanca-morocco" },
    { region: "africa", city: "Lagos", country: "Nigeria", slug: "lagos-nigeria" },
    { region: "africa", city: "Nairobi", country: "Kenya", slug: "nairobi-kenya" },
  ];
  const venueIds: Record<string, string> = {};
  for (const v of venues) {
    venueIds[v.slug] = await prisma.venue.upsert({
      where: { slug: v.slug },
      update: {},
      create: {
        slug: v.slug,
        nameEn: v.city,
        country: v.country,
        regionId: regionIds[v.region],
      },
    }).then((x) => x.id);
  }

  // ---------------------------------------------------------------
  // Countries (a starter set)
  // ---------------------------------------------------------------
  const countries = [
    { iso: "AE", nameEn: "United Arab Emirates", nameAr: "الإمارات العربية المتحدة", currency: "AED" },
    { iso: "SA", nameEn: "Saudi Arabia", nameAr: "المملكة العربية السعودية", currency: "SAR" },
    { iso: "QA", nameEn: "Qatar", nameAr: "قطر", currency: "QAR" },
    { iso: "KW", nameEn: "Kuwait", nameAr: "الكويت", currency: "KWD" },
    { iso: "OM", nameEn: "Oman", nameAr: "عُمان", currency: "OMR" },
    { iso: "BH", nameEn: "Bahrain", nameAr: "البحرين", currency: "BHD" },
    { iso: "US", nameEn: "United States", nameAr: "الولايات المتحدة", currency: "USD" },
    { iso: "GB", nameEn: "United Kingdom", nameAr: "المملكة المتحدة", currency: "GBP" },
    { iso: "CA", nameEn: "Canada", nameAr: "كندا", currency: "CAD" },
    { iso: "NG", nameEn: "Nigeria", nameAr: "نيجيريا", currency: "NGN" },
    { iso: "EG", nameEn: "Egypt", nameAr: "مصر", currency: "EGP" },
    { iso: "ZA", nameEn: "South Africa", nameAr: "جنوب أفريقيا", currency: "ZAR" },
    { iso: "MA", nameEn: "Morocco", nameAr: "المغرب", currency: "MAD" },
    { iso: "KE", nameEn: "Kenya", nameAr: "كينيا", currency: "KES" },
    { iso: "JP", nameEn: "Japan", nameAr: "اليابان", currency: "JPY" },
    { iso: "SG", nameEn: "Singapore", nameAr: "سنغافورة", currency: "SGD" },
    { iso: "MY", nameEn: "Malaysia", nameAr: "ماليزيا", currency: "MYR" },
    { iso: "TR", nameEn: "Turkey", nameAr: "تركيا", currency: "TRY" },
    { iso: "FR", nameEn: "France", nameAr: "فرنسا", currency: "EUR" },
    { iso: "NL", nameEn: "Netherlands", nameAr: "هولندا", currency: "EUR" },
    { iso: "ES", nameEn: "Spain", nameAr: "إسبانيا", currency: "EUR" },
    { iso: "AT", nameEn: "Austria", nameAr: "النمسا", currency: "EUR" },
    { iso: "CH", nameEn: "Switzerland", nameAr: "سويسرا", currency: "CHF" },
  ];
  for (const c of countries) {
    await prisma.country.upsert({ where: { iso: c.iso }, update: {}, create: c });
  }

  // ---------------------------------------------------------------
  // Certificates
  // ---------------------------------------------------------------
  const certs = {
    cpd: { code: "cpd", nameEn: "CPD Certified Training Courses", slug: "cpd" },
    ilm: { code: "ilm", nameEn: "ILM Recognised Training Courses", slug: "ilm" },
    pmi: { code: "pmi", nameEn: "PMI Registered Training Courses", slug: "pmi" },
    hrci: { code: "hrci", nameEn: "HRCI Pre-approved Training Courses", slug: "hrci" },
    ssc: { code: "ssc", nameEn: "SSC Approved Training Courses", slug: "ssc" },
    certnexus: { code: "certnexus", nameEn: "CertNexus Certification Training Courses", slug: "certnexus" },
    nasba: { code: "nasba", nameEn: "NASBA Approved Training Courses", slug: "nasba" },
    khda: { code: "khda", nameEn: "KHDA Approved Training Courses", slug: "khda" },
    iso: { code: "iso", nameEn: "ISO Training Courses", slug: "iso" },
    iiba: { code: "iiba", nameEn: "IIBA Endorsed Training Courses", slug: "iiba" },
  } as const;
  for (const c of Object.values(certs)) {
    await prisma.certificate.upsert({ where: { code: c.code }, update: {}, create: c });
  }

  // ---------------------------------------------------------------
  // Titles for registration dropdown
  // ---------------------------------------------------------------
  for (const t of ["Dr", "Mr", "Mrs", "Ms", "Engr", "Prof"]) {
    await prisma.title.upsert({ where: { name: t }, update: {}, create: { name: t } });
  }

  // ---------------------------------------------------------------
  // Categories (kebab slugs from glomacs)
  // ---------------------------------------------------------------
  const cats = [
    { slug: "urban-planning-and-development", nameEn: "Urban Planning and Development", nameAr: "التخطيط الحضري والتنمية", superCat: "sector-specific-training-courses" },
    { slug: "energy-utilities", nameEn: "Energy & Utilities", nameAr: "الطاقة والمرافق", superCat: "sector-specific-training-courses" },
    { slug: "oil-gas-petrochemicals", nameEn: "Oil, Gas & Petrochemicals", nameAr: "النفط والغاز والبتروكيماويات", superCat: "sector-specific-training-courses" },
    { slug: "banking-and-financial-services", nameEn: "Banking & Financial Services", nameAr: "الخدمات المصرفية والمالية", superCat: "sector-specific-training-courses" },
    { slug: "management-leadership", nameEn: "Management & Leadership", nameAr: "الإدارة والقيادة", superCat: "leadership-strategy-governance" },
    { slug: "artificial-intelligence-ai", nameEn: "Artificial Intelligence (AI)", nameAr: "الذكاء الاصطناعي", superCat: "emerging-technology-courses" },
    { slug: "project-management", nameEn: "Project Management", nameAr: "إدارة المشاريع", superCat: "project-contract-management" },
    { slug: "human-resource-management", nameEn: "HR Management", nameAr: "إدارة الموارد البشرية", superCat: "people-hr-talent-management-training-subjects" },
    { slug: "health-safety-environment", nameEn: "Health, Safety & Environment", nameAr: "الصحة والسلامة والبيئة", superCat: "hse-security-courses" },
    { slug: "finance-budgeting", nameEn: "Finance & Budgeting", nameAr: "المالية والميزانية", superCat: "finance-investment-training-courses" },
    { slug: "sales-marketing", nameEn: "Sales & Marketing", nameAr: "المبيعات والتسويق", superCat: "pr-sales-customer-service" },
    { slug: "operational-excellence", nameEn: "Operational Excellence", nameAr: "التميز التشغيلي", superCat: "operations-quality-business-excellence" },
    { slug: "facilities-management", nameEn: "Facilities Management", nameAr: "إدارة المرافق", superCat: "technical-training-courses" },
    { slug: "civil-construction-engineering", nameEn: "Construction Management", nameAr: "إدارة البناء", superCat: "technical-training-courses" },
  ] as const;

  // Super categories
  const superCats = [
    { slug: "leadership-strategy-governance", nameEn: "Leadership, Strategy & Governance", nameAr: "القيادة والاستراتيجية والحوكمة" },
    { slug: "emerging-technology-courses", nameEn: "AI, Data & Emerging Technologies", nameAr: "الذكاء الاصطناعي والبيانات والتقنيات الناشئة" },
    { slug: "finance-investment-training-courses", nameEn: "Finance, Investment & Banking", nameAr: "المالية والاستثمار والبنوك" },
    { slug: "project-contract-management", nameEn: "Project, Procurement & Contract", nameAr: "المشاريع والمشتريات والعقود" },
    { slug: "people-hr-talent-management-training-subjects", nameEn: "People, HR & Talent Management", nameAr: "الموارد البشرية وإدارة المواهب" },
    { slug: "operations-quality-business-excellence", nameEn: "Operations, Quality & Auditing", nameAr: "العمليات والجودة والتدقيق" },
    { slug: "pr-sales-customer-service", nameEn: "PR, Sales & Customer Service", nameAr: "العلاقات العامة والمبيعات وخدمة العملاء" },
    { slug: "technical-training-courses", nameEn: "Engineering, Maintenance, Technical", nameAr: "الهندسة والصيانة والتقنية" },
    { slug: "hse-security-courses", nameEn: "HSE, Emergency & Security", nameAr: "الصحة والسلامة والبيئة والطوارئ والأمن" },
    { slug: "sector-specific-training-courses", nameEn: "Training Sectors", nameAr: "القطاعات التدريبية" },
  ];
  const superCatIds: Record<string, string> = {};
  for (const s of superCats) {
    superCatIds[s.slug] = await prisma.superCategory.upsert({ where: { slug: s.slug }, update: {}, create: s }).then((x) => x.id);
  }

  const categoryIds: Record<string, string> = {};
  for (const c of cats) {
    categoryIds[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { superCategoryId: c.superCat ? superCatIds[c.superCat] : null },
      create: {
        slug: c.slug,
        nameEn: c.nameEn,
        nameAr: c.nameAr,
        superCategoryId: c.superCat ? superCatIds[c.superCat] : null,
        featured: true,
      },
    }).then((x) => x.id);
  }

  // ---------------------------------------------------------------
  // A couple of example courses bound to schedules
  // ---------------------------------------------------------------
  const leed = await prisma.course.upsert({
    where: { slug: "leed-green-associate-exam-preparation-training" },
    update: {},
    create: {
      slug: "leed-green-associate-exam-preparation-training",
      code: "UP1",
      titleEn: "LEED Green Associate Exam Preparation Training",
      titleAr: "التدريب على التحضير لاختبار زميل LEED الأخضر",
      subtitleEn: "Become a Leader in Green Building Design and Construction",
      subtitleAr: "كن قائداً في تصميم وبناء المباني الخضراء",
      badgeEn: "An Interactive 5-Day Training Course",
      badgeAr: "دورة تدريبية تفاعلية مدتها 5 أيام",
      durationDays: 5,
      categoryId: categoryIds["urban-planning-and-development"],
      featured: true,
      introEn: "This training course is designed to equip you with the expertise to become a LEED Green Associate.",
      introAr: "صُممت هذه الدورة التدريبية لإكسابك الخبرة اللازمة لتصبح زميل LEED الأخضر المعتمد.",
      objectivesEn: "- Understand green buildings concepts\n- Achieve LEED requirements\n- Be ready to take LEED Green Associate examination",
      objectivesAr: "- فهم مفاهيم المباني الخضراء\n- تحقيق متطلبات LEED\n- الاستعداد لاختبار شهادة LEED",
      methodologyEn: "A range of approaches including syndicate discussions, group activities and individual exercises.",
      methodologyAr: "مزيج من أساليب التعلم بما في ذلك المناقشات والأنشطة الجماعية والتمارين الفردية.",
      orgImpactEn: "Helps organisation to achieve LEED certification and improve productivity.",
      orgImpactAr: "يساعد المؤسسات على تحقيق شهادة LEED وتحسين الإنتاجية.",
      personalImpactEn: "Improve knowledge and understanding of project challenges and LEED principles.",
      personalImpactAr: "تحسين المعرفة والفهم لتحديات المشاريع ومبادئ LEED.",
      targetAudienceEn: "Contractors, facility managers, architects, engineers, developers and decision makers.",
      targetAudienceAr: "المقاولون ومديرو المرافق والمهندسون والمعماريون والمطورون ومنتجو القرار.",
      certificateNoteEn: "Upon successful completion GLOMACS certificate and CPE credits are awarded.",
      certificateNoteAr: "عند إتمام الدورة بنجاح تُمنح شهادة من التكويين ووحدات التعليم المهني المستمر.",
      dayOutlineEn: [
        { day: 1, title: "Green Buildings and LEED", topics: ["Green ordinances", "LEED Benefits", "LEED Rating Systems"] },
        { day: 2, title: "Location and Transportation & Sustainable Sites", topics: ["Project Location", "Transportation", "Site Assessment"] },
      ],
    },
  });

  await prisma.schedule.createMany({
    data: [
      { courseId: leed.id, venueId: venueIds["dubai-uae"], startDate: new Date("2026-08-17"), endDate: new Date("2026-08-21"), fee: 5950 },
      { courseId: leed.id, venueId: venueIds["london-uk"], startDate: new Date("2026-10-12"), endDate: new Date("2026-10-16"), fee: 5950 },
    ],
    skipDuplicates: true,
  });

  // ---------------------------------------------------------------
  // Additional example courses (one per category)
  // ---------------------------------------------------------------
  const additionalCourses: Array<{
    slug: string;
    code: string;
    cat: string;
    titleEn: string;
    titleAr: string;
    subtitleEn: string;
    introEn: string;
    outline: Array<{ day: number; title: string; topics: string[] }>;
  }> = [
    {
      slug: "strategic-leadership-and-change-management",
      code: "ML1",
      cat: "management-leadership",
      titleEn: "Strategic Leadership and Change Management",
      titleAr: "القيادة الاستراتيجية وإدارة التغيير",
      subtitleEn: "Inspire performance and lead sustainable transformation",
      introEn: "Build the mindset and toolkit to lead organisational change with confidence.",
      outline: [
        { day: 1, title: "Leadership Foundations", topics: ["Leadership styles", "Emotional intelligence", "Vision setting"] },
        { day: 2, title: "Change Management", topics: ["Change models", "Stakeholder engagement", "Communication plan"] },
      ],
    },
    {
      slug: "artificial-intelligence-for-business",
      code: "AI1",
      cat: "artificial-intelligence-ai",
      titleEn: "Artificial Intelligence for Business Leaders",
      titleAr: "الذكاء الاصطناعي لقادة الأعمال",
      subtitleEn: "Harness AI to drive decisions and competitive advantage",
      introEn: "A practical introduction to applying AI and data science across business functions.",
      outline: [
        { day: 1, title: "AI Essentials", topics: ["Machine learning overview", "Use cases", "Data strategy"] },
        { day: 2, title: "Applied AI", topics: ["Generative AI", "Ethics and governance", "Roadmap"] },
      ],
    },
    {
      slug: "project-management-professional-pmp-prep",
      code: "PM1",
      cat: "project-management",
      titleEn: "Project Management Professional (PMP) Preparation",
      titleAr: "التحضير لشهادة إدارة المشاريع الاحترافية",
      subtitleEn: "Become a certified project management professional",
      introEn: "Intensive preparation aligned to the PMP exam content outline in PMI.",
      outline: [
        { day: 1, title: "People", topics: ["Team leadership", "Conflict resolution", "Communication"] },
        { day: 2, title: "Process", topics: ["Integration", "Scope and schedule", "Risk variance"] },
      ],
    },
    {
      slug: "hr-strategic-talent-management",
      code: "HR1",
      cat: "human-resource-management",
      titleEn: "Strategic Talent Management and HR Excellence",
      titleAr: "الإدارة الاستراتيجية للمواهب وتميز الموارد البشرية",
      subtitleEn: "Align talent with organisational strategy",
      introEn: "Design workforce strategies that attract, develop and retain top talent.",
      outline: [
        { day: 1, title: "HR Strategy", topics: ["Workforce planning", "Competency modelling", "HR analytics"] },
        { day: 2, title: "Talent Lifecycle", topics: ["Recruitment", "Learning and development", "Succession"] },
      ],
    },
    {
      slug: "nosa-health-safety-environment-leadership",
      code: "HSE1",
      cat: "health-safety-environment",
      titleEn: "NEBOSH & HSE Leadership Essentials",
      titleAr: "أساسيات القيادة السلامة والصحة المهنية",
      subtitleEn: "Develop a robust safety culture and compliance",
      introEn: "Covers the leadership principles and practices behind a world-class safety culture.",
      outline: [
        { day: 1, title: "Safety Leadership", topics: ["Safety culture", "Leadership commitment", "Risk assessment"] },
        { day: 2, title: "Compliance", topics: ["Legislation", "Auditing", "Emergency response"] },
      ],
    },
    {
      slug: "finance-for-non-financial-managers",
      code: "FIN1",
      cat: "finance-budgeting",
      titleEn: "Finance and Budgeting for Non-Financial Managers",
      titleAr: "المالية والميزانية لغير الماليين",
      subtitleEn: "Master the financial tools every manager needs",
      introEn: "Understand key financial statements, budgeting and cost control without jargon.",
      outline: [
        { day: 1, title: "Financial Foundations", topics: ["Profit and loss", "Cash flow", "Balance sheet"] },
        { day: 2, title: "Budgeting", topics: ["Budgeting techniques", "Variance analysis", "Cost control"] },
      ],
    },
    {
      slug: "strategic-sales-and-marketing-management",
      code: "SM1",
      cat: "sales-marketing",
      titleEn: "Strategic Sales and Marketing Management",
      titleAr: "الإدارة الاستراتيجية للمبيعات والتسويق",
      subtitleEn: "Grow revenue with customer-centric strategy",
      introEn: "Combine brand growth and pipeline management for sustained revenue.",
      outline: [
        { day: 1, title: "Marketing", topics: ["Segmentation", "Positioning", "Digital channels"] },
        { day: 2, title: "Sales", topics: ["Sales pipeline", "Account management", "Negotiation"] },
      ],
    },
    {
      slug: "operational-excellence-and-process-improvement",
      code: "OP1",
      cat: "operational-excellence",
      titleEn: "Operational Excellence and Process Improvement",
      titleAr: "التميز التشغيلي وتحسين العمليات",
      subtitleEn: "Eliminate waste and deliver continuous improvement",
      introEn: "Practical Lean and Six Sigma tools to transform operational performance.",
      outline: [
        { day: 1, title: "Lean", topics: ["Value stream mapping", "Waste", "55"] },
        { day: 2, title: "Six Sigma", topics: ["DMAIC", "Process control", "Root cause"] },
      ],
    },
    {
      slug: "facilities-management-strategy",
      code: "FM1",
      cat: "facilities-management",
      titleEn: "Facilities Management and Maintenance Strategy",
      titleAr: "استراتيجية إدارة المرافق والصيانة",
      subtitleEn: "Optimise your built environment and services",
      introEn: "Deliver high-performance facilities aligned to organisational objectives.",
      outline: [
        { day: 1, title: "FM Strategy", topics: ["Facility lifecycle", "Space planning", "Energy efficiency"] },
        { day: 2, title: "Maintenance", topics: ["Maintenance strategies", "Outsourcing", "Performance"] },
      ],
    },
    {
      slug: "energy-efficiency-and-renewables-management",
      code: "EN1",
      cat: "energy-utilities",
      titleEn: "Energy Efficiency and Renewables Management",
      titleAr: "إدارة كفاءة الطاقة والطاقة المتجددة",
      subtitleEn: "Design and manage sustainable energy programmes",
      introEn: "Practical frameworks for energy audits, efficiency savings and renewables rollout.",
      outline: [
        { day: 1, title: "Energy Markets", topics: ["Energy economics", "Efficiency audits", "Net zero"] },
        { day: 2, title: "Renewables", topics: ["Solar and wind", "Storage", "Project finance"] },
      ],
    },
    {
      slug: "oil-gas-and-petrochemicals-management",
      code: "OG1",
      cat: "oil-gas-petrochemicals",
      titleEn: "Oil, Gas and Petrochemicals Management",
      titleAr: "إدارة قطاع النفط والغاز والبتروكيماويات",
      subtitleEn: "Master the upstream and downstream value chain",
      introEn: "An end-to-end view of the oil, gas and petrochemical industry and its key drivers.",
      outline: [
        { day: 1, title: "Upstream", topics: ["Exploration and production", "Cost control", "HSE"] },
        { day: 2, title: "Downstream", topics: ["Refining", "Petrochemicals", "Trading and logistics"] },
      ],
    },
    {
      slug: "banking-and-financial-services-excellence",
      code: "BN1",
      cat: "banking-and-financial-services",
      titleEn: "Banking and Financial Services Excellence",
      titleAr: "تميز الخدمات المصرفية والمالية",
      subtitleEn: "Stay ahead in a transforming finance sector",
      introEn: "Explore modern banking, risk and digital financial services for the sector professional.",
      outline: [
        { day: 1, title: "Banking", topics: ["Retail and corporate", "Risk", "Lending"] },
        { day: 2, title: "Digital Finance", topics: ["Fintech", "Regulation", "Customer experience"] },
      ],
    },
  ];

  for (const c of additionalCourses) {
    const course = await prisma.course.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        slug: c.slug,
        code: c.code,
        titleEn: c.titleEn,
        titleAr: c.titleAr,
        subtitleEn: c.subtitleEn,
        introEn: c.introEn,
        badgeEn: "An Interactive 5-Day Training Course",
        badgeAr: "دورة تدريبية تفاعلية مدتها 5 أيام",
        durationDays: 5,
        categoryId: categoryIds[c.cat],
        featured: true,
        objectivesEn: "- Apply core frameworks confidently\n- Support your organisation's goals",
        methodologyEn: "Interactive lectures, group exercises and case studies.",
        targetAudienceEn: "Professionals and managers seeking to advance their expertise.",
        dayOutlineEn: c.outline as object,
      },
    });
    await prisma.schedule.createMany({
      data: [
        { courseId: course.id, venueId: venueIds["dubai-uae"], startDate: new Date("2026-09-07"), endDate: new Date("2026-09-11"), fee: 5950 },
        { courseId: course.id, venueId: venueIds["london-uk"], startDate: new Date("2026-11-09"), endDate: new Date("2026-11-13"), fee: 5950 },
      ],
      skipDuplicates: true,
    });
  }

  // ---------------------------------------------------------------
  // Testimonials
  // ---------------------------------------------------------------
  const testimonials = [
    { textEn: "An outstanding course that immediately improved our processes.", textAr: "دورة رائعة حسّنت عملياتنا فوراً.", author: "Sarah M.", company: "Energy Co." },
    { textEn: "The trainer was world-class and the content was highly relevant.", textAr: "المدرب كان من الطراز العالمي والمحتوى شديد الصلة.", author: "John K.", company: "Govt Sector" },
    { textEn: "I recommend these programmes to any ambitious professional.", textAr: "أنصح بهذه البرامج لأي محترف طموح.", author: "Aisha R.", company: "Banking" },
  ];
  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { author: t.author } });
    if (!existing) {
      await prisma.testimonial.create({ data: { textEn: t.textEn, textAr: t.textAr, author: t.author, company: t.company, featured: true, sort: 1 } });
    }
  }

  // ---------------------------------------------------------------
  // FAQs
  // ---------------------------------------------------------------
  const faqs = [
    { q: "Do I receive a certificate after the course?", a: "Yes, all participants receive a certificate of completion. CPD and other accredited credits are noted in each course brochure." },
    { q: "Can the course be delivered at my company site?", a: "Yes, all our courses are available in-house for teams and organisations at your preferred location." },
    { q: "Are online sessions available?", a: "Many courses offer a flexible online option delivered by the same expert trainers." },
    { q: "How do I register for a course?", a: "Simply fill the registration form on the course page and our team will contact you to confirm the details." },
  ];
  for (const f of faqs) {
    const existing = await prisma.faq.findFirst({ where: { questionEn: f.q } });
    if (!existing) {
      await prisma.faq.create({ data: { questionEn: f.q, answerEn: f.a, categoryId: categoryIds["management-leadership"], sort: 1 } });
    }
  }

  // ---------------------------------------------------------------
  // Articles
  // ---------------------------------------------------------------
  const articles = [
    {
      slug: "leading-through-change",
      titleEn: "Leading Through Change in the Modern Workplace",
      excerptEn: "Practical strategies for guiding teams through transformation.",
      bodyEn: "In fast-moving industries change is constant. This article explores proven frameworks.",
    },
    {
      slug: "ai-developing-leaders",
      titleEn: "Developing Future-Ready Leaders",
      excerptEn: "Why soft skills will define tomorrow's leadership.",
      bodyEn: "Technical skills get you hired; leadership capability gets you promoted.",
    },
    {
      slug: "sustainable-hse-culture",
      titleEn: "Building a Sustainable HSE Culture",
      excerptEn: "Embedding safety into everyday decision making.",
      bodyEn: "Safety culture is built on leadership commitment and continuous learning.",
    },
  ];
  for (const a of articles) {
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: {},
      create: { slug: a.slug, titleEn: a.titleEn, excerptEn: a.excerptEn, bodyEn: a.bodyEn, status: "published", type: "article" },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());