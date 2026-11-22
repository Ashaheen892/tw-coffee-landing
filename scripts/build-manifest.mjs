import fs from "node:fs";
import { applyLandingExtras } from "./landing-extras.mjs";

const L = (ar, en) => ({ ar, en });
const text = (id, label, value, o = {}) => ({
  id,
  type: "string",
  format: o.format || "text",
  label,
  icon: o.icon || "sicon-format-text-alt",
  multilanguage: o.multilang !== false,
  required: false,
  description: o.desc ?? null,
  minLength: 0,
  maxLength: o.max ?? (o.format === "textarea" ? 800 : 180),
  value,
});
const area = (id, label, value, desc = null) => text(id, label, value, { format: "textarea", icon: "sicon-paragraph", desc, max: 800 });
const plain = (id, label, value, desc = null) => text(id, label, value, { multilang: false, desc });
const color = (id, label, value = "") => ({
  id, type: "string", format: "color", inputType: "color", label, icon: "sicon-format-fill", required: false, description: null, value,
});
const sw = (id, label, value, desc = null) => ({
  id, type: "boolean", format: "switch", label, icon: "sicon-toggle-off", required: false, description: desc, value, selected: value,
});
const image = (id, label, desc, value = "") => ({
  id, type: "string", format: "image", label, icon: "sicon-image", required: false, description: desc, value,
});
const url = (id, label, value = "", desc = null) => ({
  id,
  type: "string",
  format: "text",
  label,
  icon: "sicon-link",
  multilanguage: false,
  required: false,
  description: desc || "رابط داخل الصفحة مثل #cf-order، أو رابط كامل يبدأ بـ https.",
  minLength: 0,
  maxLength: 500,
  value,
});
const line = (id) => ({ id, type: "static", format: "line" });
const num = (id, label, value, min, max, desc = null) => ({
  id, type: "number", format: "number", inputType: "number", label, icon: "sicon-calculator",
  required: false, description: desc, minimum: min, maximum: max, value,
});
const icon = (id, label, value) => ({
  id, type: "string", format: "icon", label, icon: "sicon-star2", required: false, class: "form--inline", value,
});
const collection = (id, itemLabel, fields, value, min, max) => ({
  id, type: "collection", format: "collection", required: min > 0, minLength: min, maxLength: max,
  item_label: itemLabel,
  fields: fields.map((field) => ({ ...field, id: String(field.id).includes(".") ? field.id : `${id}.${field.id}` })),
  value: value.map((row) => {
    const out = {};
    for (const [key, val] of Object.entries(row)) out[key.startsWith(`${id}.`) ? key : `${id}.${key}`] = val;
    return out;
  }),
});
const buyHint = "في صفحة منتج يفتح الشراء السريع. في صفحة العروض يتبع رابط زر الصفحة، أو هذا الرابط إن وضعته.";
const KEY = {
  schemeAuto: "aba537d7-7975-4cf9-9204-144fe169765c",
  schemeLight: "eddf3f7a-ea54-41a0-a9d4-160e3f016214",
  schemeDark: "6dc412cc-3bb0-4cc2-bf5b-ef4b9bb137f6",
  modeLight: "75b8c3a6-7078-4420-af7e-8728ca4b243a",
  modeDark: "e79765e5-ebc1-4401-ab5a-7e274858f318",
  modeSystem: "d27e4634-80c1-44c7-b243-6def430fbb23",
  stars5: "ea85446c-432c-4683-b6dc-a5bf9b65850e",
  stars4: "d0743eb2-4606-4f44-9008-5b200b25469b",
  stars3: "57ad9885-8a04-431e-b60c-d141d81fa904",
  hot1: "56efce5c-1217-4692-a04c-4bfc83930a5f",
  hot2: "2efb2c61-d5a2-468c-ae63-5036d4e83b84",
  hot3: "759e26c1-c256-4a18-a7c0-c308e989f89e",
  annMove: "a7e35c14-8f62-4d0e-9b59-6c2f1a4e8d05",
  annStill: "b8f46d25-9073-4e1f-8c60-7d3a2b5f9e16",
  dockStart: "e8a2c5f6-7190-4db2-9e45-6f708192a3b4",
  dockEnd: "f9b3d607-82a1-4ec3-8f56-708192a3b4c5",
};
const opt = (value, label, key) => ({ label, value, key });
const picked = (value, label, key) => [opt(value, label, key)];
const drop = (id, label, options, selected, desc = null) => {
  const opts = options.map(([value, name, key]) => opt(value, name, key));
  const choice = opts.filter((item) => item.value === selected);
  return {
    id, type: "items", format: "dropdown-list", source: "Manual", label, icon: "sicon-list",
    required: false, description: desc, options: opts, selected: choice, value: choice,
  };
};
const scheme = (selected = "auto") => drop(
  "color_scheme",
  "وضع الألوان",
  [["auto", "حسب رأس الصفحة", KEY.schemeAuto], ["light", "فاتح دائماً", KEY.schemeLight], ["dark", "داكن دائماً", KEY.schemeDark]],
  selected,
  "حسب رأس الصفحة يتبع زر الفاتح والداكن. الفاتح أو الداكن يثبت القسم ولا يتأثر بالزر.",
);

