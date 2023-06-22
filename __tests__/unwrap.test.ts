import { unwrap } from '../src/helpers/unwrap';

let stringSample = [['foo']];
let neverSample = [[]];
let booleanSample = [[false]];
let zeroSample = [[0]];

describe('Should unwrap inner types correctly', () => {
  test('string[][]', () => {
    let output = unwrap(stringSample);
    expect(typeof output).toBe('string');
  });

  test('never[][]', () => {
    let output = unwrap(neverSample);
    expect(output).toBeUndefined();
  });

  test('boolean[][]', () => {
    let output = unwrap(booleanSample);
    expect(output).toBe(false);
  });

  test('number[][]', () => {
    let output = unwrap(zeroSample);
    expect(output).toBe(0);
  });
});
