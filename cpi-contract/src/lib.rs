use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    instruction::{AccountMeta, Instruction},
    program::invoke,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let mut iter = accounts.iter();
    let data_account = next_account_info(&mut iter)?;
    let double_contract_pubkey = next_account_info(&mut iter)?;

    let instruction = Instruction {
        program_id: *double_contract_pubkey.key,
        accounts: vec![AccountMeta {
            pubkey: *data_account.key,
            is_signer: false,
            is_writable: true,
        }],
        data: vec![],
    };

    invoke(&instruction, &[data_account.clone()])?;

    Ok(())
}
