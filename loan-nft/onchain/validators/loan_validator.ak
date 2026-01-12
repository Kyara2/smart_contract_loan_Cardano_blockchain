use aiken/collection/list
use cardano/address.{Address, VerificationKey}
use cardano/assets.{AssetName, PolicyId}
use cardano/transaction.{OutputReference, Transaction}

pub type Datum {
  admin: Address,
  borrower: Address,
  nft_policy: PolicyId,
  nft_name: AssetName,
}

pub type Redeemer {
  Lend
  Return
}

validator borrow_nft {
  spend(
    datum: Option<Datum>,
    redeemer: Redeemer,
    _utxo: OutputReference,
    self: Transaction,
  ) {
    expect Some(d) = datum

    // Extraímos o hash via pattern matching, garantindo que seja uma chave (VKey)
    // Se o endereço for de um script, o 'expect' falhará propositalmente aqui.
    expect VerificationKey(admin_pkh) = d.admin.payment_credential
    expect VerificationKey(borrower_pkh) = d.borrower.payment_credential

    let both_signed =
      list.has(self.extra_signatories, admin_pkh) && list.has(
        self.extra_signatories,
        borrower_pkh,
      )

    when redeemer is {
      Lend -> both_signed

      Return -> {
        let sent_back_to_admin =
          list.any(
            self.outputs,
            fn(output) {
              output.address == d.admin && assets.quantity_of(
                output.value,
                d.nft_policy,
                d.nft_name,
              ) == 1
            },
          )
        both_signed && sent_back_to_admin
      }
    }
  }
}