export const unwrap = <T>(type: T[][]): T | undefined => {
  if (type[0][0] != null) {
    return type[0][0];
  }
};
