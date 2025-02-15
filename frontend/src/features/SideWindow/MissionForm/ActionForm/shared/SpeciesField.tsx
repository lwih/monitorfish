import {
  CustomSearch,
  FormikCheckbox,
  FormikMultiRadio,
  FormikNumberInput,
  Select,
  SingleTag,
  useNewWindow
} from '@mtes-mct/monitor-ui'
import { useField, useFormikContext } from 'formik'
import { append, remove as ramdaRemove } from 'ramda'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { FormikMultiInfractionPicker } from './FormikMultiInfractionPicker'
import { useGetSpeciesQuery } from '../../../../../api/specy'
import { BOOLEAN_AS_OPTIONS } from '../../../../../constants'
import { MissionAction } from '../../../../../domain/types/missionAction'
import { FrontendError } from '../../../../../libs/FrontendError'
import { useGetMissionActionFormikUsecases } from '../../hooks/useGetMissionActionFormikUsecases'
import { FieldGroup } from '../../shared/FieldGroup'
import { FieldsetGroupSpinner } from '../../shared/FieldsetGroup'

import type { Specy } from '../../../../../domain/types/specy'
import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

export type SpeciesFieldProps = {
  controlledWeightLabel: string
}
export function SpeciesField({ controlledWeightLabel }: SpeciesFieldProps) {
  const { values } = useFormikContext<MissionActionFormValues>()
  const [input, , helper] = useField<MissionActionFormValues['speciesOnboard']>('speciesOnboard')
  const { newWindowContainerRef } = useNewWindow()
  const { updateSegments } = useGetMissionActionFormikUsecases()

  const getSpeciesApiQuery = useGetSpeciesQuery()

  const speciesAsOptions: Array<Option<Specy>> = useMemo(
    () =>
      getSpeciesApiQuery.data
        ? getSpeciesApiQuery.data.species.map(specy => ({
            label: `${specy.code} - ${specy.name}`,
            value: specy
          }))
        : [],
    [getSpeciesApiQuery.data]
  )

  const customSearch = useMemo(
    () =>
      getSpeciesApiQuery.data
        ? new CustomSearch(
            speciesAsOptions,
            [
              {
                name: 'value.code',
                weight: 0.9
              },
              {
                name: 'value.name',
                weight: 0.1
              }
            ],
            { cacheKey: 'SPECIES_AS_OPTIONS', isStrict: true }
          )
        : undefined,
    [getSpeciesApiQuery.data, speciesAsOptions]
  )

  const add = (newSpecy: Specy | undefined) => {
    if (!newSpecy) {
      // TODO Add a form validation to avoid `undefined`.

      return
    }

    const nextSpeciesOnboard = append(
      {
        controlledWeight: undefined,
        declaredWeight: undefined,
        nbFish: undefined,
        speciesCode: newSpecy.code,
        underSized: false
      },
      input.value || []
    )

    helper.setValue(nextSpeciesOnboard)
    updateSegments({
      ...values,
      speciesOnboard: nextSpeciesOnboard
    })
  }

  const getSpecyNameFromSpecyCode = useCallback(
    (specyCode: Specy['code']) => {
      if (!getSpeciesApiQuery.data) {
        return ''
      }

      const foundSpecy = getSpeciesApiQuery.data.species.find(({ code }) => code === specyCode)
      if (!foundSpecy) {
        return ''
      }

      return foundSpecy.name
    },
    [getSpeciesApiQuery.data]
  )

  const remove = (index: number) => {
    if (!input.value) {
      throw new FrontendError('`input.value` is undefined')
    }

    const nextSpeciesOnboard = ramdaRemove(index, 1, input.value)

    helper.setValue(nextSpeciesOnboard)
    updateSegments({
      ...values,
      speciesOnboard: nextSpeciesOnboard
    })
  }

  if (!speciesAsOptions.length || !customSearch) {
    return <FieldsetGroupSpinner isLight legend="Espèces à bord" />
  }

  return (
    <FormikMultiInfractionPicker
      addButtonLabel="Ajouter une infraction espèces"
      generalObservationTextareaProps={{
        label: 'Observations (hors infraction) sur les espèces',
        name: 'speciesObservations'
      }}
      label="Espèces à bord"
      name="speciesInfractions"
    >
      {/* TODO Add a BooleanRadio field in monitor-ui. */}
      <FormikMultiRadio
        isInline
        label="Poids des espèces vérifiés"
        name="speciesWeightControlled"
        options={BOOLEAN_AS_OPTIONS}
      />
      <FormikMultiRadio
        isInline
        label="Taille des espèces vérifiées"
        name="speciesSizeControlled"
        options={BOOLEAN_AS_OPTIONS}
      />
      <FormikMultiRadio
        isInline
        label="Arrimage séparé des espèces soumises à plan"
        name="separateStowageOfPreservedSpecies"
        options={[
          { label: 'Oui', value: MissionAction.ControlCheck.YES },
          { label: 'Non', value: MissionAction.ControlCheck.NO },
          { label: 'Non concerné', value: MissionAction.ControlCheck.NOT_APPLICABLE }
        ]}
      />

      {input.value && input.value.length > 0 && (
        <>
          {input.value.map((specyOnboard, index) => (
            <Row
              // eslint-disable-next-line react/no-array-index-key
              key={`speciesOnboard-${specyOnboard.speciesCode}-${index}`}
              style={{ marginTop: index === 0 ? '16px' : 0 }}
            >
              <RowInnerWrapper>
                <SingleTag onDelete={() => remove(index)}>{`${specyOnboard.speciesCode} - ${getSpecyNameFromSpecyCode(
                  specyOnboard.speciesCode
                )}`}</SingleTag>

                <StyledFieldGroup isInline>
                  <FormikNumberInput label="Qté déclarée" name={`speciesOnboard[${index}].declaredWeight`} />
                  <FormikNumberInput label={controlledWeightLabel} name={`speciesOnboard[${index}].controlledWeight`} />
                  <FormikCheckbox label="Sous-taille" name={`speciesOnboard[${index}].underSized`} />
                </StyledFieldGroup>
              </RowInnerWrapper>
            </Row>
          ))}
        </>
      )}

      <Select
        key={String(input.value?.length)}
        baseContainer={newWindowContainerRef.current}
        customSearch={customSearch}
        label="Ajouter une espèce"
        name="newSpecy"
        onChange={add}
        options={speciesAsOptions}
        searchable
        virtualized
      />
    </FormikMultiInfractionPicker>
  )
}

const Row = styled.div`
  margin-bottom: 16px;

  > legend {
    margin: 24px 0 8px;
  }

  > hr {
    margin-bottom: 16px;
  }

  input[type='number'] {
    width: 112px;
  }
`

const RowInnerWrapper = styled.div`
  > div {
    margin-top: 8px;
  }
`

const StyledFieldGroup = styled(FieldGroup)`
  justify-content: flex-start;
  margin-top: 8px !important;

  > .Field-NumberInput {
    margin-right: 16px;
  }
`
