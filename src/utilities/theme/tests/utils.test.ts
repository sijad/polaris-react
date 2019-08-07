import {setColors} from '../utils';

describe('setColors', () => {
  it('returns an object of css custom properties', () => {
    const theme = {colors: {brand: '#eeeeee'}};
    const colorScheme = setColors(theme);
    expect(colorScheme).toStrictEqual({});
  });
});
