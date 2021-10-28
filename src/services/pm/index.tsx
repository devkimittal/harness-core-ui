/* Generated by restful-react */

import React from 'react'
import { Get, GetProps, useGet, UseGetProps, Mutate, MutateProps, useMutate, UseMutateProps } from 'restful-react'

import { getConfig } from '../config'
export const SPEC_VERSION = '1.0.0'
export interface AggregateStatus {
  date?: number
  error_count?: number
  pass_count?: number
  warning_count?: number
}

export interface DashboardMetrics {
  aggregates?: AggregateStatus[]
  enabled_policy_set_count?: number
  failed_evaluation_count?: number
  total_evaluation_count?: number
  total_policy_count?: number
  total_policy_set_count?: number
}

export interface EvaluatedPolicy {
  deny_messages?: string[]
  error?: string
  output?: { [key: string]: any }
  policy?: Policy
  status?: 'error' | 'warning' | 'pass'
}

export interface Evaluation {
  account_id?: string
  action?: string
  created?: number
  details?: EvaluationDetails
  entity?: string
  entity_metadata?: string
  id?: number
  input?: { [key: string]: any }
  org_id?: string
  project_id?: string
  status?: 'error' | 'warning' | 'pass'
  type?: string
}

export interface EvaluationDetail {
  created?: number
  details?: EvaluatedPolicy[]
  identifier?: string
  name?: string
  status?: 'error' | 'warning' | 'pass'
}

export type EvaluationDetails = EvaluationDetail[]

export interface Example {
  input?: string
  rego?: string
  type?: string
}

export interface LinkedPolicy {
  account_id?: string
  created?: number
  identifier?: string
  name?: string
  org_id?: string
  project_id?: string
  rego?: string
  severity?: 'error' | 'warning'
  updated?: number
}

export interface LinkedPolicyInput {
  severity?: 'error' | 'warning'
}

export interface Policy {
  account_id?: string
  created?: number
  identifier?: string
  name?: string
  org_id?: string
  project_id?: string
  rego?: string
  updated?: number
}

export interface PolicyCreate {
  identifier?: string
  name?: string
  rego?: string
}

export interface PolicySet {
  account_id?: string
  action?: string
  created?: number
  enabled?: boolean
  identifier?: string
  name?: string
  org_id?: string
  project_id?: string
  type?: string
  updated?: number
}

export interface PolicySetCreate {
  action?: string
  enabled?: boolean
  identifier?: string
  name?: string
  type?: string
}

export interface PolicySetUpdate {
  action?: string
  enabled?: boolean
  name?: string
  policies?: LinkedPolicy[]
  type?: string
}

export interface PolicySetWithLinkedPolicies {
  account_id?: string
  action?: string
  created?: number
  enabled?: boolean
  identifier?: string
  name?: string
  org_id?: string
  policies?: LinkedPolicy[]
  project_id?: string
  type?: string
  updated?: number
}

export interface PolicyUpdate {
  name?: string
  rego?: string
}

export interface RawEvaluationInput {
  input?: { [key: string]: any }
  rego?: string
}

export interface Token {
  access_token?: string
  uri?: string
}

export interface User {
  admin?: boolean
  authed?: number
  company?: string
  created?: number
  email?: string
  id?: number
  name?: string
  updated?: number
}

export interface UserInput {
  admin?: boolean
  company?: string
  email?: string
  name?: string
  password?: string
}

export interface Version {
  version?: string
}

export type UserInputRequestBody = UserInput

export type EvaluateByIdsInputRequestBody = string

export type LoginRequestBody = void

export type AuthResponse = Token[]

export type DashboardResponse = DashboardMetrics

export type EvaluateByIdsResponse = Evaluation

export type EvaluateByTypeResponse = Evaluation

export type EvaluateRawResponse = Evaluation

export type EvaluationResponse = Evaluation

export type EvaluationListResponse = Evaluation[]

export type ExamplesResponse = Example[]

export type PolicyResponse = Policy

export type PolicyListResponse = Policy[]

export type PolicysetResponse = PolicySetWithLinkedPolicies

export type PolicysetListResponse = PolicySet[]

export type UserResponse = User

export type UserListResponse = User[]

export type VersionResponse = Version

export type GetdashboardProps = Omit<GetProps<DashboardResponse, unknown, void, void>, 'path'>

/**
 * Get the dashboard metrics
 */
export const Getdashboard = (props: GetdashboardProps) => (
  <Get<DashboardResponse, unknown, void, void> path={`/dashboard`} base={getConfig('pm/api/v1')} {...props} />
)

