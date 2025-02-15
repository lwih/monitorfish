import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { contractRightMenu, expandRightMenu } from '../../../domain/shared_slices/Global'
import { useClickOutsideWhenOpened } from '../../../hooks/useClickOutsideWhenOpened'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'

export function RightMenuOnHoverArea() {
  const dispatch = useMainAppDispatch()
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const mapToolOpened = useMainAppSelector(state => state.global.mapToolOpened)

  const areaRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideWhenOpened(areaRef, !!selectedVessel)

  useEffect(() => {
    if (clickedOutsideComponent && selectedVessel && !mapToolOpened) {
      dispatch(contractRightMenu())
    } else {
      dispatch(expandRightMenu())
    }
  }, [dispatch, clickedOutsideComponent, mapToolOpened, selectedVessel])

  return selectedVessel && <Area ref={areaRef} onMouseEnter={() => dispatch(expandRightMenu())} />
}

const Area = styled.div`
  height: 500px;
  right: 0;
  width: 60px;
  opacity: 0;
  position: absolute;
  top: 0;
`
