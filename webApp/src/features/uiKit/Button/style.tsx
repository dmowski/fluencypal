export type GetTypeOfProperty<T, Field extends keyof T> = T[Field];

import { Components, ComponentsOverrides, ComponentsVariants } from '@mui/material';

declare module '@mui/material/Button' {
  interface ButtonPropsSizeOverrides {
    iconSquareSmall: true;
    iconSquareLarge: true;
  }
}

export const pxToRem = (px: number) => `${px / 16}rem`;

export const typographySmaller = {
  fontSize: pxToRem(14),
  fontWeight: 400,
  letterSpacing: '-0px',
  b: {
    fontWeight: 600,
  },
};

export const buttonBorderRadius = '10px';

const variants: ComponentsVariants['MuiButton'] = [
  {
    props: { size: 'iconSquareSmall' },
    style: {},
  },
  {
    props: { size: 'iconSquareLarge' },
    style: {},
  },
  {
    props: { variant: 'outlined' },
    style: {
      '&:focus': {},
    },
  },

  {
    props: { variant: 'contained' },
    style: {
      //backgroundColor: "#258adc",
      //color: "#fff",
      '&:hover': {
        //backgroundColor: "#115b97ff",
      },
    },
  },

  {
    props: { size: 'large' },
    style: {},
  },
  {
    props: { variant: 'text' },
    style: {
      '&:focus': {},
    },
  },
];

const style: ComponentsOverrides['MuiButton'] = {
  contained: {},
  outlined: {
    //borderColor: "#258adc",
    '&:hover': {},
    '&:active': {},
    '&:disabled': {},
  },
  text: {
    '&:disabled': {},
  },
  root: {
    borderRadius: buttonBorderRadius,
    ...typographySmaller,
    textTransform: 'none',
    //fontWeight: 450,
  },
};

export const customButton: GetTypeOfProperty<Components, 'MuiButton'> = {
  variants: variants,
  styleOverrides: style,
};
