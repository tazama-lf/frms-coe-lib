/**
 * Calculation the difference of execution time in nano seconds
 *
 * @param {startTime: bigint} startTime Start time that was the initial cater time
 * @returns {number} differce of argument bigint passed to now
 */
export const CalculateDuration = (startTime: bigint): number => {
  const endTime = process.hrtime.bigint();
  return Number(endTime - startTime);
};

export default CalculateDuration;
