import sanityClient from "@sanity/client";

const client = sanityClient({
  projectId: "pu2ji15c",
  dataset: "production",
  apiVersion: "2023-06-01",
  token:
    "skSQScaPPpoXONG8hOwLKS3ht8tTWgQHHx08T9GxeNyyFYeUCtyfHY3Il8eaa51DDr4iLf27Mq7aTVgcOLtGAS4BIfgjsZT47skYwqOZ1Sd5YB7KsJCBR3YxUCeUA1otgmZOSKJV1RpYxd54SzdyxgzfTNP0IhG1mAftOiQcQqJHiV6Hu0g5",
  useCdn: false,
});

const keepUsers = ["DwmhrkkuhD4zyuqtUwuad7", "JlBfQswJw6IPP5T9gVi5L2"];

function removeRefs(obj, userId) {
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => !(item && item._ref === userId))
      .map((item) => removeRefs(item, userId));
  }

  if (obj && typeof obj === "object") {
    const newObj = { ...obj };
    for (const key in newObj) {
      if (newObj[key] && newObj[key]._ref === userId) {
        delete newObj[key];
      } else {
        newObj[key] = removeRefs(newObj[key], userId);
      }
    }
    return newObj;
  }

  return obj;
}

async function run() {
  const allUsers = await client.fetch('*[_type == "user"]._id');
  const deleteUsers = allUsers.filter((id) => !keepUsers.includes(id));

  console.log("Users to delete:", deleteUsers);

  for (const userId of deleteUsers) {
    console.log("\n------------------------------------------");
    console.log("Processing user:", userId);

    const refs = await client.fetch(`*[references("${userId}")]{_id, ...}`);

    console.log(`Found ${refs.length} referencing docs`);

    for (const doc of refs) {
      console.log("Cleaning:", doc._id);

      const cleaned = removeRefs(doc, userId);

      delete cleaned._id;
      delete cleaned._type;
      delete cleaned._createdAt;
      delete cleaned._updatedAt;
      delete cleaned._rev;

      // IMPORTANT FIX: explicit .unset(["user"])
      await client.patch(doc._id).unset(["user"]).set(cleaned).commit();

      console.log("Cleaned:", doc._id);
    }

    await client.delete(userId);
    console.log("✔ Deleted user:", userId);
  }

  console.log("\n✔ All unwanted users cleaned & deleted.");
}

run().catch(console.error);
