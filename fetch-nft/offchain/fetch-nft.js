import fetch from "node-fetch";

const BLOCKFROST_KEY = "previewRVUk5JJD8VR4RMyEELSS4cTadxODY6hq";
const policyId = "ccfdd393620a746179ab1310d5f681afacf3256bc3997c66ceae5bfa";

const headers = {
  project_id: BLOCKFROST_KEY,
};

async function main() {
  // listar assets da policy
  const listRes = await fetch(
    `https://cardano-preview.blockfrost.io/api/v0/assets/policy/${policyId}`,
    { headers }
  );

  const assets = await listRes.json();

  console.log("Assets encontrados:", assets.length);

  // buscar detalhes completos de cada asset
  for (const item of assets) {
    const assetId = item.asset;

    const assetRes = await fetch(
      `https://cardano-preview.blockfrost.io/api/v0/assets/${assetId}`,
      { headers }
    );

    const assetData = await assetRes.json();

    console.log("=================================");
    console.log(`Asset: ${assetId}`);
    console.log(JSON.stringify(assetData, null, 2));
  }
}

main();
