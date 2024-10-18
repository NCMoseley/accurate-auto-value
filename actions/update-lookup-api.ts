"use server";

async function getData(url) {
  const res = await fetch(url);

  if (!res.ok) {
    const json = await res.json();
    if (json.error) {
      const error = json.error;
      error.status = res.status;
      throw error;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }

  const data = await res.json();
  console.log("getData:", data);

  return data;
}

export async function updateLookupApi(table?: string, data?: FormData) {
  try {
    const brands = await getData("https://carstimate.ch/api/estimation/brands");
    // const session = await auth();

    // if (!session?.user || session?.user.id !== userId) {
    //   throw new Error("Unauthorized");
    // }

    // const { role } = userRoleSchema.parse(data);

    // // Update the user role.
    // await prisma.user.update({
    //   where: {
    //     id: userId,
    //   },
    //   data: {
    //     role: role,
    //   },
    // });

    return { brands };
  } catch (error) {
    console.log(error)
    return { status: "error" };
  }
}
