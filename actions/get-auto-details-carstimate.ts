"use server"

import { deriveDropdownValues } from "../lib/utils";

// const baseURL = "https://public.opendatasoft.com/api/records/1.0/search/"
const baseURL = "https://carstimate.ch/api/estimation/"

export async function getAllMakes(year: string, locale: string) {
  const makeURL = baseURL + `brands`;
  const res = await fetch(makeURL);

  if (!res.ok) {
    const json = await res.json();
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number;
      };
      error.status = res.status;
      throw error;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }

  const data = await res.json();
  console.log("data:", data);
  const dropdownValues = deriveDropdownValues(data);

  return dropdownValues;
}

export async function getAllModels(year: string, make: string, locale: string) {
  const url = baseURL + `?q=${make}&refine.make=${make}&refine.year=${year}&rows=0&facet=make&facet=model&dataset=all-vehicles-model&timezone=Europe%2FBerlin&lang=${locale}`;
  const res = await fetch(url);

  if (!res.ok) {
    const json = await res.json();
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number;
      };
      error.status = res.status;
      throw error;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }

  const data = await res.json();
  console.log("data:", data);
  if (!data?.facet_groups?.length) return [];

  const dropdownValues = deriveDropdownValues(data?.facet_groups[1]?.facets);

  return dropdownValues;
}

export async function getAllTrims(year: string, make: string, model: string, locale: string): Promise<{ trims: Record<string, { value: string; label: string }[]>, trim: Record<string, string> }> {
  const url = baseURL + `?q=${make}&refine.make=${make}&refine.year=${year}&refine.model=${model}&facet=cylinders&facet=drive&facet=eng_dscr&facet=fueltype&facet=fueltype1&facet=mpgdata&facet=phevblended&facet=trany&facet=vclass&dataset=all-vehicles-model&timezone=Europe%2FBerlin&lang=${locale}`;
  console.log(url);
  const res = await fetch(url);

  if (!res.ok) {
    const json = await res.json();
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number;
      };
      error.status = res.status;
      throw error;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }

  const data = await res.json();
  let trims = {};
  let trim = {};
  if (!data) return { trims, trim };
  data?.facet_groups?.forEach((facetGroup) => {
    if (facetGroup.name !== "mpgdata" && facetGroup.name !== "phevblended" && facetGroup.name !== "fueltype") {
      trims[facetGroup.name] = deriveDropdownValues(facetGroup.facets);
    }
  });

  Object.keys(trims).forEach((key) => {
    if (trims[key].length === 1) {
      trim[key] = trims[key][0].value
    }
  });

  console.log("trims:", trims);
  console.log("trim:", trim);

  return {
    trims,
    trim,
  };
}
