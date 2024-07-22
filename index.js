const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction } = require("@hashgraph/sdk");
require('dotenv').config();

async function environmentSetup() {

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    const client = Client.forTestnet()
    //set account
    client.setOperator(myAccountId, myPrivateKey);

    //set the default maximum transaction fee
    client.setDefaultMaxTransactionFee(new Hbar(100));
    //Set the maximum payment for queries (in Hbar)
    client.setDefaultMaxQueryPayment(new Hbar(50));


    console.log("Client setup complete.");

    //Create new keys
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey


    //Nueva cuenta con 1000 tinybar balance
    const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);

    //Get the account ID
    const getReceipt = await newAccount.getReceipt(client);
  const newAccountId = getReceipt.accountId;
  
  console.log("\nNew account ID: " + newAccountId);

  //Mirar el balance
  const accountBalance = await new AccountBalanceQuery()
  .setAccountId(newAccountId)
  .execute(client);

console.log(
  "The new account balance is: " +
    accountBalance.hbars.toTinybars() +
    " tinybar."
);


//Hacer una transacción de hbar
const sendHbar = await new TransferTransaction()
     .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1000)) //Sending account
     .addHbarTransfer(newAccountId, Hbar.fromTinybars(1000)) //Receiving account
     .execute(client);

    //Mostrar estado de la transacción una vez realizada
     const transactionReceipt = await sendHbar.getReceipt(client);
  console.log(
    "\nThe transfer transaction from my account to the new account was: " +
      transactionReceipt.status.toString()
  );

  // Request the cost of the query
  const queryCost = await new AccountBalanceQuery()
    .setAccountId(newAccountId)
    .getCost(client);

  console.log("\nThe cost of query is: " + queryCost);

  // Check the new account's balance
  const getNewBalance = await new AccountBalanceQuery()
    .setAccountId(newAccountId)
    .execute(client);

  console.log(
    "The account balance after the transfer is: " +
      getNewBalance.hbars.toTinybars() +
      " tinybars."
  );

}
environmentSetup();