const components = [
  {
    title: "رأس المحمصة",
    icon: "sicon-store",
    name: "roast-bar",
    key: "4f37e5fd-c208-493e-8674-d1a8eb2baf2e",
    image: "",
    props: { "min-height": "74px" },
    fields: [
      collection("bars", "شريط", [
        text("text", "نص الشريط", L("", ""), { max: 140 }),
        drop("media", "بجانب النص", [["none", "بدون", "f1864d11-6656-439b-82ca-8fbd737e697a"], ["icon", "أيقونة", "2ea7f017-feb1-4891-8913-1ad51a055883"], ["image", "صورة مصغرة", "bc917494-2524-4d34-8fc7-932a86d98df3"]], "icon", "اختر أيقونة من مكتبة سلة أو صورة صغيرة لمنتج أو شعار."),
        { ...icon("icon", "الأيقونة", "sicon-megaphone"), class: undefined },
        image("image", "الصورة المصغرة", "المقاس المقترح 112×112 بكسل، مربعة، تُقص دائرة، PNG أو WebP بخلفية شفافة أو صورة منتج. تظهر دائرة بقطر ٢٨ بكسل، فاجعل المهم في وسط الصورة. تُستخدم عند اختيار «صورة مصغرة» في «بجانب النص»."),
        drop("motion", "حركة الشريط", [["right", "متحرك لليمين →", "73eb7d08-dbed-4436-bfe3-ac6a021fbec9"], ["left", "متحرك لليسار ←", "fa90507b-c93e-4f4c-ae56-6386f82f1692"], ["still", "ثابت", "7ef720c1-214f-4928-afc4-af8a478f5103"]], "right", "المتحرك يمرّ الجملة باستمرار في الاتجاه المختار ويتوقف عند مرور المؤشر. الثابت يُبقيها في الوسط."),
        url("link", "رابط الشريط", "", "اختياري. يفتح عند الضغط على الشريط."),
        color("bg", "خلفية هذا الشريط"),
        color("ink", "كتابة هذا الشريط"),
      ], [
        { text: L("تحميص أسبوعي كل أحد", "Roasted every Sunday"), media: [{ label: "أيقونة", value: "icon", key: "2ea7f017-feb1-4891-8913-1ad51a055883" }], icon: "sicon-time", image: "", motion: [{ label: "متحرك لليمين →", value: "right", key: "73eb7d08-dbed-4436-bfe3-ac6a021fbec9" }], link: "", bg: "", ink: "" },
        { text: L("وصل محصول إثيوبيا يرقاشيفي", "Ethiopia Yirgacheffe has landed"), media: [{ label: "صورة مصغرة", value: "image", key: "bc917494-2524-4d34-8fc7-932a86d98df3" }], icon: "sicon-megaphone", image: "https://images.pexels.com/photos/22938072/pexels-photo-22938072.jpeg?auto=compress&cs=tinysrgb&w=200", motion: [{ label: "ثابت", value: "still", key: "7ef720c1-214f-4928-afc4-af8a478f5103" }], link: "", bg: "", ink: "" },
      ], 0, 5),
      drop("bars_layout", "عرض الأشرطة", [["stack", "كل شريط في سطر", "135be97c-6c34-4adb-8bb3-cca3c25531ca"], ["rotate", "شريط واحد يتبدل", "a2371cd2-c830-4b2c-8f9b-17492c4e5cb1"]], "stack", "كل شريط في سطر يعرض الأشرطة فوق بعضها. شريط واحد يتبدل يعرض شريطاً كل ٤ ثوانٍ ويتوقف عند مرور المؤشر."),
      line("pb-announce"),
      image("logo", "شعار", "اتركه فارغاً ليظهر اسم المجموعة. المقاس المقترح 280×80 بكسل."),
      image("logo_dark", "شعار للوضع الداكن", "يظهر عندما تكون الصفحة داكنة. بدونه يُستخدم الشعار الأساسي. المقاس المقترح 280×80 بكسل."),
      text("brand", "اسم المجموعة", L("مجموعة القهوة", "Coffee Group")),
      text("mark", "سطر صغير تحت الاسم", L("محمصة اختصاص", "Specialty roast")),
      url("home_url", "رابط الشعار", "#cf-cover"),
      line("pb-brand"),
      collection("links", "رابط", [
        text("label", "النص", L("المناشئ", "Origins")),
        url("url", "الرابط", "#cf-origin"),
      ], [
        { label: L("الغلاف", "Cover"), url: "#cf-cover" },
        { label: L("المناشئ", "Origins"), url: "#cf-origin" },
        { label: L("التحميص", "Roast"), url: "#cf-roast" },
        { label: L("الحاسبة", "Brew"), url: "#cf-brew" },
        { label: L("الطلب", "Order"), url: "#cf-order" },
      ], 0, 6),
      line("pb-links"),
      sw("use_kit_font", "خط الصفحة", false, "الافتراضي خط المتجر من سلة، فعّله فقط إذا أردت خط نوتو كوفي وآي بي إم بلكس."),
      sw("sticky", "تثبيت الرأس عند التمرير", true),
      sw("show_mode_toggle", "زر الفاتح والداكن", true, "أيقونة تتبدل بين القمر والشمس، وتبدّل الأقسام المضبوطة على حسب الصفحة."),
      drop("default_mode", "وضع الصفحة عند الفتح", [["light", "فاتح", KEY.modeLight], ["dark", "داكن", KEY.modeDark], ["system", "حسب جهاز الزائر", KEY.modeSystem]], "dark"),
      color("bg_color", "لون الخلفية"),
      scheme(),
    ],
  },
  {
    title: "غلاف التحميص",
    icon: "sicon-image",
    name: "roast-cover",
    key: "9350ec31-b313-4978-b3a0-4531cdb9b773",
    image: "",
    props: { "min-height": "640px" },
    fields: [
      text("stamp", "الختم", L("نحمّص الاثنين والخميس · الرياض", "Roasted Monday and Thursday · Riyadh")),
      text("title_before", "سطر العنوان الأول", L("قهوة تُحمَّص", "Coffee roasted")),
      text("title_mid", "بداية السطر الثاني", L("قبل", "within")),
      text("title_accent", "الكلمة المميزة", L("٢٤ ساعة", "24 hours")),
      text("title_after", "السطر الأخير", L("من وصولها", "of arrival")),
      area("text", "النص", L("لا مخزون راكد ولا أكياس عمرها شهور. نطحنها عند الطلب أو نُرسلها حبّاً كاملاً، ونكتب تاريخ التحميص على الكيس.", "No stale stock and no bags that sat for months. We grind to order or send it whole, and write the roast date on the bag.")),
      line("cv-cta"),
      text("primary_label", "نص الزر", L("اطلب هذه الدفعة", "Order this batch")),
      url("primary_url", "رابط الزر", "", buyHint),
      text("secondary_label", "نص الزر الثاني", L("الباقات", "Plans")),
      url("secondary_url", "رابط الزر الثاني", "#cf-plans"),
      collection("stats", "رقم", [
        text("label", "التسمية", L("الدفعة الحالية", "Current batch")),
        text("value", "القيمة", L("٤ مناشئ", "4 origins")),
      ], [
        { label: L("الدفعة الحالية", "Current batch"), value: L("١٤٤٧/٠٥/١١", "11/05") },
        { label: L("المحصول", "Crop"), value: L("٤ مناشئ", "4 origins") },
        { label: L("الشحن", "Shipping"), value: L("٤٨ ساعة", "48 hours") },
        { label: L("التقييم", "Rating"), value: L("٤٫٨ / ٥", "4.8 / 5") },
      ], 0, 4),
      color("bg_color", "لون الخلفية"),
      scheme(),
    ],
  },
  {
    title: "قائمة المناشئ",
    icon: "sicon-list",
    name: "origin-list",
    key: "5f3073a6-e539-4df9-ae29-15bec1807eb1",
    image: "",
    props: { "min-height": "560px" },
    fields: [
      plain("index_label", "رقم القسم", "٠٢"),
      text("kicker", "سطر صغير", L("المنشأ", "Origin")),
      text("title", "العنوان", L("أربع مزارع نعرف أصحابها بالاسم", "Four farms we know by name")),
      area("text", "النص", L("اختر منشأً من القائمة لتقرأ ملفه. الدرجة هي تقييم الكوب في جلسة التحكيم الأخيرة.", "Pick an origin to read its card. The score is the last cupping.")),
      text("button_label", "نص الزر", L("اطلب هذا المنشأ", "Order this origin")),
      collection("items", "منشأ", [
        text("name", "الاسم", L("إثيوبيا — يرقاشيفي", "Ethiopia — Yirgacheffe")),
        text("note", "سطر العملية", L("غسيل · ارتفاع ٢٬٠٥٠ م", "Washed · 2,050 m")),
        text("score", "درجة الكوب", L("٨٧٫٥", "87.5")),
        text("price_label", "سعر العرض", L("٨٥ ر.س / ٢٥٠غ", "SAR 85 / 250g")),
        plain("price", "سعر ٢٥٠ غ للحسبة", "85", "رقم فقط، يُستخدم في إجمالي الطلب."),
        area("story", "الملف", L("حموضة ليمونية واضحة، وياسمين في الأنف.", "Clear lemon acidity, with jasmine on the nose.")),
        text("chips", "النكهات", L("ياسمين، ليمون، شاي أسود", "Jasmine, lemon, black tea"), { desc: "افصل النكهات بفاصلة." }),
      ], [
        { name: L("إثيوبيا — يرقاشيفي", "Ethiopia — Yirgacheffe"), note: L("غسيل · ارتفاع ٢٬٠٥٠ م", "Washed · 2,050 m"), score: L("٨٧٫٥", "87.5"), price_label: L("٨٥ ر.س / ٢٥٠غ", "SAR 85 / 250g"), price: "85", story: L("حموضة ليمونية واضحة في البداية، وياسمين في الأنف، ونهاية شاي أسود خفيفة.", "Lemon acidity up front, jasmine on the nose, and a light black-tea finish."), chips: L("ياسمين، ليمون، شاي أسود", "Jasmine, lemon, black tea") },
        { name: L("كولومبيا — هويلا", "Colombia — Huila"), note: L("عسلي · ارتفاع ١٬٧٠٠ م", "Honey · 1,700 m"), score: L("٨٥٫٠", "85.0"), price_label: L("٧٢ ر.س / ٢٥٠غ", "SAR 72 / 250g"), price: "72", story: L("كراميل وتفاح أحمر وقوام دهني متوسط. منشأ يُرضي الضيوف.", "Caramel, red apple, and a medium body. An origin guests accept easily."), chips: L("كراميل، تفاح أحمر، بندق", "Caramel, red apple, hazelnut") },
        { name: L("كينيا — نييري", "Kenya — Nyeri"), note: L("غسيل مزدوج · AA", "Double washed · AA"), score: L("٨٨٫٢", "88.2"), price_label: L("٩٨ ر.س / ٢٥٠غ", "SAR 98 / 250g"), price: "98", story: L("حموضة حادّة كالكشمش الأسود مع حلاوة طماطم مجفّفة.", "Sharp blackcurrant acidity with dried-tomato sweetness."), chips: L("كشمش أسود، طماطم مجفّفة، جريب فروت", "Blackcurrant, dried tomato, grapefruit") },
        { name: L("اليمن — حراز", "Yemen — Haraz"), note: L("طبيعي · تجفيف على السطوح", "Natural · dried on rooftops"), score: L("٨٩٫٠", "89.0"), price_label: L("١٤٥ ر.س / ٢٥٠غ", "SAR 145 / 250g"), price: "145", story: L("توابل وزبيب وكاكاو داكن، بقوام ثقيل. كمية محدودة من موسم واحد.", "Spice, raisin, and dark cocoa, with a heavy body. One short season."), chips: L("زبيب، كاكاو داكن، قرفة", "Raisin, dark cocoa, cinnamon") },
      ], 1, 6),
      color("bg_color", "لون الخلفية"),
      scheme(),
    ],
  },
  {
    title: "مقياس التحميص",
    icon: "sicon-settings",
    name: "roast-dial",
    key: "33440c2e-b671-4371-9bd6-c2bc8a34db0a",
    image: "",
    props: { "min-height": "520px" },
    fields: [
      plain("index_label", "رقم القسم", "٠٣"),
      text("kicker", "سطر صغير", L("الدرجة", "Roast")),
      text("title", "العنوان", L("حرّك المقياس وشاهد الكوب يتغيّر", "Move the scale and watch the cup change")),
      area("text", "النص", L("كل درجة تُغيّر الحموضة والقوام والحلاوة. نحمّص على الدرجة التي تختارها يوم طلبك.", "Each step changes acidity, body, and sweetness. We roast to the step you pick.")),
      text("acid_label", "اسم الشريط الأول", L("الحموضة", "Acidity")),
      text("body_label", "اسم الشريط الثاني", L("القوام", "Body")),
      text("sweet_label", "اسم الشريط الثالث", L("الحلاوة", "Sweetness")),
      collection("items", "درجة", [
        text("name", "الاسم", L("تحميص فاتح", "Light roast")),
        area("note", "الشرح", L("مناسب للقطرة", "Suited to drip")),
        color("color", "لون الحبة", "#a85f1f"),
        plain("acid", "الحموضة من ١٠٠", "78"),
        plain("body", "القوام من ١٠٠", "42"),
        plain("sweet", "الحلاوة من ١٠٠", "65"),
      ], [
        { name: L("تحميص فاتح جداً", "Very light"), note: L("للتصفية الباردة والـ V60 · أعلى حموضة", "For cold brew and V60 · highest acidity"), color: "#d9b98c", acid: "92", body: "30", sweet: "58" },
        { name: L("تحميص فاتح", "Light"), note: L("مناسب للقطرة والـ V60 · يُبرز نكهات الفاكهة", "For drip and V60 · fruit shows"), color: "#a85f1f", acid: "78", body: "42", sweet: "65" },
        { name: L("تحميص وسط", "Medium"), note: L("الأكثر طلباً · توازن بين الحموضة والقوام", "The usual order · acidity and body in balance"), color: "#6b3410", acid: "58", body: "62", sweet: "80" },
        { name: L("تحميص غامق", "Dark"), note: L("للإسبريسو والحليب · قوام ثقيل وكاكاو", "For espresso and milk · heavy body and cocoa"), color: "#3f1f0a", acid: "34", body: "84", sweet: "72" },
        { name: L("تحميص غامق جداً", "Very dark"), note: L("للقهوة التركية والمزاج التقليدي", "For Turkish coffee and a traditional cup"), color: "#241105", acid: "18", body: "94", sweet: "55" },
      ], 2, 5),
      color("bg_color", "لون الخلفية"),
      scheme(),
    ],
  },
  {
    title: "حاسبة التحضير",
    icon: "sicon-calculator",
    name: "brew-calc",
    key: "62ee1b67-620b-468a-8783-c3c491770035",
    image: "",
    props: { "min-height": "520px" },
    fields: [
      plain("index_label", "رقم القسم", "٠٤"),
      text("kicker", "سطر صغير", L("أداة", "Tool")),
      text("title", "العنوان", L("حاسبة نسبة التحضير", "Brew ratio calculator")),
      text("method_label", "عنوان الطريقة", L("الطريقة", "Method")),
      text("m_v60", "اسم V60", L("V60", "V60")),
      text("m_press", "اسم الفرنش برس", L("فرنش برس", "French press")),
      text("m_drip", "اسم القطرة", L("قطرة", "Drip")),
      text("m_espresso", "اسم الإسبريسو", L("إسبريسو", "Espresso")),
      text("ratio_label", "عنوان النسبة", L("النسبة", "Ratio")),
      text("r_strong", "النسبة المركّزة", L("١:١٤ مركّز", "1:14 strong")),
      text("r_even", "النسبة المتوازنة", L("١:١٦ متوازن", "1:16 even")),
      text("r_light", "النسبة الخفيفة", L("١:١٨ خفيف", "1:18 light")),
      text("dose_label", "عنوان الوزن", L("وزن القهوة", "Coffee weight")),
      num("dose_min", "أقل وزن", 12, 8, 30, "بالغرام."),
      num("dose_max", "أعلى وزن", 40, 20, 80, "بالغرام."),
      text("water_label", "عنوان الماء", L("كمية الماء", "Water")),
      text("cups_label", "عنوان الأكواب", L("عدد الأكواب", "Cups")),
      text("bloom_label", "عنوان الإزهار", L("ماء الإزهار", "Bloom water")),
      text("time_label", "عنوان الزمن", L("الزمن المقترح", "Suggested time")),
      text("temp_label", "عنوان الحرارة", L("درجة الماء", "Water temperature")),
      text("gram_unit", "وحدة الغرام", L("غ", "g")),
      text("ml_unit", "وحدة الملل", L("مل", "ml")),
      text("minutes_unit", "وحدة الدقيقة", L("د", "m")),
      text("seconds_unit", "وحدة الثانية", L("ثانية", "sec")),
      area("hint", "ملاحظة", L("النتيجة تتحدث فوراً. قلّل النسبة إن كان الكوب باهتاً، أو زدها إن كان ثقيلاً.", "The result updates at once. Lower the ratio if the cup is thin, or raise it if it is heavy.")),
      text("button_label", "نص الزر", L("جهّز الكيس بهذه الطريقة", "Prepare the bag this way")),
      color("bg_color", "لون الخلفية"),
      scheme(),
    ],
  },
  {
    title: "جدول الباقات",
    icon: "sicon-list",
    name: "plan-table",
    key: "61af678c-82e0-455c-9ee9-eb2b5b175009",
    image: "",
    props: { "min-height": "480px" },
    fields: [
      plain("index_label", "رقم القسم", "٠٥"),
      text("kicker", "سطر صغير", L("الاشتراك", "Subscription")),
      text("title", "العنوان", L("تصل قبل أن ينتهي كيسك", "It arrives before the bag runs out")),
      text("feature_label", "عنوان عمود الميزة", L("الميزة", "Feature")),
      text("col_a", "العمود الأول", L("شهرية", "Monthly")),
      text("col_b", "العمود الثاني", L("كل أسبوعين", "Every two weeks")),
      text("col_c", "العمود الثالث", L("أسبوعية", "Weekly")),
      drop("hot_column", "العمود المميز", [["1", "الأول", KEY.hot1], ["2", "الثاني", KEY.hot2], ["3", "الثالث", KEY.hot3]], "2"),
      collection("items", "صف", [
        text("feature", "الميزة", L("السعر للكيس", "Price per bag")),
        text("a", "العمود الأول", L("٧٢", "72")),
        text("b", "العمود الثاني", L("٦٦", "66")),
        text("c", "العمود الثالث", L("٥٨", "58")),
      ], [
        { feature: L("السعر للكيس", "Price per bag"), a: L("٧٢", "72"), b: L("٦٦", "66"), c: L("٥٨", "58") },
        { feature: L("الكمية في الإرسالية", "Amount in the shipment"), a: L("٢٥٠ غ", "250 g"), b: L("٥٠٠ غ", "500 g"), c: L("٥٠٠ غ", "500 g") },
        { feature: L("الشحن", "Shipping"), a: L("١٥ ر.س", "SAR 15"), b: L("مجاناً", "Free"), c: L("مجاناً", "Free") },
        { feature: L("تغيير المنشأ في أي وقت", "Change the origin any time"), a: L("✓", "✓"), b: L("✓", "✓"), c: L("✓", "✓") },
        { feature: L("طحن مجاني حسب طريقتك", "Free grind for your method"), a: L("✓", "✓"), b: L("✓", "✓"), c: L("✓", "✓") },
        { feature: L("دفعات تجريبية محدودة", "Limited trial lots"), a: L("—", "—"), b: L("✓", "✓"), c: L("✓", "✓") },
        { feature: L("استشارة تحضير عبر الهاتف", "A brew call"), a: L("—", "—"), b: L("—", "—"), c: L("✓", "✓") },
      ], 1, 8),
      area("note", "ملاحظة تحت الجدول", L("الأسعار بالريال وتشمل الضريبة. يمكنك التجميد أو الإلغاء من حسابك.", "Prices are in riyals and include tax. You can pause or cancel from your account.")),
      text("button_label", "نص الزر", L("اختر الباقة في الطلب", "Choose the plan in the order")),
      color("bg_color", "لون الخلفية"),
      scheme(),
    ],
  },
  {
    title: "عدّة التحضير",
    icon: "sicon-box",
    name: "kit-row",
    key: "7cf8802d-0ae5-4d23-87a6-4496eb0dab15",
    image: "",
    props: { "min-height": "420px" },
    fields: [
      plain("index_label", "رقم القسم", "٠٦"),
      text("kicker", "سطر صغير", L("العدّة", "Kit")),
      text("title", "العنوان", L("ما تحتاجه فعلاً، لا أكثر", "What you actually need")),
      area("text", "النص", L("ثلاث قطع تكفي لتحضير كوب نظيف في المنزل. الباقي يمكن أن ينتظر.", "Three pieces are enough for a clean cup at home. The rest can wait.")),
      text("button_label", "نص الزر", L("أضف العدّة مع الكيس", "Add the kit with the bag")),
      collection("items", "قطعة", [
        text("mark", "رمز", L("⚖", "⚖")),
        text("title", "الاسم", L("ميزان بدقّة ٠٫١", "A 0.1 scale")),
        area("text", "الشرح", L("بدونه أنت تُخمّن.", "Without it you are guessing.")),
        text("price", "السعر", L("١٢٠ ر.س", "SAR 120")),
      ], [
        { mark: L("⚖", "⚖"), title: L("ميزان بدقّة ٠٫١", "A 0.1 scale"), text: L("بدونه أنت تُخمّن. أهم قطعة في القائمة.", "Without it you are guessing. The most useful piece on the list."), price: L("١٢٠ ر.س", "SAR 120") },
        { mark: L("⚙", "⚙"), title: L("مطحنة يدوية بأسنان", "A hand burr grinder"), text: L("الطحن الطازج يفرق أكثر من نوع البن نفسه.", "A fresh grind changes the cup more than the coffee itself."), price: L("٢٨٥ ر.س", "SAR 285") },
        { mark: L("🫖", "🫖"), title: L("غلاية رقبة الإوزة", "A gooseneck kettle"), text: L("تحكّم في مسار الماء، فلا تُغرق الطبقة ولا تجفّفها.", "You steer the water, so the bed is neither flooded nor dry."), price: L("١٩٥ ر.س", "SAR 195") },
        { mark: L("▣", "▣"), title: L("العدّة كاملة", "The full kit"), text: L("الثلاث قطع مع كيس ٢٥٠ غ من اختيارك.", "The three pieces with a 250 g bag of your choice."), price: L("٥٤٥ ر.س بدل ٦٨٥", "SAR 545 instead of 685") },
      ], 1, 6),
      color("bg_color", "لون الخلفية"),
      scheme(),
    ],
  },
  {
    title: "أصوات الزبائن",
    icon: "sicon-star",
    name: "voice-list",
    key: "f3bc7b95-7904-435e-abfe-a203decdeeff",
    image: "",
    props: { "min-height": "420px" },
    fields: [
      plain("index_label", "رقم القسم", "٠٧"),
      text("kicker", "سطر صغير", L("أصوات", "Voices")),
      text("title", "العنوان", L("ماذا قالوا بعد أول كيس", "What they said after the first bag")),
      collection("items", "صوت", [
        text("initial", "الحرف", L("ف", "F")),
        area("quote", "الجملة", L("جاء الكيس محمّصاً قبلها بيوم.", "The bag was roasted the day before.")),
        text("name", "الاسم", L("فيصل العمري", "Faisal Alomari")),
        text("place", "المدينة", L("الرياض", "Riyadh")),
        text("detail", "الصفة", L("مشترك شهري", "Monthly subscriber")),
        drop("stars", "الدرجة من ٥", [["5", "٥", KEY.stars5], ["4", "٤", KEY.stars4], ["3", "٣", KEY.stars3]], "5"),
      ], [
        { initial: L("ف", "F"), quote: L("طلبت الكينيا بدرجة فاتحة وجاء الكيس محمّصاً قبلها بيوم.", "I ordered the Kenya light, and the bag had been roasted the day before."), name: L("فيصل العمري", "Faisal Alomari"), place: L("الرياض", "Riyadh"), detail: L("مشترك شهري", "Monthly subscriber"), stars: picked("5", "٥", KEY.stars5) },
        { initial: L("ر", "R"), quote: L("الحاسبة غيّرت كوبي أكثر من تغيير البن. كنت أستخدم ماءً أكثر من اللازم.", "The calculator changed my cup more than changing the coffee. I had been using too much water."), name: L("ريم السبيعي", "Reem Alsubaie"), place: L("جدة", "Jeddah"), detail: L("أول طلب", "First order"), stars: picked("5", "٥", KEY.stars5) },
        { initial: L("م", "M"), quote: L("اتصلوا لأن المنشأ الذي اخترته نفد، واقترحوا بديلاً مع خصم الفرق.", "They called because my origin had run out, and offered another with the difference off."), name: L("محمد الزهراني", "Mohammed Alzahrani"), place: L("الدمام", "Dammam"), detail: L("مشترك كل أسبوعين", "Every two weeks"), stars: picked("4", "٤", KEY.stars4) },
      ], 1, 6),
      color("bg_color", "لون الخلفية"),
      scheme(),
    ],
  },
  {
    title: "طلب الكيس",
    icon: "sicon-box",
    name: "bag-order",
    key: "2a6b974a-d32d-4c7c-979f-e0210344bcea",
    image: "",
    props: { "min-height": "560px" },
    fields: [
      plain("index_label", "رقم القسم", "٠٨"),
      text("kicker", "سطر صغير", L("الخاتمة", "Close")),
      text("title", "العنوان", L("أرسل لنا اختيارك ونحمّص له وحده", "Send the choice, and we roast it on its own")),
      text("weight_label", "عنوان الحجم", L("حجم الكيس", "Bag size")),
      text("w_250", "حجم ٢٥٠", L("٢٥٠ غ", "250 g")),
      text("w_500", "حجم ٥٠٠", L("٥٠٠ غ", "500 g")),
      text("w_1000", "حجم الكيلو", L("كيلو", "1 kg")),
      text("grind_label", "عنوان الطحن", L("الطحن", "Grind")),
      text("g_whole", "حب كامل", L("حبّ كامل", "Whole bean")),
      text("g_ground", "طحن حسب الطريقة", L("حسب طريقتي", "Ground for my brew")),
      text("total_label", "عنوان الإجمالي", L("الإجمالي", "Total")),
      text("before_label", "عنوان السعر قبل الخصم", L("قبل الخصم", "Before discount")),
      text("currency", "العملة", L("ر.س", "SAR")),
      plain("fallback_origin", "منشأ يظهر قبل الاختيار", "إثيوبيا — يرقاشيفي"),
      plain("fallback_price", "سعر ٢٥٠ غ قبل الاختيار", "85"),
      plain("fallback_roast", "درجة تظهر قبل الاختيار", "فاتح"),
      num("factor_500", "مضاعف ٥٠٠ غ", 1.85, 1, 4, "يُضرب في سعر ٢٥٠ غ ثم يُقرَّب لأقرب ٥."),
      num("factor_1000", "مضاعف الكيلو", 3.4, 1, 8, "يُضرب في سعر ٢٥٠ غ ثم يُقرَّب لأقرب ٥."),
      text("button_label", "نص زر الشراء", L("أضف إلى السلة", "Add to cart")),
      url("button_url", "رابط الزر", "", buyHint),
      text("secondary_label", "نص الزر الثاني", L("اشترك ووفّر", "Subscribe and save")),
      collection("facts", "سطر", [
        text("label", "البند", L("التحميص والشحن", "Roast and shipping")),
        text("value", "القيمة", L("خلال ٤٨ ساعة", "Within 48 hours")),
      ], [
        { label: L("التحميص والشحن", "Roast and shipping"), value: L("خلال ٤٨ ساعة", "Within 48 hours") },
        { label: L("الشحن مجاناً فوق", "Free shipping above"), value: L("١٥٠ ر.س", "SAR 150") },
        { label: L("استبدال الدفعة", "Batch exchange"), value: L("٧ أيام", "7 days") },
        { label: L("الاستلام من المحمصة", "Pickup at the roastery"), value: L("مجاناً", "Free") },
      ], 0, 6),
      collection("payments", "طريقة دفع", [
        text("label", "الاسم", L("مدى", "mada")),
      ], [
        { label: L("مدى", "mada") },
        { label: L("Visa", "Visa") },
        { label: L("Mastercard", "Mastercard") },
        { label: L("Apple Pay", "Apple Pay") },
        { label: L("تابي", "Tabby") },
        { label: L("تمارا", "Tamara") },
      ], 0, 8),
      color("bg_color", "لون الخلفية"),
      scheme(),
    ],
  },
  {
    title: "ريلز التذوق",
    icon: "sicon-video",
    name: "cup-reels",
    key: "7c1e4a92-6b38-4d15-9f20-8a6d3e5c1b47",
    image: "",
    props: { "min-height": "420px" },
    fields: [
      text("index_label", "رقم القسم", "٠٨", { multilang: false, max: 8 }),
      text("kicker", "السطر العلوي", L("دفتر التذوق", "The cupping book")),
      text("title", "العنوان", L("تجارب المحمصة", "Roastery tastings")),
      area("text", "النص", L("ثلاث دفعات من هذا الأسبوع. شغّل المقطع واقرأ ملاحظة التذوق بجانبه.", "Three lots from this week. Play the clip and read the tasting note beside it.")),
      collection("items", "تجربة", [
        url("video_url", "رابط الفيديو", "", "ملف mp4 أو رابط يوتيوب أو فيميو."),
        image("poster", "صورة الغلاف", "تظهر قبل التشغيل. المقاس المقترح 1280×720."),
        text("name", "اسم الدفعة", L("إثيوبيا يرقاشيفي", "Ethiopia Yirgacheffe")),
        text("place", "من ذاقها", L("سارة · الرياض", "Sarah · Riyadh")),
        area("note", "ملاحظة التذوق", L("ياسمين في أول رشفة، وحموضة تشبه الخوخ.", "Jasmine on the first sip, and an acidity like peach.")),
      ], [
        { video_url: "https://videos.pexels.com/video-files/4052732/4052732-sd_640_360_25fps.mp4", poster: "https://images.pexels.com/photos/2159095/pexels-photo-2159095.jpeg?auto=compress&cs=tinysrgb&w=1200", name: L("إثيوبيا يرقاشيفي", "Ethiopia Yirgacheffe"), place: L("سارة · الرياض", "Sarah · Riyadh"), note: L("ياسمين في أول رشفة، وحموضة تشبه الخوخ بعد أن تبرد.", "Jasmine on the first sip, and a peach acidity once it cools.") },
        { video_url: "https://videos.pexels.com/video-files/5540811/5540811-sd_640_360_24fps.mp4", poster: "https://images.pexels.com/photos/4927237/pexels-photo-4927237.jpeg?auto=compress&cs=tinysrgb&w=1200", name: L("كولومبيا هويلا", "Colombia Huila"), place: L("فهد · جدة", "Fahad · Jeddah"), note: L("كاكاو وحلاوة بنية. تناسب V60 على درجة متوسطة.", "Cocoa and brown sugar. It suits a V60 at a medium roast.") },
        { video_url: "https://videos.pexels.com/video-files/7658031/7658031-sd_360_640_25fps.mp4", poster: "https://images.pexels.com/photos/34271405/pexels-photo-34271405.jpeg?auto=compress&cs=tinysrgb&w=1200", name: L("كينيا غسل مزدوج", "Kenya double washed"), place: L("لمى · الخبر", "Lama · Khobar"), note: L("كشمش أسود واضح، والجسم أخف من تحميصة الأسبوع الماضي.", "Clear blackcurrant, and a lighter body than last week's roast.") },
      ], 0, 6),
      text("button_label", "نص الزر", L("اطلب هذه التحميصة", "Order this roast")),
      color("bg_color", "لون الخلفية"),
      scheme(),
    ],
  },
  {
    title: "فوتر المحمصة",
    icon: "sicon-link",
    name: "roast-footer",
    key: "108e7db7-0541-4f65-9510-988f11178672",
    image: "",
    props: { "min-height": "180px" },
    fields: [
      text("announce", "الشريط الإعلاني", L("الحبوب تُحمّص بعد الطلب · استلام من المحمصة أو شحن", "Beans are roasted after the order · pickup at the roastery or shipping"), { desc: "يظهر فوق الفوتر. اتركه فارغاً لإخفاء الشريط." }),
      drop("announce_mode", "حركة الشريط", [["move", "متحرك", KEY.annMove], ["still", "ثابت", KEY.annStill]], "move", "المتحرك يمرّ الجملة باستمرار. الثابت يُبقيها في الوسط."),
      line("ft-announce"),
      image("logo", "شعار", "اتركه فارغاً ليظهر الاسم فقط. المقاس المقترح 280×80 بكسل."),
      image("logo_dark", "شعار للوضع الداكن", "يظهر في الوضع الداكن. المقاس المقترح 280×80 بكسل."),
      text("brand", "الاسم", L("مجموعة القهوة", "Coffee Group")),
      text("address", "العنوان", L("الرياض · حي الملقا · طريق أنس بن مالك", "Riyadh · Al Malqa · Anas ibn Malik road")),
      text("hours", "الهاتف والوقت", L("٩٢٠٠٠٨٨١٢ · من ٧ ص إلى ١١ م", "920008812 · 7 am to 11 pm")),
      text("legal", "سطر نظامي", L("السجل التجاري يُكتب هنا إن لزم", "Add the commercial register here if needed")),
      collection("links", "رابط", [
        text("label", "النص", L("سياسة الاستبدال", "Exchange policy")),
        url("url", "الرابط", "https://help.salla.sa/"),
      ], [
        { label: L("سياسة الاستبدال", "Exchange policy"), url: "https://help.salla.sa/" },
        { label: L("الشروط والأحكام", "Terms"), url: "https://help.salla.sa/" },
        { label: L("الخصوصية", "Privacy"), url: "https://help.salla.sa/" },
      ], 0, 6),
      color("bg_color", "لون الخلفية"),
      scheme(),
    ],
  },
];


