'use server';

import { deriveDropdownValues } from "../lib/utils";

// https://public.opendatasoft.com/api/records/1.0/search/?refine.make=Volkswagen&rows=0&facet=make&facet=model&facet=cylinders&facet=drive&facet=eng_dscr&facet=fueltype&facet=fueltype1&facet=mpgdata&facet=phevblended&facet=trany&facet=vclass&facet=year&facetsort.year=-count&dataset=all-vehicles-model&timezone=Europe%2FBerlin&lang=en


// https://public.opendatasoft.com/api/records/1.0/search/?rows=0&facet=make&facet=model&facet=cylinders&facet=drive&facet=eng_dscr&facet=fueltype&facet=fueltype1&facet=mpgdata&facet=phevblended&facet=trany&facet=vclass&facet=year&facetsort.year=-count&dataset=all-vehicles-model&timezone=Europe%2FBerlin&lang=en

const baseURLPlus = "https://public.opendatasoft.com/api/records/1.0/search/?q=BMW&refine.make=BMW&rows=0&facet=make&facet=model&facet=cylinders&facet=drive&facet=eng_dscr&facet=fueltype&facet=fueltype1&facet=mpgdata&facet=phevblended&facet=trany&facet=vclass&facet=year&facetsort.year=-count&dataset=all-vehicles-model&timezone=Europe%2FBerlin&lang=en";

const baseURL = "https://public.opendatasoft.com/api/records/1.0/search/?q="

export async function getAllMakes(locale: string) {
  const makeURL = `https://public.opendatasoft.com/api/records/1.0/search/?rows=0&facet=make&dataset=all-vehicles-model&timezone=Europe%2FBerlin&lang=${locale}`;
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
  const dropdownValues = deriveDropdownValues(data.facet_groups[0].facets);

  return dropdownValues;
}

export async function getAllModels(make: string, locale: string) {
  const url = baseURL + make + "&refine.make=" + make + `&rows=0&facet=make&facet=model&dataset=all-vehicles-model&timezone=Europe%2FBerlin&lang=${locale}`;
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
  const dropdownValues = deriveDropdownValues(data.facet_groups[1].facets);

  return dropdownValues;
}

export async function getAllTrims(make: string, model: string, locale: string) {
  const url = baseURL + make + "&refine.make=" + make + "&refine.model=" + model + `&facet=cylinders&facet=drive&facet=eng_dscr&facet=fueltype&facet=fueltype1&facet=mpgdata&facet=phevblended&facet=trany&facet=vclass&facet=year&facetsort.year=-count&dataset=all-vehicles-model&timezone=Europe%2FBerlin&lang=${locale}`;
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
  console.log(data);
  let r = [
    { name: 'cylinders', facets: [Array] },
    { name: 'drive', facets: [Array] },
    { name: 'eng_dscr', facets: [Array] },
    { name: 'fueltype', facets: [Array] },
    { name: 'fueltype1', facets: [Array] },
    { name: 'mpgdata', facets: [Array] },
    { name: 'phevblended', facets: [Array] },
    { name: 'trany', facets: [Array] },
    { name: 'vclass', facets: [Array] },
    { name: 'year', facets: [Array] },
    { name: 'make', facets: [Array] },
    { name: 'model', facets: [Array] }
  ]
  let trims = {}
  data.facet_groups.forEach((facetGroup) => {
    trims[facetGroup.name] = deriveDropdownValues(facetGroup.facets);
  });

  const dropdownValues = deriveDropdownValues(data.facet_groups[1].facets);
  console.log('dropdownValues:', dropdownValues);

  return trims;
}
