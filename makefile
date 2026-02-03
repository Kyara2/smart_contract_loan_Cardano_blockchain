
NODE := node
MINT_SRC_CODE = create-nft/offchain/mint-nft.js

create_nft:
	$(NODE) $(MINT_SRC_CODE)