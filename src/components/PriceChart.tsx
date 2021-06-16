import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AreaClosed, Bar, Line } from '@visx/shape';
import { curveLinear } from '@visx/curve';
import { GridRows, GridColumns } from '@visx/grid';
import { scaleTime, scaleLinear } from '@visx/scale';
import { withTooltip, Tooltip, TooltipWithBounds } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { localPoint } from '@visx/event';
import { LinearGradient } from '@visx/gradient';
import { max, extent, bisector, min } from 'd3-array';
import { timeFormat } from 'd3-time-format';
import { Button } from '@material-ui/core';
import { useGlobalContext } from '../context';

import MovingAverage from './MovingAverage';
import { StockSymbol } from '../reducer';

const { REACT_APP_FIN_URL: URL, REACT_APP_FIN_KEY: KEY } = process.env;
const QUOTE_URL = `${URL}/stock/candle?token=${KEY}`;

interface Stock {
  date: Date;
  close: number;
}

type ToolTipData = Stock;

// styles
const accentColor = 'green';

// util
const formatDate = timeFormat('%d %b %y  %I:%M');

// accessors
const getDate = (d: Stock) => d.date;
const getStockValue = (d: Stock) => d.close;
const bisectDate = bisector<Stock, Date>((d) => d.date).left;

export type AreaProps = {
  width: number;
  height: number;
  symbol: StockSymbol;
  margin?: { top: number; right: number; bottom: number; left: number };
};

export default withTooltip<AreaProps, ToolTipData>(
  ({
    width,
    height,
    symbol,
    margin = { top: 0, right: 0, bottom: 0, left: 0 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  }: AreaProps & WithTooltipProvidedProps<ToolTipData>) => {
    if (width < 10) return null;

    const [priceData, setPriceData] = useState<Stock[]>([]);
    const [showMavg, setShowMavg] = useState(false);
    const [loading, setLoading] = useState(true);

    const { timePeriod } = useGlobalContext();

    // bounds
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    useEffect(() => {
      const { resolution, from, to } = timePeriod;
      fetch(`${QUOTE_URL}&symbol=${symbol.symbol}&resolution=${resolution}&from=${from}&to=${to}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Could not fetch price data');
          }
          return res.json();
        })
        .then((data) => {
          if (data.s !== 'ok') {
            throw new Error('Could not fetch price data');
          }

          const { c: closePrices, t: timeStamps } = data;
          const stockData: Stock[] = [];
          if (closePrices && timeStamps) {
            for (let i = 0; i < closePrices.length; i++) {
              const date = new Date(timeStamps[i] * 1000);
              stockData.push({ date, close: closePrices[i] });
            }
          }
          setPriceData(stockData);
          setLoading(false);
        });
    }, [symbol, timePeriod]);

    // scales
    const dateScale = useMemo(
      () =>
        scaleTime({
          range: [margin.left, innerWidth + margin.left],
          domain: extent(priceData, getDate) as [Date, Date],
        }),
      [innerWidth, margin.left, priceData]
    );
    const stockValueScale = useMemo(
      () =>
        scaleLinear({
          range: [innerHeight + margin.top, margin.top],
          domain: [
            (min(priceData, getStockValue) || 0) - 0.3,
            (max(priceData, getStockValue) || 0) + 0.3,
          ],
          nice: true,
        }),
      [priceData, margin.top, innerHeight]
    );

    // tooltip handler
    const handleTooltip = useCallback(
      (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
        const { x } = localPoint(event) || { x: 0 };
        const x0 = dateScale.invert(x);
        const index = bisectDate(priceData, x0, 1);
        const d0 = priceData[index - 1];
        const d1 = priceData[index];
        let d = d0;
        if (d1 && getDate(d1)) {
          d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
        }
        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
          tooltipTop: stockValueScale(getStockValue(d)),
        });
      },
      [showTooltip, dateScale, stockValueScale, priceData]
    );

    if (loading) {
      return <div>Loading</div>;
    }

    return (
      <div>
        <svg width={width} height={height}>
          <rect x={0} y={0} width={width} height={height} rx={14} fill="white" />
          <LinearGradient id="area-gradient" from={accentColor} to={accentColor} toOpacity={0.1} />
          <GridRows
            left={margin.left}
            scale={stockValueScale}
            width={innerWidth}
            strokeDasharray="1,3"
            stroke={accentColor}
            strokeOpacity={0.2}
            pointerEvents="none"
          />
          <GridColumns
            top={margin.top}
            scale={dateScale}
            height={innerHeight}
            strokeDasharray="1,3"
            stroke={accentColor}
            strokeOpacity={0.2}
            pointerEvents="none"
          />
          <AreaClosed<Stock>
            data={priceData}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => stockValueScale(getStockValue(d)) ?? 0}
            yScale={stockValueScale}
            strokeWidth={1}
            stroke="url(#area-gradient)"
            fill="url(#area-gradient)"
            curve={curveLinear}
          />
          <Bar
            x={margin.left}
            y={margin.top}
            width={innerWidth}
            height={innerWidth}
            fill="transparent"
            rx={14}
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />
          {showMavg && (
            (
            <MovingAverage
                lineData={priceData.map((d) => ({ date: d.date, value: d.close }))}
                timeRange={{ x: margin.left, y: innerWidth + margin.left }}
                linearRange={{ x: innerHeight + margin.top, y: margin.top }}
              />
          )
          )}
          {tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: margin.top }}
                to={{ x: tooltipLeft, y: innerHeight + margin.top }}
                stroke="red"
                strokeWidth={2}
                pointerEvents="none"
                strokeDasharray="5,2"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop + 1}
                r={4}
                fill="black"
                fillOpacity={0.1}
                stroke="black"
                strokeOpacity={0.1}
                strokeWidth={2}
                pointerEvents="none"
              />
            </g>
          )}
        </svg>
        <Button onClick={() => setShowMavg(!showMavg)}>Show MA</Button>
        {tooltipData && (
          <div>
            <TooltipWithBounds key={Math.random()} top={tooltipTop - 12} left={tooltipLeft + 12}>
              {`$${getStockValue(tooltipData)}`}
            </TooltipWithBounds>
            <Tooltip top={innerHeight + margin.top - 14} left={tooltipLeft}>
              {formatDate(getDate(tooltipData))}
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
);
