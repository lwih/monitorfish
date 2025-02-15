import { expect } from '@jest/globals'

import { Mission } from '../../../domain/entities/mission/types'
import { getMissionDataFromMissionFormValues } from '../MissionForm/utils'

import MissionSource = Mission.MissionSource
import MissionType = Mission.MissionType

describe('utils/getMissionDataFromMissionFormValues()', () => {
  it('should keep the existing missionSource if previously set', () => {
    const missionForm = {
      controlUnits: [
        {
          administration: 'DDTM',
          contact: undefined,
          id: 10001,
          isArchived: false,
          name: 'Cultures marines – DDTM 40',
          resources: [
            {
              id: 2,
              name: 'Semi-rigide 2'
            }
          ]
        }
      ],
      endDateTimeUtc: '2023-12-31T23:30:00.000000Z',
      isClosed: false,
      isGeometryComputedFromControls: true,
      isUnderJdp: true,
      isValid: true,
      missionSource: MissionSource.POSEIDON_CNSP,
      missionTypes: [MissionType.SEA],
      startDateTimeUtc: '2022-12-31T23:30:00.000000Z'
    }

    const result = getMissionDataFromMissionFormValues(missionForm)

    expect(result).toStrictEqual({
      controlUnits: [
        {
          administration: 'DDTM',
          contact: undefined,
          id: 10001,
          isArchived: false,
          name: 'Cultures marines – DDTM 40',
          resources: [{ id: 2, name: 'Semi-rigide 2' }]
        }
      ],
      endDateTimeUtc: '2023-12-31T23:30:00.000000Z',
      isClosed: false,
      isGeometryComputedFromControls: true,
      isUnderJdp: true,
      isValid: true,
      missionSource: 'POSEIDON_CNSP',
      missionTypes: ['SEA'],
      startDateTimeUtc: '2022-12-31T23:30:00.000000Z'
    })
  })
})
