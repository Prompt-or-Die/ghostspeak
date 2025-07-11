/**
 * This code was GENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  getAddressEncoder,
  getProgramDerivedAddress,
  type Address,
} from '@solana/addresses';
import {
  addDecoderSizePrefix,
  addEncoderSizePrefix,
  combineCodec,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
  getUtf8Decoder,
  getUtf8Encoder,
  transformEncoder,
  transformDecoder,
  type Codec,
  type Decoder,
  type Encoder,
} from '@solana/codecs';
import type {
  IAccountMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
} from '../../utils/instruction-compat';
import { AccountRole } from '../../utils/instruction-compat';
import {
  type IAccountSignerMeta,
  type TransactionSigner,
} from '@solana/signers';
import { POD_COM_PROGRAM_ADDRESS } from '../programs';
import {
  expectAddress,
} from '../shared';

export const VERIFY_AGENT_DISCRIMINATOR = new Uint8Array([
  42, 158, 201, 44, 92, 88, 134, 201,
]);

export function getVerifyAgentDiscriminatorBytes() {
  return VERIFY_AGENT_DISCRIMINATOR.slice();
}

export type VerifyAgentInstruction<
  TProgram extends string = 'PodAI111111111111111111111111111111111111111',
  TAccountAgentVerification extends string | IAccountMeta<string> = string,
  TAccountAgent extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountAgentVerification extends string
        ? IAccountMeta<TAccountAgentVerification>
        : TAccountAgentVerification,
      TAccountAgent extends string
        ? IAccountSignerMeta<TAccountAgent>
        : TAccountAgent,
      TAccountPayer extends string
        ? IAccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountSystemProgram extends string
        ? IAccountMeta<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type VerifyAgentInstructionData = {
  discriminator: Uint8Array;
  agentPubkey: Address;
  serviceEndpoint: string;
  supportedCapabilities: Array<string>;
  verifiedAt: bigint;
};

export type VerifyAgentInstructionDataArgs = {
  agentPubkey: Address;
  serviceEndpoint: string;
  supportedCapabilities: Array<string>;
  verifiedAt: bigint;
};

export function getVerifyAgentInstructionDataEncoder(): Encoder<VerifyAgentInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', getBytesEncoder({ size: 8 })],
      ['agentPubkey', getAddressEncoder()],
      ['serviceEndpoint', getUtf8Encoder()],
      ['supportedCapabilities', addEncoderSizePrefix(
        getUtf8Encoder(),
        getU32Encoder()
      )],
      ['verifiedAt', getU64Encoder()],
    ]),
    (value) => ({ ...value, discriminator: getVerifyAgentDiscriminatorBytes() })
  );
}

export function getVerifyAgentInstructionDataDecoder(): Decoder<VerifyAgentInstructionData> {
  return getStructDecoder([
    ['discriminator', getBytesDecoder({ size: 8 })],
    ['agentPubkey', getAddressEncoder()],
    ['serviceEndpoint', getUtf8Decoder()],
    ['supportedCapabilities', addDecoderSizePrefix(
      getUtf8Decoder(),
      getU32Decoder()
    )],
    ['verifiedAt', getU64Decoder()],
  ]);
}

export function getVerifyAgentInstructionDataCodec(): Codec<
  VerifyAgentInstructionDataArgs,
  VerifyAgentInstructionData
> {
  return combineCodec(
    getVerifyAgentInstructionDataEncoder(),
    getVerifyAgentInstructionDataDecoder()
  );
}

export type VerifyAgentInput<
  TAccountAgentVerification extends string = string,
  TAccountAgent extends string = string,
  TAccountPayer extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  agentVerification: Address<TAccountAgentVerification>;
  agent: TransactionSigner<TAccountAgent>;
  payer: TransactionSigner<TAccountPayer>;
  systemProgram?: Address<TAccountSystemProgram>;
  agentPubkey: Address;
  serviceEndpoint: string;
  supportedCapabilities: Array<string>;
  verifiedAt: bigint;
};

export function getVerifyAgentInstruction<
  TAccountAgentVerification extends string,
  TAccountAgent extends string,
  TAccountPayer extends string,
  TAccountSystemProgram extends string,
>(
  input: VerifyAgentInput<
    TAccountAgentVerification,
    TAccountAgent,
    TAccountPayer,
    TAccountSystemProgram
  >
): VerifyAgentInstruction<
  typeof POD_COM_PROGRAM_ADDRESS,
  TAccountAgentVerification,
  TAccountAgent,
  TAccountPayer,
  TAccountSystemProgram
> {
  const programAddress = POD_COM_PROGRAM_ADDRESS;
  const originalAccounts = {
    agentVerification: { value: input.agentVerification ?? null, isWritable: true },
    agent: { value: input.agent ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: true },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Resolve default values.
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value = expectAddress(
      '11111111111111111111111111111111'
    );
  }

  const getAccountMeta = (key: keyof typeof accounts): IAccountMeta => {
    return accounts[key] as IAccountMeta;
  };

  const instruction = {
    accounts: [
      getAccountMeta('agentVerification'),
      getAccountMeta('agent'),
      getAccountMeta('payer'),
      getAccountMeta('systemProgram'),
    ],
    programAddress,
    data: getVerifyAgentInstructionDataEncoder().encode({
      agentPubkey: input.agentPubkey,
      serviceEndpoint: input.serviceEndpoint,
      supportedCapabilities: input.supportedCapabilities,
      verifiedAt: input.verifiedAt,
    }),
  } as VerifyAgentInstruction<
    typeof POD_COM_PROGRAM_ADDRESS,
    TAccountAgentVerification,
    TAccountAgent,
    TAccountPayer,
    TAccountSystemProgram
  >;

  return instruction;
}

export type ParsedVerifyAgentInstruction<
  TProgram extends string = 'PodAI111111111111111111111111111111111111111',
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    agentVerification: TAccountMetas[0];
    agent: TAccountMetas[1];
    payer: TAccountMetas[2];
    systemProgram: TAccountMetas[3];
  };
  data: VerifyAgentInstructionData;
};

export function parseVerifyAgentInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedVerifyAgentInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 4) {
    throw new Error('Not enough accounts');
  }
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = instruction.accounts![accountIndex]!;
    accountIndex += 1;
    return accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      agentVerification: getNextAccount(),
      agent: getNextAccount(),
      payer: getNextAccount(),
      systemProgram: getNextAccount(),
    },
    data: getVerifyAgentInstructionDataDecoder().decode(instruction.data),
  };
}

type ResolvedAccount = {
  value: Address | null;
  isWritable: boolean;
};