export type CountryCode = "MR" | "MA" | "DZ" | "TN" | "LY";

export interface Region {
  slug: string;
  name: string;
}

export interface CountryRegions {
  code: CountryCode;
  label: string;
  regions: Region[];
}

export interface ListingCategory {
  slug: string;
  title: string;
  color: string;
  icon: string;
  description: string;
}