// Media sections: a slider whose slides can be a video, and vertical reels.
const PX = (id, w = 1600) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
const CLIP_POUR = "https://videos.pexels.com/video-files/4052732/4052732-sd_640_360_25fps.mp4";
const CLIP_CUP = "https://videos.pexels.com/video-files/5540811/5540811-sd_640_360_24fps.mp4";
const CLIP_ROAST = "https://videos.pexels.com/video-files/7658031/7658031-sd_360_640_25fps.mp4";
const videoHint = "رابط ملف MP4 أو يوتيوب أو فيميو. يعمل بلا صوت، والصورة تظهر قبل تحميله.";
components.push(
  {
    title: "سلايدر المحمصة",
    icon: "sicon-image",
    name: "roast-slider",
    key: "a6ee3d10-55a7-4998-ad28-11d09ce01e79",
    image: "",
    props: { "min-height": "560px" },
    fields: [
      text("title", "اسم القسم", L("شرائح المحمصة", "Roastery slides")),
      collection("items", "شريحة", [
        image("image", "الصورة", "المقاس المقترح 1920×1080 بكسل. مع الفيديو تظهر كغلاف قبل التشغيل."),
        url("video", "فيديو الشريحة (اختياري)", "", videoHint + " الشريحة تنتقل عند انتهاء الملف."),
        text("alt", "وصف الصورة", L("القهوة في المحمصة", "Coffee at the roastery")),
        text("tag", "وسم البطاقة", L("دفعة", "LOT"), { max: 16 }),
        text("title", "العنوان", L("تحميص الاثنين والخميس", "Roasted Monday and Thursday")),
        area("text", "النص", L("جملة واحدة عن الدفعة أو العرض.", "One sentence about the lot or the offer.")),
        text("button", "نص الزر", L("اطلب الدفعة", "Order the lot")),
        url("url", "رابط الزر", "", buyHint),
      ], [
        { image: PX(2159095), video: CLIP_POUR, alt: L("باريستا يصب القهوة المقطرة في كوب زجاجي", "A barista pouring brewed coffee into a glass"), tag: L("الآن", "NOW"), title: L("دفعة الأسبوع خرجت من المحمصة صباح اليوم", "This week's lot left the roaster this morning"), text: L("نحمّص بعد الطلب، ونطبع تاريخ التحميص على الكيس.", "We roast after the order and print the roast date on the bag."), button: L("اطلب الدفعة", "Order the lot"), url: "#cf-order" },
        { image: PX(31890552), alt: L("حبوب تخرج ساخنة من آلة التحميص", "Hot beans pouring out of the roaster"), tag: L("منشأ", "ORIGIN"), title: L("إثيوبيا يرقاشيفي: ياسمين وليمون", "Ethiopia Yirgacheffe: jasmine and lemon"), text: L("تحميص فاتح يناسب الـ V60 والتقطير.", "A light roast for V60 and drip."), button: L("اقرأ ملف المنشأ", "Read the origin card"), url: "#cf-origin" },
        { image: PX(30146018), alt: L("صب القهوة السعودية من دلة نحاسية", "Saudi coffee poured from a brass dallah"), tag: L("سعودي", "SAUDI"), title: L("قهوة سعودية بالهيل والزعفران", "Saudi coffee with cardamom and saffron"), text: L("بن خولاني من جبال جازان بتحميص أشقر، يُطحن على مقاس الدلة. في الاشتراك كل أسبوعين توفّر ٨ ر.س في الكيس.", "Khawlani beans from the Jazan mountains in a blonde roast, ground for the dallah. A two-week plan saves SAR 8 a bag."), button: L("اطلب القهوة السعودية", "Order the Saudi coffee"), url: "#cf-order" },
      ], 1, 6),
      color("bg_color", "لون الخلفية"),
      scheme(),
    ],
  },
  {
    title: "ريلز المحمصة",
    icon: "sicon-play",
    name: "brew-reels",
    key: "380a3c83-78cd-4bde-80a9-4dd38c1c2111",
    image: "",
    props: { "min-height": "520px" },
    fields: [
      text("kicker", "السطر العلوي", L("من البار", "From the bar")),
      text("title", "العنوان", L("مقاطع قصيرة من المحمصة", "Short clips from the roastery")),
      area("text", "النص", L("المقطع يعمل بلا صوت وأنت تمرّر. اضغط عليه ليعمل بالصوت.", "Clips play silently as you scroll. Tap one to hear it.")),
      collection("items", "مقطع", [
        url("video", "رابط الفيديو", "", videoHint + " الأفضل مقطع طولي ٩:١٦."),
        image("poster", "صورة الغلاف", "المقاس المقترح 720×1280 بكسل."),
        text("name", "العنوان", L("صب V60", "V60 pour")),
        text("note", "سطر صغير", L("دفعة إثيوبيا", "Ethiopia lot")),
        text("price", "السعر", L("٨٥ ر.س", "SAR 85"), { max: 30 }),
        text("button", "نص الزر", L("اطلب", "Order"), { max: 30 }),
        url("url", "رابط الزر", "", buyHint),
      ], [
        { video: CLIP_ROAST, poster: PX(31890551, 800), name: L("خروج الدفعة من المحمصة", "The lot leaves the roaster"), note: L("تحميص فاتح · إثيوبيا", "Light roast · Ethiopia"), price: L("٨٥ ر.س", "SAR 85"), button: L("اطلب", "Order"), url: "#cf-order" },
        { video: CLIP_POUR, poster: PX(22223105, 800), name: L("لاتيه بحليب كامل", "A whole-milk latte"), note: L("كولومبيا هويلا", "Colombia Huila"), price: L("٧٢ ر.س", "SAR 72"), button: L("اطلب", "Order"), url: "#cf-order" },
        { video: CLIP_CUP, poster: PX(31523243, 800), name: L("كابتشينو الصباح", "The morning cappuccino"), note: L("كينيا نييري", "Kenya Nyeri"), price: L("٩٨ ر.س", "SAR 98"), button: L("اطلب", "Order"), url: "#cf-order" },
      ], 1, 10),
      color("bg_color", "لون الخلفية"),
      scheme(),
    ],
  },
);

