import { useEffect } from 'react'
import styled from 'styled-components'

import { FIVE_MINUTES } from '../../../api/APIWorker'
import { setError, setHealthcheckTextWarning } from '../../../domain/shared_slices/Global'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { ReactComponent as WarningSVG } from '../../icons/Picto_alerte.svg'
import { useGetHealthcheckQuery } from '../apis'
import { useIsOnline } from '../hooks/useIsOnline'
import { setHealthcheckWarning } from '../useCases/setHealthcheckWarning'

export function HealthcheckHeadband() {
  const dispatch = useMainAppDispatch()
  const { healthcheckTextWarning, previewFilteredVesselsMode } = useMainAppSelector(state => state.global)
  const isOnline = useIsOnline()
  const {
    data: healthcheck,
    error,
    isError
  } = useGetHealthcheckQuery(undefined, {
    pollingInterval: FIVE_MINUTES
  })

  useEffect(() => {
    if (isError || !healthcheck) {
      dispatch(setError(error))

      return
    }

    dispatch(setHealthcheckWarning(healthcheck))
  }, [dispatch, healthcheck, isError, error])

  useEffect(() => {
    if (isOnline) {
      dispatch(setHealthcheckTextWarning(undefined))

      return
    }

    dispatch(setHealthcheckTextWarning('Vous êtes hors-ligne.'))
  }, [dispatch, isOnline])

  return (
    <>
      {healthcheckTextWarning && !previewFilteredVesselsMode && (
        <HealthcheckWarnings>
          <Warning>
            <WarningIcon />
            {healthcheckTextWarning}
          </Warning>
        </HealthcheckWarnings>
      )}
    </>
  )
}

const WarningIcon = styled(WarningSVG)`
  width: 20px;
  vertical-align: sub;
  margin-right: 8px;
  height: 18px;
`

const Warning = styled.div`
  font: normal normal bold 16px/22px Marianne;
`

const HealthcheckWarnings = styled.div`
  background: ${p => p.theme.color.goldenPoppy} 0% 0% no-repeat padding-box;
  width: calc(100vw - 26px);
  height: 22px;
  text-align: center;
  padding: 13px;
  border-bottom: 2px solid #e3be05;
`
