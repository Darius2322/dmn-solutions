// Kenya counties by ISO 3166-2:KE code (KE-01 ... KE-47), as sent by Vercel in
// the x-vercel-ip-country-region header.
const KE_COUNTIES: Record<string, string> = {
  "01": "Baringo", "02": "Bomet", "03": "Bungoma", "04": "Busia", "05": "Elgeyo-Marakwet",
  "06": "Embu", "07": "Garissa", "08": "Homa Bay", "09": "Isiolo", "10": "Kajiado",
  "11": "Kakamega", "12": "Kericho", "13": "Kiambu", "14": "Kilifi", "15": "Kirinyaga",
  "16": "Kisii", "17": "Kisumu", "18": "Kitui", "19": "Kwale", "20": "Laikipia",
  "21": "Lamu", "22": "Machakos", "23": "Makueni", "24": "Mandera", "25": "Marsabit",
  "26": "Meru", "27": "Migori", "28": "Mombasa", "29": "Murang'a", "30": "Nairobi",
  "31": "Nakuru", "32": "Nandi", "33": "Narok", "34": "Nyamira", "35": "Nyandarua",
  "36": "Nyeri", "37": "Samburu", "38": "Siaya", "39": "Taita-Taveta", "40": "Tana River",
  "41": "Tharaka-Nithi", "42": "Trans Nzoia", "43": "Turkana", "44": "Uasin Gishu",
  "45": "Vihiga", "46": "Wajir", "47": "West Pokot",
};

// Older geo databases use the former 8 provinces for Kenya.
const KE_PROVINCES: Record<string, string> = {
  "110": "Nairobi", "200": "Central", "300": "Coast", "400": "Eastern",
  "500": "North Eastern", "600": "Nyanza", "700": "Rift Valley", "800": "Western",
};

export function readGeo(headers: Headers) {
  const country = headers.get("x-vercel-ip-country")?.toUpperCase() || null;
  const regionCode = headers.get("x-vercel-ip-country-region") || null;
  let city: string | null = null;
  const rawCity = headers.get("x-vercel-ip-city");
  if (rawCity) {
    try { city = decodeURIComponent(rawCity); } catch { city = rawCity; }
  }

  let county: string | null = null;
  let region: string | null = regionCode;
  if (country === "KE" && regionCode) {
    const code = regionCode.padStart(2, "0");
    if (KE_COUNTIES[code]) {
      county = KE_COUNTIES[code];
      region = KE_COUNTIES[code];
    } else if (KE_PROVINCES[regionCode]) {
      region = KE_PROVINCES[regionCode];
    }
  }
  return { country, region, county, city };
}
