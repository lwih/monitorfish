import {
  FormikCheckbox,
  FormikEffect,
  FormikMultiCheckbox,
  FormikMultiRadio,
  FormikTextarea,
  FormikTextInput
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash/fp'
import { memo } from 'react'
import styled from 'styled-components'

import { MISSION_TYPES_AS_OPTIONS } from './constants'
import { FormikDoubleDatePicker } from './FormikDoubleDatePicker'
import { FormikLocationPicker } from './FormikLocationPicker'
import { FormikMultiControlUnitPicker } from './FormikMultiControlUnitPicker'
import { MainFormLiveSchema } from './schemas'
import { BOOLEAN_AS_OPTIONS } from '../../../../constants'
import { FormBody, FormBodyInnerWrapper } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'
import { FormikIsValidEffect } from '../shared/FormikIsValidEffect'

import type { MissionMainFormValues } from '../types'
import type { Promisable } from 'type-fest'

type MainFormProps = {
  initialValues: MissionMainFormValues
  onChange: (nextValues: MissionMainFormValues) => Promisable<void>
}
function UnmemoizedMainForm({ initialValues, onChange }: MainFormProps) {
  return (
    <Formik initialValues={initialValues} onSubmit={noop} validationSchema={MainFormLiveSchema}>
      <Wrapper>
        <FormikEffect onChange={onChange as any} />
        <FormikIsValidEffect />

        <FormHead>
          <h2>Informations générales</h2>
        </FormHead>

        <FormBody>
          <CustomFormBodyInnerWrapper>
            <FormikDoubleDatePicker />

            <MultiCheckColumns>
              <FormikMultiCheckbox
                isErrorMessageHidden
                isInline
                label="Types de mission"
                name="missionTypes"
                options={MISSION_TYPES_AS_OPTIONS}
              />

              <IsUnderJdpFormikCheckbox isUndefinedWhenDisabled label="Mission sous JDP" name="isUnderJdp" />
            </MultiCheckColumns>

            <FormikMultiRadio isInline label="Ordre de mission" name="hasMissionOrder" options={BOOLEAN_AS_OPTIONS} />
          </CustomFormBodyInnerWrapper>

          <FormikMultiControlUnitPicker name="controlUnits" />

          <CustomFormBodyInnerWrapper>
            <FormikLocationPicker />

            <RelatedFieldGroupWrapper>
              <FormikTextarea label="CACEM : orientations, observations" name="observationsCacem" rows={2} />
              <FormikTextarea label="CNSP : orientations, observations" name="observationsCnsp" rows={2} />
            </RelatedFieldGroupWrapper>

            <InlineFieldGroupWrapper>
              <FormikTextInput label="Ouvert par" name="openBy" />
              <FormikTextInput label="Clôturé par" name="closedBy" />
            </InlineFieldGroupWrapper>
          </CustomFormBodyInnerWrapper>
        </FormBody>
      </Wrapper>
    </Formik>
  )
}

/**
 * @description
 * This component is fully memoized because we want its parent (`<MissionForm />`) to fully control
 * when to re-create this component, the component would be re-render when :
 * - The `key` prop is modified (the edited mission `id` changes).
 * - the `onChange` callback is modified (the mission `isClosed` property has been changed).
 */
export const MainForm = memo(UnmemoizedMainForm, (prevProps, nextProps) => prevProps.onChange === nextProps.onChange)

const IsUnderJdpFormikCheckbox = styled(FormikCheckbox)`
  margin-left: 48px;
  margin-top: 20px;
`

const MultiCheckColumns = styled.div`
  display: flex;
`

// TODO Why is there a `font-weight: 700` for legends in mini.css?
const Wrapper = styled.div`
  background-color: ${p => p.theme.color.white};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-width: 465px;
  width: 36.34%;
  overflow-y: auto;

  /* TODO Handle that in @mtes-mct/monitor-ui. */
  legend {
    font-weight: 400;
  }
`

const CustomFormBodyInnerWrapper = styled(FormBodyInnerWrapper)`
  > div:not(:first-child),
  > fieldset:not(:first-child) {
    margin-top: 32px;
  }
`

const RelatedFieldGroupWrapper = styled.div`
  > div:not(:first-child) {
    margin-top: 8px;
  }
`

const InlineFieldGroupWrapper = styled.div`
  display: flex;

  > div:first-child {
    margin-right: 8px;
    width: 50%;
  }

  > div:last-child {
    margin-left: 8px;
    width: 50%;
  }
`
