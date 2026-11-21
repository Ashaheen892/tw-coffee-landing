const SPEC = {
  schemeMode: "field",
  hasTop: false,
  waBg: "#e08b3f",
  waInk: "#1c140e",
  topBg: "#1c140e",
  topInk: "#f6efe6",
  waMessage: ["أبي أطلب تحميصة هذا الأسبوع", "I want this week's roast"],
  topLabel: ["أعلى", "Top"],
  phone: "920008812",
  email: "hello@saji-tech.com",
  partnerMark: true,
  stat: {
    key: "9b4cae02-f39d-4ab8-8fc9-c7e1a3df8190",
    kicker: ["المحمصة", "The roastery"],
    title: ["أرقام التحميص", "Roast numbers"],
    items: [
      [["٢٤ ساعة", "24 hours"], ["من التحميص إلى الكيس", "From roast to bag"]],
      [["٦ مناشئ", "6 origins"], ["في قائمة الأسبوع", "On this week's list"]],
      [["١٥٠ ر.س", "SAR 150"], ["حد الشحن المجاني", "Free shipping threshold"]],
    ],
  },
  brand: {
    key: "ac5dbf13-04ae-4bc9-9ada-d8f2b4e092a1",
    kicker: ["المنشأ", "Origin"],
    title: ["ماركات البن", "Coffee lots"],
    items: [
      [["إثيوبيا", "Ethiopia"], ["يقري شيف", "Yirgacheffe"]],
      [["كولومبيا", "Colombia"], ["هويلا", "Huila"]],
      [["البرازيل", "Brazil"], ["سيررادو", "Cerrado"]],
      [["كينيا", "Kenya"], ["غسل مزدوج", "Double washed"]],
    ],
  },
  partner: {
    key: "bd6ec024-15bf-4cda-8beb-e9a3c5f1a3b2",
    kicker: ["التوريد", "Supply"],
    title: ["شركاء النجاح", "Partners"],
    items: [
      [["٢٤", "24"], ["محمصة الملقا", "Al Malqa roastery"], ["التحميص الأسبوعي", "The weekly roast"]],
      [["١٢", "12"], ["مقهى الورشة", "Workshop cafe"], ["تذوق الدفعة", "Batch tasting"]],
      [["٠٨", "08"], ["موزع الشرقية", "Eastern distributor"], ["الشحن السريع", "Fast shipping"]],
    ],
  },
  contact: {
    key: "ce7fd135-26c0-4deb-9cfc-fab4d602b4c3",
    kicker: ["الطلب", "The order"],
    title: ["تواصل سريع", "Quick contact"],
    text: ["التحميص يبدأ بعد تأكيد الطلب. اسأل عن درجة الطحن قبل الشحن.", "Roasting starts after the order is confirmed. Ask about the grind before shipping."],
    phoneText: ["اتصال بالمحمصة", "Call the roastery"],
    waText: ["اطلب التحميصة", "Order the roast"],
  },
};

export function applyLandingExtras(ctx) {
  const { components, catalog, templates, L, text, color, sw, drop, line, collection, image, url, scheme, KEY } = ctx;
  const spec = SPEC;
  const footer = components.find((item) => item.name === "page-footer");
  if (footer && !footer.fields.some((field) => field.id === "show_whatsapp")) {
    const sides = [["start", "بداية السطر", KEY.dockStart], ["end", "نهاية السطر", KEY.dockEnd]];
    const dock = [
      line("dock-line"),
      sw("show_whatsapp", "زر واتساب ثابت", true, "يبقى ظاهراً أثناء تمرير الصفحة."),
      text("whatsapp_number", "رقم واتساب", "201153958512", { multilang: false, desc: "بالصيغة الدولية بدون + أو مسافات." }),
      text("whatsapp_message", "رسالة واتساب الجاهزة", L(...spec.waMessage)),
      color("whatsapp_bg", "خلفية زر واتساب", spec.waBg),
      color("whatsapp_ink", "لون أيقونة واتساب", spec.waInk),
      drop("whatsapp_side", "جهة زر واتساب", sides, "start", "إذا اخترت الجهة نفسها لزر الرجوع، يُرفع واتساب فوقه حتى لا يتداخلا."),
    ];
    if (!spec.hasTop) {
      dock.push(
        sw("show_top", "زر العودة للأعلى", true, "يبقى ثابتاً أثناء التمرير، في الجهة المقابلة لواتساب."),
        text("top_label", "نص زر العودة", L(...spec.topLabel), { max: 24 }),
      );
    }
    dock.push(
      color("top_bg", "خلفية زر العودة", spec.topBg),
      color("top_ink", "لون زر العودة", spec.topInk),
      drop("top_side", "جهة زر العودة", sides, "end", "الافتراضي نهاية السطر، مقابل زر واتساب."),
    );
    const at = footer.fields.findIndex((field) => field.id === "bg_color");
    footer.fields.splice(at < 0 ? footer.fields.length : at, 0, ...dock);
  }

  if (!components.some((item) => item.name === "stat-strip")) {
    const made = blocks({ L, text, color, collection, image, url, scheme, spec });
    const index = components.findIndex((item) => item.name === "page-footer");
    components.splice(index < 0 ? components.length : index, 0, ...made);
    if (spec.schemeMode === "after") made.forEach((item) => item.fields.push(scheme()));
  }

  if (Array.isArray(catalog)) {
    const names = ["stat-strip", "brand-row", "partner-row", "quick-contact"];
    const at = catalog.indexOf("page-footer");
    names.slice().reverse().forEach((name) => {
      if (!catalog.includes(name)) catalog.splice(at < 0 ? catalog.length : at, 0, name);
    });
  }

  const required = ["stat-strip", "brand-row", "partner-row", "quick-contact"];
  for (const template of templates) {
    const next = [];
    let added = false;
    for (const entry of template.order) {
      const name = Array.isArray(entry) ? entry[0] : entry;
      if (name === "page-footer" && !added) {
        next.push(...required);
        added = true;
      }
      next.push(entry);
    }
    if (!added) next.push(...required);
    template.order = next;
  }
}

