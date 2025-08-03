use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

entrypoint!(program_instruction);

#[derive(BorshDeserialize, BorshSerialize)]
struct OnChainData {
    count: u32,
}

fn program_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo], // [data account]
    intruction_data: &[u8],
) -> ProgramResult {
    let mut iter = accounts.iter();
    let data_account = next_account_info(&mut iter)?;

    let mut counter = OnChainData::try_from_slice(&data_account.data.borrow_mut())?; // [u8]

    if counter.count == 0 {
        counter.count = 1;
    } else {
        counter.count = counter.count * 2;
    }

    counter.serialize(&mut *data_account.data.borrow_mut());

    Ok(())
}
