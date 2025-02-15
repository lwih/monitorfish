import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'

import { GearsOrGearCategories } from './GearsOrGearCategories'
import { COLORS } from '../../../../../../constants/constants'
import { getGroupCategories, REGULATED_GEARS_KEYS } from '../../../../../../domain/entities/backoffice'
import { useMainAppSelector } from '../../../../../../hooks/useMainAppSelector'
import { theme } from '../../../../../../ui/theme'
import { INFO_TEXT } from '../../../../../Backoffice/constants'
import { InfoPoint } from '../../../../../Backoffice/edit_regulation/InfoPoint'
import { GreenCircle, RedCircle } from '../../../../../commonStyles/Circle.style'
import { Label, List, SectionTitle } from '../RegulatoryMetadata.style'

import type { RegulatedGears as RegulatedGearsType } from '../../../../../../domain/types/regulation'

export type RegulatedGearsProps = {
  authorized: boolean
  hasPreviousRegulatedGearsBloc?: boolean
  regulatedGearsObject: RegulatedGearsType
}
export function RegulatedGears({
  authorized,
  hasPreviousRegulatedGearsBloc = false,
  regulatedGearsObject
}: RegulatedGearsProps) {
  const { categoriesToGears, groupsToCategories } = useMainAppSelector(state => state.gear)

  const { allGears, allPassiveGears, allTowedGears, derogation, otherInfo, regulatedGearCategories, regulatedGears } =
    regulatedGearsObject

  const [filteredRegulatedGearCategories, setFilteredRegulatedGearCategories] = useState(regulatedGearCategories)
  const towedGearsCategories = getGroupCategories(REGULATED_GEARS_KEYS.ALL_TOWED_GEARS, groupsToCategories)
  const passiveGearsCategories = getGroupCategories(REGULATED_GEARS_KEYS.ALL_PASSIVE_GEARS, groupsToCategories)

  useEffect(() => {
    const nextFilteredRegulatedGearCategories = { ...regulatedGearCategories }
    if (allTowedGears) {
      towedGearsCategories.forEach(category => {
        delete nextFilteredRegulatedGearCategories[category]
      })
    }

    if (allPassiveGears) {
      passiveGearsCategories.forEach(category => {
        delete nextFilteredRegulatedGearCategories[category]
      })
    }

    setFilteredRegulatedGearCategories(nextFilteredRegulatedGearCategories)
  }, [
    allPassiveGears,
    allTowedGears,
    groupsToCategories,
    passiveGearsCategories,
    regulatedGearCategories,
    towedGearsCategories
  ])

  const dataCyTarget = authorized ? 'authorized' : 'unauthorized'

  return (
    <div data-cy={`${dataCyTarget}-regulatory-layers-metadata-gears`}>
      <SectionTitle $hasPreviousRegulatedGearsBloc={hasPreviousRegulatedGearsBloc}>
        {authorized ? <GreenCircle margin="0 5px 0 0" /> : <RedCircle margin="0 5px 0 0" />}
        Engins {authorized ? 'réglementés' : 'interdits'}
      </SectionTitle>
      {allGears ? (
        <Label>Tous les engins</Label>
      ) : (
        <List>
          {allTowedGears && (
            <Label
              data-cy={`${dataCyTarget}-regulatory-layers-metadata-gears-towed-gears`}
              title={INFO_TEXT.TOWED_GEAR}
            >
              Tous les engins trainants
              <InfoPoint margin="3px" title={INFO_TEXT.TOWED_GEAR} />
            </Label>
          )}
          {allPassiveGears && (
            <Label
              data-cy={`${dataCyTarget}-regulatory-layers-metadata-gears-passive-gears`}
              title={INFO_TEXT.PASSIVE_GEAR}
            >
              Tous les engins dormants
              <InfoPoint margin="3px" title={INFO_TEXT.PASSIVE_GEAR} />
            </Label>
          )}
          <GearsOrGearCategories list={regulatedGears} />
          <GearsOrGearCategories
            categoriesToGears={categoriesToGears}
            isCategory
            list={filteredRegulatedGearCategories}
          />
        </List>
      )}
      {!authorized && derogation && (
        <Derogation>
          <InfoPoint backgroundColor={theme.color.goldenPoppy} color={COLORS.charcoal} margin="3px 0 0 0" />
          <DerogationMessage>Mesures dérogatoire: consulter les références réglementaires</DerogationMessage>
        </Derogation>
      )}
      {otherInfo && <ReactMarkdown>{otherInfo}</ReactMarkdown>}
    </div>
  )
}

const Derogation = styled.span`
  display: flex;
  border: 1px solid ${theme.color.goldenPoppy};
  padding: 4px 15px 6px 8px;
`

const DerogationMessage = styled.span`
  color: ${COLORS.slateGray};
  margin-left: 4px;
`
