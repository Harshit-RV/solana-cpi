# Solana CPI Example

A simple demonstration of Cross-Program Invocation (CPI) on Solana.

## Overview

This project contains two Solana programs:

- **double-contract**: A counter program that doubles a stored value
- **cpi-contract**: Demonstrates how to invoke the double-contract from another program

## Structure

```
├── cpi-contract/     # CPI caller program
├── double-contract/  # Target program with counter logic
└── client/          # TypeScript tests using LiteSVM
```

## Running Tests

```bash
cd client
bun install
bun test
```

The tests demonstrate both direct program invocation and cross-program invocation, showing how the counter value gets doubled with each call.