const catalog = ["roast-bar", "roast-slider", "roast-cover", "origin-list", "roast-dial", "brew-calc", "plan-table", "kit-row", "voice-list", "cup-reels", "brew-reels", "bag-order", "roast-footer"];
components.sort((a, b) => catalog.indexOf(a.name) - catalog.indexOf(b.name));

const templates = [
  {
    name: "qahwa",
    id: "26a58c48-75da-464c-9456-25874f37cc09",
    is_default: true,
    primary_color: "#c2410c",
    order: ["roast-bar", "roast-cover", "origin-list", "roast-dial", "brew-calc", "plan-table", "kit-row", "voice-list", "cup-reels", "bag-order", "roast-footer"],
  },
  {
    name: "kis",
    id: "348b24a9-afc3-4e83-a749-a74a1d1a00bc",
    is_default: false,
    primary_color: "#6b3410",
    order: [
      ["roast-bar", {
        links: [
          { label: L("الدفعة", "Lot"), url: "#cf-slides" },
          { label: L("المناشئ", "Origins"), url: "#cf-origin" },
          { label: L("الطلب", "Order"), url: "#cf-order" },
        ],
      }],
      "roast-slider",
      ["origin-list", { index_label: "٠٢" }],
      "brew-reels",
      ["bag-order", { index_label: "٠٣", secondary_label: L("", "") }],
      "roast-footer",
    ],
  },
];

