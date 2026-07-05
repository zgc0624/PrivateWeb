export interface Unit {
  key: string
  name: string
  factor: number
}

export interface UnitCategory {
  key: string
  name: string
  baseUnit: string
  units: Unit[]
}

export const unitCategories: UnitCategory[] = [
  {
    key: 'length',
    name: '长度',
    baseUnit: 'm',
    units: [
      { key: 'mm', name: '毫米 (mm)', factor: 0.001 },
      { key: 'cm', name: '厘米 (cm)', factor: 0.01 },
      { key: 'm', name: '米 (m)', factor: 1 },
      { key: 'km', name: '千米 (km)', factor: 1000 },
      { key: 'inch', name: '英寸 (in)', factor: 0.0254 },
      { key: 'ft', name: '英尺 (ft)', factor: 0.3048 },
      { key: 'yd', name: '码 (yd)', factor: 0.9144 },
      { key: 'mile', name: '英里 (mi)', factor: 1609.344 }
    ]
  },
  {
    key: 'weight',
    name: '重量',
    baseUnit: 'kg',
    units: [
      { key: 'mg', name: '毫克 (mg)', factor: 0.000001 },
      { key: 'g', name: '克 (g)', factor: 0.001 },
      { key: 'kg', name: '千克 (kg)', factor: 1 },
      { key: 't', name: '吨 (t)', factor: 1000 },
      { key: 'oz', name: '盎司 (oz)', factor: 0.0283495 },
      { key: 'lb', name: '磅 (lb)', factor: 0.453592 },
      { key: 'jin', name: '斤', factor: 0.5 }
    ]
  },
  {
    key: 'temperature',
    name: '温度',
    baseUnit: 'c',
    units: [
      { key: 'c', name: '摄氏度 (°C)', factor: 1 },
      { key: 'f', name: '华氏度 (°F)', factor: 1 },
      { key: 'k', name: '开尔文 (K)', factor: 1 }
    ]
  },
  {
    key: 'area',
    name: '面积',
    baseUnit: 'm2',
    units: [
      { key: 'mm2', name: '平方毫米 (mm²)', factor: 0.000001 },
      { key: 'cm2', name: '平方厘米 (cm²)', factor: 0.0001 },
      { key: 'm2', name: '平方米 (m²)', factor: 1 },
      { key: 'km2', name: '平方千米 (km²)', factor: 1000000 },
      { key: 'ha', name: '公顷 (ha)', factor: 10000 },
      { key: 'mu', name: '亩', factor: 666.667 },
      { key: 'ft2', name: '平方英尺 (ft²)', factor: 0.092903 },
      { key: 'acre', name: '英亩 (acre)', factor: 4046.86 }
    ]
  },
  {
    key: 'volume',
    name: '体积',
    baseUnit: 'l',
    units: [
      { key: 'ml', name: '毫升 (ml)', factor: 0.001 },
      { key: 'l', name: '升 (L)', factor: 1 },
      { key: 'm3', name: '立方米 (m³)', factor: 1000 },
      { key: 'gal_us', name: '美制加仑 (gal)', factor: 3.78541 },
      { key: 'gal_uk', name: '英制加仑 (gal)', factor: 4.54609 },
      { key: 'cup', name: '杯 (cup)', factor: 0.24 }
    ]
  },
  {
    key: 'speed',
    name: '速度',
    baseUnit: 'ms',
    units: [
      { key: 'ms', name: '米/秒 (m/s)', factor: 1 },
      { key: 'kmh', name: '千米/时 (km/h)', factor: 0.277778 },
      { key: 'mph', name: '英里/时 (mph)', factor: 0.44704 },
      { key: 'kn', name: '节 (kn)', factor: 0.514444 },
      { key: 'fts', name: '英尺/秒 (ft/s)', factor: 0.3048 }
    ]
  }
]

export function convert(value: number, fromUnit: Unit, toUnit: Unit, category: UnitCategory): number {
  if (category.key === 'temperature') {
    let celsius: number
    if (fromUnit.key === 'c') celsius = value
    else if (fromUnit.key === 'f') celsius = (value - 32) * 5 / 9
    else celsius = value - 273.15

    if (toUnit.key === 'c') return celsius
    if (toUnit.key === 'f') return celsius * 9 / 5 + 32
    return celsius + 273.15
  }

  const baseValue = value * fromUnit.factor
  return baseValue / toUnit.factor
}

export function formatNumber(n: number): string {
  if (n === 0) return '0'
  if (Math.abs(n) >= 1e10 || (Math.abs(n) < 0.0001 && Math.abs(n) > 0)) {
    return n.toExponential(6)
  }
  const rounded = Math.round(n * 1e8) / 1e8
  return rounded.toString()
}
