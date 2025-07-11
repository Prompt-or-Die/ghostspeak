/**
 * This code was GENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import type { Address } from '@solana/addresses';
import type {
  IAccountMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
} from '../../utils/instruction-compat';
import { AccountRole } from '../../utils/instruction-compat';
import {
  combineCodec,
  getArrayDecoder,
  getArrayEncoder,
  getStructDecoder,
  getStructEncoder,
  getU32Decoder,
  getU32Encoder,
  getU64Decoder,
  getU64Encoder,
  getUtf8Decoder,
  getUtf8Encoder,
  getBytesEncoder,
  getBytesDecoder,
  transformEncoder,
  transformDecoder,
  type Codec,
  type Decoder,
  type Encoder
} from '@solana/codecs';

export const PURCHASE_SERVICE_DISCRIMINATOR = new Uint8Array([
  201, 156, 88, 123, 45, 92, 200, 77,
]);

export function getPurchaseServiceDiscriminatorBytes() {
  return PURCHASE_SERVICE_DISCRIMINATOR.slice();
}

export type PurchaseServiceInstruction<
  TProgram extends string = 'PodAI111111111111111111111111111111111111111',
  TAccountServicePurchase extends string | IAccountMeta<string> = string,
  TAccountServiceListing extends string | IAccountMeta<string> = string,
  TAccountBuyer extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountServicePurchase extends string
        ? IAccountMeta<string>
        : TAccountServicePurchase,
      TAccountServiceListing extends string
        ? IAccountMeta<string>
        : TAccountServiceListing,
      TAccountBuyer extends string
        ? IAccountMeta<string>
        : TAccountBuyer,
      TAccountSystemProgram extends string
        ? IAccountMeta<string>
        : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type PurchaseServiceInstructionData = {
  discriminator: Uint8Array;
  purchaseData: ServicePurchaseData;
};

export type ServicePurchaseData = {
  listingId: bigint;
  quantity: number;
  requirements: string[];
  customInstructions: string;
  deadline: bigint;
};

export type PurchaseServiceInstructionDataArgs = {
  purchaseData: ServicePurchaseDataArgs;
};

export type ServicePurchaseDataArgs = {
  listingId: number | bigint;
  quantity: number;
  requirements: string[];
  customInstructions: string;
  deadline: number | bigint;
};

export function getPurchaseServiceInstructionDataEncoder(): Encoder<PurchaseServiceInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', getBytesEncoder()],
      ['purchaseData', getServicePurchaseDataEncoder()],
    ]),
    (value) => ({ ...value, discriminator: getPurchaseServiceDiscriminatorBytes() })
  );
}

export function getPurchaseServiceInstructionDataDecoder(): Decoder<PurchaseServiceInstructionData> {
  return transformDecoder(
    getStructDecoder([
      ['discriminator', getBytesDecoder()],
      ['purchaseData', getServicePurchaseDataDecoder()],
    ]),
    (value) => ({
      ...value,
      discriminator: value.discriminator instanceof Uint8Array ? value.discriminator : new Uint8Array(value.discriminator),
    })
  );
}

export function getPurchaseServiceInstructionDataCodec(): Codec<
  PurchaseServiceInstructionDataArgs,
  PurchaseServiceInstructionData
> {
  return combineCodec(
    getPurchaseServiceInstructionDataEncoder(),
    getPurchaseServiceInstructionDataDecoder()
  );
}

export function getServicePurchaseDataEncoder(): Encoder<ServicePurchaseDataArgs> {
  return getStructEncoder([
    ['listingId', getU64Encoder()],
    ['quantity', getU32Encoder()],
    ['requirements', getArrayEncoder(getUtf8Encoder())],
    ['customInstructions', getUtf8Encoder()],
    ['deadline', getU64Encoder()],
  ]);
}

export function getServicePurchaseDataDecoder(): Decoder<ServicePurchaseData> {
  return getStructDecoder([
    ['listingId', getU64Decoder()],
    ['quantity', getU32Decoder()],
    ['requirements', getArrayDecoder(getUtf8Decoder())],
    ['customInstructions', getUtf8Decoder()],
    ['deadline', getU64Decoder()],
  ]);
}

export function getServicePurchaseDataCodec(): Codec<ServicePurchaseDataArgs, ServicePurchaseData> {
  return combineCodec(getServicePurchaseDataEncoder(), getServicePurchaseDataDecoder());
}

export type PurchaseServiceInput<
  TAccountServicePurchase extends string = string,
  TAccountServiceListing extends string = string,
  TAccountBuyer extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  servicePurchase: Address<TAccountServicePurchase>;
  serviceListing: Address<TAccountServiceListing>;
  buyer: Address<TAccountBuyer>;
  systemProgram?: Address<TAccountSystemProgram>;
  purchaseData: ServicePurchaseDataArgs;
};

export function getPurchaseServiceInstruction<
  TAccountServicePurchase extends string,
  TAccountServiceListing extends string,
  TAccountBuyer extends string,
  TAccountSystemProgram extends string,
>(
  input: PurchaseServiceInput<TAccountServicePurchase, TAccountServiceListing, TAccountBuyer, TAccountSystemProgram>
): PurchaseServiceInstruction<
  'PodAI111111111111111111111111111111111111111',
  TAccountServicePurchase,
  TAccountServiceListing,
  TAccountBuyer,
  TAccountSystemProgram
> {
  const programAddress = 'PodAI111111111111111111111111111111111111111' as Address<'PodAI111111111111111111111111111111111111111'>;
  const accounts = [
    { address: input.servicePurchase, role: 'writable' },
    { address: input.serviceListing, role: 'writable' },
    { address: input.buyer, role: 'writable', signer: true },
    { address: input.systemProgram ?? ('11111111111111111111111111111111' as Address<string>), role: 'readonly' },
  ] as unknown as [
    TAccountServicePurchase extends string ? IAccountMeta<string> : TAccountServicePurchase,
    TAccountServiceListing extends string ? IAccountMeta<string> : TAccountServiceListing,
    TAccountBuyer extends string ? IAccountMeta<string> : TAccountBuyer,
    TAccountSystemProgram extends string ? IAccountMeta<string> : TAccountSystemProgram
  ];
  const args = { purchaseData: input.purchaseData };
  let data = getPurchaseServiceInstructionDataEncoder().encode(args);
  if (!(data instanceof Uint8Array)) {
    data = new Uint8Array(data);
  }
  return {
    programAddress,
    accounts,
    data: data as Uint8Array & ArrayBufferLike,
  } as PurchaseServiceInstruction<
    'PodAI111111111111111111111111111111111111111',
    TAccountServicePurchase,
    TAccountServiceListing,
    TAccountBuyer,
    TAccountSystemProgram
  >;
}

export type ParsedPurchaseServiceInstruction<
  TProgram extends string = 'PodAI111111111111111111111111111111111111111',
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    servicePurchase: TAccountMetas[0];
    serviceListing: TAccountMetas[1];
    buyer: TAccountMetas[2];
    systemProgram: TAccountMetas[3];
  };
  data: PurchaseServiceInstructionData;
};

export function parsePurchaseServiceInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> & IInstructionWithAccounts<TAccountMetas> & IInstructionWithData<Uint8Array>
): ParsedPurchaseServiceInstruction<TProgram, TAccountMetas> {
  return {
    programAddress: instruction.programAddress,
    accounts: {
      servicePurchase: instruction.accounts[0]!,
      serviceListing: instruction.accounts[1]!,
      buyer: instruction.accounts[2]!,
      systemProgram: instruction.accounts[3]!,
    },
    data: getPurchaseServiceInstructionDataDecoder().decode(instruction.data),
  };
}

export async function getPurchaseServiceInstructionAsync<
  TAccountServicePurchase extends string,
  TAccountServiceListing extends string,
  TAccountBuyer extends string,
  TAccountSystemProgram extends string,
>(
  input: PurchaseServiceInput<TAccountServicePurchase, TAccountServiceListing, TAccountBuyer, TAccountSystemProgram>
): Promise<PurchaseServiceInstruction<
  'PodAI111111111111111111111111111111111111111',
  TAccountServicePurchase,
  TAccountServiceListing,
  TAccountBuyer,
  TAccountSystemProgram
>> {
  // NOTE: This instruction does not need any account resolution
  return getPurchaseServiceInstruction(input);
} 