import React, { useEffect, useMemo, useState } from 'react';
import { LinePath } from '@visx/shape';
import { curveLinear } from '@visx/curve';
import { scaleLinear, scaleTime } from '@visx/scale';
import { extent, max, min } from 'd3-array';

interface AverageData {
  date: Date;
  value: number;
}

type Props = {
  lineData: AverageData[];
  timeRange: { x: number; y: number };
  linearRange: { x: number; y: number };
};

const getDate = (d: AverageData) => d.date;
const getValue = (d: AverageData) => d.value;

const MA_LENGTH = 14;

const MovingAverage: React.FC<Props> = ({ lineData, timeRange, linearRange }) => {
  const [maData, setMaData] = useState<AverageData[]>([]);

  useEffect(() => {
    const reversedLineData = [...lineData];
    reversedLineData.reverse();
    const mad = reversedLineData.map((d, i, arr) => {
      const maValues = arr.slice(i, i + MA_LENGTH).map((x) => x.value);
      return { date: d.date, value: maValues.reduce((acc, val) => acc + val) / maValues.length };
    });
    setMaData(mad);
  }, [lineData]);
  // scales
  const dateScale = useMemo(
    () =>
      scaleTime({
        range: [timeRange.x, timeRange.y],
        domain: extent(maData, getDate) as [Date, Date],
      }),
    [maData, timeRange]
  );
  const stockValueScale = useMemo(
    () =>
      scaleLinear({
        range: [linearRange.x, linearRange.y],
        domain: [(min(maData, getValue) || 0) - 0.3, (max(maData, getValue) || 0) + 0.3],
        nice: true,
      }),
    [maData, linearRange]
  );

  return (
    <>
      <LinePath<AverageData>
        curve={curveLinear}
        data={maData}
        stroke="red"
        strokeWidth={2}
        strokeOpacity={0.6}
        x={(d) => dateScale(getDate(d)) ?? 0}
        y={(d) => stockValueScale(getValue(d)) ?? 0}
      />
    </>
  );
};
export default MovingAverage;
