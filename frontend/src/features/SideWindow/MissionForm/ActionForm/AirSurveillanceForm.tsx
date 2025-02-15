import {
  FormikCheckbox,
  FormikEffect,
  FormikMultiSelect,
  FormikNumberInput,
  FormikTextarea,
  Icon,
  useKey,
  useNewWindow
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash/fp'
import { useMemo } from 'react'
import styled from 'styled-components'

import { AirSurveillanceFormClosureSchema, AirSurveillanceFormLiveSchema } from './schemas'
import { FLIGHT_GOALS_AS_OPTIONS } from './shared/constants'
import { FleetSegmentsField } from './shared/FleetSegmentsField'
import { FormikAuthor } from './shared/FormikAuthor'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FieldsetGroup } from '../shared/FieldsetGroup'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'
import { FormikIsValidEffect } from '../shared/FormikIsValidEffect'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

export type AirSurveillanceFormProps = {
  initialValues: MissionActionFormValues
  onChange: (nextValues: MissionActionFormValues) => Promisable<void>
}
export function AirSurveillanceForm({ initialValues, onChange }: AirSurveillanceFormProps) {
  const { newWindowContainerRef } = useNewWindow()

  const mission = useMainAppSelector(store => store.mission)

  // We have to re-create the Formik component when `validationSchema` changes to apply it
  const key = useKey([mission.isClosing])
  const validationSchema = useMemo(
    () => (mission.isClosing ? AirSurveillanceFormClosureSchema : AirSurveillanceFormLiveSchema),
    [mission.isClosing]
  )

  return (
    <Formik key={key} initialValues={initialValues} onSubmit={noop} validationSchema={validationSchema}>
      <>
        <FormikEffect onChange={onChange as any} />
        <FormikIsValidEffect />

        <FormHead>
          <h2>
            <Icon.Observation />
            Surveillance aérienne
          </h2>
        </FormHead>

        <FormBody>
          <FormikMultiSelect
            baseContainer={newWindowContainerRef.current}
            isLight
            label="Objectifs du vol"
            name="flightGoals"
            options={FLIGHT_GOALS_AS_OPTIONS}
          />

          <FleetSegmentsField label="Segments ciblés" />

          <FormikNumberInput isLight label="Nb de navires survolés" name="numberOfVesselsFlownOver" />

          <FormikTextarea isLight label="Observations générales sur le vol" name="otherComments" rows={2} />

          <hr />

          <FieldsetGroup isLight legend="Qualité du contrôle">
            <FormikTextarea
              label="Observations sur le déroulé de la surveillance"
              name="controlQualityComments"
              placeholder="Éléments marquants dans vos échanges avec l’unité, problèmes rencontrés..."
              rows={2}
            />
            <StyledFormikCheckBox label="Fiche RETEX nécessaire" name="feedbackSheetRequired" />
          </FieldsetGroup>

          <FormikAuthor />
        </FormBody>
      </>
    </Formik>
  )
}

const StyledFormikCheckBox = styled(FormikCheckbox)`
  margin-top: 8px;
`
