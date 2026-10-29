import type { Factor } from "./health";

/**
 * Health Choice: side-by-side lifestyle choices, each backed by a published recommendation.
 * These are general population figures, never a prediction for the person reading them.
 */

export interface Option {
  label: string;
  points: string[];
}

export interface HealthChoice {
  id: string;
  topic: string;
  /** Quiz factors this choice is about; shown first when one needs attention. */
  factors: Factor["id"][];
  a: Option;
  b: Option;
  takeaway: string;
  sources: { name: string; url: string }[];
  /** The mission that puts option B into practice. */
  mission: string;
}

export const CHOICES: HealthChoice[] = [
  {
    id: "sugar",
    topic: "เครื่องดื่มหวาน",
    factors: ["sweet"],
    a: { label: "ชานม น้ำอัดลม หวานปกติ", points: ["เครื่องดื่มหวานแก้วเดียวอาจมีน้ำตาลใกล้หรือเกิน 25 กรัม (น้ำอัดลม 1 กระป๋องมีน้ำตาลได้ถึงราว 40 กรัม)", "WHO ระบุว่าการกินน้ำตาลอิสระมากสัมพันธ์กับน้ำหนักเกินและฟันผุ"] },
    b: { label: "หวานน้อย หรือน้ำเปล่า", points: ["WHO แนะนำน้ำตาลอิสระไม่เกิน 10% ของพลังงานต่อวัน และถ้าลดเหลือต่ำกว่า 5% (ราว 25 กรัม หรือ 6 ช้อนชา) อาจได้ประโยชน์เพิ่ม", "น้ำเปล่าไม่มีน้ำตาลและพลังงานเลย"] },
    takeaway: "ลดน้ำตาลอิสระช่วยลดความเสี่ยงน้ำหนักเกินและฟันผุ",
    sources: [
      { name: "WHO Guideline: Sugars intake for adults and children (2015)", url: "https://www.who.int/publications/i/item/9789241549028" },
      { name: "WHO news release: WHO calls on countries to reduce sugars intake (2015)", url: "https://apps.who.int/mediacentre/news/releases/2015/sugar-guideline/en/index.html" },
    ],
    mission: "food-sweet",
  },
  {
    id: "salt",
    topic: "รสเค็ม",
    factors: ["sweet", "bp"],
    a: { label: "เติมน้ำปลา ซดน้ำซุปจนหมด", points: ["ผลสำรวจระดับประเทศปี 2563 พบคนไทยกินโซเดียมเฉลี่ยราว 3,600 มิลลิกรัมต่อวัน เกือบ 2 เท่าของที่แนะนำ", "โซเดียมสูงทำให้ความดันโลหิตสูงขึ้น ซึ่งเพิ่มความเสี่ยงโรคหัวใจและหลอดเลือด"] },
    b: { label: "ชิมก่อนปรุง ซดน้ำซุปน้อยลง", points: ["WHO แนะนำเกลือไม่เกิน 5 กรัมต่อวัน (โซเดียมไม่เกิน 2,000 มิลลิกรัม)", "การลดเกลือช่วยลดความดันโลหิตได้"] },
    takeaway: "ลดเค็มเป็นวิธีที่คุ้มค่าที่สุดวิธีหนึ่งในการลดความดันโลหิต",
    sources: [
      { name: "WHO Fact sheet: Sodium reduction", url: "https://www.who.int/news-room/fact-sheets/detail/salt-reduction" },
      { name: "Chailimpamontree W, et al. Estimated dietary sodium intake in Thailand (J Clin Hypertens, 2021)", url: "https://doi.org/10.1111/jch.14147" },
    ],
    mission: "food-salty",
  },
  {
    id: "move",
    topic: "การขยับร่างกาย",
    factors: ["exerciseDays", "bmi"],
    a: { label: "นั่งเกือบทั้งวัน ไม่ค่อยออกกำลังกาย", points: ["คนที่มีกิจกรรมทางกายไม่เพียงพอมีความเสี่ยงเสียชีวิตสูงกว่าคนที่เพียงพอ 20–30%"] },
    b: { label: "ขยับ 150 นาทีต่อสัปดาห์", points: ["WHO แนะนำผู้ใหญ่ทำกิจกรรมระดับปานกลาง 150–300 นาทีต่อสัปดาห์ (อย่างน้อย 150 นาที)", "เดินเร็ววันละ 30 นาที 5 วันก็ถึงเป้า และทุกการขยับนับรวมได้"] },
    takeaway: "ขยับเพิ่มแม้เพียงเล็กน้อยก็ดีกว่าไม่ขยับเลย",
    sources: [
      { name: "WHO Fact sheet: Physical activity", url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity" },
      { name: "WHO guidelines on physical activity and sedentary behaviour (2020)", url: "https://www.who.int/publications/i/item/9789240015128" },
    ],
    mission: "move-walk",
  },
  {
    id: "sleep",
    topic: "การนอน",
    factors: ["sleepHours", "stress"],
    a: { label: "นอนน้อยกว่า 7 ชั่วโมงเป็นประจำ", points: ["สัมพันธ์กับน้ำหนักเพิ่ม เบาหวาน ความดันสูง โรคหัวใจ โรคหลอดเลือดสมอง และภาวะซึมเศร้า", "สัมพันธ์กับภูมิคุ้มกันบกพร่อง ประสิทธิภาพการทำงานลดลง และเสี่ยงอุบัติเหตุมากขึ้น"] },
    b: { label: "นอน 7 ชั่วโมงขึ้นไปทุกคืน", points: ["ผู้เชี่ยวชาญด้านการนอนแนะนำผู้ใหญ่นอนอย่างน้อย 7 ชั่วโมงต่อคืนเป็นประจำ"] },
    takeaway: "การนอนพอเป็นพื้นฐานของสุขภาพกายและใจ",
    sources: [{ name: "AASM/SRS Consensus: Recommended amount of sleep for a healthy adult (J Clin Sleep Med, 2015)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4434546/" }],
    mission: "sleep-time",
  },
  {
    id: "veg",
    topic: "ผักและผลไม้",
    factors: ["veggies"],
    a: { label: "ผักผลไม้น้อยกว่า 5 ส่วนต่อวัน", points: ["อาหารที่ไม่ดีต่อสุขภาพ รวมถึงกินผักผลไม้น้อย เป็นปัจจัยเสี่ยงสำคัญของโรคไม่ติดต่อเรื้อรัง"] },
    b: { label: "ผักผลไม้อย่างน้อย 400 กรัมต่อวัน", points: ["WHO แนะนำผักผลไม้อย่างน้อย 400 กรัมต่อวัน", "ช่วยลดความเสี่ยงโรคไม่ติดต่อเรื้อรังและได้ใยอาหารเพียงพอ"] },
    takeaway: "ผักครึ่งจานในมื้อหลักเป็นวิธีง่ายที่สุดที่จะถึงเป้า",
    sources: [{ name: "WHO Fact sheet: Healthy diet", url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet" }],
    mission: "food-veg",
  },
  {
    id: "fat",
    topic: "วิธีปรุงอาหาร",
    factors: ["sweet", "bmi"],
    a: { label: "ทอด ผัดน้ำมันเยอะ แกงกะทิ", points: ["ไขมันอิ่มตัวและไขมันทรานส์สูงเพิ่มความเสี่ยงโรคหัวใจ", "พลังงานสูง ทำให้น้ำหนักขึ้นง่าย"] },
    b: { label: "ต้ม นึ่ง แทนทอด", points: ["WHO แนะนำเลือกนึ่งหรือต้มแทนการทอด", "ไขมันรวมไม่เกิน 30% และไขมันอิ่มตัวไม่เกิน 10% ของพลังงานต่อวัน"] },
    takeaway: "เปลี่ยนวิธีปรุงวันละมื้อ ลดไขมันได้โดยไม่ต้องเลิกเมนูโปรด",
    sources: [{ name: "WHO Fact sheet: Healthy diet", url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet" }],
    mission: "food-fatty",
  },
  {
    id: "smoke",
    topic: "บุหรี่",
    factors: ["smoking"],
    a: { label: "สูบต่อไป", points: ["ยาสูบคร่าชีวิตผู้ที่สูบโดยไม่เลิกได้มากถึงครึ่งหนึ่ง", "เพิ่มความเสี่ยงโรคหัวใจ โรคหลอดเลือดสมอง มะเร็ง และโรคปอด"] },
    b: { label: "เริ่มลด และเลิกให้ได้", points: ["หลังเลิก 1 ปี ความเสี่ยงโรคหลอดเลือดหัวใจลดลงเหลือราวครึ่งหนึ่งของคนที่ยังสูบ", "ปรึกษาสายเลิกบุหรี่ 1600 ได้ฟรี"] },
    takeaway: "เลิกเมื่อไรก็ได้ประโยชน์ ไม่มีคำว่าสายเกินไป",
    sources: [
      { name: "WHO Fact sheet: Tobacco", url: "https://www.who.int/news-room/fact-sheets/detail/tobacco" },
      { name: "WHO: Tobacco: health benefits of smoking cessation", url: "https://www.who.int/news-room/questions-and-answers/item/tobacco-health-benefits-of-smoking-cessation" },
    ],
    mission: "habit-smoke",
  },
  {
    id: "alcohol",
    topic: "เครื่องดื่มแอลกอฮอล์",
    factors: ["alcohol"],
    a: { label: "ดื่มเป็นประจำ", points: ["แอลกอฮอล์ก่อมะเร็งได้หลายชนิด และความเสี่ยงเพิ่มตามปริมาณที่ดื่ม", "เพิ่มความดันโลหิตและภาระของตับ"] },
    b: { label: "ดื่มน้อยลง หรือไม่ดื่ม", points: ["WHO ระบุว่าไม่มีปริมาณการดื่มที่ปลอดภัยต่อสุขภาพ", "ยิ่งดื่มน้อย ความเสี่ยงยิ่งต่ำ"] },
    takeaway: "ลดได้เท่าไรก็ดีต่อสุขภาพเท่านั้น",
    sources: [
      { name: "WHO/Europe: No level of alcohol consumption is safe for our health (2023)", url: "https://www.who.int/europe/news/item/04-01-2023-no-level-of-alcohol-consumption-is-safe-for-our-health" },
      { name: "WHO Fact sheet: Alcohol", url: "https://www.who.int/news-room/fact-sheets/detail/alcohol" },
    ],
    mission: "habit-alcohol",
  },
];
