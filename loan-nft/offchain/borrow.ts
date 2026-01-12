import { Lucid, Blockfrost } from "lucid-cardano";
import fs from "fs";

const blockfrostKey = "previewRVUk5JJD8VR4RMyEELSS4cTadxODY6hq";
const adminSeed = fs.readFileSync("./admin.seed", "utf-8").trim();
const borrowerAddress = "addr_test1qqpunqtx8jzy8vspaj0uk6z8rsse73j75wz8nvug65s2spkjq8kkaqmwgyaf5pndp9n2pwmr9j30j0j7g6pzs643f6asje0kag";

const lucid = await Lucid.new(
  new Blockfrost("https://cardano-preview.blockfrost.io/api/v0", blockfrostKey),
  "Preview"
);
lucid.selectWalletFromSeed(adminSeed);

// Identificação da NFT (MESA001)
const unit = "ccfdd393620a746179ab1310d5f681afacf3256bc3997c66ceae5bfa4d455341303031";

// Smart Contract (compiledCode fornecido por você)
const compiledCode = "59027901010029800aba2aba1aab9faab9eaab9dab9a48888896600264653001300700198039804000cdc3a400530070024888966002600460106ea800e26466453001159800980098059baa002899192cc004c00cc034dd5000c4c8c966002600a601e6ea8006264b300130063010375401910018acc00400626464660020026eb0c008c04cdd5005912cc00400629422b3001325980099baf301730153754002602e602a6ea80262601d30013756600e602a6ea80066eb8c010c054dd5004cdd7180b980c180c180c180a9baa0098a40009111199119800800801191919800800803112cc00400600713233225980099b910090028acc004cdc78048014400600c80ea26600a00a604400880e8dd7180e0009bab301d001301e0014074297adef6c602259800800c00e2646644b30013372200e00515980099b8f0070028800c01901c44cc014014c08401101c1bae301b001375a6038002603a00280e114a08098c0580062946266004004602e00280910151180a180a980a800c528201e403c6644b3001330013758600460246ea8028dd7180a18091baa0058998009bac3002301237540146eb8c050c048dd5001c528202023013301430143014301430143014301430140012232330010010032259800800c528456600266e3cdd7180b000801c528c4cc008008c05c005012202a8b201c3011300f37546002601e6ea800c8c044c0480062c8060c03cc034dd5180798069baa001300e300c3754005164029300b375400f300e003488966002600800515980098079baa00a801c590104566002601000515980098079baa00a801c5901045900d201a180618068009b8748000c024dd5001c590070c01c004c00cdd5003c52689b2b200201";
const script = { type: "PlutusV2" as const, script: compiledCode };
const contractAddress = lucid.utils.validatorToAddress(script);

/**
 * DATUM EM CBOR BRUTO
 * Contém: Construtor 0 + AdminHash + BorrowerHash + Deadline (1768224000000)
 * Isso pula a validação de tipo do Lucid que está falhando.
 */
const loanDatumCBOR = "d8799f581cd70081191afb9c0f642485b685a006840f8ef27b0522a25be38e2055581c03c981663c8443b201ec9fcb68471c219f465ea38479b388d520a806491b0000019b9c0ca400ff";

async function main() {
  console.log("Admin Address:", await lucid.wallet.address());
  console.log("Contract Address:", contractAddress);
  
  try {
    const tx = await lucid.newTx()
      // Usamos a string CBOR diretamente no campo inline
      .payToContract(contractAddress, { inline: loanDatumCBOR }, { [unit]: 1n, lovelace: 2000000n })
      .complete();

    const signed = await tx.sign().complete();
    const hash = await signed.submit();
    console.log(`✅ Sucesso! NFT enviada. TX: ${hash}`);
  } catch (e) {
    console.error("❌ Erro durante a transação:");
    console.error(e);
  }
}

main();