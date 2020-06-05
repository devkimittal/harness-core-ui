import xhr from '@wings-software/xhr-async'
import type { ResponseWrapper } from 'modules/common/utils/HelperTypes'
import type { CVConfig, RestResponseListCVConfig, MetricPack } from '@wings-software/swagger-ts/definitions'

export async function fetchQueriesFromSplunk({ accountId, dataSourceId = '', xhrGroup }: any) {
  const url = `https://localhost:9090/api/cv-nextgen/splunk/saved-searches?accountId=${accountId}&connectorId=${dataSourceId}`
  return await xhr.get(url, { group: xhrGroup })
}

export async function fetchConfigs({
  accountId,
  dataSourceConnectorId
}: {
  accountId: string
  dataSourceConnectorId: string
}): Promise<ResponseWrapper<RestResponseListCVConfig>> {
  return xhr
    .get(
      `https://localhost:9090/api/cv-nextgen/cv-config/list?accountId=${accountId}&connectorId=${dataSourceConnectorId}`
    )
    .as('configs')
}

export async function saveConfigs({
  accountId,
  group,
  configsToSave
}: {
  accountId: string
  group: string
  configsToSave: CVConfig[]
}): Promise<ResponseWrapper<RestResponseListCVConfig>> {
  return xhr.post(`https://localhost:9090/api/cv-nextgen/cv-config/batch?accountId=${accountId}`, {
    group,
    data: configsToSave
  })
}

export async function updateConfigs({
  accountId,
  group,
  configsToUpdate
}: {
  accountId: string
  group: string
  configsToUpdate: CVConfig[]
}): Promise<ResponseWrapper<RestResponseListCVConfig>> {
  return xhr.put(`https://localhost:9090/api/cv-nextgen/cv-config/batch?accountId=${accountId}`, {
    group,
    data: configsToUpdate
  })
}

export async function deleteConfigs({
  accountId,
  group,
  configsToDelete
}: {
  accountId: string
  group: string
  configsToDelete: string[]
}): Promise<ResponseWrapper<RestResponseListCVConfig>> {
  return xhr.delete(`https://localhost:9090/api/cv-nextgen/cv-config/batch?accountId=${accountId}`, {
    group,
    data: configsToDelete
  })
}

export async function fetchMetricPacks({
  accountId,
  projectId,
  dataSourceType,
  excludeDetails,
  group
}: {
  accountId: string
  projectId: number
  dataSourceType: string
  excludeDetails: boolean
  group: string
}): Promise<ResponseWrapper<MetricPack[]>> {
  return xhr.get(
    `https://localhost:9090/api/cv-nextgen/data-source/metric-packs?accountId=${accountId}&projectId=${projectId}&datasourceType=${dataSourceType}&excludeDetails=${excludeDetails}`,
    { group }
  )
}
