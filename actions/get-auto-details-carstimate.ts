"use server"

import { getTranslations } from "next-intl/server";
import { deriveDropdownValues } from "../lib/utils";

const baseURL = "https://carstimate.ch/api/estimation"

type DropdownValues = {
  label: string;
  value: string;
};

export async function getAllMakes(): Promise<DropdownValues[]> {
  const t = await getTranslations("ServerData");
  const url = baseURL + `/brands`;
  try {
    const res = await fetch(url);

    // if (!res.ok) {
    let json;

    try {
      json = await res.json();
    } catch (error) {
      const errorText = await res.text();
      console.error("Makes json error occurred" + errorText, { cause: error });
    }

    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number;
      };
      error.status = res.status;
      throw new Error("An unexpected error occurred in get all makes" + error);
    }
    // }

    const data = await res.json();
    if (!data) return [];
    const dropdownValues = deriveDropdownValues(data, t, false);

    return dropdownValues;
  } catch (error) {
    console.error("Error fetching makes:", error);
    return [];
  }
}

export async function getAllModels(make: string): Promise<DropdownValues[]> {
  const t = await getTranslations("ServerData");
  const url = baseURL + `/series?brand=${encodeURIComponent(make)}`;
  try {
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
    if (!data) return [];
    const dropdownValues = deriveDropdownValues(data, t, false);

    return dropdownValues;
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
}

export async function getAllSeries(make: string, model: string): Promise<DropdownValues[]> {
  const t = await getTranslations("ServerData");
  const url = baseURL + `/modeltypes?brand=${encodeURIComponent(make)}&series=${encodeURIComponent(model)}`;
  try {
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
    if (!data) return [];
    const dropdownValues = deriveDropdownValues(data, t, false);

    return dropdownValues;
  } catch (error) {
    console.error("Error fetching series:", error);
    return [];
  }
}

async function getData(url: string) {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      const json = await res.json();
      if (json.error) {
        const error = new Error(json.error);
        // @ts-ignore
        error.status = res.status;
        throw error;
      } else {
        throw new Error("An unexpected error occurred");
      }
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching option data:", error);
    return [];
  }
}

export async function getAllOptions(make: string, model: string, trim: string): Promise<{ options: DropdownValues[], option: DropdownValues }> {
  const t = await getTranslations("ServerData");
  const optionsUrls: string[] = [baseURL];

  let res = {}

  await Promise.all(
    optionsUrls.map(async (url) => {
      const gears = await getData(
        `${url}/gears?brand=${encodeURIComponent(
          make
        )}&series=${encodeURIComponent(
          model
        )}&modeltype=${encodeURIComponent(trim)}`
      );

      const colors = await getData(
        `${url}/colors?brand=${encodeURIComponent(
          make
        )}&series=${encodeURIComponent(
          model
        )}&modeltype=${encodeURIComponent(trim)}`
      );

      const fuelTypes = await getData(
        `${url}/fuels?brand=${encodeURIComponent(
          make
        )}&series=${encodeURIComponent(
          model
        )}&modeltype=${encodeURIComponent(trim)}`
      );

      const output = await getData(
        `${url}/powers?brand=${encodeURIComponent(
          make
        )}&series=${encodeURIComponent(
          model
        )}&modeltype=${encodeURIComponent(trim)}`
      );
      res = { transmission: gears, colors, fuelType: fuelTypes, output };
    })
  );

  if (!Object.keys(res).length) return { options: [], option: { label: "", value: "" } };
  let options = {} as any;
  let option = {} as DropdownValues;
  Object.keys(res).forEach((key) => {
    options[key] = deriveDropdownValues(res[key], t, true);
  });

  Object.keys(options).forEach((key) => {
    if (options[key].length === 1) {
      option[key] = options[key][0]
    }
  });

  return {
    options: options,
    option,
  };
}
