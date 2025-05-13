import { ICodeLabel } from '../../interfaces';

export const taxRateArray: ICodeLabel[] = [
  { code: '02', label: 'Tarifa reducida 1%' },
  { code: '03', label: 'Tarifa reducida 2%' },
  { code: '04', label: 'Tarifa reducida 4%' },
  // { code: '05', label: 'Transitorio 0%' },
  // { code: '06', label: 'Transitorio 4%' },
  { code: '07', label: 'Tarifa transitoria 8%' },
  { code: '08', label: 'Tarifa general 13%' },
  { code: '09', label: 'Tarifa reducida 0.5%' },
  { code: '10', label: 'Tarifa Exenta' },
];

export const getTaxRateValue = (taxRateCode: string): number => {
  let result = 0;
  switch (taxRateCode) {
    case '02':
      result = 1;
      break;
    case '03':
      result = 2;
      break;
    case '04':
      result = 4;
      break;
    case '05':
      result = 0;
      break;
    case '06':
      result = 4;
      break;
    case '07':
      result = 8;
      break;
    case '08':
      result = 13;
      break;
    case '09':
      result = 0.5;
      break;
    case '10':
      result = 0;
      break;

    default:
      break;
  }

  return result;
};

export const getTaxRateLabel = (code: string): string => {
  let result = '';

  switch (code) {
    case '01':
      result = 'Tarifa 0% (Artículo 32, num 1, RLIVA)';
      break;

    case '02':
      result = 'Tarifa reducida 1%';
      break;

    case '03':
      result = 'Tarifa reducida 2%';
      break;

    case '04':
      result = 'Tarifa reducida 4%';
      break;

    case '05':
      result = 'Transitorio 0%';
      break;

    case '06':
      result = 'Transitorio 4%';
      break;

    case '07':
      result = 'Tarifa transitoria 8%';
      break;

    case '08':
      result = 'Tarifa general 13%';
      break;

    case '09':
      result = 'Tarifa reducida 0.5%';
      break;

    case '10':
      result = 'Tarifa Exenta';
      break;

    case '11':
      result = 'Tarifa 0% sin derecho a crédito';
      break;

    default:
      break;
  }

  return result;
};
