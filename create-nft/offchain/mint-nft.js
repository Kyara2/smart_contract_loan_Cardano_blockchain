import { Lucid, Blockfrost, fromText } from "lucid-cardano";
import fs from "fs";

const BLOCKFROST_KEY = "previewRVUk5JJD8VR4RMyEELSS4cTadxODY6hq";
const NETWORK = "Preview";

async function main() {
  const lucid = await Lucid.new(
    new Blockfrost(
      "https://cardano-preview.blockfrost.io/api/v0",
      BLOCKFROST_KEY
    ),
    NETWORK
  );

  // Wallet do ADMIN
  const adminSeed = fs.readFileSync("./admin.seed", "utf8").trim();
  await lucid.selectWalletFromSeed(adminSeed);

  const adminAddress = await lucid.wallet.address();
  console.log("Admin address:", adminAddress);

  // Criar minting policy baseada na assinatura do admin
  const mintingPolicy = lucid.utils.nativeScriptFromJson({
    type: "sig",
    keyHash:
      lucid.utils.getAddressDetails(adminAddress).paymentCredential.hash,
  });

  // Gerar policyId corretamente
  const policyId = lucid.utils.mintingPolicyToId(mintingPolicy);

  // NFT
  const assetName = "MESA001";
  const unit = policyId + fromText(assetName);

  // Metadata CIP-721
  const metadata = {
    [policyId]: {
      [assetName]: {
        name: "Mesa Fisica",
        image: "",
        mediaType: "application/json",
        description: "Mesa para emprestimo",
        attributes: {
          identification: "MESA-001",
          material: "Madeira"
        }
      },
    },
  };


  // Transação de mint
  const tx = await lucid
    .newTx()
    .mintAssets({ [unit]: 1n })
    .attachMintingPolicy(mintingPolicy)
    .attachMetadata(721, metadata)
    .complete();

  const signedTx = await tx.sign().complete();
  const txHash = await signedTx.submit();

  console.log("NFT criado com sucesso!");
  console.log("Tx hash:", txHash);
}

main();
