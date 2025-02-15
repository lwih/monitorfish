import { getVesselFromAPI } from '../../../api/vessel'
import { logbookActions } from '../../../features/Logbook/slice'
import { addVesselIdentifierToVesselIdentity } from '../../../features/VesselSearch/utils'
import { Vessel } from '../../entities/vessel/vessel'
import { getCustomOrDefaultTrackRequest, throwCustomErrorFromAPIFeedback } from '../../entities/vesselTrackDepth'
import { setDisplayedErrors } from '../../shared_slices/DisplayedError'
import { addSearchedVessel, removeError, setError } from '../../shared_slices/Global'
import { doNotAnimate } from '../../shared_slices/Map'
import { loadingVessel, resetLoadingVessel, setSelectedVessel } from '../../shared_slices/Vessel'
import { displayOrLogError } from '../error/displayOrLogError'

import type { VesselIdentity } from '../../entities/vessel/types'

/**
 * Show a specified vessel track on map and on the vessel right sidebar
 */
export const showVessel =
  (vesselIdentity: VesselIdentity, isFromSearch: boolean, isFromUserAction: boolean) => async (dispatch, getState) => {
    try {
      const { fishingActivities, map, vessel } = getState()
      const { selectedVesselTrackRequest, vessels } = vessel
      const { defaultVesselTrackDepth } = map
      const { areFishingActivitiesShowedOnMap } = fishingActivities

      const vesselFeatureId = Vessel.getVesselFeatureId(vesselIdentity)
      const selectedVesselLastPosition = vessels.find(lastPosition => lastPosition.vesselFeatureId === vesselFeatureId)
        ?.vesselProperties

      dispatchLoadingVessel(dispatch, isFromUserAction, vesselIdentity)
      const nextTrackRequest = getCustomOrDefaultTrackRequest(
        selectedVesselTrackRequest,
        defaultVesselTrackDepth,
        false
      )
      if (areFishingActivitiesShowedOnMap && isFromUserAction) {
        dispatch(logbookActions.removeAllFromMap())
      }

      if (isFromSearch) {
        dispatch(addSearchedVessel(vesselIdentity))
      }

      const { isTrackDepthModified, vesselAndPositions } = await getVesselFromAPI(vesselIdentity, nextTrackRequest)
      try {
        throwCustomErrorFromAPIFeedback(vesselAndPositions.positions, isTrackDepthModified, isFromUserAction)
      } catch (error) {
        dispatch(setError(error))
      }

      const selectedVessel = {
        ...selectedVesselLastPosition,
        ...vesselAndPositions?.vessel,
        globalRiskFactor: selectedVesselLastPosition?.riskFactor,
        riskFactor: vesselAndPositions?.vessel?.riskFactor,
        vesselIdentifier: addVesselIdentifierToVesselIdentity(vesselIdentity).vesselIdentifier
      }

      dispatch(setDisplayedErrors({ vesselSidebarError: null }))
      dispatch(
        setSelectedVessel({
          positions: vesselAndPositions.positions,
          vessel: selectedVessel
        })
      )
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          {
            func: showVessel,
            parameters: [vesselIdentity, isFromSearch, isFromUserAction]
          },
          isFromUserAction,
          'vesselSidebarError'
        )
      )
      dispatch(resetLoadingVessel())
    }
  }

function dispatchLoadingVessel(dispatch, isFromUserAction: boolean, vesselIdentity) {
  dispatch(doNotAnimate(!isFromUserAction))
  dispatch(removeError())
  dispatch(
    loadingVessel({
      calledFromCron: !isFromUserAction,
      vesselIdentity
    })
  )
}
