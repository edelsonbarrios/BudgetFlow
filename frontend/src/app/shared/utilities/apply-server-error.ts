import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

/**
 * Puts the server's field errors onto the form controls that have the same name.
 * Each control becomes invalid with the error { server: 'the message' }, and the template
 * shows that message under the field. The error clears by itself when the user edits the field.
 *
 * Returns:
 *  - null when the error is not a field-error response (a 422, a 404, a lost connection...).
 *    The caller shows its usual message.
 *  - a list of the messages for fields the form does not have. It is empty when every
 *    error found its field.
 */
export function applyServerFieldErrors(form: FormGroup, error: unknown): string[] | null {
  if (!(error instanceof HttpErrorResponse)) {
    return null;
  }

  const fieldErrors: unknown = error.error?.fieldErrors;
  if (typeof fieldErrors !== 'object' || fieldErrors === null) {
    return null;
  }

  const leftover: string[] = [];

  for (const [field, message] of Object.entries(fieldErrors)) {
    if (typeof message !== 'string') {
      continue;
    }

    const control = form.get(field);
    if (control === null) {
      // The form has no field with this name, so the message must not get lost.
      leftover.push(message);
      continue;
    }

    control.setErrors({ server: message });
    control.markAsTouched();
  }

  return leftover;
}