export type UseGetdashboardProps = Omit<UseGetProps<DashboardResponse, unknown, void, void>, 'path'>

/**
 * Get the dashboard metrics
 */
export const useGetdashboard = (props: UseGetdashboardProps) =>
  useGet<DashboardResponse, unknown, void, void>(`/dashboard`, { base: getConfig('pm/api/v1'), ...props })

export type EvaluateRawProps = Omit<
  MutateProps<PolicyResponse, unknown, void, RawEvaluationInput, void>,
  'path' | 'verb'
>

/**
 * Evaluate arbitrary rego policies
 *
 * Input must be a JSON structure. It must not be a string containing "double-encoded" JSON.
 */
export const EvaluateRaw = (props: EvaluateRawProps) => (
  <Mutate<PolicyResponse, unknown, void, RawEvaluationInput, void>
    verb="POST"
    path={`/evaluate`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseEvaluateRawProps = Omit<
  UseMutateProps<PolicyResponse, unknown, void, RawEvaluationInput, void>,
  'path' | 'verb'
>

/**
 * Evaluate arbitrary rego policies
 *
 * Input must be a JSON structure. It must not be a string containing "double-encoded" JSON.
 */
export const useEvaluateRaw = (props: UseEvaluateRawProps) =>
  useMutate<PolicyResponse, unknown, void, RawEvaluationInput, void>('POST', `/evaluate`, {
    base: getConfig('pm/api/v1'),
    ...props
  })

export interface EvaluateByIdsQueryParams {
  /**
   * A unique ID for the entity under evaluation e.g. UUID, database key. Can be used to filter out evaluations for a particular entity. The caller must ensure the ID is globally unqiue and cannot clash with any other callers.
   */
  entity?: string
  /**
   * Arbitrary string containing metadata about the entity like friendly name. Can be a raw string, JSON, YAML, base 64 encoded as suits the caller.
   */
  entityMetadata?: string
  /**
   * Comma-separated list of policy set IDs
   */
  ids?: string
}

export type EvaluateByIdsProps = Omit<
  MutateProps<PolicyResponse, unknown, EvaluateByIdsQueryParams, EvaluateByIdsInputRequestBody, void>,
  'path' | 'verb'
>

/**
 * Evaluate policy sets by policy set ids
 */
export const EvaluateByIds = (props: EvaluateByIdsProps) => (
  <Mutate<PolicyResponse, unknown, EvaluateByIdsQueryParams, EvaluateByIdsInputRequestBody, void>
    verb="POST"
    path={`/evaluate-by-ids`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseEvaluateByIdsProps = Omit<
  UseMutateProps<PolicyResponse, unknown, EvaluateByIdsQueryParams, EvaluateByIdsInputRequestBody, void>,
  'path' | 'verb'
>

/**
 * Evaluate policy sets by policy set ids
 */
export const useEvaluateByIds = (props: UseEvaluateByIdsProps) =>
  useMutate<PolicyResponse, unknown, EvaluateByIdsQueryParams, EvaluateByIdsInputRequestBody, void>(
    'POST',
    `/evaluate-by-ids`,
    { base: getConfig('pm/api/v1'), ...props }
  )

export interface EvaluateByTypeQueryParams {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
  /**
   * A unique ID for the entity under evaluation e.g. UUID, database key. Can be used to filter out evaluations for a particular entity. The caller must ensure the ID is globally unqiue and cannot clash with any other callers.
   */
  entity?: string
  /**
   * Arbitrary string containing metadata about the entity like friendly name. Can be a raw string, JSON, YAML, base 64 encoded as suits the caller.
   */
  entityMetadata?: string
  /**
   * The type of entity that is under evaluation e.g. pipeline, environment
   */
  type?: string
  /**
   * The action performed on the entity that is under evaluation e.g. onrun, onsave
   */
  action?: string
}

export type EvaluateByTypeProps = Omit<
  MutateProps<PolicyResponse, unknown, EvaluateByTypeQueryParams, EvaluateByIdsInputRequestBody, void>,
  'path' | 'verb'
>

/**
 * Evaluate policy sets by policy set type
 */
export const EvaluateByType = (props: EvaluateByTypeProps) => (
  <Mutate<PolicyResponse, unknown, EvaluateByTypeQueryParams, EvaluateByIdsInputRequestBody, void>
    verb="POST"
    path={`/evaluate-by-type`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseEvaluateByTypeProps = Omit<
  UseMutateProps<PolicyResponse, unknown, EvaluateByTypeQueryParams, EvaluateByIdsInputRequestBody, void>,
  'path' | 'verb'
>

/**
 * Evaluate policy sets by policy set type
 */
export const useEvaluateByType = (props: UseEvaluateByTypeProps) =>
  useMutate<PolicyResponse, unknown, EvaluateByTypeQueryParams, EvaluateByIdsInputRequestBody, void>(
    'POST',
    `/evaluate-by-type`,
    { base: getConfig('pm/api/v1'), ...props }
  )

export interface GetEvaluationListQueryParams {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
  /**
   * Filter by evaluation 'entity' field
   */
  entity?: string
  /**
   * the number of records returned per page
   */
  per_page?: string
  /**
   * the id of the last returned record
   */
  last_seen?: string
}

export type GetEvaluationListProps = Omit<
  GetProps<EvaluationListResponse, unknown, GetEvaluationListQueryParams, void>,
  'path'
>

/**
 * Get the list of all evaluations
 */
export const GetEvaluationList = (props: GetEvaluationListProps) => (
  <Get<EvaluationListResponse, unknown, GetEvaluationListQueryParams, void>
    path={`/evaluations`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseGetEvaluationListProps = Omit<
  UseGetProps<EvaluationListResponse, unknown, GetEvaluationListQueryParams, void>,
  'path'
>

/**
 * Get the list of all evaluations
 */
export const useGetEvaluationList = (props: UseGetEvaluationListProps) =>
  useGet<EvaluationListResponse, unknown, GetEvaluationListQueryParams, void>(`/evaluations`, {
    base: getConfig('pm/api/v1'),
    ...props
  })

export interface DeleteEvaluationQueryParams {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export type DeleteEvaluationProps = Omit<
  MutateProps<void, unknown, DeleteEvaluationQueryParams, string, void>,
  'path' | 'verb'
>

/**
 * Delete the evaluation by ID
 */
export const DeleteEvaluation = (props: DeleteEvaluationProps) => (
  <Mutate<void, unknown, DeleteEvaluationQueryParams, string, void>
    verb="DELETE"
    path={`/evaluations`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseDeleteEvaluationProps = Omit<
  UseMutateProps<void, unknown, DeleteEvaluationQueryParams, string, void>,
  'path' | 'verb'
>

/**
 * Delete the evaluation by ID
 */
export const useDeleteEvaluation = (props: UseDeleteEvaluationProps) =>
  useMutate<void, unknown, DeleteEvaluationQueryParams, string, void>('DELETE', `/evaluations`, {
    base: getConfig('pm/api/v1'),
    ...props
  })

export interface GetEvaluationQueryParams {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export interface GetEvaluationPathParams {
  evaluation: string
}

export type GetEvaluationProps = Omit<
  GetProps<EvaluationResponse, unknown, GetEvaluationQueryParams, GetEvaluationPathParams>,
  'path'
> &
  GetEvaluationPathParams

/**
 * Get the evaluation by ID
 */
export const GetEvaluation = ({ evaluation, ...props }: GetEvaluationProps) => (
  <Get<EvaluationResponse, unknown, GetEvaluationQueryParams, GetEvaluationPathParams>
    path={`/evaluations/${evaluation}`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseGetEvaluationProps = Omit<
  UseGetProps<EvaluationResponse, unknown, GetEvaluationQueryParams, GetEvaluationPathParams>,
  'path'
> &
  GetEvaluationPathParams

/**
 * Get the evaluation by ID
 */
export const useGetEvaluation = ({ evaluation, ...props }: UseGetEvaluationProps) =>
  useGet<EvaluationResponse, unknown, GetEvaluationQueryParams, GetEvaluationPathParams>(
    (paramsInPath: GetEvaluationPathParams) => `/evaluations/${paramsInPath.evaluation}`,
    { base: getConfig('pm/api/v1'), pathParams: { evaluation }, ...props }
  )

export type GetexamplesProps = Omit<GetProps<ExamplesResponse, unknown, void, void>, 'path'>

/**
 * Get the example rego and input
 */
export const Getexamples = (props: GetexamplesProps) => (
  <Get<ExamplesResponse, unknown, void, void> path={`/examples`} base={getConfig('pm/api/v1')} {...props} />
)

export type UseGetexamplesProps = Omit<UseGetProps<ExamplesResponse, unknown, void, void>, 'path'>

/**
 * Get the example rego and input
 */
export const useGetexamples = (props: UseGetexamplesProps) =>
  useGet<ExamplesResponse, unknown, void, void>(`/examples`, { base: getConfig('pm/api/v1'), ...props })

export type LoginProps = Omit<MutateProps<AuthResponse, unknown, void, LoginRequestBody, void>, 'path' | 'verb'>

/**
 * Return system health information
 */
export const Login = (props: LoginProps) => (
  <Mutate<AuthResponse, unknown, void, LoginRequestBody, void>
    verb="POST"
    path={`/login`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseLoginProps = Omit<UseMutateProps<AuthResponse, unknown, void, LoginRequestBody, void>, 'path' | 'verb'>

/**
 * Return system health information
 */
export const useLogin = (props: UseLoginProps) =>
  useMutate<AuthResponse, unknown, void, LoginRequestBody, void>('POST', `/login`, {
    base: getConfig('pm/api/v1'),
    ...props
  })

export interface GetPolicyListQueryParams {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
  /**
   * the number of records returned per page
   */
  per_page?: string
  /**
   * the page requested page number
   */
  page?: string
}

export type GetPolicyListProps = Omit<GetProps<PolicyListResponse, unknown, GetPolicyListQueryParams, void>, 'path'>

/**
 * Get the list of all policies
 */
export const GetPolicyList = (props: GetPolicyListProps) => (
  <Get<PolicyListResponse, unknown, GetPolicyListQueryParams, void>
    path={`/policies`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseGetPolicyListProps = Omit<
  UseGetProps<PolicyListResponse, unknown, GetPolicyListQueryParams, void>,
  'path'
>

/**
 * Get the list of all policies
 */
export const useGetPolicyList = (props: UseGetPolicyListProps) =>
  useGet<PolicyListResponse, unknown, GetPolicyListQueryParams, void>(`/policies`, {
    base: getConfig('pm/api/v1'),
    ...props
  })

export interface CreatePolicyQueryParams {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export type CreatePolicyProps = Omit<
  MutateProps<PolicyResponse, unknown, CreatePolicyQueryParams, PolicyCreate, void>,
  'path' | 'verb'
>

/**
 * Create a new policy
 */
export const CreatePolicy = (props: CreatePolicyProps) => (
  <Mutate<PolicyResponse, unknown, CreatePolicyQueryParams, PolicyCreate, void>
    verb="POST"
    path={`/policies`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseCreatePolicyProps = Omit<
  UseMutateProps<PolicyResponse, unknown, CreatePolicyQueryParams, PolicyCreate, void>,
  'path' | 'verb'
>

/**
 * Create a new policy
 */
export const useCreatePolicy = (props: UseCreatePolicyProps) =>
  useMutate<PolicyResponse, unknown, CreatePolicyQueryParams, PolicyCreate, void>('POST', `/policies`, {
    base: getConfig('pm/api/v1'),
    ...props
  })

export interface DeletePolicyQueryParams {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export type DeletePolicyProps = Omit<MutateProps<void, unknown, DeletePolicyQueryParams, string, void>, 'path' | 'verb'>

/**
 * Delete the policy by ID
 */
export const DeletePolicy = (props: DeletePolicyProps) => (
  <Mutate<void, unknown, DeletePolicyQueryParams, string, void>
    verb="DELETE"
    path={`/policies`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseDeletePolicyProps = Omit<
  UseMutateProps<void, unknown, DeletePolicyQueryParams, string, void>,
  'path' | 'verb'
>

/**
 * Delete the policy by ID
 */
export const useDeletePolicy = (props: UseDeletePolicyProps) =>
  useMutate<void, unknown, DeletePolicyQueryParams, string, void>('DELETE', `/policies`, {
    base: getConfig('pm/api/v1'),
    ...props
  })

export interface GetPolicyQueryParams {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export interface GetPolicyPathParams {
  policy: string
}

export type GetPolicyProps = Omit<
  GetProps<PolicyResponse, unknown, GetPolicyQueryParams, GetPolicyPathParams>,
  'path'
> &
  GetPolicyPathParams

/**
 * Get the policy by ID
 */
export const GetPolicy = ({ policy, ...props }: GetPolicyProps) => (
  <Get<PolicyResponse, unknown, GetPolicyQueryParams, GetPolicyPathParams>
    path={`/policies/${policy}`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseGetPolicyProps = Omit<
  UseGetProps<PolicyResponse, unknown, GetPolicyQueryParams, GetPolicyPathParams>,
  'path'
> &
  GetPolicyPathParams

/**
 * Get the policy by ID
 */
export const useGetPolicy = ({ policy, ...props }: UseGetPolicyProps) =>
  useGet<PolicyResponse, unknown, GetPolicyQueryParams, GetPolicyPathParams>(
    (paramsInPath: GetPolicyPathParams) => `/policies/${paramsInPath.policy}`,
    { base: getConfig('pm/api/v1'), pathParams: { policy }, ...props }
  )

export interface UpdatePolicyQueryParams {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export interface UpdatePolicyPathParams {
  policy: string
}

export type UpdatePolicyProps = Omit<
  MutateProps<PolicyResponse, unknown, UpdatePolicyQueryParams, PolicyUpdate, UpdatePolicyPathParams>,
  'path' | 'verb'
> &
  UpdatePolicyPathParams

/**
 * Update the policy by ID
 */
export const UpdatePolicy = ({ policy, ...props }: UpdatePolicyProps) => (
  <Mutate<PolicyResponse, unknown, UpdatePolicyQueryParams, PolicyUpdate, UpdatePolicyPathParams>
    verb="PATCH"
    path={`/policies/${policy}`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseUpdatePolicyProps = Omit<
  UseMutateProps<PolicyResponse, unknown, UpdatePolicyQueryParams, PolicyUpdate, UpdatePolicyPathParams>,
  'path' | 'verb'
> &
  UpdatePolicyPathParams

/**
 * Update the policy by ID
 */
export const useUpdatePolicy = ({ policy, ...props }: UseUpdatePolicyProps) =>
  useMutate<PolicyResponse, unknown, UpdatePolicyQueryParams, PolicyUpdate, UpdatePolicyPathParams>(
    'PATCH',
    (paramsInPath: UpdatePolicyPathParams) => `/policies/${paramsInPath.policy}`,
    { base: getConfig('pm/api/v1'), pathParams: { policy }, ...props }
  )

export interface GetPolicySetListQueryParams {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
  /**
   * Filter by policy set 'type' field
   */
  type?: string
  /**
   * Filter by policy set 'action' field
   */
  action?: string
  /**
   * The number of records returned per page
   */
  per_page?: string
  /**
   * The page requested page number
   */
  page?: string
}

export type GetPolicySetListProps = Omit<
  GetProps<PolicysetListResponse, unknown, GetPolicySetListQueryParams, void>,
  'path'
>

/**
 * Get the list of all policysets
 */
export const GetPolicySetList = (props: GetPolicySetListProps) => (
  <Get<PolicysetListResponse, unknown, GetPolicySetListQueryParams, void>
    path={`/policysets`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseGetPolicySetListProps = Omit<
  UseGetProps<PolicysetListResponse, unknown, GetPolicySetListQueryParams, void>,
  'path'
>

/**
 * Get the list of all policysets
 */
export const useGetPolicySetList = (props: UseGetPolicySetListProps) =>
  useGet<PolicysetListResponse, unknown, GetPolicySetListQueryParams, void>(`/policysets`, {
    base: getConfig('pm/api/v1'),
    ...props
  })

export interface CreatePolicySetQueryParams {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export type CreatePolicySetProps = Omit<
  MutateProps<PolicysetResponse, unknown, CreatePolicySetQueryParams, PolicySetCreate, void>,
  'path' | 'verb'
>

/**
 * Create a new policyset
 */
export const CreatePolicySet = (props: CreatePolicySetProps) => (
  <Mutate<PolicysetResponse, unknown, CreatePolicySetQueryParams, PolicySetCreate, void>
    verb="POST"
    path={`/policysets`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseCreatePolicySetProps = Omit<
  UseMutateProps<PolicysetResponse, unknown, CreatePolicySetQueryParams, PolicySetCreate, void>,
  'path' | 'verb'
>

/**
 * Create a new policyset
 */
export const useCreatePolicySet = (props: UseCreatePolicySetProps) =>
  useMutate<PolicysetResponse, unknown, CreatePolicySetQueryParams, PolicySetCreate, void>('POST', `/policysets`, {
    base: getConfig('pm/api/v1'),
    ...props
  })

export interface DeletePolicySetQueryParams {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export type DeletePolicySetProps = Omit<
  MutateProps<void, unknown, DeletePolicySetQueryParams, string, void>,
  'path' | 'verb'
>

/**
 * Delete the policyset by ID
 */
export const DeletePolicySet = (props: DeletePolicySetProps) => (
  <Mutate<void, unknown, DeletePolicySetQueryParams, string, void>
    verb="DELETE"
    path={`/policysets`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseDeletePolicySetProps = Omit<
  UseMutateProps<void, unknown, DeletePolicySetQueryParams, string, void>,
  'path' | 'verb'
>

/**
 * Delete the policyset by ID
 */
export const useDeletePolicySet = (props: UseDeletePolicySetProps) =>
  useMutate<void, unknown, DeletePolicySetQueryParams, string, void>('DELETE', `/policysets`, {
    base: getConfig('pm/api/v1'),
    ...props
  })

export interface GetPolicySetQueryParams {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export interface GetPolicySetPathParams {
  policyset: string
}

export type GetPolicySetProps = Omit<
  GetProps<PolicysetResponse, unknown, GetPolicySetQueryParams, GetPolicySetPathParams>,
  'path'
> &
  GetPolicySetPathParams

/**
 * Get the policyset by ID
 */
export const GetPolicySet = ({ policyset, ...props }: GetPolicySetProps) => (
  <Get<PolicysetResponse, unknown, GetPolicySetQueryParams, GetPolicySetPathParams>
    path={`/policysets/${policyset}`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseGetPolicySetProps = Omit<
  UseGetProps<PolicysetResponse, unknown, GetPolicySetQueryParams, GetPolicySetPathParams>,
  'path'
> &
  GetPolicySetPathParams

/**
 * Get the policyset by ID
 */
export const useGetPolicySet = ({ policyset, ...props }: UseGetPolicySetProps) =>
  useGet<PolicysetResponse, unknown, GetPolicySetQueryParams, GetPolicySetPathParams>(
    (paramsInPath: GetPolicySetPathParams) => `/policysets/${paramsInPath.policyset}`,
    { base: getConfig('pm/api/v1'), pathParams: { policyset }, ...props }
  )

export interface UpdatePolicySetQueryParams {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export interface UpdatePolicySetPathParams {
  policyset: string
}

export type UpdatePolicySetProps = Omit<
  MutateProps<PolicysetResponse, unknown, UpdatePolicySetQueryParams, PolicySetUpdate, UpdatePolicySetPathParams>,
  'path' | 'verb'
> &
  UpdatePolicySetPathParams

/**
 * Update the policyset by ID
 */
export const UpdatePolicySet = ({ policyset, ...props }: UpdatePolicySetProps) => (
  <Mutate<PolicysetResponse, unknown, UpdatePolicySetQueryParams, PolicySetUpdate, UpdatePolicySetPathParams>
    verb="PATCH"
    path={`/policysets/${policyset}`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseUpdatePolicySetProps = Omit<
  UseMutateProps<PolicysetResponse, unknown, UpdatePolicySetQueryParams, PolicySetUpdate, UpdatePolicySetPathParams>,
  'path' | 'verb'
> &
  UpdatePolicySetPathParams

/**
 * Update the policyset by ID
 */
export const useUpdatePolicySet = ({ policyset, ...props }: UseUpdatePolicySetProps) =>
  useMutate<PolicysetResponse, unknown, UpdatePolicySetQueryParams, PolicySetUpdate, UpdatePolicySetPathParams>(
    'PATCH',
    (paramsInPath: UpdatePolicySetPathParams) => `/policysets/${paramsInPath.policyset}`,
    { base: getConfig('pm/api/v1'), pathParams: { policyset }, ...props }
  )

export interface DeleteLinkedPolicyQueryParams {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export interface DeleteLinkedPolicyPathParams {
  policyset: string
}

export type DeleteLinkedPolicyProps = Omit<
  MutateProps<void, unknown, DeleteLinkedPolicyQueryParams, string, DeleteLinkedPolicyPathParams>,
  'path' | 'verb'
> &
  DeleteLinkedPolicyPathParams

/**
 * Delete the linked policy by ID
 */
export const DeleteLinkedPolicy = ({ policyset, ...props }: DeleteLinkedPolicyProps) => (
  <Mutate<void, unknown, DeleteLinkedPolicyQueryParams, string, DeleteLinkedPolicyPathParams>
    verb="DELETE"
    path={`/policysets/${policyset}/policy`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseDeleteLinkedPolicyProps = Omit<
  UseMutateProps<void, unknown, DeleteLinkedPolicyQueryParams, string, DeleteLinkedPolicyPathParams>,
  'path' | 'verb'
> &
  DeleteLinkedPolicyPathParams

/**
 * Delete the linked policy by ID
 */
export const useDeleteLinkedPolicy = ({ policyset, ...props }: UseDeleteLinkedPolicyProps) =>
  useMutate<void, unknown, DeleteLinkedPolicyQueryParams, string, DeleteLinkedPolicyPathParams>(
    'DELETE',
    (paramsInPath: DeleteLinkedPolicyPathParams) => `/policysets/${paramsInPath.policyset}/policy`,
    { base: getConfig('pm/api/v1'), pathParams: { policyset }, ...props }
  )

export interface AddLinkedPolicyQueryParams {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export interface AddLinkedPolicyPathParams {
  policyset: string
  policy: string
}

export type AddLinkedPolicyProps = Omit<
  MutateProps<void, unknown, AddLinkedPolicyQueryParams, LinkedPolicyInput, AddLinkedPolicyPathParams>,
  'path' | 'verb'
> &
  AddLinkedPolicyPathParams

/**
 * Add a new linked policy
 */
export const AddLinkedPolicy = ({ policyset, policy, ...props }: AddLinkedPolicyProps) => (
  <Mutate<void, unknown, AddLinkedPolicyQueryParams, LinkedPolicyInput, AddLinkedPolicyPathParams>
    verb="PATCH"
    path={`/policysets/${policyset}/policy/${policy}`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseAddLinkedPolicyProps = Omit<
  UseMutateProps<void, unknown, AddLinkedPolicyQueryParams, LinkedPolicyInput, AddLinkedPolicyPathParams>,
  'path' | 'verb'
> &
  AddLinkedPolicyPathParams

/**
 * Add a new linked policy
 */
export const useAddLinkedPolicy = ({ policyset, policy, ...props }: UseAddLinkedPolicyProps) =>
  useMutate<void, unknown, AddLinkedPolicyQueryParams, LinkedPolicyInput, AddLinkedPolicyPathParams>(
    'PATCH',
    (paramsInPath: AddLinkedPolicyPathParams) => `/policysets/${paramsInPath.policyset}/policy/${paramsInPath.policy}`,
    { base: getConfig('pm/api/v1'), pathParams: { policyset, policy }, ...props }
  )

export type RegisterProps = Omit<MutateProps<AuthResponse, unknown, void, LoginRequestBody, void>, 'path' | 'verb'>

/**
 * Return system version information
 */
export const Register = (props: RegisterProps) => (
  <Mutate<AuthResponse, unknown, void, LoginRequestBody, void>
    verb="POST"
    path={`/register`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseRegisterProps = Omit<
  UseMutateProps<AuthResponse, unknown, void, LoginRequestBody, void>,
  'path' | 'verb'
>

/**
 * Return system version information
 */
export const useRegister = (props: UseRegisterProps) =>
  useMutate<AuthResponse, unknown, void, LoginRequestBody, void>('POST', `/register`, {
    base: getConfig('pm/api/v1'),
    ...props
  })

export type HealthProps = Omit<GetProps<void, unknown, void, void>, 'path'>

/**
 * Return system health information
 */
export const Health = (props: HealthProps) => (
  <Get<void, unknown, void, void> path={`/system/health`} base={getConfig('pm/api/v1')} {...props} />
)

export type UseHealthProps = Omit<UseGetProps<void, unknown, void, void>, 'path'>

/**
 * Return system health information
 */
export const useHealth = (props: UseHealthProps) =>
  useGet<void, unknown, void, void>(`/system/health`, { base: getConfig('pm/api/v1'), ...props })

export type VersionProps = Omit<GetProps<VersionResponse, unknown, void, void>, 'path'>

/**
 * Return system version information
 */
export const Version = (props: VersionProps) => (
  <Get<VersionResponse, unknown, void, void> path={`/system/version`} base={getConfig('pm/api/v1')} {...props} />
)

export type UseVersionProps = Omit<UseGetProps<VersionResponse, unknown, void, void>, 'path'>

/**
 * Return system version information
 */
export const useVersion = (props: UseVersionProps) =>
  useGet<VersionResponse, unknown, void, void>(`/system/version`, { base: getConfig('pm/api/v1'), ...props })

export type GetCurrentUserProps = Omit<GetProps<UserResponse, unknown, void, void>, 'path'>

/**
 * Get the authenticated user.
 */
export const GetCurrentUser = (props: GetCurrentUserProps) => (
  <Get<UserResponse, unknown, void, void> path={`/user`} base={getConfig('pm/api/v1')} {...props} />
)

export type UseGetCurrentUserProps = Omit<UseGetProps<UserResponse, unknown, void, void>, 'path'>

/**
 * Get the authenticated user.
 */
export const useGetCurrentUser = (props: UseGetCurrentUserProps) =>
  useGet<UserResponse, unknown, void, void>(`/user`, { base: getConfig('pm/api/v1'), ...props })

export type GetUserListProps = Omit<GetProps<UserListResponse, unknown, void, void>, 'path'>

/**
 * Get the list of all registered users.
 */
export const GetUserList = (props: GetUserListProps) => (
  <Get<UserListResponse, unknown, void, void> path={`/users`} base={getConfig('pm/api/v1')} {...props} />
)

export type UseGetUserListProps = Omit<UseGetProps<UserListResponse, unknown, void, void>, 'path'>

/**
 * Get the list of all registered users.
 */
export const useGetUserList = (props: UseGetUserListProps) =>
  useGet<UserListResponse, unknown, void, void>(`/users`, { base: getConfig('pm/api/v1'), ...props })

export type CreateUserProps = Omit<
  MutateProps<UserResponse, unknown, void, UserInputRequestBody, void>,
  'path' | 'verb'
>

/**
 * Create a new user.
 */
export const CreateUser = (props: CreateUserProps) => (
  <Mutate<UserResponse, unknown, void, UserInputRequestBody, void>
    verb="POST"
    path={`/users`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseCreateUserProps = Omit<
  UseMutateProps<UserResponse, unknown, void, UserInputRequestBody, void>,
  'path' | 'verb'
>

/**
 * Create a new user.
 */
export const useCreateUser = (props: UseCreateUserProps) =>
  useMutate<UserResponse, unknown, void, UserInputRequestBody, void>('POST', `/users`, {
    base: getConfig('pm/api/v1'),
    ...props
  })

export type DeleteUserProps = Omit<MutateProps<void, unknown, void, string, void>, 'path' | 'verb'>

/**
 * Delete the user with the matching email address.
 */
export const DeleteUser = (props: DeleteUserProps) => (
  <Mutate<void, unknown, void, string, void> verb="DELETE" path={`/users`} base={getConfig('pm/api/v1')} {...props} />
)

export type UseDeleteUserProps = Omit<UseMutateProps<void, unknown, void, string, void>, 'path' | 'verb'>

/**
 * Delete the user with the matching email address.
 */
export const useDeleteUser = (props: UseDeleteUserProps) =>
  useMutate<void, unknown, void, string, void>('DELETE', `/users`, { base: getConfig('pm/api/v1'), ...props })

export interface GetUserPathParams {
  user: string
}

export type GetUserProps = Omit<GetProps<UserResponse, unknown, void, GetUserPathParams>, 'path'> & GetUserPathParams

/**
 * Get the user with the matching email address.
 */
export const GetUser = ({ user, ...props }: GetUserProps) => (
  <Get<UserResponse, unknown, void, GetUserPathParams>
    path={`/users/${user}`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseGetUserProps = Omit<UseGetProps<UserResponse, unknown, void, GetUserPathParams>, 'path'> &
  GetUserPathParams

/**
 * Get the user with the matching email address.
 */
export const useGetUser = ({ user, ...props }: UseGetUserProps) =>
  useGet<UserResponse, unknown, void, GetUserPathParams>(
    (paramsInPath: GetUserPathParams) => `/users/${paramsInPath.user}`,
    { base: getConfig('pm/api/v1'), pathParams: { user }, ...props }
  )

export interface UpdateUserPathParams {
  user: string
}

export type UpdateUserProps = Omit<
  MutateProps<UserResponse, unknown, void, UserInputRequestBody, UpdateUserPathParams>,
  'path' | 'verb'
> &
  UpdateUserPathParams

/**
 * Update the user with the matching email address.
 */
export const UpdateUser = ({ user, ...props }: UpdateUserProps) => (
  <Mutate<UserResponse, unknown, void, UserInputRequestBody, UpdateUserPathParams>
    verb="PATCH"
    path={`/users/${user}`}
    base={getConfig('pm/api/v1')}
    {...props}
  />
)

export type UseUpdateUserProps = Omit<
  UseMutateProps<UserResponse, unknown, void, UserInputRequestBody, UpdateUserPathParams>,
  'path' | 'verb'
> &
  UpdateUserPathParams

/**
 * Update the user with the matching email address.
 */
export const useUpdateUser = ({ user, ...props }: UseUpdateUserProps) =>
  useMutate<UserResponse, unknown, void, UserInputRequestBody, UpdateUserPathParams>(
    'PATCH',
    (paramsInPath: UpdateUserPathParams) => `/users/${paramsInPath.user}`,
    { base: getConfig('pm/api/v1'), pathParams: { user }, ...props }
  )
