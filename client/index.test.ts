import {test, expect} from "bun:test"
import { LiteSVM } from "litesvm";
import path from "path";
import {
	PublicKey,
	Transaction,
	SystemProgram,
	Keypair,
	LAMPORTS_PER_SOL,
  TransactionInstruction,
} from "@solana/web3.js";

function createNewDataAccount(payer: Keypair, counterAccountPubKey: PublicKey, svm: LiteSVM) {
  const dataAccount = new Keypair();
  const blockhash = svm.latestBlockhash();
  
  const ixs = [
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: dataAccount.publicKey,
      lamports: Number(svm.minimumBalanceForRentExemption(BigInt(4))),
      space: 4,
      programId: counterAccountPubKey
    }),
  ];

  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.add(...ixs);
  tx.sign(payer, dataAccount);
  svm.sendTransaction(tx);
  return dataAccount.publicKey;
}

function doubleValue(dataAccountPubKey: PublicKey, counterAccountPubKey: PublicKey, payer: Keypair, svm: LiteSVM) {
  const ix2 = new TransactionInstruction({
    keys: [
      { pubkey: dataAccountPubKey, isSigner: false, isWritable: true }
    ],
    programId: counterAccountPubKey,
  })
  const blockhash = svm.latestBlockhash();
  const tx2 = new Transaction();
  tx2.recentBlockhash = blockhash;
  tx2.add(ix2);
  tx2.sign(payer);
  svm.sendTransaction(tx2);
  svm.expireBlockhash();
}

test("direct invoke", () => {
	const svm = new LiteSVM();

  // adding contract from binary
  const counterAccountPubKey = PublicKey.unique();
  svm.addProgramFromFile(counterAccountPubKey, path.join(__dirname, "./double-contract.so"))

	const payer = new Keypair();
	svm.airdrop(payer.publicKey, BigInt(LAMPORTS_PER_SOL));

  const dataAccountPubkey = createNewDataAccount(payer, counterAccountPubKey, svm)

	const balanceAfter = svm.getBalance(dataAccountPubkey);

	expect(balanceAfter).toBe(svm.minimumBalanceForRentExemption(BigInt(4)));

  doubleValue(dataAccountPubkey, counterAccountPubKey, payer, svm)
  doubleValue(dataAccountPubkey, counterAccountPubKey, payer, svm)
  doubleValue(dataAccountPubkey, counterAccountPubKey, payer, svm)
  doubleValue(dataAccountPubkey, counterAccountPubKey, payer, svm)

  const newDataAcc = svm.getAccount(dataAccountPubkey);
  console.log(newDataAcc?.data)
  
  expect(newDataAcc?.data[0]).toBe(8)
  expect(newDataAcc?.data[1]).toBe(0)
  expect(newDataAcc?.data[2]).toBe(0)
  expect(newDataAcc?.data[3]).toBe(0)
});