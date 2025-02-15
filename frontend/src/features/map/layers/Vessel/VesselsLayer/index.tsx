import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import WebGLPointsLayer from 'ol/layer/WebGLPoints'
import VectorSource from 'ol/source/Vector'
import { memo, useEffect, useRef } from 'react'

import { COLORS } from '../../../../../constants/constants'
import { LayerProperties } from '../../../../../domain/entities/layers/constants'
import { getVesselLastPositionVisibilityDates, Vessel } from '../../../../../domain/entities/vessel/vessel'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { theme } from '../../../../../ui/theme'
import { booleanToInt, customHexToRGB } from '../../../../../utils'
import { applyFilterToVessels } from '../../../../Vessel/useCases/applyFilterToVessels'
import { getWebGLVesselStyle } from '../style'

import type { VesselLastPositionFeature } from '../../../../../domain/entities/vessel/types'
import type { WebGLPointsLayerWithName } from '../../../../../domain/types/layer'

function UnmemoizedVesselsLayer({ map }) {
  const dispatch = useMainAppDispatch()
  const { areVesselsDisplayed } = useMainAppSelector(state => state.displayedComponent)

  const { hideNonSelectedVessels, vessels } = useMainAppSelector(state => state.vessel)

  const { hideVesselsAtPort, selectedBaseLayer, vesselsLastPositionVisibility } = useMainAppSelector(state => state.map)

  const { previewFilteredVesselsMode } = useMainAppSelector(state => state.global)

  const { filterColor, filters, nonFilteredVesselsAreHidden, showedFilter } = useMainAppSelector(state => {
    const nextShowedFilter = state.filter?.filters?.find(filter => filter.showed)

    return {
      filterColor: nextShowedFilter?.color,
      filters: state.filter?.filters,
      nonFilteredVesselsAreHidden: state.filter?.nonFilteredVesselsAreHidden,
      showedFilter: nextShowedFilter
    }
  })

  const vesselsVectorSourceRef = useRef<VectorSource<Point>>()
  const vesselWebGLPointsLayerRef = useRef<WebGLPointsLayerWithName>()
  const style = useRef<any>()

  function getVesselsVectorSource() {
    if (!vesselsVectorSourceRef.current) {
      vesselsVectorSourceRef.current = new VectorSource()
    }

    return vesselsVectorSourceRef.current
  }

  useEffect(() => {
    if (map) {
      if (vesselWebGLPointsLayerRef.current) {
        map.removeLayer(vesselWebGLPointsLayerRef.current)
        vesselWebGLPointsLayerRef.current?.dispose()
      }

      // styles derived from state
      const isLight = Vessel.iconIsLight(selectedBaseLayer)
      const { vesselIsHidden, vesselIsOpacityReduced } =
        getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)
      const filterColorRGBArray = customHexToRGB(filterColor || isLight ? theme.color.lightGray : COLORS.charcoal)
      const initStyles = {
        filterColorBlue: filterColorRGBArray[2],
        filterColorGreen: filterColorRGBArray[1],
        filterColorRed: filterColorRGBArray[0],
        hideNonSelectedVessels: false,
        hideVesselsAtPort: false,
        isLight,
        nonFilteredVesselsAreHidden,
        previewFilteredVesselsMode,
        vesselIsHiddenTimeThreshold: vesselIsHidden.getTime(),
        vesselIsOpacityReducedTimeThreshold: vesselIsOpacityReduced.getTime()
      }
      style.current = getWebGLVesselStyle(initStyles)

      const vesselsVectorLayer = new WebGLPointsLayer({
        className: LayerProperties.VESSELS_POINTS.code,
        source: getVesselsVectorSource(),
        style: style.current,
        zIndex: LayerProperties.VESSELS_POINTS.zIndex
      }) as WebGLPointsLayerWithName
      vesselsVectorLayer.name = LayerProperties.VESSELS_POINTS.code

      map.getLayers().push(vesselsVectorLayer)
      vesselWebGLPointsLayerRef.current = vesselsVectorLayer
    }

    return () => {
      if (map && vesselWebGLPointsLayerRef.current) {
        map.removeLayer(vesselWebGLPointsLayerRef.current)
        vesselWebGLPointsLayerRef.current?.dispose()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  useEffect(() => {
    if (!areVesselsDisplayed) {
      vesselWebGLPointsLayerRef.current?.setVisible(false)

      return
    }

    vesselWebGLPointsLayerRef.current?.setVisible(true)
  }, [areVesselsDisplayed])

  useEffect(() => {
    if (map) {
      const features = vessels.map(vessel => {
        const propertiesUsedForStyling = {
          coordinates: vessel.coordinates,
          course: vessel.course,
          filterPreview: vessel.filterPreview,
          hasBeaconMalfunction: vessel.hasBeaconMalfunction,
          isAtPort: vessel.isAtPort,
          isFiltered: vessel.isFiltered,
          lastPositionSentAt: vessel.lastPositionSentAt,
          speed: vessel.speed
        }

        const feature = new Feature({
          vesselFeatureId: vessel.vesselFeatureId,
          ...propertiesUsedForStyling,
          geometry: new Point(vessel.coordinates)
        }) as VesselLastPositionFeature
        feature.setId(vessel.vesselFeatureId)
        feature.vesselProperties = vessel.vesselProperties

        return feature
      })

      getVesselsVectorSource()?.clear(true)
      getVesselsVectorSource()?.addFeatures(features)

      if (filterColor) {
        const rgb = customHexToRGB(filterColor)

        style.current.variables = {
          ...style.current.variables,
          filterColorBlue: rgb[2],
          filterColorGreen: rgb[1],
          filterColorRed: rgb[0]
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, vessels])

  // styles
  useEffect(() => {
    style.current.variables.hideVesselsAtPort = booleanToInt(hideVesselsAtPort)
  }, [hideVesselsAtPort])

  useEffect(() => {
    style.current.variables.hideNonSelectedVessels = booleanToInt(hideNonSelectedVessels)
  }, [hideNonSelectedVessels])

  useEffect(() => {
    style.current.variables.nonFilteredVesselsAreHidden = booleanToInt(nonFilteredVesselsAreHidden)
  }, [nonFilteredVesselsAreHidden])

  useEffect(() => {
    style.current.variables.previewFilteredVesselsMode = booleanToInt(previewFilteredVesselsMode)
  }, [previewFilteredVesselsMode])

  useEffect(() => {
    const isLight = Vessel.iconIsLight(selectedBaseLayer)
    style.current.variables.isLight = booleanToInt(isLight)
  }, [selectedBaseLayer])

  useEffect(() => {
    dispatch(applyFilterToVessels())
    if (filterColor) {
      const [red, green, blue] = customHexToRGB(filterColor)
      style.current.variables.filterColorRed = red
      style.current.variables.filterColorGreen = green
      style.current.variables.filterColorBlue = blue
    }
  }, [filterColor, filters, showedFilter, dispatch])

  useEffect(() => {
    const { vesselIsHidden, vesselIsOpacityReduced } =
      getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)
    style.current.variables.vesselIsHiddenTimeThreshold = vesselIsHidden.getTime()
    style.current.variables.vesselIsOpacityReducedTimeThreshold = vesselIsOpacityReduced.getTime()
  }, [vesselsLastPositionVisibility])
  // end styles

  return null
}

export const VesselsLayer = memo(UnmemoizedVesselsLayer)
VesselsLayer.displayName = 'VesselsLayer'
