import {
  colorTeal,
  colorOrange,
  colorYellow,
  colorGreen,
  colorPurple,
} from '@shopify/polaris-tokens';
import {HSLColor, HSLAColor, RGBColor} from '../color-types';
import {
  colorToHsla,
  hslToString,
  hslToRgb,
  rgbToHex,
} from '../color-transformers';
import {isLight} from '../color-validation';
import {constructColorName} from '../color-names';
import {lightenColor, darkenColor, opacifyColor} from '../color-manipulation';
import {compose} from '../compose';

import {Theme, CSSProperties, ComponentThemeProperties} from './types';

const NAMESPACE = 'polaris';

/*
Since color ranges need to be aware of surface base darkness or lightness, this should just be a class

Each color should create
  - base
  - on base
    - subdued (15, 85)
    - icon
    - disabled (30, 70)
  - 2 darkened stops from base

  - surface (dark (l:5) or light (l:95) depending on surface base)
  - on surface
    - subdued
    - icon
    - disabled

Surface should create
  - shade
    - one darkened stop
  - border
    - one darkened stop

  - base
    - card
    - page
  - on base
    - subdued
    - icon
    - disabled
  - base opacified

  - opposing (opposite of base)
  - on opposing
    - subdued
    - icon
    - disabled
  - opposing opacified

  - range of grays for interactive elements (5-10?)
*/

export function setColors(theme: Theme): CSSProperties {
  const {colors = {}} = theme;

  const {
    surface = '#0c0d0e',
    brand = '#008060',
    interaction = '#2A94FF',
    negative = '#C43256',
    timeliness = colorTeal,
    warning = colorOrange,
    attention = colorYellow,
    positive = colorGreen,
    accent = colorPurple,
  } = colors;

  return {
    ...createSurfaceRange(surface),
    ...createRoleRange(brand, 'brand'),
    ...createRoleRange(interaction, 'interaction'),
    ...createRoleRange(timeliness, 'timeliness'),
    ...createRoleRange(positive, 'positive'),
    ...createRoleRange(attention, 'attention'),
    ...createRoleRange(warning, 'warning'),
    ...createRoleRange(negative, 'negative'),
    ...createRoleRange(accent, 'accent'),
  };
}

const hslToHex: (color: HSLColor | HSLAColor) => string = compose(
  rgbToHex,
  hslToRgb,
);

function createRoleRange(
  baseColor: string,
  colorRole: string,
  options?: {
    opacify?: boolean;
    stops?: number;
    increment?: number;
  },
): CSSProperties {
  const {opacify = false, stops = 2, increment = 5} = options || {};

  const hslBaseColor = colorToHsla(baseColor) as HSLColor;
  const rgbBaseColor = hslToRgb(hslBaseColor);

  const base = {
    [constructColorName(NAMESPACE, colorRole)]: baseColor,
  };

  const darkRange = createDarkRange(
    stops,
    colorRole,
    hslBaseColor as HSLColor,
    increment,
  );

  const opaqueRange = opacify && createOpaqueRange(baseColor, colorRole);

  const on = {
    [constructColorName(NAMESPACE, colorRole, 'on')]: hslToHex({
      hue: hslBaseColor.hue,
      saturation: hslBaseColor.saturation,
      lightness: isLight(rgbBaseColor) ? 5 : 95,
    }),
  };

  return {
    ...base,
    ...darkRange,
    ...opaqueRange,
    ...on,
  };
}

