import {
  Accent,
  Button,
  FormikMultiRadio,
  FormikSelect,
  FormikTextarea,
  type Option,
  useNewWindow
} from '@mtes-mct/monitor-ui'
import { Form, Formik } from 'formik'
import styled from 'styled-components'

import { InfractionFormLiveSchema } from '../../schemas'
import { INFRACTION_TYPES_AS_OPTIONS } from '../constants'

import type { MissionAction } from '../../../../../../domain/types/missionAction'

export type InfractionFormProps<AnyInfraction extends MissionAction.OtherInfraction> = {
  initialValues: AnyInfraction
  natinfsAsOptions: Option<number>[]
  onCancel: () => void
  onSubmit: (nextInfractionFormValues: AnyInfraction) => void
}
export function InfractionForm<AnyInfraction extends MissionAction.OtherInfraction>({
  initialValues,
  natinfsAsOptions,
  onCancel,
  onSubmit
}: InfractionFormProps<AnyInfraction>) {
  const { newWindowContainerRef } = useNewWindow()

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={InfractionFormLiveSchema}>
      {({ isValid }) => (
        <StyledForm>
          <FormikMultiRadio
            isErrorMessageHidden
            isInline
            label="Type d’infraction"
            name="infractionType"
            options={INFRACTION_TYPES_AS_OPTIONS}
          />
          <HackedFormikSelect
            baseContainer={newWindowContainerRef.current}
            isErrorMessageHidden
            label="NATINF"
            name="natinf"
            options={natinfsAsOptions}
            searchable
          />
          <FormikTextarea isErrorMessageHidden label="Observations sur l’infraction" name="comments" rows={2} />

          <FormButtonGroup>
            <Button accent={Accent.TERTIARY} onClick={onCancel}>
              Annuler
            </Button>
            <Button accent={Accent.PRIMARY} disabled={!isValid} type="submit">
              Valider l’infraction
            </Button>
          </FormButtonGroup>
        </StyledForm>
      )}
    </Formik>
  )
}

const StyledForm = styled(Form)`
  background-color: transparent;
  border: 0;
  padding: 0;

  > .Element-Field,
  > .Element-Fieldset {
    margin-top: 16px;
  }
`

const FormButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;

  > button:last-child {
    margin-left: 16px;
  }
`

const HackedFormikSelect = styled(FormikSelect)`
  .rs-picker-toggle {
    /* TODO Investigate both these props which are a hack to fix long NATINFs breaking the layout. */
    max-width: 312px !important;
  }
`
