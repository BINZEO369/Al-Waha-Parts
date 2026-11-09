export type ProductAiInput = {
  part_name: string;
  image_url?: string;
  description?: string;
  sku?: string;
  oem_number?: string;
  part_number?: string;
  brand_name?: string;
  model_name?: string;
  category_name?: string;
};

export type ProductAiSuggestion = {
  product_title: string | null;
  part_number: string | null;
  oem_numbers: string[];
  category_name: string | null;
  manufacturer_name: string | null;
  model_name: string | null;
  compatible_years: number[];
  part_type: string | null;
  position: string | null;
  condition: string | null;
  material: string | null;
  color: string | null;
  package_contents: string[];
  seo_title: string | null;
  seo_description: string | null;
  keywords: string[];
  duplicate_risk: 'low' | 'medium' | 'high';
  confidence: number;
  notes: string[];
};

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

const cleanText = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

export const sanitizeProductAiInput = (input: ProductAiInput): ProductAiInput => ({
  part_name: cleanText(input.part_name, 240),
  image_url: cleanText(input.image_url, 2000),
  description: cleanText(input.description, 2000),
  sku: cleanText(input.sku, 120),
  oem_number: cleanText(input.oem_number, 120),
  part_number: cleanText(input.part_number, 120),
  brand_name: cleanText(input.brand_name, 120),
  model_name: cleanText(input.model_name, 160),
  category_name: cleanText(input.category_name, 160),
});

const parseJson = (text: string): ProductAiSuggestion => {
  const withoutFence = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const parsed = JSON.parse(withoutFence) as Partial<ProductAiSuggestion>;
  const risk = parsed.duplicate_risk;
  return {
    product_title:
      typeof parsed.product_title === 'string' ? parsed.product_title.slice(0, 240) : null,
    part_number: typeof parsed.part_number === 'string' ? parsed.part_number.slice(0, 120) : null,
    oem_numbers: Array.isArray(parsed.oem_numbers)
      ? parsed.oem_numbers
          .filter((value): value is string => typeof value === 'string')
          .slice(0, 20)
      : [],
    category_name: typeof parsed.category_name === 'string' ? parsed.category_name : null,
    manufacturer_name:
      typeof parsed.manufacturer_name === 'string' ? parsed.manufacturer_name : null,
    model_name: typeof parsed.model_name === 'string' ? parsed.model_name : null,
    compatible_years: Array.isArray(parsed.compatible_years)
      ? parsed.compatible_years
          .map(Number)
          .filter((year) => Number.isInteger(year) && year >= 1900 && year <= 2200)
          .slice(0, 30)
      : [],
    part_type: typeof parsed.part_type === 'string' ? parsed.part_type.slice(0, 120) : null,
    position: typeof parsed.position === 'string' ? parsed.position.slice(0, 80) : null,
    condition: typeof parsed.condition === 'string' ? parsed.condition.slice(0, 80) : null,
    material: typeof parsed.material === 'string' ? parsed.material.slice(0, 120) : null,
    color: typeof parsed.color === 'string' ? parsed.color.slice(0, 80) : null,
    package_contents: Array.isArray(parsed.package_contents)
      ? parsed.package_contents
          .filter((value): value is string => typeof value === 'string')
          .slice(0, 20)
      : [],
    seo_title: typeof parsed.seo_title === 'string' ? parsed.seo_title.slice(0, 160) : null,
    seo_description:
      typeof parsed.seo_description === 'string' ? parsed.seo_description.slice(0, 320) : null,
    keywords: Array.isArray(parsed.keywords)
      ? parsed.keywords.filter((value): value is string => typeof value === 'string').slice(0, 12)
      : [],
    duplicate_risk: risk === 'high' || risk === 'medium' ? risk : 'low',
    confidence:
      typeof parsed.confidence === 'number' ? Math.min(Math.max(parsed.confidence, 0), 1) : 0,
    notes: Array.isArray(parsed.notes)
      ? parsed.notes.filter((value): value is string => typeof value === 'string').slice(0, 8)
      : [],
  };
};

async function readRemoteImage(imageUrl: string) {
  if (!imageUrl) return null;
  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    throw new Error('image_url must be a valid public URL');
  }
  if (
    parsed.protocol !== 'https:' ||
    /^(localhost|127\.|0\.0\.0\.0|169\.254\.|\[::1\])$/i.test(parsed.hostname)
  ) {
    throw new Error('image_url must be a public HTTPS image URL');
  }
  const response = await fetch(parsed, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`Could not read image (${response.status})`);
  const contentType = response.headers.get('content-type')?.split(';')[0] || '';
  const length = Number(response.headers.get('content-length') || 0);
  if (!contentType.startsWith('image/') || length > 6 * 1024 * 1024) {
    throw new Error('image_url must point to an image smaller than 6 MB');
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > 6 * 1024 * 1024) throw new Error('Image is larger than 6 MB');
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return { mimeType: contentType, data: btoa(binary) };
}

export async function suggestProductMetadata(
  apiKey: string,
  model: string,
  input: ProductAiInput,
): Promise<ProductAiSuggestion> {
  if (!apiKey) throw new Error('AI is not configured. Add GEMINI_API_KEY to the API environment.');
  const safeInput = sanitizeProductAiInput(input);
  if (!safeInput.part_name) throw new Error('part_name is required');
  const image = await readRemoteImage(safeInput.image_url || '');

  const prompt = `You are an automotive parts catalog assistant for Al Waha Parts.
Analyze the supplied product fields. Do not invent a manufacturer, model, OEM number, or year.
Return ONLY valid JSON matching this exact shape:
{"product_title":string|null,"part_number":string|null,"oem_numbers":string[],"category_name":string|null,"manufacturer_name":string|null,"model_name":string|null,"compatible_years":number[],"part_type":string|null,"position":string|null,"condition":string|null,"material":string|null,"color":string|null,"package_contents":string[],"seo_title":string|null,"seo_description":string|null,"keywords":string[],"duplicate_risk":"low"|"medium"|"high","confidence":number,"notes":string[]}
Confidence must be between 0 and 1. If evidence is missing, use null, an empty array, and explain it in notes.
Read visible labels, numbers and logos from the image when clear. Never guess a number or compatibility year from appearance alone.
Product input:
${JSON.stringify(safeInput)}
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: image
              ? [{ inlineData: { mimeType: image.mimeType, data: image.data } }, { text: prompt }]
              : [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    },
  );
  const payload = (await response.json()) as GeminiResponse;
  if (!response.ok)
    throw new Error(payload.error?.message || `Gemini request failed (${response.status})`);
  const text =
    payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
  if (!text) throw new Error('AI returned an empty response');
  try {
    return parseJson(text);
  } catch {
    throw new Error('AI returned invalid structured data. Please retry.');
  }
}
