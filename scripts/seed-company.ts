import { db } from "@/firebase/admin";

async function main() {
  const ref = db.doc(`companies/ORCL`);
  await ref.set(
    {
      name: "ORACLE CORP",
      irSources: ["https://investor.oracle.com/home/default.aspx"],
    },
    { merge: true }
  );

  // (Optional) pre-approve an IR domain if you disabled the DEV_ALLOW_ALL helper
  // await setDoc(doc(db, "scrapeAllowlist", "investor.nvidia.com"), { approved: true });
  console.log("Seeded ORCL");
}
main();
