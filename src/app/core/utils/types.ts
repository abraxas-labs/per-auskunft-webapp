export type MaskedValue<T> = Masked | Value<T>;

type Masked = {
  type: 'Masked';
};

type Value<T> = {
  type: 'Value';
  value?: T;
};

export function valueOr<T>(maskedVal: MaskedValue<T>, fallBack: T) {
  return maskedVal.type === 'Masked' ? fallBack : maskedVal.value ?? fallBack;
}

export function masked<T>(): MaskedValue<T> {
  return {type: 'Masked'};
}

export function value<T>(value: T): MaskedValue<T> {
  return {type: 'Value', value};
}

export function mapMasked<T, R>(value: MaskedValue<T>, mapper: (a: T) => R): MaskedValue<R> {
  return value.type === 'Masked'
    ? value
    : {type: 'Value', value: value.value !== undefined ? mapper(value.value) : undefined};
}

export function concatMaskedValues<T>(delimiter: string, ...values: MaskedValue<T>[]): MaskedValue<string> {
  return values.reduce((acc, curr) => concatTwoMaskedValues(acc, curr, delimiter), {type: 'Value'} as MaskedValue<string>);
}

export function concatTwoMaskedValues<T1, T2>(a: MaskedValue<T1>, b: MaskedValue<T2>, delimiter: string): MaskedValue<string> {
  if (a.type === 'Masked' || b.type === 'Masked') {
    return {type: 'Masked'};
  }
  if (!a.value && !b.value) {
    return {type: 'Value'};
  }
  return {type: 'Value', value: `${a.value ?? ''}${delimiter}${b.value ?? ''}`};
}