applyLandingExtras({ components, catalog, templates, L, text, color, sw, drop, line, collection, image, url, scheme, KEY });

const bundlePath = new URL("../twilight-bundle.json", import.meta.url);
let previous = { templates: [] };
if (fs.existsSync(bundlePath)) previous = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
const previousTemplates = new Map((previous.templates || []).map((item) => [item.path, item]));

const bundle = {
  name: { ar: "مجموعة القهوة", en: "Coffee Group" },
  description: {
    ar: "صفحتا هبوط لمحمصة. الصفحة الكاملة تعرض المنشأ ودرجة التحميص وحاسبة التحضير والباقة، ثم طلب الكيس. الصفحة المختصرة للطلب المباشر.",
    en: "Two landing pages for a roastery. The full page shows origin, roast, brew math, and the plan, then the bag order. The short page is for a direct order.",
  },
  author: {
    name: "Saji",
    email: "sajispprt@gmail.com",
    url: "https://saji-tech.com/",
  },
  author_email: "sajispprt@gmail.com",
  support_url: "https://github.com/Ashaheen892/tw-coffee-landing",
  repository: "https://github.com/Ashaheen892/tw-coffee-landing",
  features: ["landing-page-templates"],
  components,
  templates: templates.map((template) => {
    const path = `templates.${template.name}`;
    const saved = previousTemplates.get(path) || {};
    return {
      id: template.id,
      path,
      category_id: saved.category_id || "",
      primary_color: template.primary_color,
      thumbnail: saved.thumbnail || "",
      is_default: template.is_default,
      ...(saved.public_preview_url ? { public_preview_url: saved.public_preview_url } : {}),
    };
  }),
};

