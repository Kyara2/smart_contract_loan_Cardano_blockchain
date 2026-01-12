import { Lucid, Blockfrost } from "lucid-cardano";

const blockfrostKey = "previewRVUk5JJD8VR4RMyEELSS4cTadxODY6hq";
const lucid = await Lucid.new(
  new Blockfrost("https://cardano-preview.blockfrost.io/api/v0", blockfrostKey),
  "Preview"
);

// IMPORTANTE: Este endereço DEVE ser o mesmo que o borrow.ts imprimiu no terminal
const compiledCode = "59027901010029800aba2aba1aab9faab9eaab9dab9a48888896600264653001300700198039804000cdc3a400530070024888966002600460106ea800e26466453001159800980098059baa002899192cc004c00cc034dd5000c4c8c966002600a601e6ea8006264b300130063010375401910018acc00400626464660020026eb0c008c04cdd5005912cc00400629422b3001325980099baf301730153754002602e602a6ea80262601d30013756600e602a6ea80066eb8c010c054dd5004cdd7180b980c180c180c180a9baa0098a40009111199119800800801191919800800803112cc00400600713233225980099b910090028acc004cdc78048014400600c80ea26600a00a604400880e8dd7180e0009bab301d001301e0014074297adef6c602259800800c00e2646644b30013372200e00515980099b8f0070028800c01901c44cc014014c08401101c1bae301b001375a6038002603a00280e114a08098c0580062946266004004602e00280910151180a180a980a800c528201e403c6644b3001330013758600460246ea8028dd7180a18091baa0058998009bac3002301237540146eb8c050c048dd5001c528202023013301430143014301430143014301430140012232330010010032259800800c528456600266e3cdd7180b000801c528c4cc008008c05c005012202a8b201c3011300f37546002601e6ea800c8c044c0480062c8060c03cc034dd5180798069baa001300e300c3754005164029300b375400f300e003488966002600800515980098079baa00a801c590104566002601000515980098079baa00a801c5901045900d201a180618068009b8748000c024dd5001c590070c01c004c00cdd5003c52689b2b200201";
const script = { type: "PlutusV2" as const, script: compiledCode };
const contractAddress = lucid.utils.validatorToAddress(script);

// NFT: MESA001
const unit = "ccfdd393620a746179ab1310d5f681afacf3256bc3997c66ceae5bfa4d455341303031";

async function check() {
  console.log("Consultando endereço do contrato:", contractAddress);
  
  // Pegamos todos os UTXOs que estão morando no endereço do contrato
  const utxos = await lucid.utxosAt(contractAddress);
  
  // Procuramos o UTXO que contém a nossa NFT
  const nftUtxo = utxos.find(u => u.assets[unit] === 1n);

  if (nftUtxo) {
    console.log("-----------------------------------------");
    console.log("✅ STATUS: NFT ENCONTRADA NO CONTRATO!");
    console.log("TX Hash do Empréstimo:", nftUtxo.txHash);
    console.log("Garantia de ADA no UTXO:", Number(nftUtxo.assets.lovelace) / 1000000, "ADA");
    console.log("-----------------------------------------");
  } else {
    console.log("-----------------------------------------");
    console.log("❌ STATUS: NFT NÃO ESTÁ NO CONTRATO.");
    console.log("Ela pode estar na carteira do Admin ou já foi devolvida.");
    console.log("-----------------------------------------");
  }
}

check();