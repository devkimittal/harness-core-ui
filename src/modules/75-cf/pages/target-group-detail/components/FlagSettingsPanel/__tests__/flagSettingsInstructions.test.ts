import { cloneDeep, omit } from 'lodash-es'
import {
  getUpdatedFlags,
  getFlagSettingsInstructions,
  getRemovedFlagIdentifiers,
  getRemoveFlagsInstruction,
  getUpdateFlagsInstruction
} from '../flagSettingsInstructions'
import { mockFlagSettingsFormDataValues, mockTargetGroupFlagsMap } from './mocks'

describe('flagSettingsInstructions', () => {
  describe('getFlagSettingsInstructions', () => {
    test('it should return no instructions when nothing changed', async () => {
      expect(getFlagSettingsInstructions(mockFlagSettingsFormDataValues.flags, mockTargetGroupFlagsMap)).toEqual([])
    })

    test('it should return only a removeRule instruction when a flag is removed', async () => {
      const flags = omit(mockFlagSettingsFormDataValues.flags, 'f1')

      const response = getFlagSettingsInstructions(flags, mockTargetGroupFlagsMap)

      expect(response).not.toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'addRule' })]))
      expect(response).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'removeRule' })]))
    })

    test('it should return only an addRule instruction when a flag is changed', async () => {
      const flags = cloneDeep(mockFlagSettingsFormDataValues.flags)
      flags.f1.variation = 'v2'

      const response = getFlagSettingsInstructions(flags, mockTargetGroupFlagsMap)

      expect(response).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'addRule' })]))
      expect(response).not.toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'removeRule' })]))
    })

    test('it should return both removeRule and addRule instructions when a flag is removed and another changed', async () => {
      const flags = omit(cloneDeep(mockFlagSettingsFormDataValues.flags), 'f1')
      flags.f2.variation = 'v1'

      const response = getFlagSettingsInstructions(flags, mockTargetGroupFlagsMap)

      expect(response).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ kind: 'addRule' }),
          expect.objectContaining({ kind: 'removeRule' })
        ])
      )
    })
  })

  describe('getRemovedFlagIdentifiers', () => {
    test('it should return an array with the identifiers of removed flags', async () => {
      const removedFlags = ['f2', 'f4']
      const flags = omit(mockFlagSettingsFormDataValues.flags, ...removedFlags)

      expect(getRemovedFlagIdentifiers(flags, mockTargetGroupFlagsMap)).toEqual(removedFlags)
    })

    test('it should return an empty array when no flags have been removed', async () => {
      expect(getRemovedFlagIdentifiers(mockFlagSettingsFormDataValues.flags, mockTargetGroupFlagsMap)).toEqual([])
    })
  })

  describe('getUpdatedFlags', () => {
    test('it should return an array with the rows of changed flags', async () => {
      const editedRows = [
        cloneDeep(mockFlagSettingsFormDataValues.flags.f2),
        cloneDeep(mockFlagSettingsFormDataValues.flags.f4)
      ]

      editedRows[0].variation = 'v1'
      editedRows[1].variation = 'v1'

      const flags = cloneDeep(mockFlagSettingsFormDataValues.flags)
      flags.f2 = editedRows[0]
      flags.f4 = editedRows[1]

      expect(getUpdatedFlags(flags, mockTargetGroupFlagsMap)).toEqual(editedRows)
    })

    test('it should return an empty array when no flags have been changed', async () => {
      expect(getUpdatedFlags(mockFlagSettingsFormDataValues.flags, mockTargetGroupFlagsMap)).toEqual([])
    })
  })

  describe('getRemoveFlagsInstruction', () => {
    test('it should return the appropriate instruction to remove a single flag', async () => {
      const flagToRemove = mockTargetGroupFlagsMap.f1

      expect(getRemoveFlagsInstruction([flagToRemove.identifier], mockTargetGroupFlagsMap)).toEqual({
        kind: 'removeRule',
        parameters: {
          features: [{ ruleID: flagToRemove.ruleId }]
        }
      })
    })

    test('it should return the appropriate instruction to remove multiple flags', async () => {
      const flagsToRemove = [mockTargetGroupFlagsMap.f1, mockTargetGroupFlagsMap.f2]

      expect(
        getRemoveFlagsInstruction([flagsToRemove[0].identifier, flagsToRemove[1].identifier], mockTargetGroupFlagsMap)
      ).toEqual({
        kind: 'removeRule',
        parameters: {
          features: [{ ruleID: flagsToRemove[0].ruleId }, { ruleID: flagsToRemove[1].ruleId }]
        }
      })
    })
  })

  describe('getUpdateFlagsInstruction', () => {
    test('it should return the appropriate instruction to update a single flag', async () => {
      const flagToUpdate = cloneDeep(mockFlagSettingsFormDataValues.flags.f1)
      flagToUpdate.variation = 'v2'

      expect(getUpdateFlagsInstruction([flagToUpdate], mockTargetGroupFlagsMap)).toEqual({
        kind: 'addRule',
        parameters: {
          features: [
            {
              identifier: flagToUpdate.identifier,
              variation: flagToUpdate.variation,
              ruleID: mockTargetGroupFlagsMap[flagToUpdate.identifier].ruleId
            }
          ]
        }
      })
    })

    test('it should return the appropriate instruction to update multiple flags', async () => {
      const flagsToUpdate = [
        cloneDeep(mockFlagSettingsFormDataValues.flags.f1),
        cloneDeep(mockFlagSettingsFormDataValues.flags.f2)
      ]
      flagsToUpdate[0].variation = 'v2'
      flagsToUpdate[1].variation = 'v1'

      expect(getUpdateFlagsInstruction(flagsToUpdate, mockTargetGroupFlagsMap)).toEqual({
        kind: 'addRule',
        parameters: {
          features: [
            {
              identifier: flagsToUpdate[0].identifier,
              variation: flagsToUpdate[0].variation,
              ruleID: mockTargetGroupFlagsMap[flagsToUpdate[0].identifier].ruleId
            },
            {
              identifier: flagsToUpdate[1].identifier,
              variation: flagsToUpdate[1].variation,
              ruleID: mockTargetGroupFlagsMap[flagsToUpdate[1].identifier].ruleId
            }
          ]
        }
      })
    })
  })
})
