import { useFormikContext } from 'formik'
import { isEmpty } from 'lodash/fp'

import { useDeepCompareEffect } from '../../../../hooks/useDeepCompareEffect'

/**
 * Triggers Formik validation when main form values are updated.
 *
 * @description
 * We use this "hook" in `<ActionForm />` in order to retrigger main form-related validation rules.
 */
export function FormikIsValidEffect() {
  const { errors, setFieldValue } = useFormikContext()

  useDeepCompareEffect(
    () => {
      const isValid = isEmpty(errors)

      setFieldValue('isValid', isValid)
    },

    // We don't want to trigger infinite re-renders since `setFieldValue` changes after each rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [errors]
  )

  return <></>
}
