import { usePrevious } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'
import { FingerprintSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

import { Archived } from './Archived'
import { Current } from './Current'
import { COLORS } from '../../../constants/constants'
import { vesselsAreEquals } from '../../../domain/entities/vessel/vessel'
import { getVesselReportings } from '../../../domain/use_cases/vessel/getVesselReportings'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'

const ReportingTab = {
  CURRENT_REPORTING: 'CURRENT_REPORTING',
  REPORTING_HISTORY: 'REPORTING_HISTORY'
}

export function Reportings() {
  const dispatch = useMainAppDispatch()
  const { selectedVesselIdentity } = useMainAppSelector(state => state.vessel)

  const { currentAndArchivedReportingsOfSelectedVessel, isLoadingReporting } = useMainAppSelector(
    state => state.reporting
  )

  const [reportingTab, setReportingTab] = useState(ReportingTab.CURRENT_REPORTING)
  const previousSelectedVesselIdentity = usePrevious(selectedVesselIdentity)

  useEffect(() => {
    dispatch(getVesselReportings(true))
  }, [dispatch, selectedVesselIdentity])

  useEffect(() => {
    if (!vesselsAreEquals(previousSelectedVesselIdentity, selectedVesselIdentity)) {
      setReportingTab(ReportingTab.CURRENT_REPORTING)
    }
  }, [previousSelectedVesselIdentity, selectedVesselIdentity])

  return (
    <>
      {!isLoadingReporting ? (
        <Body data-cy="vessel-reporting">
          <Menu>
            <CurrentOrHistoryButton
              isActive={reportingTab === ReportingTab.CURRENT_REPORTING}
              onClick={() => setReportingTab(ReportingTab.CURRENT_REPORTING)}
            >
              Signalements en cours ({currentAndArchivedReportingsOfSelectedVessel?.current?.length})
            </CurrentOrHistoryButton>
            <CurrentOrHistoryButton
              data-cy="vessel-sidebar-reporting-tab-history-button"
              isActive={reportingTab === ReportingTab.REPORTING_HISTORY}
              onClick={() => setReportingTab(ReportingTab.REPORTING_HISTORY)}
            >
              Historique des signalements
            </CurrentOrHistoryButton>
          </Menu>
          {reportingTab === ReportingTab.CURRENT_REPORTING && <Current />}
          {reportingTab === ReportingTab.REPORTING_HISTORY && <Archived />}
        </Body>
      ) : (
        <FingerprintSpinner className="radar" color={COLORS.charcoal} size={100} />
      )}
    </>
  )
}

const CurrentOrHistoryButton = styled.div<{
  isActive: boolean
}>`
  padding: 7px 0 7px 0;
  flex-grow: 1;
  color: ${props => (props.isActive ? COLORS.gainsboro : COLORS.gunMetal)};
  background: ${props => (props.isActive ? COLORS.charcoal : 'unset')};
  cursor: pointer;
`

const Menu = styled.div`
  margin: 5px;
  border: 1px solid ${COLORS.charcoal};
  display: flex;
  width: 480px;
`

const Body = styled.div`
  padding: 5px;
  overflow-x: hidden;
  max-height: 700px;
`
