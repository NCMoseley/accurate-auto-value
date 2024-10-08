// https://public.opendatasoft.com/api/records/1.0/search/?refine.make=Volkswagen&rows=0&facet=make&facet=model&facet=cylinders&facet=drive&facet=eng_dscr&facet=fueltype&facet=fueltype1&facet=mpgdata&facet=phevblended&facet=trany&facet=vclass&facet=year&facetsort.year=-count&dataset=all-vehicles-model&timezone=Europe%2FBerlin&lang=en

import { deriveDropdownValues } from "../lib/utils";

// https://public.opendatasoft.com/api/records/1.0/search/?rows=0&facet=make&facet=model&facet=cylinders&facet=drive&facet=eng_dscr&facet=fueltype&facet=fueltype1&facet=mpgdata&facet=phevblended&facet=trany&facet=vclass&facet=year&facetsort.year=-count&dataset=all-vehicles-model&timezone=Europe%2FBerlin&lang=en

const baseURLPlus = "https://public.opendatasoft.com/api/records/1.0/search/?q=BMW&refine.make=BMW&rows=0&facet=make&facet=model&facet=cylinders&facet=drive&facet=eng_dscr&facet=fueltype&facet=fueltype1&facet=mpgdata&facet=phevblended&facet=trany&facet=vclass&facet=year&facetsort.year=-count&dataset=all-vehicles-model&timezone=Europe%2FBerlin&lang=en";

const baseURL = "https://public.opendatasoft.com/api/records/1.0/search/?q="


function generateURL(make: string, model?: string) {
  return baseURL + make + "&refine.make=" + make + "&rows=0&facet=make&facet=model&dataset=all-vehicles-model&timezone=Europe%2FBerlin&lang=en";
}

export async function getAllMakes() {
  const makeURL = "https://public.opendatasoft.com/api/records/1.0/search/?rows=0&facet=make&dataset=all-vehicles-model&timezone=Europe%2FBerlin&lang=en";
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

export async function getAutoDetails<JSON = any>(
  make: string,
  init?: RequestInit,
): Promise<JSON> {
  const url = generateURL(make);
  console.log("url", url);
  const res = await fetch(url, init);

  console.log("res", res);

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

  return res.json();
}