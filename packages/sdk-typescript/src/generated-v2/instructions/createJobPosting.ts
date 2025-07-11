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

// Define missing types for compatibility
type ReadonlyAccount<T> = T;
type WritableAccount<T> = T;
type WritableSignerAccount<T> = T;

import {
  combineCodec,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
  transformEncoder,
  type Codec,
  type Decoder,
  type Encoder,
} from '@solana/codecs';
import {
  getArrayDecoder,
  getArrayEncoder,
  getUtf8Decoder,
  getUtf8Encoder,
} from '@solana/codecs';

export const CREATE_JOB_POSTING_DISCRIMINATOR = new Uint8Array([
  77, 92, 201, 88, 156, 45, 123, 200,
]);

export function getCreateJobPostingDiscriminatorBytes() {
  return CREATE_JOB_POSTING_DISCRIMINATOR.slice();
}

export type CreateJobPostingInstruction<
  TProgram extends string = 'PodAI111111111111111111111111111111111111111',
  TAccountJobPosting extends string | IAccountMeta<string> = string,
  TAccountEmployer extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends ReadonlyArray<IAccountMeta<string>> = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountJobPosting extends string
        ? WritableAccount<TAccountJobPosting>
        : TAccountJobPosting,
      TAccountEmployer extends string
        ? WritableSignerAccount<TAccountEmployer>
        : TAccountEmployer,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export interface CreateJobPostingInstructionData {
  discriminator: Uint8Array;
  jobData: JobPostingData;
}

export interface JobPostingData {
  title: string;
  description: string;
  requirements: string[];
  budget: bigint;
  deadline: bigint;
  skillsNeeded: string[];
  budgetMin: bigint;
  budgetMax: bigint;
  paymentToken: Address;
  jobType: string;
  experienceLevel: string;
}

export interface CreateJobPostingInstructionDataArgs {
  jobData: JobPostingDataArgs;
}

export interface JobPostingDataArgs {
  title: string;
  description: string;
  requirements: string[];
  budget: number | bigint;
  deadline: number | bigint;
  skillsNeeded: string[];
  budgetMin: number | bigint;
  budgetMax: number | bigint;
  paymentToken: Address;
  jobType: string;
  experienceLevel: string;
}

export function getCreateJobPostingInstructionDataEncoder(): Encoder<CreateJobPostingInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', getCreateJobPostingDiscriminatorBytes()],
      ['jobData', getJobPostingDataEncoder()],
    ]),
    value => ({
      ...value,
      discriminator: getCreateJobPostingDiscriminatorBytes(),
    })
  );
}

export function getCreateJobPostingInstructionDataDecoder(): Decoder<CreateJobPostingInstructionData> {
  return getStructDecoder([
    ['discriminator', getCreateJobPostingDiscriminatorBytes()],
    ['jobData', getJobPostingDataDecoder()],
  ]);
}

export function getCreateJobPostingInstructionDataCodec(): Codec<
  CreateJobPostingInstructionDataArgs,
  CreateJobPostingInstructionData
> {
  return combineCodec(
    getCreateJobPostingInstructionDataEncoder(),
    getCreateJobPostingInstructionDataDecoder()
  );
}

export function getJobPostingDataEncoder(): Encoder<JobPostingDataArgs> {
  return getStructEncoder([
    ['title', getUtf8Encoder()],
    ['description', getUtf8Encoder()],
    ['requirements', getArrayEncoder(getUtf8Encoder())],
    ['budget', getU64Encoder()],
    ['deadline', getU64Encoder()],
    ['skillsNeeded', getArrayEncoder(getUtf8Encoder())],
    ['budgetMin', getU64Encoder()],
    ['budgetMax', getU64Encoder()],
    ['paymentToken', getUtf8Encoder()],
    ['jobType', getUtf8Encoder()],
    ['experienceLevel', getUtf8Encoder()],
  ]);
}

export function getJobPostingDataDecoder(): Decoder<JobPostingData> {
  return getStructDecoder([
    ['title', getUtf8Decoder()],
    ['description', getUtf8Decoder()],
    ['requirements', getArrayDecoder(getUtf8Decoder())],
    ['budget', getU64Decoder()],
    ['deadline', getU64Decoder()],
    ['skillsNeeded', getArrayDecoder(getUtf8Decoder())],
    ['budgetMin', getU64Decoder()],
    ['budgetMax', getU64Decoder()],
    ['paymentToken', getUtf8Decoder()],
    ['jobType', getUtf8Decoder()],
    ['experienceLevel', getUtf8Decoder()],
  ]);
}

export function getJobPostingDataCodec(): Codec<
  JobPostingDataArgs,
  JobPostingData
> {
  return combineCodec(getJobPostingDataEncoder(), getJobPostingDataDecoder());
}

export interface CreateJobPostingInput<
  TAccountJobPosting extends string = string,
  TAccountEmployer extends string = string,
  TAccountSystemProgram extends string = string,
> {
  jobPosting: Address<TAccountJobPosting>;
  employer: Address<TAccountEmployer>;
  systemProgram?: Address<TAccountSystemProgram>;
  jobData: JobPostingDataArgs;
}

export function getCreateJobPostingInstruction<
  TAccountJobPosting extends string,
  TAccountEmployer extends string,
  TAccountSystemProgram extends string,
>(
  input: CreateJobPostingInput<
    TAccountJobPosting,
    TAccountEmployer,
    TAccountSystemProgram
  >
): CreateJobPostingInstruction<
  'PodAI111111111111111111111111111111111111111',
  TAccountJobPosting,
  TAccountEmployer,
  TAccountSystemProgram
> {
  // Program ID
  const programId =
    'PodAI111111111111111111111111111111111111111' as Address<'PodAI111111111111111111111111111111111111111'>;

  // Accounts
  const accounts: CreateJobPostingInstruction<
    'PodAI111111111111111111111111111111111111111',
    TAccountJobPosting,
    TAccountEmployer,
    TAccountSystemProgram
  >['accounts'] = [
    {
      address: input.jobPosting,
      role: 'writable',
    },
    {
      address: input.employer,
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
  const args = { jobData: input.jobData };
  const data = getCreateJobPostingInstructionDataEncoder().encode(args);

  return {
    programId,
    accounts,
    data,
  };
}

// Async version for modern Web3.js v2 usage
export async function getCreateJobPostingInstructionAsync<
  TAccountJobPosting extends string,
  TAccountEmployer extends string,
  TAccountSystemProgram extends string,
>(
  input: CreateJobPostingInput<
    TAccountJobPosting,
    TAccountEmployer,
    TAccountSystemProgram
  >
): Promise<
  CreateJobPostingInstruction<
    'PodAI111111111111111111111111111111111111111',
    TAccountJobPosting,
    TAccountEmployer,
    TAccountSystemProgram
  >
> {
  return getCreateJobPostingInstruction(input);
}

export function getCreateJobPostingInstructionData(
  instruction: CreateJobPostingInstruction<any, any, any, any>
): CreateJobPostingInstructionData {
  return {
    programAddress: instruction.programAddress,
    accounts: {
      jobPosting: getNextAccount(),
      client: getNextAccount(),
      systemProgram: getNextAccount(),
    },
    data: getCreateJobPostingInstructionDataDecoder().decode(instruction.data),
  };
}