function blocks({ L, text, color, collection, image, url, scheme, spec }) {
  const end = (fields) => {
    fields.push(color("bg_color", "لون الخلفية"));
    if (spec.schemeMode === "field") fields.push(scheme());
    return fields;
  };
  const partnerFields = [
    ...(spec.partnerMark ? [text("mark", "العلامة", L("٢٤", "24"))] : []),
    text("name", "الاسم", L("الشريك", "Partner")),
    text("note", "السطر", L("الدور", "Role")),
  ];
  return [
    {
      title: "إحصائيات",
      icon: "sicon-calculator",
      name: "stat-strip",
      key: spec.stat.key,
      image: "",
      props: { "min-height": "180px" },
      fields: end([
        text("kicker", "السطر الصغير", L(...spec.stat.kicker)),
        text("title", "العنوان", L(...spec.stat.title)),
        text("subtitle", "السطر تحت العنوان", L("", "")),
        collection("items", "رقم", [
          text("value", "الرقم", L("١٢", "12")),
          text("label", "الوصف", L("وصف الرقم", "What the number means")),
        ], spec.stat.items.map(([value, label]) => ({ value: L(...value), label: L(...label) })), 1, 4),
      ]),
    },
    {
      title: "الماركات التجارية",
      icon: "sicon-star2",
      name: "brand-row",
      key: spec.brand.key,
      image: "",
      props: { "min-height": "160px" },
      fields: end([
        text("kicker", "السطر الصغير", L(...spec.brand.kicker)),
        text("title", "العنوان", L(...spec.brand.title)),
        text("subtitle", "السطر تحت العنوان", L("", "")),
        collection("items", "ماركة", [
          image("image", "الشعار", "اختياري. المقاس المقترح 240×80 بكسل بخلفية شفافة."),
          text("name", "الاسم", L("الماركة", "Brand")),
          text("note", "السطر", L("الخامة", "Material")),
          url("url", "الرابط", ""),
        ], spec.brand.items.map(([name, note]) => ({ image: "", name: L(...name), note: L(...note), url: "" })), 1, 8),
      ]),
    },
    {
      title: "شركاء النجاح",
      icon: "sicon-store",
      name: "partner-row",
      key: spec.partner.key,
      image: "",
      props: { "min-height": "180px" },
      fields: end([
        text("kicker", "السطر الصغير", L(...spec.partner.kicker)),
        text("title", "العنوان", L(...spec.partner.title)),
        text("subtitle", "السطر تحت العنوان", L("", "")),
        collection("items", "شريك", partnerFields, spec.partner.items.map((row) => (
          spec.partnerMark
            ? { mark: L(...row[0]), name: L(...row[1]), note: L(...row[2]) }
            : { name: L(...row[0]), note: L(...row[1]) }
        )), 1, 8),
      ]),
    },
    {
      title: "التواصل السريع",
      icon: "sicon-link",
      name: "quick-contact",
      key: spec.contact.key,
      image: "",
      props: { "min-height": "160px" },
      fields: end([
        text("kicker", "السطر الصغير", L(...spec.contact.kicker)),
        text("title", "العنوان", L(...spec.contact.title)),
        text("subtitle", "السطر تحت العنوان", L(...(spec.contact.text || ["", ""]))),
        text("text", "جملة القسم", L(...(spec.contact.text || ["", ""]))),
        text("phone_label", "عنوان الاتصال", L("اتصال", "Call")),
        text("phone", "رقم الاتصال", spec.phone, { multilang: false }),
        text("phone_text", "نص الاتصال", L(...spec.contact.phoneText)),
        text("whatsapp_label", "عنوان واتساب", L("واتساب", "WhatsApp")),
        text("whatsapp", "رقم واتساب", "201153958512", { multilang: false }),
        text("whatsapp_text", "نص واتساب", L(...spec.contact.waText)),
        text("whatsapp_message", "الرسالة الجاهزة", L(...spec.waMessage)),
        text("email_label", "عنوان البريد", L("البريد", "Email")),
        text("email", "البريد", spec.email, { multilang: false }),
      ]),
    },
  ];
}
