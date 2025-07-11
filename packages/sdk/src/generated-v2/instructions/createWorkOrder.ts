/**
 * This code was GENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck

import { Address } from '@solana/addresses';
import {
  IAccountMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
} from '../../utils/instruction-compat';
import {
  addDecoderSizePrefix,
  addEncoderSizePrefix,
  combineCodec,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
  getU32Decoder,
  getU32Encoder,
  getU64Decoder,
  getU64Encoder,
  transformEncoder,
  getAddressDecoder,
  getAddressEncoder,
  getArrayDecoder,
  getArrayEncoder,
  getUtf8Decoder,
  getUtf8Encoder,
  type Codec,
  type Decoder,
  type Encoder,
} from '@solana/codecs';

export const CREATE_WORK_ORDER_DISCRIMINATOR = new Uint8Array([
  156, 100, 204, 119, 17, 200, 7, 88,
]);

export function getCreateWorkOrderDiscriminatorBytes() {
  return CREATE_WORK_ORDER_DISCRIMINATOR.slice();
}

export type CreateWorkOrderInstruction<
  TProgram extends string = 'PodAI111111111111111111111111111111111111111',
  TAccountWorkOrder extends string | IAccountMeta<string> = string,
  TAccountClient extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountWorkOrder extends string
        ? WritableAccount<TAccountWorkOrder>
        : TAccountWorkOrder,
      TAccountClient extends string
        ? WritableSignerAccount<TAccountClient>
        : TAccountClient,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type CreateWorkOrderInstructionData = {
  discriminator: Uint8Array;
  workOrderData: WorkOrderData;
};

export type WorkOrderData = {
  orderId: bigint;
  provider: Address;
  title: string;
  description: string;
  requirements: string[];
  paymentAmount: bigint;
  paymentToken: Address;
  deadline: bigint;
};

export type CreateWorkOrderInstructionDataArgs = {
  workOrderData: WorkOrderDataArgs;
};

export type WorkOrderDataArgs = {
  orderId: number | bigint;
  provider: Address;
  title: string;
  description: string;
  requirements: string[];
  paymentAmount: number | bigint;
  paymentToken: Address;
  deadline: number | bigint;
};

export function getCreateWorkOrderInstructionDataEncoder(): Encoder<CreateWorkOrderInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', getBytesEncoder()],
      ['workOrderData', getWorkOrderDataEncoder()],
    ]),
    value => ({ ...value, discriminator: CREATE_WORK_ORDER_DISCRIMINATOR })
  );
}

export function getCreateWorkOrderInstructionDataDecoder(): Decoder<CreateWorkOrderInstructionData> {
  return getStructDecoder([
    ['discriminator', getBytesDecoder()],
    ['workOrderData', getWorkOrderDataDecoder()],
  ]);
}

export function getCreateWorkOrderInstructionDataCodec(): Codec<
  CreateWorkOrderInstructionDataArgs,
  CreateWorkOrderInstructionData
> {
  return combineCodec(
    getCreateWorkOrderInstructionDataEncoder(),
    getCreateWorkOrderInstructionDataDecoder()
  );
}

export function getWorkOrderDataEncoder(): Encoder<WorkOrderDataArgs> {
  return getStructEncoder([
    ['orderId', getU64Encoder()],
    ['provider', addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
    ['title', addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
    ['description', addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
    [
      'requirements',
      addEncoderSizePrefix(
        getArrayEncoder(
          addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())
        ),
        getU32Encoder()
      ),
    ],
    ['paymentAmount', getU64Encoder()],
    ['paymentToken', addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
    ['deadline', getU64Encoder()],
  ]);
}

export function getWorkOrderDataDecoder(): Decoder<WorkOrderData> {
  return getStructDecoder([
    ['orderId', getU64Decoder()],
    ['provider', addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    ['title', addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    ['description', addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    [
      'requirements',
      addDecoderSizePrefix(
        getArrayDecoder(
          addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())
        ),
        getU32Decoder()
      ),
    ],
    ['paymentAmount', getU64Decoder()],
    ['paymentToken', addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    ['deadline', getU64Decoder()],
  ]);
}

export function getWorkOrderDataCodec(): Codec<
  WorkOrderDataArgs,
  WorkOrderData
> {
  return combineCodec(getWorkOrderDataEncoder(), getWorkOrderDataDecoder());
}

export type CreateWorkOrderInput<
  TAccountWorkOrder extends string = string,
  TAccountClient extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  workOrder: Address<TAccountWorkOrder>;
  client: Address<TAccountClient>;
  systemProgram?: Address<TAccountSystemProgram>;
  workOrderData: WorkOrderDataArgs;
};

export function getCreateWorkOrderInstruction<
  TAccountWorkOrder extends string,
  TAccountClient extends string,
  TAccountSystemProgram extends string,
>(
  input: CreateWorkOrderInput<
    TAccountWorkOrder,
    TAccountClient,
    TAccountSystemProgram
  >
): CreateWorkOrderInstruction<
  'PodAI111111111111111111111111111111111111111',
  TAccountWorkOrder,
  TAccountClient,
  TAccountSystemProgram
> {
  // Program ID
  const programId =
    'PodAI111111111111111111111111111111111111111' as Address<'PodAI111111111111111111111111111111111111111'>;

  // Accounts
  const accounts: CreateWorkOrderInstruction<
    'PodAI111111111111111111111111111111111111111',
    TAccountWorkOrder,
    TAccountClient,
    TAccountSystemProgram
  >['accounts'] = [
    {
      address: input.workOrder,
      role: 'writable',
    },
    {
      address: input.client,
      role: 'writable',
      signer: true,
    },
    {
      address:
        input.systemProgram ??
        ('11111111111111111111111111111111' as Address<TAccountSystemProgram>),
      role: 'readonly',
    },
  ];

  // Instruction data
  const args = { workOrderData: input.workOrderData };
  const data = getCreateWorkOrderInstructionDataEncoder().encode(args);

  return {
    programId,
    accounts,
    data,
  };
}

export type ParsedCreateWorkOrderInstruction<
  TProgram extends string = 'PodAI111111111111111111111111111111111111111',
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    workOrder: TAccountMetas[0];
    client: TAccountMetas[1];
    systemProgram: TAccountMetas[2];
  };
  data: CreateWorkOrderInstructionData;
};

export function parseCreateWorkOrderInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedCreateWorkOrderInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 3) {
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
      workOrder: getNextAccount(),
      client: getNextAccount(),
      systemProgram: getNextAccount(),
    },
    data: getCreateWorkOrderInstructionDataDecoder().decode(instruction.data),
  };
}

// Async version for modern Web3.js v2 usage
export async function getCreateWorkOrderInstructionAsync<
  TAccountWorkOrder extends string,
  TAccountClient extends string,
  TAccountSystemProgram extends string,
>(
  input: CreateWorkOrderInput<
    TAccountWorkOrder,
    TAccountClient,
    TAccountSystemProgram
  >
): Promise<
  CreateWorkOrderInstruction<
    'PodAI111111111111111111111111111111111111111',
    TAccountWorkOrder,
    TAccountClient,
    TAccountSystemProgram
  >
> {
  return getCreateWorkOrderInstruction(input);
}
