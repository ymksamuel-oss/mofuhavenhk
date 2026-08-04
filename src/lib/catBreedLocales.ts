/**
 * English overlays for CatBreedInfo fields + locale helpers for breed pages.
 */
import type { CatBreed } from "@/lib/catBreeds";
import type { Locale } from "@/lib/i18n/translations";

export type BreedInfoEn = {
  eye_color: string;
  size_category: string;
  maturation_years?: string;
  coat: { length: string; texture: string; undercoat: string };
  patterns: Record<string, { name: string; description: string }>;
  colors: Record<string, { name: string; description: string }>;
  care: {
    environment: string;
    genetic_risks: string[];
    digestive_health: string;
    diet_management: string;
    grooming: string;
  };
  gallery: Record<string, { description: string; alt: string }>;
};

export const CAT_BREED_INFO_EN: Record<string, BreedInfoEn> = {
  american_shorthair: {
    eye_color: "Gold, green, or hazel (varies with coat color)",
    size_category: "Medium to large, muscular rectangular build",
    coat: {
      length: "Short",
      texture: "Dense and glossy",
      undercoat: "Moderate; more noticeable when shedding",
    },
    patterns: {
      classic_tabby: {
        name: "Classic / blotched tabby",
        description: "Swirls or bull’s-eye on the side; forehead often shows an “M”",
      },
      silver_tabby: {
        name: "Silver tabby",
        description: "Pale silver ground with dark tabby markings",
      },
      brown_tabby: {
        name: "Brown tabby",
        description: "Warm brown ground with classic or mackerel stripes",
      },
      solid_and_bicolor: {
        name: "Solid & bicolor",
        description: "Self colors or white combined with color patches",
      },
    },
    colors: {
      silver_tabby: {
        name: "Silver tabby",
        description: "Signature ASH look",
      },
      brown_tabby: {
        name: "Brown tabby",
        description: "Warm classic tabby",
      },
      red_tabby: {
        name: "Red tabby",
        description: "Warm orange tabby",
      },
      bicolor: {
        name: "Bicolor",
        description: "White with color blocks",
      },
    },
    care: {
      environment: "Active indoor life with climb-and-play enrichment",
      genetic_risks: ["Hypertrophic cardiomyopathy (HCM)", "Polycystic kidney disease (PKD) in some lines"],
      digestive_health: "Generally robust digestion with a stable diet",
      diet_management: "Quality protein; scheduled adult meals",
      grooming: "Weekly brushing; more in shedding season",
    },
    gallery: {
      hero_main: {
        description: "Classic American Shorthair portrait",
        alt: "American Shorthair portrait",
      },
      gallery_item_1: {
        description: "Silver tabby patterning",
        alt: "Silver tabby American Shorthair",
      },
      gallery_item_2: {
        description: "Brown tabby expression",
        alt: "Brown tabby American Shorthair",
      },
      gallery_item_3: {
        description: "Outdoor alert posture",
        alt: "American Shorthair outdoors",
      },
      gallery_item_4: {
        description: "Cozy indoor companion",
        alt: "American Shorthair relaxing indoors",
      },
    },
    maturation_years: "About 3–4 years",
  },
  british_shorthair: {
    eye_color: "Copper, gold, or blue (by colorway)",
    size_category: "Medium to large, cobby and rounded",
    coat: {
      length: "Short",
      texture: "Dense plush “crushed velvet” feel",
      undercoat: "Thick undercoat; heavy seasonal shed",
    },
    patterns: {
      british_blue: {
        name: "British Blue",
        description: "Even blue-gray coat — the classic look",
      },
      golden_shade: {
        name: "Golden shaded",
        description: "Warm golden tipping over a lighter undercoat",
      },
      silver_tabby: {
        name: "Silver tabby",
        description: "Silver ground with crisp tabby markings",
      },
      bicolor: {
        name: "Bicolor",
        description: "White with blue or other color patches",
      },
    },
    colors: {
      british_blue: {
        name: "British Blue",
        description: "Even blue-gray",
      },
      golden_shade: {
        name: "Golden shaded",
        description: "Warm golden tones",
      },
      silver_tabby: {
        name: "Silver tabby",
        description: "Silver with tabby pattern",
      },
      bicolor: {
        name: "Bicolor",
        description: "White plus color",
      },
    },
    care: {
      environment: "Calm indoor home; independent but enjoys nearby company",
      genetic_risks: ["Hypertrophic cardiomyopathy (HCM)", "Polycystic kidney disease (PKD) — ask for parental DNA tests"],
      digestive_health: "Usually steady; watch hairballs when shedding",
      diet_management: "Strict calorie control after neutering",
      grooming: "Brush 1–2× weekly; more in coat blow",
    },
    gallery: {
      hero_main: {
        description: "Golden shaded British Shorthair",
        alt: "Golden British Shorthair",
      },
      gallery_item_1: {
        description: "Classic British Blue",
        alt: "British Blue shorthair",
      },
      gallery_item_2: {
        description: "Silver tabby British Shorthair",
        alt: "Silver tabby British Shorthair",
      },
      gallery_item_3: {
        description: "Cozy everyday companion",
        alt: "British Shorthair relaxing",
      },
    },
    maturation_years: "About 3–4 years",
  },
  ragdoll: {
    eye_color: "Blue",
    size_category: "Large, semi-longhair, substantial bone",
    coat: {
      length: "Semi-long",
      texture: "Silky with less matting than Persians",
      undercoat: "Moderate; still needs routine brushing",
    },
    patterns: {
      bicolor: {
        name: "Bicolor",
        description: "Inverted-V white blaze with white legs/chest",
      },
      mitted: {
        name: "Mitted",
        description: "White mittens, boots, and chin/belly white",
      },
      colorpoint: {
        name: "Colorpoint",
        description: "Darker points on face, ears, legs, and tail",
      },
    },
    colors: {
      seal: {
        name: "Seal",
        description: "Classic deep brown points",
      },
      blue: {
        name: "Blue",
        description: "Gray-blue points",
      },
      chocolate: {
        name: "Chocolate",
        description: "Warm mid-brown points",
      },
      lilac: {
        name: "Lilac",
        description: "Pale pinkish-gray points",
      },
      red: {
        name: "Red",
        description: "Warm orange-red points",
      },
      cream: {
        name: "Cream",
        description: "Soft cream points",
      },
      lynx: {
        name: "Lynx (tabby point)",
        description: "Pointed pattern with tabby striping",
      },
    },
    care: {
      environment: "Strictly indoor — low street survival instincts",
      genetic_risks: ["Hypertrophic cardiomyopathy (HCM)", "Polycystic kidney disease (PKD)"],
      digestive_health: "Sensitive gut — slow food transitions; probiotics help",
      diet_management: "Scheduled meals to prevent obesity",
      grooming: "Brush 2–3× weekly; tidy rear furnishings",
    },
    gallery: {
      hero_main: {
        description: "Blue-eyed bicolor Ragdoll close-up",
        alt: "Bicolor Ragdoll close-up",
      },
      gallery_item_1: {
        description: "Mitted Ragdoll with white gloves",
        alt: "Mitted Ragdoll",
      },
      gallery_item_2: {
        description: "Bicolor Ragdoll full body reference",
        alt: "Bicolor Ragdoll full body",
      },
      gallery_item_3: {
        description: "Colorpoint Ragdoll",
        alt: "Colorpoint Ragdoll",
      },
    },
    maturation_years: "About 3–4 years",
  },
  russian_blue: {
    eye_color: "Vivid emerald green (adults)",
    size_category: "Medium, fine-boned yet muscular and elegant",
    coat: {
      length: "Short double coat",
      texture: "Dense, plush, silver-tipped",
      undercoat: "Thick undercoat creating a blue shimmer",
    },
    patterns: {
      silver_tipped_blue: {
        name: "Silver-tipped blue",
        description: "Even blue with silver tipping for a luminous sheen",
      },
      american_type: {
        name: "American type",
        description: "Slightly finer, very elegant lines",
      },
      european_type: {
        name: "European type",
        description: "A touch more compact and sturdy",
      },
      emerald_eyes: {
        name: "Emerald eyes",
        description: "Intense green adult eye color is a hallmark",
      },
    },
    colors: {
      blue: {
        name: "Blue",
        description: "Even blue-gray body",
      },
      silver_tipping: {
        name: "Silver tipping",
        description: "Guard hairs tipped silver",
      },
      lavender_pads: {
        name: "Lavender paw pads",
        description: "Classic soft lavender/pink-gray pads",
      },
    },
    care: {
      environment: "Quiet, predictable indoor home with vertical space",
      genetic_risks: ["Higher relative risk of urinary crystals/stones — encourage fluids and watch litter habits", "Generally hardy and long-lived; still keep annual checkups"],
      digestive_health: "Typically steady on a consistent diet",
      diet_management: "Quality protein; wet food supports hydration",
      grooming: "Weekly brushing; more during shed",
    },
    gallery: {
      hero_main: {
        description: "Silver-blue Russian Blue with green eyes",
        alt: "Russian Blue portrait",
      },
      gallery_item_1: {
        description: "Face and ear profile",
        alt: "Russian Blue face",
      },
      gallery_item_2: {
        description: "Elegant seated posture",
        alt: "Elegant Russian Blue",
      },
      gallery_item_3: {
        description: "Window-side calm",
        alt: "Russian Blue by a window",
      },
      gallery_item_4: {
        description: "Cozy indoor rest",
        alt: "Russian Blue resting",
      },
      gallery_item_5: {
        description: "Pose showing coat sheen",
        alt: "Russian Blue coat sheen",
      },
      gallery_item_6: {
        description: "Paw and pad detail",
        alt: "Russian Blue paw",
      },
    },
    maturation_years: "About 3–5 years for full coat/eye color",
  },
  munchkin: {
    eye_color: "Varies widely with coat color",
    size_category: "Small to medium with short legs and longer body",
    coat: {
      length: "Short or long",
      texture: "Soft; many colors/patterns accepted",
      undercoat: "Varies by individual",
    },
    patterns: {
      short_legs: {
        name: "Short legs",
        description: "Signature shortened limbs with a longer body",
      },
      tabby: {
        name: "Tabby",
        description: "Very common patterned coats",
      },
      bicolor_point: {
        name: "Bicolor / point",
        description: "White spotting or pointed contrast",
      },
      longhair: {
        name: "Longhair variety",
        description: "Fluffier coat on the same short-legged frame",
      },
    },
    colors: {
      tabby: {
        name: "Tabby",
        description: "One of the most common looks",
      },
      bicolor: {
        name: "Bicolor",
        description: "White with color patches",
      },
      point: {
        name: "Pointed",
        description: "Darker face/ears/tail, lighter body",
      },
      solid: {
        name: "Solid",
        description: "White, black, blue, and other self colors",
      },
    },
    care: {
      environment: "Low perches, ramps, non-slip floors; avoid forced high jumps",
      genetic_risks: ["Long-term spinal/joint load related to the short-leg gene", "Obesity sharply increases stress on spine and legs"],
      digestive_health: "Usually normal; manage hairballs in longhairs",
      diet_management: "Strict calorie control is critical",
      grooming: "Weekly for shorthair; 2–3× for longhair",
    },
    gallery: {
      hero_main: {
        description: "Classic short-legged Munchkin",
        alt: "Munchkin cat",
      },
      gallery_item_1: {
        description: "Tabby Munchkin",
        alt: "Tabby Munchkin",
      },
      gallery_item_2: {
        description: "Standing playful posture",
        alt: "Munchkin standing",
      },
      gallery_item_3: {
        description: "Bicolor short-leg look",
        alt: "Bicolor Munchkin",
      },
      gallery_item_4: {
        description: "Playful daily energy",
        alt: "Munchkin at play",
      },
    },
    maturation_years: "About 2–3 years",
  },
  norwegian_forest: {
    eye_color: "Green, gold, or copper",
    size_category: "Large, substantial, triangular profile",
    coat: {
      length: "Long double coat",
      texture: "Water-resistant guard hairs over woolly undercoat",
      undercoat: "Dense seasonal undercoat",
    },
    patterns: {
      tabby_white: {
        name: "Tabby / tabby & white",
        description: "Often brown tabby with white chest, feet, and blaze",
      },
      lynx_tips: {
        name: "Lynx tip ear tufts",
        description: "Ear tufts and long ear furnishings are signature traits",
      },
      winter_coat: {
        name: "Winter coat / ruff",
        description: "Winter double coat and chest mane thicken; heavy seasonal shed",
      },
      solid_smoke: {
        name: "Solid / smoke",
        description: "Many solids/smokes accepted depending on registry (excl. some colors)",
      },
    },
    colors: {
      brown_tabby: {
        name: "Brown tabby",
        description: "Classic forest look",
      },
      silver_tabby: {
        name: "Silver tabby",
        description: "Silver ground with dark markings",
      },
      black_white: {
        name: "Black & white / bicolor",
        description: "Common white spotting combinations",
      },
      red_tabby: {
        name: "Red tabby",
        description: "Warm orange striping",
      },
    },
    care: {
      environment: "Tall climbing furniture; enrichment for a powerful athlete",
      genetic_risks: ["Glycogen storage disease type IV (GSD IV) — reputable breeders screen", "Hip dysplasia", "HCM in some lines"],
      digestive_health: "Hairball management is important with the heavy coat",
      diet_management: "Support slow large-breed growth with quality nutrition",
      grooming: "Deep brushing in seasonal coat blow; routine combing year-round",
    },
    gallery: {
      hero_main: {
        description: "Brown tabby NFC face with lynx tips",
        alt: "Norwegian Forest Cat face",
      },
      gallery_item_1: {
        description: "Thick coat in snow",
        alt: "Norwegian Forest Cat in snow",
      },
      gallery_item_2: {
        description: "Outdoor natural setting",
        alt: "Norwegian Forest Cat outdoors",
      },
      gallery_item_3: {
        description: "Silver tabby face and green eyes",
        alt: "Silver Norwegian Forest Cat",
      },
      gallery_item_4: {
        description: "Snowy group of NFCs",
        alt: "Norwegian Forest Cats in snow",
      },
    },
    maturation_years: "About 3–5 years",
  },
  exotic_shorthair: {
    eye_color: "Copper, gold, or blue/odd-eyed in pointed/white",
    size_category: "Medium, cobby “teddy bear” build",
    coat: {
      length: "Short",
      texture: "Dense and plush",
      undercoat: "Thick; still easier than Persian longhair",
    },
    patterns: {
      tabby: {
        name: "Tabby",
        description: "Brown/silver tabbies with flat faces and big copper eyes",
      },
      bicolor: {
        name: "Bicolor",
        description: "White with blue, red, or tabby patches — classic “Garfield” vibe",
      },
      solid: {
        name: "Solid",
        description: "White, black, blue, red, cream, and more",
      },
      colorpoint: {
        name: "Colorpoint",
        description: "Himalayan-style points on a short coat; blue eyes",
      },
    },
    colors: {
      brown_tabby: {
        name: "Brown tabby",
        description: "Classic Exotic look",
      },
      blue_white: {
        name: "Blue & white",
        description: "Blue-gray with white chest/face",
      },
      cream_white: {
        name: "Cream & white",
        description: "Soft light tones",
      },
      calico: {
        name: "Calico / tortie-white",
        description: "Orange, black, and white patches",
      },
    },
    care: {
      environment: "Quiet, cool, well-ventilated indoor home",
      genetic_risks: ["PKD — confirm parental testing", "Brachycephalic tear overflow, congestion, breathing load", "HCM in some lines"],
      digestive_health: "Watch hairballs; choose easy-chew food forms",
      diet_management: "Calorie control protects breathing and heart",
      grooming: "Brush several times weekly; daily eye cleaning",
    },
    gallery: {
      hero_main: {
        description: "Brown tabby Exotic with copper eyes",
        alt: "Brown tabby Exotic Shorthair",
      },
      gallery_item_1: {
        description: "Blue-and-white Exotic by a window",
        alt: "Blue-and-white Exotic Shorthair",
      },
      gallery_item_2: {
        description: "Brown tabby profile",
        alt: "Tabby Exotic profile",
      },
      gallery_item_3: {
        description: "Cream Exotic resting at home",
        alt: "Exotic Shorthair resting",
      },
      gallery_item_4: {
        description: "Cream-white Exotic gazing upward",
        alt: "Cream Exotic Shorthair",
      },
    },
    maturation_years: "About 2–3 years",
  },
  maine_coon: {
    eye_color: "Green, gold, copper; odd eyes possible with white",
    size_category: "Large to giant; rectangular and muscled",
    coat: {
      length: "Long / shaggy",
      texture: "Silky, water-shedding; heavier ruff and britches",
      undercoat: "Seasonal undercoat",
    },
    patterns: {
      classic_tabby: {
        name: "Classic / patterned tabby",
        description: "Very common; forehead “M” and a plumed tail",
      },
      silver_tabby: {
        name: "Silver tabby",
        description: "Silver ground with crisp dark markings",
      },
      bicolor: {
        name: "Bicolor / white spotting",
        description: "White chest, feet, blaze, and more",
      },
      solid_smoke: {
        name: "Solid / smoke",
        description: "Black, blue, red, cream, and smoke looks",
      },
    },
    colors: {
      brown_tabby: {
        name: "Brown tabby",
        description: "The classic representative color",
      },
      silver_tabby: {
        name: "Silver tabby",
        description: "Metallic silver ground",
      },
      red_tabby: {
        name: "Red tabby",
        description: "Warm orange striping",
      },
      bicolor: {
        name: "Bicolor",
        description: "White with other color blocks",
      },
    },
    care: {
      environment: "Sturdy tall trees; space for a big, social athlete",
      genetic_risks: ["HCM", "Hip dysplasia", "Spinal muscular atrophy (SMA) — screen in good catteries"],
      digestive_health: "Hairball care for the long coat",
      diet_management: "Large-breed growth then controlled adult portions",
      grooming: "Several brushes weekly on ruff, pants, and plume",
    },
    gallery: {
      hero_main: {
        description: "Outdoor brown tabby Maine with lynx tips",
        alt: "Maine Coon outdoors",
      },
      gallery_item_1: {
        description: "Longhair face close-up",
        alt: "Maine Coon face",
      },
      gallery_item_2: {
        description: "Boxed muzzle and green eyes",
        alt: "Maine Coon front view",
      },
      gallery_item_3: {
        description: "Large full body with plume tail",
        alt: "Maine Coon full body",
      },
      gallery_item_4: {
        description: "Three-color Maine group",
        alt: "Maine Coon group",
      },
      gallery_item_5: {
        description: "Silver tabby Maine",
        alt: "Silver Maine Coon",
      },
    },
    maturation_years: "About 3–5 years",
  },
  persian: {
    eye_color: "Copper, blue, or odd-eyed depending on color",
    size_category: "Medium, cobby and rounded",
    coat: {
      length: "Long",
      texture: "Full and soft; mats without daily care",
      undercoat: "Dense undercoat",
    },
    patterns: {
      solid_longhair: {
        name: "Solid longhair",
        description: "White, blue, cream, and other luxurious self colors",
      },
      bicolor: {
        name: "Bicolor / patched",
        description: "White with color blocks — classic Persian look",
      },
      face_type: {
        name: "Flat face structure",
        description: "Round face, short nose, and large eyes",
      },
    },
    colors: {
      white_cream: {
        name: "White / cream",
        description: "Classic light longhair",
      },
      blue: {
        name: "Blue",
        description: "Blue-gray longhair",
      },
      red_bicolor: {
        name: "Red & white / red tabby",
        description: "Warm bicolor tones",
      },
    },
    care: {
      environment: "Quiet, stable indoor home; avoid chaos and forced athletics",
      genetic_risks: ["PKD — review health testing when adopting", "Tear overflow and breathing comfort from flat faces", "Dental/bite issues"],
      digestive_health: "Hairballs rise quickly if grooming slips",
      diet_management: "Hairball-support formulas; control portions",
      grooming: "Daily brushing is mandatory",
    },
    gallery: {
      hero_main: {
        description: "Classic Persian elegance with full coat and flat face",
        alt: "Persian cat",
      },
      gallery_item_01: {
        description: "Cream long coat with rounded outline",
        alt: "Cream Persian",
      },
      gallery_item_02: {
        description: "Fluffy coat texture close-up",
        alt: "Fluffy Persian",
      },
      gallery_item_03: {
        description: "Flat-face close-up with large round eyes",
        alt: "Persian face",
      },
      gallery_item_04: {
        description: "Quiet, elegant portrait angle",
        alt: "Persian portrait",
      },
      gallery_item_05: {
        description: "Calm indoor lifestyle companion",
        alt: "Persian at home",
      },
    },
    maturation_years: "About 2–3 years",
  },
  scottish_fold: {
    eye_color: "Wide range — copper, gold, green, blue",
    size_category: "Medium, rounded and compact",
    coat: {
      length: "Short or long (Fold / Highland Fold)",
      texture: "Dense and resilient",
      undercoat: "Moderate to dense",
    },
    patterns: {
      folded_ears: {
        name: "Folded ears",
        description: "Forward fold creating the owl-like look",
      },
      solid: {
        name: "Solid",
        description: "Even self colors",
      },
      tabby: {
        name: "Tabby",
        description: "Very common patterned Folds",
      },
      bicolor: {
        name: "Bicolor",
        description: "White with color patches",
      },
    },
    colors: {
      blue: {
        name: "Blue",
        description: "Soft blue-gray",
      },
      white: {
        name: "White",
        description: "White Fold look",
      },
      tabby: {
        name: "Tabby",
        description: "Brown or other tabbies",
      },
      bicolor: {
        name: "Bicolor",
        description: "White with color patches",
      },
    },
    care: {
      environment: "Soft beds, moderate play, attentive joint monitoring",
      genetic_risks: ["Osteochondrodysplasia linked to the fold gene — watch gait and tail flexibility", "Folds trap debris — clean ears often", "HCM in some lines"],
      digestive_health: "Generally normal with a steady diet",
      diet_management: "Keep lean to spare joints",
      grooming: "Weekly coat care; ear hygiene is essential",
    },
    gallery: {
      hero_main: {
        description: "Blue Scottish Fold with copper eyes",
        alt: "Scottish Fold",
      },
      gallery_item_1: {
        description: "Studio full-body Fold",
        alt: "Scottish Fold studio",
      },
      gallery_item_2: {
        description: "Outdoor Fold in a basket",
        alt: "Scottish Fold outdoors",
      },
      gallery_item_3: {
        description: "Brown tabby Fold close-up",
        alt: "Tabby Scottish Fold",
      },
      gallery_item_4: {
        description: "White Fold sitting",
        alt: "White Scottish Fold",
      },
      gallery_item_5: {
        description: "Cozy home Fold",
        alt: "Scottish Fold relaxing",
      },
    },
    maturation_years: "About 2–3 years",
  },
  siamese: {
    eye_color: "Vivid blue",
    size_category: "Medium, svelte and tubular",
    coat: {
      length: "Short",
      texture: "Fine, close-lying, low maintenance",
      undercoat: "Little undercoat",
    },
    patterns: {
      seal_point: {
        name: "Seal point",
        description: "Dark brown points — classic Siamese",
      },
      chocolate_point: {
        name: "Chocolate point",
        description: "Milk-chocolate points",
      },
      blue_point: {
        name: "Blue point",
        description: "Blue-gray points",
      },
      lilac_point: {
        name: "Lilac point",
        description: "Pale pinkish-gray points",
      },
    },
    colors: {
      seal: {
        name: "Seal",
        description: "Deep brown points",
      },
      chocolate: {
        name: "Chocolate",
        description: "Warm mid-brown points",
      },
      blue: {
        name: "Blue",
        description: "Blue-gray points",
      },
      lilac: {
        name: "Lilac",
        description: "Soft lilac points",
      },
    },
    care: {
      environment: "Social indoor life with climbing and conversation",
      genetic_risks: ["Progressive retinal atrophy (PRA) in some lines", "Amyloidosis concerns in some older lines", "Dental and upper-respiratory checks"],
      digestive_health: "Usually fine on consistent high-quality food",
      diet_management: "Lean protein-forward meals for a svelte body",
      grooming: "Weekly wipe-down or soft brush",
    },
    gallery: {
      hero_main: {
        description: "Seal-point Siamese with blue eyes",
        alt: "Seal-point Siamese",
      },
      gallery_item_1: {
        description: "Seal point full body and mask",
        alt: "Seal-point Siamese full body",
      },
      gallery_item_2: {
        description: "Blue almond-eye close-up",
        alt: "Siamese blue eyes",
      },
      gallery_item_3: {
        description: "Elegant seated Siamese",
        alt: "Seated Siamese",
      },
      gallery_item_4: {
        description: "Classic female Siamese",
        alt: "Classic Siamese",
      },
      gallery_item_5: {
        description: "Chocolate point",
        alt: "Chocolate-point Siamese",
      },
    },
    maturation_years: "About 2–3 years",
  },
  bengal: {
    eye_color: "Gold, green, or hazel",
    size_category: "Medium to large, athletic and muscled",
    coat: {
      length: "Short",
      texture: "Dense, often with “glitter” sheen",
      undercoat: "Light",
    },
    patterns: {
      rosetted: {
        name: "Rosettes",
        description: "Most popular: arrowhead or pancake leopard-like rosettes",
      },
      spotted: {
        name: "Spotted",
        description: "Clear round or broken spots",
      },
      marble: {
        name: "Marble",
        description: "Horizontal flowing marble pattern",
      },
      snow: {
        name: "Snow",
        description: "Light ground with darker markings; some are pointed with blue eyes",
      },
    },
    colors: {
      brown: {
        name: "Brown / gold",
        description: "Classic golden ground with dark markings",
      },
      silver: {
        name: "Silver",
        description: "Cool silver ground with black markings",
      },
      snow_lynx: {
        name: "Snow lynx",
        description: "Light pointed look with blue eyes",
      },
      charcoal: {
        name: "Charcoal",
        description: "Dramatic dark contrast",
      },
    },
    care: {
      environment: "High-enrichment home: height, water play, long hunt games",
      genetic_risks: ["HCM", "Pectus excavatum occasionally in kittens", "PRA-b — screened by good catteries"],
      digestive_health: "Usually robust; keep diet transitions sensible",
      diet_management: "High-protein athletic feeding",
      grooming: "Light weekly brush",
    },
    gallery: {
      hero_main: {
        description: "Golden rosetted Bengal",
        alt: "Bengal cat",
      },
      gallery_item_1: {
        description: "Clear rosette detail",
        alt: "Rosetted Bengal",
      },
      gallery_item_2: {
        description: "Spotted leopard look",
        alt: "Spotted Bengal",
      },
      gallery_item_3: {
        description: "Athletic motion",
        alt: "Athletic Bengal",
      },
      gallery_item_4: {
        description: "Golden glitter coat",
        alt: "Golden Bengal",
      },
      gallery_item_5: {
        description: "Full-body pattern display",
        alt: "Bengal full body",
      },
    },
    maturation_years: "About 2–3 years",
  },
  sphynx: {
    eye_color: "Wide range — green, gold, blue, odd-eyed",
    size_category: "Medium, hard and muscular; pot-bellied look common",
    coat: {
      length: "Hairless / peach fuzz",
      texture: "Warm suede-like skin with wrinkles",
      undercoat: "None",
    },
    patterns: {
      solid: {
        name: "Solid skin pigment",
        description: "Even color on the skin",
      },
      bicolor: {
        name: "Bicolor / van",
        description: "White areas with color blocks",
      },
      pointed: {
        name: "Pointed contrast",
        description: "Darker cooler points on a lighter body",
      },
      calico_tortie: {
        name: "Calico / tortie pigment",
        description: "Multi-color pigment visible on skin",
      },
    },
    colors: {
      pink_white: {
        name: "Pink / white",
        description: "Light skin tones",
      },
      black_grey: {
        name: "Black / gray pigment",
        description: "Darker skin pigment",
      },
      calico: {
        name: "Calico patches",
        description: "Tri-color skin patches",
      },
      tuxedo: {
        name: "Tuxedo",
        description: "Black-and-white skin contrast",
      },
    },
    care: {
      environment: "Warm indoor climate; sunburn and chill protection",
      genetic_risks: ["HCM — schedule cardiac checks", "Skin oil acne and irritation", "Ear wax buildup without hair"],
      digestive_health: "Usually normal; skin issues are the bigger focus",
      diet_management: "Higher calories sometimes needed; watch body condition",
      grooming: "Regular baths, ear cleaning, and nail care",
    },
    gallery: {
      hero_main: {
        description: "Classic wrinkled Sphynx",
        alt: "Sphynx cat",
      },
      gallery_item_1: {
        description: "Calico skin patches",
        alt: "Calico Sphynx",
      },
      gallery_item_2: {
        description: "Tuxedo contrast",
        alt: "Tuxedo Sphynx",
      },
      gallery_item_3: {
        description: "Large ears and blue eyes",
        alt: "Sphynx portrait",
      },
      gallery_item_4: {
        description: "Hairless kitten",
        alt: "Sphynx kitten",
      },
      gallery_item_5: {
        description: "Neck wrinkles in profile",
        alt: "Sphynx profile",
      },
    },
    maturation_years: "About 2–3 years",
  },
  devon_rex: {
    eye_color: "Wide range matching coat color",
    size_category: "Small to medium, lithe with large ears",
    coat: {
      length: "Short, wavy/curly",
      texture: "Soft and fine; may thin with age or over-bathing",
      undercoat: "Sparse",
    },
    patterns: {
      solid: {
        name: "Solid",
        description: "Even self colors",
      },
      bicolor: {
        name: "Bicolor",
        description: "White with color",
      },
      pointed: {
        name: "Pointed",
        description: "Siamese-style points on a Rex coat",
      },
      tabby_tortie: {
        name: "Tabby / tortie",
        description: "Patterned Rex coats",
      },
    },
    colors: {
      blue: {
        name: "Blue",
        description: "Blue Rex",
      },
      black_white: {
        name: "Black & white",
        description: "Bicolor Devon",
      },
      cream_point: {
        name: "Cream point",
        description: "Soft cream points",
      },
      lilac_point: {
        name: "Lilac point",
        description: "Lilac pointed Devon",
      },
    },
    care: {
      environment: "Warmth-loving indoor clowns with lots of people time",
      genetic_risks: ["HCM", "Hereditary myopathy in some lines", "Large ears need routine checks"],
      digestive_health: "Some sensitive eaters — go slow on changes",
      diet_management: "Balanced quality diet for an acrobatic small frame",
      grooming: "Gentle weekly grooming; don’t over-bathe",
    },
    gallery: {
      hero_main: {
        description: "Blue Devon Rex with big ears",
        alt: "Devon Rex",
      },
      gallery_item_1: {
        description: "Black-and-white Devon",
        alt: "Bicolor Devon Rex",
      },
      gallery_item_2: {
        description: "Wave coat close-up",
        alt: "Devon Rex coat",
      },
      gallery_item_3: {
        description: "Cream point Devon",
        alt: "Cream-point Devon Rex",
      },
      gallery_item_4: {
        description: "Outdoor wavy detail",
        alt: "Devon Rex outdoors",
      },
      gallery_item_5: {
        description: "Lilac point studio",
        alt: "Lilac-point Devon Rex",
      },
    },
    maturation_years: "About 2–3 years",
  },
  mix_shorthair: {
    eye_color: "Any — gold, green, copper, blue, odd-eyed",
    size_category: "Usually small to medium; highly variable",
    coat: {
      length: "Typically short",
      texture: "Practical and easy-care",
      undercoat: "Seasonal, varies by individual",
    },
    patterns: {
      tabby: {
        name: "Tabby",
        description: "Most common in HK: mackerel, classic, or spotted",
      },
      orange: {
        name: "Ginger",
        description: "Warm orange / orange-and-white; often described as sunny",
      },
      tuxedo_bicolor: {
        name: "Tuxedo / bicolor",
        description: "Crisp black-and-white or white with color blocks",
      },
      calico_tortie_solid: {
        name: "Calico / tortie / solid",
        description: "Calico, tortie, solid black, solid white, and more",
      },
    },
    colors: {
      tabby: {
        name: "Tabby",
        description: "Gray-brown striping is everywhere",
      },
      orange: {
        name: "Ginger",
        description: "Orange / orange-and-white",
      },
      black: {
        name: "Black",
        description: "Sleek solid black",
      },
      tuxedo: {
        name: "Tuxedo",
        description: "Classic black-and-white",
      },
    },
    care: {
      environment: "Indoor-preferred with windows, trees, and daily trust-building",
      genetic_risks: ["No single breed disease — still prevent obesity, urinary issues, dental disease, parasites", "Plan desexing and microchipping for intact cats"],
      digestive_health: "Usually hardy; keep diet changes gradual",
      diet_management: "Complete diet + more wet food for urinary health",
      grooming: "Weekly brush for most shorthairs",
    },
    gallery: {
      hero_main: {
        description: "Classic tabby Tong cat",
        alt: "Tabby Hong Kong shorthair",
      },
      gallery_item_1: {
        description: "Black-and-white tuxedo mix",
        alt: "Tuxedo Tong cat",
      },
      gallery_item_2: {
        description: "Bright ginger",
        alt: "Ginger Tong cat",
      },
      gallery_item_3: {
        description: "Friendly face close-up",
        alt: "Tong cat portrait",
      },
      gallery_item_4: {
        description: "Tabby everyday at home",
        alt: "Tabby at home",
      },
      gallery_item_5: {
        description: "Sleek black cat",
        alt: "Black Tong cat",
      },
    },
    maturation_years: "About 1–2 years",
  },
};