fs.writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 4)}\n`);
fs.mkdirSync(new URL("../templates/", import.meta.url), { recursive: true });
fs.mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
const byName = new Map(components.map((component) => [component.name, component]));
const materialize = (entry) => {
  const [name, overrides] = Array.isArray(entry) ? entry : [entry, {}];
  const copy = structuredClone(byName.get(name));
  for (const [id, value] of Object.entries(overrides)) {
    const field = copy.fields.find((item) => item.id === id);
    if (!field) continue;
    if (field.format === "dropdown-list") {
      const choice = (field.options || []).filter((item) => item.value === value);
      field.selected = choice;
      field.value = choice;
    } else if (field.format === "collection" && Array.isArray(value)) {
      field.value = value.map((row) => {
        const out = {};
        for (const [key, val] of Object.entries(row)) out[key.startsWith(`${id}.`) ? key : `${id}.${key}`] = val;
        return out;
      });
    } else {
      field.value = value;
      if ("selected" in field) field.selected = value;
    }
  }
  return copy;
};
for (const template of templates) {
  const list = template.order.map((entry) => materialize(entry));
  fs.writeFileSync(new URL(`../templates/${template.name}.json`, import.meta.url), `${JSON.stringify({ id: template.id, components: list }, null, 2)}\n`);
}
fs.writeFileSync(new URL("../public/twilight-bundle.json", import.meta.url), `${JSON.stringify(bundle, null, 4)}\n`);
console.log("pages:", templates.map((template) => `${template.name}(${template.order.length})`).join(", "));
console.log("sections:", components.map((component) => component.name).join(", "));
