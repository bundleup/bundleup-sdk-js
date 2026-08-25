/**
 * Checks if a value is a plain object (not null, not an array).
 * @param value - The value to check.
 * @returns True if the value is a plain object, false otherwise.
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Checks if a value is empty.
 * - For null or undefined, returns true.
 * - For strings and arrays, returns true if length is 0.
 * - For objects, returns true if it has no own properties.
 * - For other types, returns false.
 * @param value - The value to check for emptiness.
 * @returns True if the value is empty, false otherwise.
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0;
  }

  if (isObject(value)) {
    return Object.keys(value).length === 0;
  }

  return false;
}