function createSurfaceRange(baseColor: string): CSSProperties {
  const hslBaseColor: HSLColor = colorToHsla(baseColor) as HSLColor;
  const rgbBaseColor: RGBColor = hslToRgb(hslBaseColor);
  const isBaseLight: boolean = isLight(rgbBaseColor);

  let greyRange: CSSProperties;

  const colorRole = 'surface';
  const stops = 19;
  const increment = 5;
  const options = {suffix: ''};

  if (isBaseLight) {
    greyRange = createDarkRange(
      stops,
      colorRole,
      hslBaseColor,
      increment,
      options,
    );
  } else {
    greyRange = createLightRange(
      stops,
      colorRole,
      hslBaseColor,
      increment,
      options,
    );
  }

  const opposingColor = hslToHex({
    hue: hslBaseColor.hue,
    saturation: hslBaseColor.saturation,
    lightness: isBaseLight ? 1 : 99,
  });

  function getOnColor(baseIsLight: boolean) {
    return hslToHex({
      hue: hslBaseColor.hue,
      saturation: hslBaseColor.saturation,
      lightness: baseIsLight ? 5 : 95,
    });
  }

  const on = {
    [constructColorName(NAMESPACE, colorRole, 'onDark')]: getOnColor(false),
    [constructColorName(NAMESPACE, colorRole, 'onLight')]: getOnColor(true),
    [constructColorName(NAMESPACE, colorRole, 'onBase')]: getOnColor(
      isBaseLight,
    ),
    [constructColorName(NAMESPACE, colorRole, 'onOpposing')]: getOnColor(
      !isBaseLight,
    ),
  };

  return {
    ...{
      [constructColorName(NAMESPACE, colorRole, '0')]: baseColor,
    },
    ...greyRange,
    ...createOpaqueRange(baseColor, colorRole, {
      suffix: 'baseOpacified',
    }),
    ...createOpaqueRange(opposingColor, colorRole, {
      suffix: 'opposingOpacified',
    }),
    ...on,
  };
}

function createLightRange(
  stops: number,
  colorRole: string,
  hslBaseColor: HSLColor,
  increment: number,
  options?: {
    suffix?: string;
  },
): CSSProperties {
  const {suffix = 'lightened'} = options || {};
  return Array.from({length: stops}, (_, i) => i + 1).reduce(
    (colorStyles: CSSProperties, stop) => {
      const color = hslToHex(lightenColor(
        hslBaseColor,
        increment * stop,
      ) as HSLColor);
      colorStyles[
        constructColorName(NAMESPACE, colorRole, `${suffix}${stop}`)
      ] = color;
      return colorStyles;
    },
    {},
  );
}

function createDarkRange(
  stops: number,
  colorRole: string,
  hslBaseColor: HSLColor,
  increment: number,
  options?: {
    suffix?: string;
  },
): CSSProperties {
  const {suffix = 'darkened'} = options || {};
  return Array.from({length: stops}, (_, i) => i + 1).reduce(
    (colorStyles: CSSProperties, stop) => {
      const color = hslToHex(darkenColor(
        hslBaseColor,
        increment * stop,
      ) as HSLColor);
      colorStyles[
        constructColorName(NAMESPACE, colorRole, `${suffix}${stop}`)
      ] = color;
      return colorStyles;
    },
    {},
  );
}

function createOpaqueRange(
  baseColor: string,
  colorRole: string,
  options?: {
    suffix?: string;
  },
): CSSProperties {
  const {hue, saturation, lightness} = colorToHsla(baseColor) as HSLColor;
  const {suffix = 'opacified'} = options || {};
  return [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].reduce(
    (colorStyles: CSSProperties, stop) => {
      colorStyles[
        constructColorName(
          NAMESPACE,
          colorRole,
          `${suffix}${stop.toString().split('0.')[1]}`,
        )
      ] = hslToString(
        opacifyColor({hue, saturation, lightness, alpha: 1}, stop),
      );

      return colorStyles;
    },
    {},
  );
}

export function reduceTheme(theme: ComponentThemeProperties): CSSProperties {
  return Object.entries(theme)
    .reduce((childAccumulator, childCurrent) => {
      const maybeChildCurrent = childCurrent[1] != null ? childCurrent[1] : [];
      return [
        ...childAccumulator,
        ...Object.entries(maybeChildCurrent).reduce(
          (propertyAccumulator, propertyCurrent) => {
            if (typeof propertyCurrent[1] === 'string') {
              return [
                ...propertyAccumulator,
                ...[
                  {
                    [`--${childCurrent[0]}-${propertyCurrent[0]}`]: `var(${
                      propertyCurrent[1]
                    })`,
                  },
                ],
              ];
            } else {
              const maybePropertyCurrent =
                propertyCurrent[1] != null ? propertyCurrent[1] : [];
              return [
                ...propertyAccumulator,
                ...[
                  ...maybePropertyCurrent.map((property, index) => {
                    return {
                      [`--${childCurrent[0]}-${propertyCurrent[0]}-${index +
                        1}`]: `var(${property})`,
                    };
                  }),
                ],
              ];
            }
          },
          [],
        ),
      ];
    }, [])
    .reduce((accumulator, current) => {
      return {...accumulator, ...current};
    }, {});
}
