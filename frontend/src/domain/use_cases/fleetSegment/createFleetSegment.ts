import { customDayjs } from '@mtes-mct/monitor-ui'

import { createFleetSegmentFromAPI } from '../../../api/fleetSegment'
import { setFleetSegments } from '../../shared_slices/FleetSegment'
import { setError } from '../../shared_slices/Global'

import type { FleetSegment, UpdateFleetSegment } from '../../types/fleetSegment'

/**
 * Create a fleet segment
 */
export const createFleetSegment =
  (segmentFields: UpdateFleetSegment, previousFleetSegments: FleetSegment[]) =>
  async (dispatch, getState): Promise<undefined | FleetSegment[]> => {
    try {
      if (!segmentFields?.segment) {
        throw new Error("Le segment de flotte n'a pas de nom")
      }
      if (!segmentFields?.year) {
        throw new Error("Le segment de flotte n'a pas d'année")
      }

      const currentYear = customDayjs().year()
      const previousFleetSegmentsOfCurrentYear = Object.assign([], getState().fleetSegment.fleetSegments)

      const newSegment = await createFleetSegmentFromAPI(segmentFields)
      if (segmentFields.year === currentYear) {
        const nextFleetSegments = addFleetSegments(previousFleetSegmentsOfCurrentYear, newSegment)
        dispatch(setFleetSegments(nextFleetSegments))
      }

      return addFleetSegments(previousFleetSegments, newSegment)
    } catch (error) {
      dispatch(setError(error))

      return undefined
    }
  }

function addFleetSegments(previousFleetSegments: FleetSegment[], updatedFleetSegment: FleetSegment): FleetSegment[] {
  return previousFleetSegments.concat(updatedFleetSegment).sort((a, b) => a.segment.localeCompare(b.segment))
}
