import type { CategoryHierarchy } from "../types/category-types";
import { getCategoryColor, getCategoryIcon } from "../helpers/categories";

// Raw category definitions without colors
const RAW_CATEGORIES = [
  // 1. INCOME
  {
    slug: "income",
    name: "Entrate",
    description: "Tutte le fonti di reddito e guadagno.",
    children: [
      {
        slug: "salary",
        name: "Stipendio",
        description: "Reddito da lavoro dipendente.",
      },
      {
        slug: "bonus",
        name: "Bonus & Premi",
        description: "Bonus, premi e incentivi ricevuti.",
      },
      {
        slug: "freelance",
        name: "Freelance",
        description: "Entrate da lavoro autonomo o freelance.",
      },
      {
        slug: "other-income",
        name: "Altre Entrate",
        description: "Altre fonti di reddito non specificate.",
      },
    ],
  },

  // 2. HOUSING
  {
    slug: "housing",
    name: "Casa",
    description: "Spese relative all'abitazione.",
    children: [
      {
        slug: "rent-mortgage",
        name: "Affitto / Mutuo",
        description: "Pagamenti di affitto o mutuo.",
      },
      {
        slug: "utilities",
        name: "Utenze",
        description: "Spese per luce, gas, acqua e altre utenze.",
      },
      {
        slug: "maintenance",
        name: "Manutenzione",
        description: "Riparazioni e manutenzione della casa.",
      },
      {
        slug: "insurance",
        name: "Assicurazioni",
        description: "Assicurazioni relative all'abitazione.",
      },
    ],
  },

  // 3. TRANSPORTATION
  {
    slug: "transport",
    name: "Trasporti",
    description: "Spese per spostamenti e mezzi di trasporto.",
    children: [
      {
        slug: "fuel",
        name: "Carburante",
        description: "Spese per benzina, diesel o altri carburanti.",
      },
      {
        slug: "car-maintenance",
        name: "Manutenzione Auto",
        description: "Riparazioni e manutenzione dei veicoli.",
      },
      {
        slug: "public-transport",
        name: "Trasporto Pubblico",
        description: "Biglietti e abbonamenti per mezzi pubblici.",
      },
      {
        slug: "car-insurance",
        name: "Assicurazione mezzi",
        description: "Assicurazioni per auto o altri veicoli.",
      },
    ],
  },

  // 4. FOOD & DRINK
  {
    slug: "food-drink",
    name: "Cibo e Bevande",
    description: "Spese per alimenti e bevande.",
    children: [
      {
        slug: "groceries",
        name: "Spesa",
        description: "Acquisti di generi alimentari.",
      },
      {
        slug: "restaurants",
        name: "Ristoranti",
        description: "Pranzi e cene fuori casa.",
      },
      {
        slug: "bar",
        name: "Bar",
        description: "Colazioni, aperitivi e consumazioni al bar.",
      },
      {
        slug: "delivery",
        name: "Delivery",
        description: "Cibo ordinato a domicilio.",
      },
    ],
  },

  // 5. HEALTH
  {
    slug: "health",
    name: "Salute",
    description: "Spese per la salute e il benessere.",
    children: [
      {
        slug: "pharmacy",
        name: "Farmacia",
        description: "Acquisto di farmaci e prodotti sanitari.",
      },
      {
        slug: "doctor",
        name: "Visite Mediche",
        description: "Visite mediche e specialistiche.",
      },
      {
        slug: "sport",
        name: "Sport e Palestra",
        description: "Abbonamenti e attrezzature sportive.",
      },
      {
        slug: "personal-care",
        name: "Cura personale",
        description: "Spese per la cura della persona.",
      },
    ],
  },

  // 6. LEISURE
  {
    slug: "leisure",
    name: "Tempo Libero",
    description: "Attività ricreative e di svago.",
    children: [
      {
        slug: "subscriptions",
        name: "Abbonamenti",
        description: "Abbonamenti a servizi di intrattenimento.",
      },
      {
        slug: "travel",
        name: "Viaggi",
        description: "Spese per viaggi e vacanze.",
      },
      {
        slug: "events",
        name: "Eventi",
        description: "Partecipazione a eventi, concerti, spettacoli.",
      },
      {
        slug: "hobby",
        name: "Hobby",
        description: "Materiali e attività per hobby e passioni.",
      },
    ],
  },

  // 6. FAMILY
  {
    slug: "family",
    name: "Famiglia",
    description: "Spese legate alla famiglia e ai membri della famiglia.",
    children: [
      {
        slug: "school",
        name: "Istruzione",
        description: "Spese scolastiche e formative.",
      },
      { slug: "children", name: "Figli", description: "Spese per i figli." },
      {
        slug: "pets",
        name: "Animali domestici",
        description: "Cure e alimentazione per animali domestici.",
      },
      {
        slug: "gifts",
        name: "Regali",
        description: "Acquisto di regali per familiari e amici.",
      },
    ],
  },

  // 7. OTHER
  {
    slug: "other",
    name: "Varie",
    description: "Altre spese non categorizzate altrove.",
    children: [
      {
        slug: "donations",
        name: "Donazioni",
        description: "Donazioni a enti o associazioni.",
      },
      {
        slug: "unexpected",
        name: "Imprevisti",
        description: "Spese impreviste o emergenze.",
      },
      {
        slug: "misc",
        name: "Altro",
        description: "Spese varie non specificate.",
      },
      {
        slug: "transfer",
        name: "Transfer",
        description: "Trasferimenti di denaro tra conti.",
        system: true,
        excluded: true,
      },
      {
        slug: "uncategorized",
        name: "Uncategorized",
        description: "Transazioni senza categoria assegnata.",
        system: true,
      },
    ],
  },
] as const;

// Function to automatically apply colors and parentSlug to all categories
function applyColorsToCategories(
  rawCategories: typeof RAW_CATEGORIES,
): CategoryHierarchy {
  return rawCategories.map((parent) => ({
    ...parent,
    color: getCategoryColor(parent.slug),
    icon: getCategoryIcon(parent.slug),
    system: false,
    excluded: false, // Default to not excluded
    children: parent.children.map((child) => ({
      ...child,
      parentSlug: parent.slug, // Automatically add parentSlug
      color: getCategoryColor(child.slug),
      icon: getCategoryIcon(child.slug),
      system: child.slug === "uncategorized",
      excluded: child.slug === "transfer", // Default to not excluded
    })),
  }));
}

export const CATEGORIES: CategoryHierarchy =
  applyColorsToCategories(RAW_CATEGORIES);