export type LocalizedBreedView = {
  name: string;
  coatLabel: string;
  shortDescription: string;
  origin: string;
  lifespan: string;
  weight: string;
  personality: string[];
  careTips: string[];
  nutritionAdvice: string[];
  fullDescription: string;
  title: string;
  subtitle: string | null;
  physical: {
    eye_color: string;
    size_category: string;
    maturation_years?: string;
    coat_length: string;
    coat_texture: string;
    coat_undercoat: string;
  } | null;
  patterns: Array<{
    pattern_id: string;
    name: string;
    description: string;
    image_url: string;
  }>;
  colors: Array<{ color_id: string; name: string; description: string }>;
  careAndHealth: {
    environment: string;
    genetic_risks: string[];
    digestive_health: string;
    diet_management: string;
    grooming: string;
  } | null;
  gallerySlides: Array<{
    tag: string;
    src: string;
    alt: string;
    description: string;
  }>;
  riskJoiner: string;
};

export function getLocalizedBreedView(
  breed: CatBreed,
  locale: Locale,
): LocalizedBreedView {
  const en = locale === "en";
  const info = breed.breedInfo;
  const infoEn = info ? CAT_BREED_INFO_EN[info.breed_id] : undefined;

  const title = en
    ? info?.name_en || breed.nameEn
    : info?.name_zh_hk || breed.name;

  let subtitle: string | null = null;
  if (info) {
    if (en) {
      const extras = info.aliases.filter(
        (alias) => alias !== info.name_en && alias !== breed.nameEn,
      );
      subtitle = extras.length > 0 ? extras.join(" · ") : breed.name;
    } else {
      subtitle = `${info.name_en}${
        info.aliases.length ? ` · ${info.aliases.join("／")}` : ""
      }`;
    }
  } else if (en) {
    subtitle = breed.name;
  }

  const physical = info
    ? en && infoEn
      ? {
          eye_color: infoEn.eye_color,
          size_category: infoEn.size_category,
          maturation_years: infoEn.maturation_years,
          coat_length: infoEn.coat.length,
          coat_texture: infoEn.coat.texture,
          coat_undercoat: infoEn.coat.undercoat,
        }
      : {
          eye_color: info.physical_characteristics.eye_color,
          size_category: info.physical_characteristics.size_category,
          maturation_years: info.physical_characteristics.maturation_years,
          coat_length: info.physical_characteristics.coat.length,
          coat_texture: info.physical_characteristics.coat.texture,
          coat_undercoat: info.physical_characteristics.coat.undercoat,
        }
    : null;

  const patterns =
    info?.patterns.map((pattern) => {
      const tr = infoEn?.patterns[pattern.pattern_id];
      return {
        pattern_id: pattern.pattern_id,
        name: en && tr ? tr.name : pattern.name_zh,
        description: en && tr ? tr.description : pattern.description,
        image_url: pattern.image_url,
      };
    }) ?? [];

  const colors =
    info?.colors.map((color) => {
      const tr = infoEn?.colors[color.color_id];
      return {
        color_id: color.color_id,
        name: en && tr ? tr.name : color.name_zh,
        description: en && tr ? tr.description : color.description,
      };
    }) ?? [];

  const careAndHealth = info
    ? en && infoEn
      ? { ...infoEn.care }
      : {
          environment: info.care_and_health.environment,
          genetic_risks: info.care_and_health.genetic_risks,
          digestive_health: info.care_and_health.digestive_health,
          diet_management: info.care_and_health.diet_management,
          grooming: info.care_and_health.grooming,
        }
    : null;

  const gallerySlides =
    info?.media_assets.images
      .filter((image) => Boolean(image.src))
      .map((image) => {
        const tr = infoEn?.gallery[image.tag];
        return {
          tag: image.tag,
          src: image.src,
          alt: en && tr ? tr.alt : image.alt,
          description: en && tr ? tr.description : image.description,
        };
      }) ?? [];

  return {
    name: en ? breed.nameEn : breed.name,
    coatLabel: en ? breed.coatLabelEn : breed.coatLabel,
    shortDescription: en
      ? breed.shortDescriptionEn
      : breed.shortDescription,
    origin: en ? breed.originEn : breed.origin,
    lifespan: en ? breed.lifespanEn : breed.lifespan,
    weight: en ? breed.weightEn : breed.weight,
    personality: en ? breed.personalityEn : breed.personality,
    careTips: en ? breed.careTipsEn : breed.careTips,
    nutritionAdvice: en ? breed.nutritionAdviceEn : breed.nutritionAdvice,
    fullDescription: en
      ? breed.fullDescriptionEn
      : breed.fullDescription,
    title,
    subtitle,
    physical,
    patterns,
    colors,
    careAndHealth,
    gallerySlides,
    riskJoiner: en ? ", " : "、",
  };
}
